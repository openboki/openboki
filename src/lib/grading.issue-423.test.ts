import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #423: 当期に生じた売掛金の貸倒れで左に貸倒引当金を書くと、誤解の判定が付かず汎用文だけが出ていた
const GENERIC = "結果の表で何が動くはずか";
const task = unitMap.get("bad-debts/bad-debt-loss")!.steps[4].task;
if (task.type !== "post") throw new Error("postではない");

describe("売掛金が回収できない ステップ5(半分だけ回収できた)", () => {
  it("貸倒損失の代わりに貸倒引当金を書くと、見積もっていない貸倒れには使えないと説明する", () => {
    const result = gradePost(task, {
      debit: [
        { account: "cash", amount: 20000 },
        { account: "allowance_for_doubtful_accounts", amount: 30000 },
      ],
      credit: [{ account: "accounts_receivable", amount: 50000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("allowance_for_unestimated_bad_debt");
    expect(result.feedback).toContain("貸倒引当金");
    expect(result.feedback).toContain("貸倒損失");
    expect(result.feedback).not.toContain(GENERIC);
  });
});
