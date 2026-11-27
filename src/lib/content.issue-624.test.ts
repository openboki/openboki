import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradePost, gradePredict } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #624: 「貸したお金、借りたお金」で、普通預金を当座預金と書く誤答(ステップ2・4・6)と
// 2%を0.002とした利息300(ステップ5)に誤解が付かず、ステップ3の予想では説明文が2つ重なった
const unit = unitMap.get("receivables-and-payables/loans")!;

function task<T extends "post" | "predict" | "calc">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

const post = (step: number, debit: [string, number][], credit: [string, number][]) =>
  gradePost(task(step, "post"), { debit: debit.map(([account, amount]) => ({ account, amount })), credit: credit.map(([account, amount]) => ({ account, amount })) }, accountMap);

describe("普通預金を当座預金と書く誤答", () => {
  const cases: [string, number, [string, number][], [string, number][]][] = [
    ["ステップ2: 貸し付けの右", 1, [["loans_receivable", 100000]], [["checking_account", 100000]]],
    ["ステップ4: 利息の支払いの右", 3, [["interest_expense", 3000]], [["checking_account", 3000]]],
    ["ステップ6: 返済の左", 5, [["checking_account", 100000]], [["loans_receivable", 100000]]],
  ];
  it.each(cases)("%sに、預金はどれも同じ科目の誤解が付く", (_, step, debit, credit) => {
    const r = post(step, debit, credit);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("deposit_kinds_confused");
    expect(r.feedback).toContain("普通預金");
  });
});

describe("ステップ3: 利息を受け取る(予想)", () => {
  it("資産と収益を変わらないにすると、説明は貸付金が減る誤解の1文だけで重ならない", () => {
    const r = gradePredict(task(2, "predict"), { asset: "none", liability: "none", equity: "increase", revenue: "none", expense: "none" });
    expect(r.correct).toBe(false);
    expect(r.misconceptions).toEqual(["interest_is_loan_return"]);
    expect(r.feedback.split("\n")).toHaveLength(1);
    expect(r.feedback).not.toContain("貸付金は減りませんが");
  });
  it("収益は見えていて資産だけ見落とした回答には、預金が増える説明が出る", () => {
    const r = gradePredict(task(2, "predict"), { asset: "none", liability: "none", equity: "increase", revenue: "increase", expense: "none" });
    expect(r.feedback).toContain("貸付金は減りませんが");
    expect(r.misconceptions).toEqual([]);
  });
});

describe("ステップ5: 利息の計算", () => {
  it.each([
    ["2%を0.002とした300", 300, "0.002"],
    ["2%を0.2とした30,000", 30000, "0.2"],
  ] as const)("%sに、%%を小数に直すときの桁違いの誤解が付く", (_, value, keyword) => {
    const r = gradeCalc(task(4, "calc"), value);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("percent_off_by_ten");
    expect(r.feedback).toContain(keyword);
  });
  it("誤解の定義は10倍と10分の1の両方向を書いている", () => {
    const m = misconceptionMap.get("percent_off_by_ten")!;
    expect(m.description).toContain("0.002");
    expect(m.description).toContain("0.2");
  });
});
