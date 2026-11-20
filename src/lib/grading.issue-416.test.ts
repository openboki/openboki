import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";
import type { JournalEntry } from "./accounting";

const units = [...unitMap.values()];

// Issue #416: 総称の「減価償却累計額」が別解で正解になり、資産別の累計額と別の行に載って成功文の「累計額が200,000」が表に無かった。
// 総称は正解から外し、資産ごとの科目で書くよう案内する
const GENERIC = "accumulated_depreciation";
const SPECIFIC = /^accumulated_depreciation_/;

const swapToGeneric = (entry: JournalEntry): JournalEntry => ({
  debit: entry.debit.map((l) => (SPECIFIC.test(l.account) ? { ...l, account: GENERIC } : l)),
  credit: entry.credit.map((l) => (SPECIFIC.test(l.account) ? { ...l, account: GENERIC } : l)),
});

// 資産別の累計額を正解に含むpost課題(減価償却の4単元の7課題)
const targets = units.flatMap((u) =>
  u.steps.flatMap((s, i) => {
    const t = s.task;
    if (t?.type !== "post") return [];
    const lines = [...t.answer.debit, ...t.answer.credit];
    return lines.some((l) => SPECIFIC.test(l.account)) ? [{ unit: u.id, step: i + 1, task: t }] : [];
  }),
);

describe("総称の減価償却累計額は正解にしない", () => {
  it("対象の課題が減価償却の単元にそろっている", () => {
    expect(targets.map((t) => `${t.unit}#${t.step}`).sort()).toEqual([
      "depreciation/sale-during-period#4",
      "depreciation/sale-during-period#7",
      "depreciation/sale-of-fixed-assets#3",
      "depreciation/sale-of-fixed-assets#5",
      "depreciation/straight-line#7",
      "depreciation/what-is-depreciation#5",
      "depreciation/what-is-depreciation#8",
    ]);
  });

  it("どの単元の別解にも総称が残っていない", () => {
    for (const u of units) {
      for (const s of u.steps) {
        if (s.task?.type !== "post") continue;
        const alt = s.task.alternatives.flatMap((e) => [...e.debit, ...e.credit].map((l) => l.account));
        expect(alt, `${u.id}`).not.toContain(GENERIC);
      }
    }
  });

  for (const { unit, step, task } of targets) {
    it(`${unit} ステップ${step}: 総称で書くとaccumulated_depreciation_any_assetで資産ごとの科目を案内する`, () => {
      const result = gradePost(task, swapToGeneric(task.answer));
      expect(result.correct).toBe(false);
      expect(result.misconception).toBe("accumulated_depreciation_any_asset");
      expect(result.feedback).toContain("総称");
      expect(result.feedback).toMatch(/備品減価償却累計額|車両運搬具減価償却累計額/);
    });

    it(`${unit} ステップ${step}: 資産ごとの科目で書けば正解のまま`, () => {
      expect(gradePost(task, task.answer).correct).toBe(true);
    });
  }
});

describe("減価償却とは何か ステップ8", () => {
  const task = unitMap.get("depreciation/what-is-depreciation")!.steps[7].task;
  if (task?.type !== "post") throw new Error("postではない");

  it("総称で書いた2年目の仕訳に、1年目と同じ科目で200,000にまとまることを伝える", () => {
    const result = gradePost(task, {
      debit: [{ account: "depreciation_expense", amount: 100000 }],
      credit: [{ account: GENERIC, amount: 100000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("200,000");
  });
});
