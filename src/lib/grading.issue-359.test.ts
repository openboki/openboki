import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #359: 通信費と消耗品費の金額を入れ替えただけで「切手代も消耗品費」の誤解が付いていた
describe("小口現金 ステップ4(週末の報告)", () => {
  const task = unitMap.get("cash-and-deposits/petty-cash")!.steps[3].task;
  if (task.type !== "post") throw new Error("postではない");

  const credit = [{ account: "petty_cash", amount: 12500 }];

  it("通信費と消耗品費の金額を入れ替えると、誤解IDなしで金額の割り当てを見直すよう促す", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 6500 },
        { account: "supplies_expense", amount: 4000 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("科目は合っています");
    expect(result.feedback).not.toContain("切手代4,000円は");
  });

  it("通信費と旅費交通費の金額を入れ替えても同じ案内になる", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 2000 },
        { account: "supplies_expense", amount: 6500 },
        { account: "travel_expense", amount: 4000 },
      ],
      credit,
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("科目は合っています");
  });

  it("切手代を消耗品費にまとめる(消耗品費10,500)とpostage_as_supplies", () => {
    const result = gradePost(task, {
      debit: [
        { account: "supplies_expense", amount: 10500 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("postage_as_supplies");
  });

  it("切手代を消耗品費の別の行に書く(消耗品費4,000と6,500)とpostage_as_supplies", () => {
    const result = gradePost(task, {
      debit: [
        { account: "supplies_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("postage_as_supplies");
  });
});
