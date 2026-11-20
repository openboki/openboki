import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #445: 3つの支払いのうち2つを1つの費用に合算した2行の仕訳に、誤解の説明が無く汎用文だけが出ていた
describe("小口現金 ステップ4(週末の報告)で2つの支払いを1つの費用に合算する", () => {
  const task = unitMap.get("cash-and-deposits/petty-cash")!.steps[3].task;
  if (task.type !== "post") throw new Error("postではない");

  const credit = [{ account: "petty_cash", amount: 12500 }];

  const cases: [string, { account: string; amount: number }[], string][] = [
    ["電車代を消耗品費へ(通信費4,000 + 消耗品費8,500)", [{ account: "communication_expense", amount: 4000 }, { account: "supplies_expense", amount: 8500 }], "電車代"],
    ["電車代を通信費へ(通信費6,000 + 消耗品費6,500)", [{ account: "communication_expense", amount: 6000 }, { account: "supplies_expense", amount: 6500 }], "電車代"],
    ["文房具代を旅費交通費へ(通信費4,000 + 旅費交通費8,500)", [{ account: "communication_expense", amount: 4000 }, { account: "travel_expense", amount: 8500 }], "文房具代"],
    ["文房具代を通信費へ(通信費10,500 + 旅費交通費2,000)", [{ account: "communication_expense", amount: 10500 }, { account: "travel_expense", amount: 2000 }], "文房具代"],
    ["切手代を旅費交通費へ(消耗品費6,500 + 旅費交通費6,000)", [{ account: "supplies_expense", amount: 6500 }, { account: "travel_expense", amount: 6000 }], "切手代"],
  ];

  for (const [name, debit, payment] of cases) {
    it(`${name}はpetty_expenses_lumpedで、含めた支払いを名指しする`, () => {
      const result = gradePost(task, { debit, credit });
      expect(result.correct).toBe(false);
      expect(result.misconception).toBe("petty_expenses_lumped");
      expect(result.feedback).toContain(payment);
      expect(result.feedback).not.toContain("使っている科目を見直しましょう");
    });
  }

  it("切手代を消耗品費へ(消耗品費10,500 + 旅費交通費2,000)は従来どおりpostage_as_supplies", () => {
    const result = gradePost(task, {
      debit: [
        { account: "supplies_expense", amount: 10500 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.misconception).toBe("postage_as_supplies");
  });

  it("1行の書き忘れ(通信費4,000 + 消耗品費6,500)は従来どおりpetty_payment_omitted", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
      ],
      credit,
    });
    expect(result.misconception).toBe("petty_payment_omitted");
  });
});
