import type { Unit } from "#content";
import { type AccountInfo, type Change, type Element, type JournalEntry, ELEMENTS, ELEMENT_LABELS, computeImpact, sameEntry } from "./accounting";
import { evaluateFormula } from "./formulas";

// ステップの課題の採点(純粋関数)。正誤だけでなく「どの誤解か」を返す(docs/architecture.md 6章)

export type Task = Unit["steps"][number]["task"];
export type TaskOf<T extends Task["type"]> = Extract<Task, { type: T }>;
export type EffectAnswer = Record<Element, Change>;

export interface GradeResult {
  correct: boolean;
  misconception?: string;
  feedback: string;
}

const GENERIC_WRONG = "まだ合っていません。結果の表で何が動くはずかを考えて、もう一度試してみましょう。";
// 歴史の単元には結果の表が無く、ページの左右で教える(Issue #300)
const GENERIC_WRONG_HISTORY = "まだ合っていません。どのページの左と右に書くかを見直して、もう一度試してみましょう。";
// 正解の金額は書かない。計算で求める課題では答えそのものになる
const AMOUNT_WRONG = "科目は合っています。金額をもう一度確かめましょう。";
// 比較表が全行「同じ」になる誤答。表を見直させても手がかりが無いので、科目へ目を向けさせる
const SAME_IMPACT = "5つの要素の動きは合っています。使っている科目を見直しましょう。";
// 歴史の単元は5要素ではなくページの左右で教えるので、同じ状況を左右の言葉で言う(Issue #274)
const SAME_IMPACT_HISTORY = "左右に書く金額は合っています。どのページに書くかを見直しましょう。";
// swappedの誤答パターンが無い課題(debugなど)でも、同じ要素どうしの貸借逆をSAME_IMPACTに落とさない
const SWAPPED = "科目と金額は合っています。借方と貸方が逆です。";
const EXTRA_LINES = "正しい行はそろっています。この取引に含まれない余計な行を消しましょう。";
// 計算問題では記帳しないので、結果の表の動きではなく計算そのものの見直しを促す
const CALC_WRONG = "まだ合っていません。計算の式と、使う数字をもう一度確かめましょう。";
// 桁や符号の打ち間違いは式が合っている見込みが高いので、式を疑わせない。考え方の誤りではないので誤解IDは付けない(Issue #332)
const CALC_SIGN = "数字は合っていますが、プラスとマイナスの向きが逆です。符号を確かめましょう。";
const CALC_DIGITS = "数字の並びは合っていますが、桁がずれています。0の数や単位を確かめましょう。";
// 予想は1回限りで、回答と同時に記帳される。やり直しではなく実際の動きとの見比べを促す
const PREDICT_WRONG = "予想と実際の動きが違いました。下の表で、どの要素がどう動いたかを見比べましょう。外れても、このまま次へ進めます。";

/** 2回誤答すると「答えを見る」が出る課題か。predictは1回で進み、tweakは目標に合わせるだけなので誤答が重ならない */
export function canRevealAnswer(type: Task["type"]): boolean {
  return type === "post" || type === "calc" || type === "classify" || type === "debug";
}

function ok(task: { success?: string }): GradeResult {
  return { correct: true, feedback: task.success ?? "できました。" };
}
function ng(feedback?: string, misconception?: string): GradeResult {
  return { correct: false, misconception, feedback: feedback ?? GENERIC_WRONG };
}

function sameAccounts(a: JournalEntry, b: JournalEntry): boolean {
  const key = (lines: JournalEntry["debit"]) => [...new Set(lines.map((l) => l.account))].sort().join(",");
  return key(a.debit) === key(b.debit) && key(a.credit) === key(b.credit);
}

export function gradePost(task: TaskOf<"post">, entry: JournalEntry, accounts?: ReadonlyMap<string, AccountInfo>, kind: Unit["kind"] = "lesson"): GradeResult {
  const answers = [task.answer, ...task.alternatives];
  if (answers.some((e) => sameEntry(e, entry))) return ok(task);
  const sum = (lines: { amount: number }[]) => lines.reduce((t, l) => t + l.amount, 0);
  const sides = ["debit", "credit"] as const;
  const pattern = task.wrong_patterns.find((p) => {
    const m = p.match;
    // 金額も違う貸借逆を、後ろの金額や科目のパターンに渡さない
    if (m.swapped && !sameAccounts(entry, { debit: task.answer.credit, credit: task.answer.debit })) return false;
    if (m.unbalanced && sum(entry.debit) === sum(entry.credit)) return false;
    return sides.every((side) => {
      const wanted = m[side];
      if (!wanted) return true;
      const named = wanted.every((w) => entry[side].some((l) => (w.account === undefined || l.account === w.account) && (w.amount === undefined || l.amount === w.amount)));
      // 正解にもパターンにも無い行があるなら、このパターンは学習者の誤りを説明していない
      const explained = entry[side].every((l) => wanted.some((w) => w.account === l.account) || answers.some((e) => e[side].some((c) => c.account === l.account)));
      return named && explained;
    });
  });
  if (pattern) return ng(pattern.feedback, pattern.misconception);
  if (answers.some((e) => sameEntry({ debit: e.credit, credit: e.debit }, entry))) return ng(SWAPPED);
  const hasAllLines = (e: JournalEntry) => sides.every((side) => e[side].every((c) => entry[side].some((l) => l.account === c.account && l.amount === c.amount)));
  if (answers.some(hasAllLines)) return ng(EXTRA_LINES);
  if (answers.some((e) => sameAccounts(e, entry))) return ng(AMOUNT_WRONG);
  if (accounts) {
    // 比較表と同じくtask.answerとだけ比べる
    const yours = computeImpact(entry, accounts);
    const expected = computeImpact(task.answer, accounts);
    if (ELEMENTS.every((el) => yours[el] === expected[el])) return ng(kind === "history" ? SAME_IMPACT_HISTORY : SAME_IMPACT);
  }
  return ng(kind === "history" ? GENERIC_WRONG_HISTORY : undefined);
}

