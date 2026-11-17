import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost, type TaskOf } from "./grading";

// Issue #408: 現金過不足の雑損への振り替えで、通信費へ移した2,000を引き忘れて総額3,000を雑損にする誤答
describe("現金過不足 ステップ5の雑損3,000", () => {
  const unit = unitMap.get("cash-and-deposits/cash-over-and-short")!;
  const task = unit.steps.find((s) => s.task?.type === "post" && s.task.answer.debit[0].account === "miscellaneous_loss")!.task as TaskOf<"post">;

  it("通信費へ移した2,000を引く案内と誤解IDを返す", () => {
    const r = gradePost(task, { debit: [{ account: "miscellaneous_loss", amount: 3000 }], credit: [{ account: "cash_over_and_short", amount: 3000 }] });
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("2,000");
    expect(r.feedback).not.toContain("金額をもう一度確かめましょう");
    expect(r.misconception).toBe("forget_transferred_portion");
  });
  it("貸借がそろっていなければ従来どおり貸借不一致の案内", () => {
    const r = gradePost(task, { debit: [{ account: "miscellaneous_loss", amount: 3000 }], credit: [{ account: "cash_over_and_short", amount: 1000 }] });
    expect(r.feedback).toContain("そろっていません");
  });
  it("右に現金を書いた誤答は現金の案内のまま", () => {
    const r = gradePost(task, { debit: [{ account: "miscellaneous_loss", amount: 3000 }], credit: [{ account: "cash", amount: 3000 }] });
    expect(r.feedback).toContain("現金はもう実際の金額に直してあります");
  });
});
