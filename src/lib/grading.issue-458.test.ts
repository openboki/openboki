import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #458: 小口現金を仮払金と取り違える(前渡しの借方・報告の貸方)、報告の支払いを雑損にまとめると、誤解の説明が無く汎用文だけが出ていた
describe("小口現金を仮払金・雑損と取り違える", () => {
  const unit = unitMap.get("cash-and-deposits/petty-cash")!;
  const handOver = unit.steps[1].task;
  const report = unit.steps[3].task;
  if (handOver.type !== "post" || report.type !== "post") throw new Error("postではない");

  it("ステップ2の借方仮払金はpetty_cash_as_suspense", () => {
    const result = gradePost(handOver, {
      debit: [{ account: "suspense_payment", amount: 30000 }],
      credit: [{ account: "checking_account", amount: 30000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("petty_cash_as_suspense");
    expect(result.feedback).not.toContain("使っている科目を見直しましょう");
  });

  it("ステップ4の貸方仮払金はpetty_cash_as_suspenseで、ステップ2で増やした小口現金を減らすと言う", () => {
    const result = gradePost(report, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit: [{ account: "suspense_payment", amount: 12500 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("petty_cash_as_suspense");
    expect(result.feedback).toContain("ステップ2");
  });

  it("ステップ4の借方雑損12,500はreported_payments_as_miscellaneous_loss", () => {
    const result = gradePost(report, {
      debit: [{ account: "miscellaneous_loss", amount: 12500 }],
      credit: [{ account: "petty_cash", amount: 12500 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("reported_payments_as_miscellaneous_loss");
    expect(result.feedback).toContain("雑損");
  });

  it("従来の取り違え(借方現金、貸方現金)は変わらずpetty_cash_is_cash", () => {
    expect(gradePost(handOver, { debit: [{ account: "cash", amount: 30000 }], credit: [{ account: "checking_account", amount: 30000 }] }).misconception).toBe("petty_cash_is_cash");
    expect(
      gradePost(report, {
        debit: [
          { account: "communication_expense", amount: 4000 },
          { account: "supplies_expense", amount: 6500 },
          { account: "travel_expense", amount: 2000 },
        ],
        credit: [{ account: "cash", amount: 12500 }],
      }).misconception,
    ).toBe("petty_cash_is_cash");
  });
});