// debugのentriesは誤りの行のほかは貸借がそろっている(prepareで検査)
const DEBUG_ROW_BALANCED = "その行は借方と貸方の両側がそろっています。片方のページにしか書いていない行を探しましょう。";

export interface DebugAnswer {
  index: number;
  entry: JournalEntry;
}

/** debug: 選んだ行と直した仕訳を採点する。行の選び間違いはwrong_patternsで、行が合っていれば仕訳をpostと同じく比べる(Issue #263) */
export function gradeDebug(task: TaskOf<"debug">, answer: DebugAnswer, accounts?: ReadonlyMap<string, AccountInfo>, kind: Unit["kind"] = "lesson"): GradeResult {
  if (answer.index !== task.answer.index) {
    const pattern = task.wrong_patterns.find((p) => p.match.index === answer.index);
    return ng(pattern?.feedback ?? DEBUG_ROW_BALANCED, pattern?.misconception);
  }
  const r = gradePost({ type: "post", transaction: "", answer: task.answer.entry, alternatives: [], wrong_patterns: [] }, answer.entry, accounts, kind);
  return r.correct ? ok(task) : r;
}

export interface PredictResult extends GradeResult {
  // 外した要素それぞれの誤解(重複なし)。misconceptionはこの先頭で、attemptsには1件だけ保存する
  misconceptions: string[];
}

/** predictで問う要素。elementsが無ければ5要素すべて(Issue #170) */
export function predictElements(task: TaskOf<"predict">): readonly Element[] {
  return task.elements ? ELEMENTS.filter((el) => task.elements!.includes(el)) : ELEMENTS;
}

export function gradePredict(task: TaskOf<"predict">, effect: Partial<EffectAnswer>): PredictResult {
  const keys = predictElements(task);
  if (keys.every((k) => effect[k] === task.answer[k])) return { ...ok(task), misconceptions: [] };
  const patterns = task.wrong_patterns.filter((p) =>
    (Object.entries(p.match) as [Element, Change | undefined][]).every(([k, v]) => v === undefined || effect[k] === v),
  );
  const misconceptions = [...new Set(patterns.flatMap((p) => p.misconception ?? []))];
  return { ...ng(patterns.map((p) => p.feedback).join("\n") || PREDICT_WRONG, misconceptions[0]), misconceptions };
}

export function gradeCalc(task: TaskOf<"calc">, value: number): GradeResult {
  if (value === task.answer) return ok(task);
  const pattern = task.wrong_patterns.find((p) => p.match === value);
  if (pattern) return ng(pattern.feedback, pattern.misconception);
  if (task.answer !== 0 && value === -task.answer) return ng(CALC_SIGN);
  const ratio = value / task.answer;
  const n = Math.round(Math.log10(ratio));
  // 浮動小数の割り算なので、10のn乗との一致は相対誤差で見る
  if (task.answer !== 0 && n !== 0 && Math.abs(ratio / 10 ** n - 1) < 1e-9) return ng(CALC_DIGITS);
  return ng(CALC_WRONG);
}

export function gradeTweak(task: TaskOf<"tweak">, outputs: Record<string, number>, currency = "円"): GradeResult {
  return outputs[task.goal.output] === task.goal.equals ? ok(task) : ng(`いまの${task.goal.label}は${outputs[task.goal.output]?.toLocaleString("ja-JP")}${currency}です。条件を動かして${task.goal.equals.toLocaleString("ja-JP")}${currency}にしてみましょう。`);
}

/** スライダーで取れる値か。範囲外や刻みから外れた値は、入力の位置がブラウザに丸められて表示と計算が食い違う(Issue #326) */
function onSlider(p: TaskOf<"tweak">["params"][number], v: unknown): v is number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < p.min || v > p.max) return false;
  const n = (v - p.min) / p.step;
  return Math.abs(n - Math.round(n)) < 1e-9;
}

