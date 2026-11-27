import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { gradeClassify } from "./grading";

// Issue #616: 仕分け(5つの箱に分ける)で、前のステップで誤解を付けた取り違えと同じ誤答をしても誤解が付かなかった
const classifyTask = () => {
  const t = unitMap.get("bookkeeping-basics/five-elements")!.steps.find((s) => s.task.type === "classify")!.task;
  if (t.type !== "classify") throw new Error("classifyではない");
  return t;
};

const correct = { cash: "asset", equipment: "asset", loans_payable: "liability", capital_stock: "equity", sales: "revenue", rent_expense: "expense" };

describe("5つの要素と仕訳 ステップ7: 前のステップと同じ取り違えに同じ誤解が付く", () => {
  it.each([
    ["資本金 → 負債", "capital_stock", "liability", "capital_loan_confused"],
    ["借入金 → 純資産", "loans_payable", "equity", "capital_loan_confused"],
    ["支払家賃 → 資産", "rent_expense", "asset", "expense_as_asset"],
    ["売上 → 負債", "sales", "liability", "sale_proceeds_as_capital_or_loan"],
  ])("%s", (_label, account, wrong, misconception) => {
    const result = gradeClassify(classifyTask(), { ...correct, [account]: wrong }, accountMap);
    expect(result.correct).toBe(false);
    expect(result.misconceptions).toEqual([misconception]);
  });
});
