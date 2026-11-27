import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { gradeClassify } from "./grading";

// Issue #627: 「預かったお金、仮のお金」ステップ9の仕分けで立替金を費用に入れても、
// ステップ4で付けた誤解advance_for_others_is_expenseが付かなかった
const classifyTask = () => {
  const t = unitMap.get("receivables-and-payables/temporary-and-deposits")!.steps.find((s) => s.task.type === "classify")!.task;
  if (t.type !== "classify") throw new Error("classifyではない");
  return t;
};

const correct = { advances_paid: "asset", deposits_received: "liability", suspense_payment: "asset", suspense_receipt: "liability" };

describe("預かったお金、仮のお金 ステップ9: 立替金を費用に入れるとステップ4と同じ誤解が付く", () => {
  it("立替金 → 費用", () => {
    const result = gradeClassify(classifyTask(), { ...correct, advances_paid: "expense" }, accountMap);
    expect(result.correct).toBe(false);
    expect(result.misconceptions).toEqual(["advance_for_others_is_expense"]);
  });

  it("他の3科目の誤解は変わらない", () => {
    expect(gradeClassify(classifyTask(), { ...correct, deposits_received: "revenue" }, accountMap).misconceptions).toEqual(["deposit_is_revenue"]);
    expect(gradeClassify(classifyTask(), { ...correct, suspense_payment: "expense" }, accountMap).misconceptions).toEqual(["suspense_is_expense"]);
    expect(gradeClassify(classifyTask(), { ...correct, suspense_receipt: "revenue" }, accountMap).misconceptions).toEqual(["suspense_receipt_is_revenue"]);
  });
});
