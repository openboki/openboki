import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #556: 家賃の支払いで借方を備品にした誤答に、feedbackはあるが誤解IDが無かった
describe("5つの要素と仕訳 ステップ6(家賃を払う)", () => {
  const task = unitMap.get("bookkeeping-basics/five-elements")!.steps[5].task;
  if (task.type !== "post") throw new Error("postではない");

  it("借方を備品にするとexpense_as_asset", () => {
    const result = gradePost(task, {
      debit: [{ account: "equipment", amount: 50000 }],
      credit: [{ account: "cash", amount: 50000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("expense_as_asset");
    expect(result.feedback).toContain("支払家賃");
  });
});
