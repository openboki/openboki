import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { gradePredict, type TaskOf } from "./grading";

// Issue #318: 「貸したお金、借りたお金」の受取利息の予想で、誤答の形ごとに合った誤解を返す
const source = readFileSync("content/topics/receivables-and-payables/loans.md", "utf8");
const blocks = [...source.matchAll(/```task\n([\s\S]*?)```/g)].map((m) => parse(m[1]));
const task = blocks.find((t) => t.type === "predict" && t.transaction.includes("利息2,000円")) as TaskOf<"predict">;

describe("受取利息の予想(Issue #318)", () => {
  it("資産「増える」・収益「変わらない」は、入金と収益の取り違えであって貸付金を減らす誤解ではない", () => {
    const r = gradePredict(task, { asset: "increase", liability: "none", equity: "none", revenue: "none", expense: "none" });
    expect(r.correct).toBe(false);
    expect(r.misconceptions).not.toContain("interest_is_loan_return");
    expect(r.misconceptions).toContain("interest_income_as_cash");
  });

  it("全部「変わらない」は、貸付金が戻ったと読んだ形なので貸付金を減らす誤解のまま", () => {
    const r = gradePredict(task, { asset: "none", liability: "none", equity: "none", revenue: "none", expense: "none" });
    expect(r.misconceptions).toContain("interest_is_loan_return");
    expect(r.misconceptions).not.toContain("interest_income_as_cash");
  });
});