/**
 * 達成済みのtweakを戻す値。保存値が全パラメータともスライダーで取れて目標を満たすならそれを使う。
 * tweakには模範解答が無いので、そうでなければ初期値から1つのパラメータだけ動かして目標に届く値を探し、無ければ初期値を返す
 */
export function tweakRestoreValues(task: TaskOf<"tweak">, saved: unknown): Record<string, number> {
  const reaches = (values: Record<string, number>) => evaluateFormula(task.formula, values).outputs[task.goal.output] === task.goal.equals;
  if (typeof saved === "object" && saved !== null && !Array.isArray(saved)) {
    const values = saved as Record<string, unknown>;
    if (task.params.every((p) => onSlider(p, values[p.id]))) {
      const picked = Object.fromEntries(task.params.map((p) => [p.id, values[p.id] as number]));
      if (reaches(picked)) return picked;
    }
  }
  const initial = Object.fromEntries(task.params.map((p) => [p.id, p.value]));
  for (const p of task.params) {
    for (let i = 0; p.min + i * p.step <= p.max; i++) {
      const values = { ...initial, [p.id]: p.min + i * p.step };
      if (reaches(values)) return values;
    }
  }
  return initial;
}

export interface ClassifyResult extends GradeResult {
  // 間違えた項目ごとの説明。accountは科目IDまたは項目ID
  wrong: { account: string; feedback: string; misconception?: string }[];
  // 間違えた項目それぞれの誤解(重複なし)。misconceptionはこの先頭で、attemptsには1件だけ保存する
  misconceptions: string[];
}

export interface ClassifyBox {
  id: string;
  label: string;
}
export interface ClassifyItem extends ClassifyBox {
  answer: string;
}

/** 仕分けボードの箱と項目。labelsの無い従来の形は、箱を5要素、項目を科目とみなす(Issue #262) */
export function classifyBoard(task: TaskOf<"classify">, accounts: ReadonlyMap<string, AccountInfo>): { boxes: ClassifyBox[]; items: ClassifyItem[] } {
  if (task.labels) return { boxes: Object.entries(task.labels).map(([id, label]) => ({ id, label })), items: task.items ?? [] };
  return {
    boxes: ELEMENTS.map((el) => ({ id: el, label: ELEMENT_LABELS[el] })),
    items: (task.accounts ?? []).flatMap((id) => {
      const a = accounts.get(id);
      return a ? [{ id, label: a.name, answer: a.element }] : [];
    }),
  };
}

// 科目のwhyにある「〜ではありません。」が否定している要素を、文中の言葉で引く
const DENIED_ELEMENT_WORDS: Record<Element, RegExp> = {
  asset: /(?<!純)資産|財産/,
  liability: /負債/,
  equity: /純資産|元手/,
  revenue: /収益|売上|もうけ/,
  expense: /費用|仕入/,
};

/** 「〜ではありません。」の文が否定している要素。否定文でなければundefined */
export function deniedElement(sentence: string): Element | undefined {
  if (!sentence.endsWith("ではありません。")) return undefined;
  return ELEMENTS.find((el) => DENIED_ELEMENT_WORDS[el].test(sentence));
}

/** 仕分けボードの説明に使うwhy。否定文は学習者がその要素に入れたときだけ残し、選んでいない箱を否定しない(Issue #377) */
function whyForChosen(why: string, chosen: string | undefined): string {
  return why
    .split(/(?<=。)/)
    .filter((sentence) => {
      const denied = deniedElement(sentence);
      return denied === undefined || denied === chosen;
    })
    .join("");
}

export function gradeClassify(task: TaskOf<"classify">, placed: Partial<Record<string, string>>, accounts: ReadonlyMap<string, AccountInfo>): ClassifyResult {
  const { boxes, items } = classifyBoard(task, accounts);
  const boxLabel = new Map(boxes.map((b) => [b.id, b.label]));
  const wrong: ClassifyResult["wrong"] = [];
  for (const item of items) {
    const chosen = placed[item.id];
    if (chosen === item.answer) continue;
    wrong.push({
      account: item.id,
      misconception: chosen ? task.misconceptions[item.id]?.[chosen] : undefined,
      // 任意の箱には科目のwhyに当たる理由が無いので、正解の箱だけを示し、理由は誤解の説明に任せる。
      // ラベルは動詞句のこともある(「貸倒れとして処理する」)ので、「〜です」に直結せず「の箱」で受ける(Issue #417)
      feedback: task.labels ? `「${item.label}」は「${boxLabel.get(item.answer)}」の箱です。` : `${item.label}は${boxLabel.get(item.answer)}です。${whyForChosen(accounts.get(item.id)!.why, chosen)}`,
    });
  }
  if (wrong.length === 0) return { ...ok(task), wrong, misconceptions: [] };
  const misconceptions = [...new Set(wrong.flatMap((w) => w.misconception ?? []))];
  return { ...ng(`${wrong.length}個の${task.labels ? "項目" : "科目"}が別の箱に入っています。`, misconceptions[0]), wrong, misconceptions };
}
