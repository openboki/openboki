import { describe, expect, it } from "vitest";
import { accountMap, unitAccountList, unitMap } from "./content";
import { gradeDebug, gradePost, type TaskOf } from "./grading";

// Issue #284: 科目と金額が合っていて貸借だけ逆の誤答に、科目を見直させる文が出ていた
const SAME_IMPACT = "5つの要素の動きは合っています。使っている科目を見直しましょう。";
const SWAPPED = "科目と金額は合っています。借方と貸方が逆です。";

const venture = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;
const accounts = new Map(unitAccountList(venture.scenario.accounts).map((a) => [a.id, a]));
const task = venture.steps[5].task as TaskOf<"debug">;
const swapped = { debit: task.answer.entry.credit, credit: task.answer.entry.debit };

describe("貸借だけ逆の誤答", () => {
  it("debugで正しい行の貸借を逆にすると、貸借逆の文を返す", () => {
    const r = gradeDebug(task, { index: task.answer.index, entry: swapped }, accounts);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(SWAPPED);
    expect(r.feedback).not.toBe(SAME_IMPACT);
  });

  it("swappedパターンの無いpostでも、同じ要素どうしの貸借逆に貸借逆の文を返す", () => {
    const post: TaskOf<"post"> = { type: "post", transaction: "", answer: task.answer.entry, alternatives: [], wrong_patterns: [] };
    expect(gradePost(post, swapped, accounts).feedback).toBe(SWAPPED);
  });

  it("swappedパターンがあれば、そちらの誤解と文が優先される", () => {
    const t = unitMap.get("bookkeeping-basics/five-elements")!.steps[1].task as TaskOf<"post">;
    const r = gradePost(t, { debit: t.answer.credit, credit: t.answer.debit }, accountMap);
    expect(r.misconception).toBe("debit_means_increase");
    expect(r.feedback).not.toBe(SWAPPED);
  });

  it("金額も違う貸借逆には貸借逆の文を出さない", () => {
    const entry = { debit: [{ account: swapped.debit[0].account, amount: 1 }], credit: [{ account: swapped.credit[0].account, amount: 1 }] };
    expect(gradeDebug(task, { index: task.answer.index, entry }, accounts).feedback).not.toBe(SWAPPED);
  });
});
