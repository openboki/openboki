import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #520: 給料の総額を現金で払う仕訳に天引きの誤解が付かず、精算の貸借逆に向きの誤解が付いていなかった
describe("預かったお金、仮のお金の誤解判定", () => {
  const unit = unitMap.get("receivables-and-payables/temporary-and-deposits")!;
  const salary = unit.steps[1].task;
  const settlement = unit.steps[5].task;
  if (salary.type !== "post" || settlement.type !== "post") throw new Error("postではない");

  it("ステップ2で給料100,000 / 現金100,000はwithholding_ignoredで、預り金と普通預金の両方を言う", () => {
    const result = gradePost(salary, {
      debit: [{ account: "salaries_expense", amount: 100000 }],
      credit: [{ account: "cash", amount: 100000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("withholding_ignored");
    expect(result.feedback).toContain("預り金");
    expect(result.feedback).toContain("普通預金");
  });

  it("ステップ2の給料100,000 / 普通預金100,000は変わらずwithholding_ignored", () => {
    const result = gradePost(salary, {
      debit: [{ account: "salaries_expense", amount: 100000 }],
      credit: [{ account: "bank_deposit", amount: 100000 }],
    });
    expect(result.misconception).toBe("withholding_ignored");
  });

  it("ステップ2で現金97,000と預り金3,000は、口座の取り違えだけを言う", () => {
    const result = gradePost(salary, {
      debit: [{ account: "salaries_expense", amount: 100000 }],
      credit: [
        { account: "cash", amount: 97000 },
        { account: "deposits_received", amount: 3000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("普通預金から振り込みました");
  });

  it("ステップ6の貸借まるごと逆はoutflow_on_debit", () => {
    const result = gradePost(settlement, {
      debit: [{ account: "suspense_payment", amount: 20000 }],
      credit: [
        { account: "travel_expense", amount: 18000 },
        { account: "cash", amount: 2000 },
      ],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("outflow_on_debit");
  });

  it("ステップ6で仮払金を左に書くだけの誤りは、従来どおり誤解IDなしの説明", () => {
    const result = gradePost(settlement, {
      debit: [
        { account: "travel_expense", amount: 18000 },
        { account: "suspense_payment", amount: 2000 },
      ],
      credit: [{ account: "suspense_payment", amount: 20000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("右に書いて消します");
  });
});
