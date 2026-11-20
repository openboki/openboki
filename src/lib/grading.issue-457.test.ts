import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #457: 期中の売却で、累計額を積んでから消す合算形の左右を個別の累計額と総称の「減価償却累計額」に混ぜると、
// 減価償却費を書いているのに「今年の分を減価償却費にせず」と出ていた

function task(index: number) {
  const t = unitMap.get("depreciation/sale-during-period")!.steps[index].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

const mixes = (specific: string) => [
  [specific, "accumulated_depreciation"],
  ["accumulated_depreciation", specific],
];

describe.each(mixes("accumulated_depreciation_equipment"))("ステップ4(マシン): 左が%s、右が%sの合算形", (left, right) => {
  it("減価償却費にせずとは言わず、合算すると同じになる説明を返す", () => {
    const result = gradePost(task(3), {
      debit: [
        { account: "cash", amount: 400000 },
        { account: left, amount: 300000 },
        { account: "depreciation_expense", amount: 60000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 20000 },
      ],
      credit: [
        { account: "equipment", amount: 720000 },
        { account: right, amount: 60000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).not.toContain("減価償却費にせず");
    expect(result.feedback).toContain("考え方は合っています");
  });
});

describe.each(mixes("accumulated_depreciation_vehicle"))("ステップ7(スクーター): 左が%s、右が%sの合算形", (left, right) => {
  it("減価償却費にせずとは言わず、合算すると同じになる説明を返す", () => {
    const result = gradePost(task(6), {
      debit: [
        { account: "accounts_receivable_other", amount: 210000 },
        { account: left, amount: 162000 },
        { account: "depreciation_expense", amount: 54000 },
      ],
      credit: [
        { account: "vehicle", amount: 360000 },
        { account: "gain_on_sale_of_fixed_assets", amount: 12000 },
        { account: right, amount: 54000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).not.toContain("減価償却費にせず");
    expect(result.feedback).toContain("考え方は合っています");
  });
});

describe("ほかの判定は変わらない", () => {
  it("ステップ4: 減価償却費を書かずに累計額300,000を消すと、今年の分を落とした誤解のまま", () => {
    const result = gradePost(task(3), {
      debit: [
        { account: "cash", amount: 400000 },
        { account: "accumulated_depreciation_equipment", amount: 300000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 20000 },
      ],
      credit: [{ account: "equipment", amount: 720000 }],
    });
    expect(result.misconception).toBe("sale_ignores_current_depreciation");
  });

  it("ステップ7: 累計額を右に書くだけの仕訳はcontra_always_credit", () => {
    const result = gradePost(task(6), {
      debit: [
        { account: "accounts_receivable_other", amount: 210000 },
        { account: "depreciation_expense", amount: 54000 },
      ],
      credit: [
        { account: "vehicle", amount: 360000 },
        { account: "accumulated_depreciation", amount: 108000 },
      ],
    });
    expect(result.misconception).toBe("contra_always_credit");
  });
});
