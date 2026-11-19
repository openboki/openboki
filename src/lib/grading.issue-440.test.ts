import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #440: 給料から預かった3,000円を雑益などの収益にすると、誤解の説明が無く汎用文だけが出ていた
const GENERIC = "結果の表で何が動くはずか";

function task() {
  const t = unitMap.get("receivables-and-payables/temporary-and-deposits")!.steps[1].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

function entry(credit: string) {
  return {
    debit: [{ account: "salaries_expense", amount: 100000 }],
    credit: [
      { account: "bank_deposit", amount: 97000 },
      { account: credit, amount: 3000 },
    ],
  };
}

describe.each(["miscellaneous_gain", "sales", "interest_income"])("ステップ2: 預かった3,000円を右の%sにする", (credit) => {
  it("deposit_is_revenueと預り金・負債の説明を返す", () => {
    const result = gradePost(task(), entry(credit));
    expect(result.correct).toBe(false);
    expect(result.feedback).not.toContain(GENERIC);
    expect(result.feedback).toContain("預り金");
    expect(result.feedback).toContain("負債");
    expect(result.misconception).toBe("deposit_is_revenue");
  });
});

describe("ほかの判定は変わらない", () => {
  it("預り金3,000は正解", () => {
    expect(gradePost(task(), entry("deposits_received")).correct).toBe(true);
  });
  it("雑益で貸借が合わないときは不一致の説明", () => {
    const result = gradePost(task(), { ...entry("miscellaneous_gain"), debit: [{ account: "salaries_expense", amount: 97000 }] });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("net_pay_is_salary");
  });
});
