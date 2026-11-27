import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { gradeClassify } from "./grading";

// Issue #634: 「金庫のお金が合わない」ステップ7の仕分けで雑損を負債に入れても、
// task.misconceptionsが空で誤解が付かなかった(classifyステップで空なのはこの単元だけだった)
const classifyTask = () => {
  const t = unitMap.get("cash-and-deposits/cash-over-and-short")!.steps.find((s) => s.task.type === "classify")!.task;
  if (t.type !== "classify") throw new Error("classifyではない");
  return t;
};

const correct = { cash: "asset", bank_deposit: "asset", communication_expense: "expense", miscellaneous_loss: "expense" };

describe("金庫のお金が合わない ステップ7: 費用を別の箱に入れると取り違えの型が付く", () => {
  it("雑損 → 負債は費用と負債の混同", () => {
    const result = gradeClassify(classifyTask(), { ...correct, miscellaneous_loss: "liability" }, accountMap);
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("expense_as_liability");
    expect(result.misconceptions).toEqual(["expense_as_liability"]);
  });

  it("雑損 → 資産は費用と資産の混同、雑損 → 純資産は元手を直接減らす誤解", () => {
    expect(gradeClassify(classifyTask(), { ...correct, miscellaneous_loss: "asset" }, accountMap).misconceptions).toEqual(["expense_as_asset"]);
    expect(gradeClassify(classifyTask(), { ...correct, miscellaneous_loss: "equity" }, accountMap).misconceptions).toEqual(["payment_reduces_capital"]);
  });

  it("通信費も雑損と同じ型が付く", () => {
    expect(gradeClassify(classifyTask(), { ...correct, communication_expense: "liability" }, accountMap).misconceptions).toEqual(["expense_as_liability"]);
    expect(gradeClassify(classifyTask(), { ...correct, communication_expense: "asset" }, accountMap).misconceptions).toEqual(["expense_as_asset"]);
    expect(gradeClassify(classifyTask(), { ...correct, communication_expense: "equity" }, accountMap).misconceptions).toEqual(["payment_reduces_capital"]);
  });

  it("正解なら誤解は付かない", () => {
    expect(gradeClassify(classifyTask(), correct, accountMap).correct).toBe(true);
  });
});

it("科目を箱に分けるclassifyステップに、misconceptionsが空の単元が無い", () => {
  for (const unit of unitMap.values()) {
    for (const [i, step] of unit.steps.entries()) {
      if (step.task.type !== "classify" || step.task.labels) continue;
      expect(Object.keys(step.task.misconceptions).length, `${unit.id} ステップ${i + 1}`).toBeGreaterThan(0);
    }
  }
});
