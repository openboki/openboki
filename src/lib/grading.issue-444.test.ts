import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #444: 期中の売却で、今年の分の減価償却費を落として累計額300,000を消す仕訳(A)に「考え方は合っています」が出て、
// 累計額に積んでから消す合算形(B)には「累計額に積んでいない」と逆のことを言っていた

function task(index: number) {
  const t = unitMap.get("depreciation/sale-during-period")!.steps[index].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

describe.each(["accumulated_depreciation_equipment", "accumulated_depreciation"])("ステップ4(マシン): 累計額の科目が%s", (accum) => {
  it("(A) 減価償却費を書かずに累計額300,000を消すと、今年の分を落とした誤解を返す", () => {
    const result = gradePost(task(3), {
      debit: [
        { account: "cash", amount: 400000 },
        { account: accum, amount: 300000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 20000 },
      ],
      credit: [{ account: "equipment", amount: 720000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("sale_ignores_current_depreciation");
    expect(result.feedback).not.toContain("考え方は合っています");
    expect(result.feedback).toContain("減価償却費");
  });

  it("(B) 積んでから消す合算形には、積んでいないとは言わず、合算すると同じになる説明を返す", () => {
    const result = gradePost(task(3), {
      debit: [
        { account: "cash", amount: 400000 },
        { account: accum, amount: 300000 },
        { account: "depreciation_expense", amount: 60000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 20000 },
      ],
      credit: [
        { account: "equipment", amount: 720000 },
        { account: accum, amount: 60000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).not.toContain("積んでいない");
    expect(result.feedback).toContain("合わせる");
  });
});

describe.each(["accumulated_depreciation_vehicle", "accumulated_depreciation"])("ステップ7(スクーター): 累計額の科目が%s", (accum) => {
  it("(A) 減価償却費を書かずに累計額162,000を消すと、今年の分を落とした誤解を返す", () => {
    const result = gradePost(task(6), {
      debit: [
        { account: "accounts_receivable_other", amount: 210000 },
        { account: accum, amount: 162000 },
      ],
      credit: [
        { account: "vehicle", amount: 360000 },
        { account: "gain_on_sale_of_fixed_assets", amount: 12000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("sale_ignores_current_depreciation");
    expect(result.feedback).not.toContain("考え方は合っています");
    expect(result.feedback).toContain("減価償却費");
  });

  it("(B) 積んでから消す合算形には、積んでいないとは言わず、合算すると同じになる説明を返す", () => {
    const result = gradePost(task(6), {
      debit: [
        { account: "accounts_receivable_other", amount: 210000 },
        { account: accum, amount: 162000 },
        { account: "depreciation_expense", amount: 54000 },
      ],
      credit: [
        { account: "vehicle", amount: 360000 },
        { account: accum, amount: 54000 },
        { account: "gain_on_sale_of_fixed_assets", amount: 12000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).not.toContain("積んでいない");
    expect(result.feedback).toContain("合わせる");
  });
});

describe("ほかの判定は変わらない", () => {
  it("ステップ4: 累計額を右に書くだけの仕訳はcontra_always_credit", () => {
    const result = gradePost(task(3), {
      debit: [
        { account: "cash", amount: 400000 },
        { account: "depreciation_expense", amount: 60000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 500000 },
      ],
      credit: [
        { account: "equipment", amount: 720000 },
        { account: "accumulated_depreciation_equipment", amount: 240000 },
      ],
    });
    expect(result.misconception).toBe("contra_always_credit");
  });

  it("ステップ4: 正解の4行は正解", () => {
    expect(gradePost(task(3), task(3).answer).correct).toBe(true);
  });
});
