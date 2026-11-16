import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #361: 左の金額の打ち間違いや1行の書き忘れで、説明が左の合計を12,500と言い切っていた
describe("小口現金 ステップ4(週末の報告)の貸借不一致", () => {
  const task = unitMap.get("cash-and-deposits/petty-cash")!.steps[3].task;
  if (task.type !== "post") throw new Error("postではない");

  const credit = [{ account: "petty_cash", amount: 12500 }];

  it("旅費交通費を200と打ち間違える(右12,500)と、左の合計を12,500と決めつけず、誤解IDも付けない", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
        { account: "travel_expense", amount: 200 },
      ],
      credit,
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).not.toContain("費用の合計(12,500)");
    expect(result.feedback).not.toContain("書かれていません");
    expect(result.feedback).toContain("そろっていません");
  });

  it("右の小口現金を12,000と打ち間違えても同じ案内になる", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit: [{ account: "petty_cash", amount: 12000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).not.toContain("費用の合計(12,500)");
    expect(result.feedback).toContain("そろっていません");
  });

  it("電車代を書き忘れて右を12,500にすると、petty_payment_omittedで電車代の書き忘れを指す", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
      ],
      credit,
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("petty_payment_omitted");
    expect(result.feedback).toContain("電車代2,000円の分が書かれていません");
    expect(result.feedback).not.toContain("3つの費用");
  });

  it("文房具代を書き忘れて右を12,500にすると、文房具代の書き忘れを指す", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.misconception).toBe("petty_payment_omitted");
    expect(result.feedback).toContain("文房具代6,500円の分が書かれていません");
  });

  it("切手代を書き忘れて右を12,500にすると、切手代の書き忘れを指す", () => {
    const result = gradePost(task, {
      debit: [
        { account: "supplies_expense", amount: 6500 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.misconception).toBe("petty_payment_omitted");
    expect(result.feedback).toContain("切手代4,000円の分が書かれていません");
  });

  it("電車代を書き忘れて右も10,500にする既存の誤答は、右も直すよう促す文言のまま", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 4000 },
        { account: "supplies_expense", amount: 6500 },
      ],
      credit: [{ account: "petty_cash", amount: 10500 }],
    });
    expect(result.misconception).toBe("petty_payment_omitted");
    expect(result.feedback).toContain("電車代2,000円の分が書かれていません");
    expect(result.feedback).toContain("右の小口現金も3つの合計にしましょう");
  });

  it("金額の入れ替え(Issue #359)は貸借がそろっているので、金額の割り当てを見直す案内のまま", () => {
    const result = gradePost(task, {
      debit: [
        { account: "communication_expense", amount: 6500 },
        { account: "supplies_expense", amount: 4000 },
        { account: "travel_expense", amount: 2000 },
      ],
      credit,
    });
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("どの金額をどの行に書いたか");
  });
});
