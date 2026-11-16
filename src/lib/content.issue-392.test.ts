import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #392: 初年度の減価償却費を75,000・600,000と答える、マシンの分を2台合計の150,000で記帳すると、取り違えを言う説明が無く汎用文だけが出た
const unit = unitMap.get("depreciation/straight-line")!;

function task<T extends "calc" | "post">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

describe("ステップ5: 使った月の分だけ", () => {
  it("75,000は残存価額300,000を持ち越した誤答として説明する", () => {
    const r = gradeCalc(task(4, "calc"), 75000);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("残存価額");
    expect(r.feedback).toContain("300,000");
  });
  it("600,000は耐用年数で割っていない誤答として説明する", () => {
    const r = gradeCalc(task(4, "calc"), 600000);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("耐用年数");
  });
});

describe("ステップ7: マシンの分も記帳する", () => {
  it("2台合計の150,000で記帳すると、資産ごとに分ける誤解が付く", () => {
    const r = gradePost(task(6, "post"), {
      debit: [{ account: "depreciation_expense", amount: 150000 }],
      credit: [{ account: "accumulated_depreciation_equipment", amount: 150000 }],
    });
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("accumulated_depreciation_any_asset");
    expect(r.feedback).toContain("軽バン");
  });
  it("月割り忘れの100,000はそのまま", () => {
    const r = gradePost(task(6, "post"), {
      debit: [{ account: "depreciation_expense", amount: 100000 }],
      credit: [{ account: "accumulated_depreciation_equipment", amount: 100000 }],
    });
    expect(r.misconception).toBe("forgot_monthly_proration");
  });
});
