import { describe, expect, it } from "vitest";
import { unitAccountList, unitMap } from "./content";
import { buildTrialBalance } from "./ledger";
import { gradePost, type TaskOf } from "./grading";

// Issue #447: ワインを10樽売り切っていたので、胡椒の口だけ閉じるステップ7でワインの口にもうけ5が残ったまま単元が終わっていた。
// ワインは一部だけ売れた途中の口にして、胡椒と一緒に閉じる誤答には誤解IDを付ける
const venture = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;
const accounts = new Map(unitAccountList(venture.scenario.accounts).map((a) => [a.id, a]));
const debug = venture.steps[5].task as TaskOf<"debug">;
const task = venture.steps[6].task as TaskOf<"post">;

describe("航海の儲けと複式の発見で、ワインの口は売れ残りがある途中の口", () => {
  it("ステップ6の取引で、ワインは10樽のうち一部だけ売れている", () => {
    const memos = debug.entries.map((e) => e.memo ?? "");
    expect(memos.some((m) => m.includes("ワイン10樽"))).toBe(true);
    const sold = memos.filter((m) => /ワイン(\d+)樽を\d+ドゥカートで売った/.test(m)).map((m) => Number(m.match(/ワイン(\d+)樽/)![1]));
    expect(sold.reduce((t, n) => t + n, 0)).toBeLessThan(10);
  });

  it("ステップ7の時点で、ワインの口は左が右より大きい(もうけが残っていない)", () => {
    const fixed = debug.entries.map((e, i) => (i === debug.answer.index ? debug.answer.entry : { debit: e.debit, credit: e.credit }));
    const earlier = venture.steps.slice(0, 5).flatMap((s) => (s.task?.type === "observe" ? s.task.entries : s.task?.type === "post" ? [s.task.answer] : []));
    const tb = buildTrialBalance(venture.scenario.opening, [...earlier, ...fixed], accounts);
    const wine = tb.lines.find((l) => l.account === "wine_voyage")!;
    expect(wine.debit).toBeGreaterThan(wine.credit);
  });

  it("ステップ7の本文と成功文が、ワインの航海が終わっていないことを言う", () => {
    expect(venture.steps[6].narrative).toContain("まだ終わっていません");
    expect(task.success).toContain("売れ残っている");
    expect(task.success).not.toContain("財産がいくら増えたか");
  });

  it("胡椒30 / 元手30が正解のまま", () => {
    expect(gradePost(task, task.answer, accounts, "history").correct).toBe(true);
  });

  it("胡椒とワインを合わせて閉じるとventure_closed_before_endで、ワインが終わっていないと説明する", () => {
    const r = gradePost(
      task,
      { debit: [{ account: "pepper_voyage", amount: 30 }], credit: [{ account: "wine_voyage", amount: 10 }, { account: "owner_capital", amount: 20 }] },
      accounts,
      "history",
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_closed_before_end");
    expect(r.feedback).toContain("まだ終わっていません");
  });

  it("借方 ワイン30 / 貸方 元手30は従来どおりventure_account_mixed", () => {
    const r = gradePost(task, { debit: [{ account: "wine_voyage", amount: 30 }], credit: [{ account: "owner_capital", amount: 30 }] }, accounts, "history");
    expect(r.misconception).toBe("venture_account_mixed");
  });
});
