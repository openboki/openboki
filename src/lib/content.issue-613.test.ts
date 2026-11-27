import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { accountMap, unitMap } from "./content";

// Issue #613: 「ヴェネツィア式とパチョーリ」で、絹の口に書くところを胡椒の口に書いても、
// ステップ6でかかった額100を利益と損失へ移しても、誤解が付かず汎用文だけが出た
const unit = unitMap.get("birth-of-double-entry/venetian-method-and-pacioli")!;
const step3 = unit.steps[2].task as TaskOf<"post">;
const step6 = unit.steps[5].task as TaskOf<"post">;

const entry = (debit: string, credit: string, amount: number) => ({
  debit: [{ account: debit, amount }],
  credit: [{ account: credit, amount }],
});

describe("ステップ3: 絹を買った額を仕訳帳に書く", () => {
  it("左を胡椒の口にすると、航海の口を取り違える誤解が付く", () => {
    const r = gradePost(step3, entry("pepper_voyage", "niccolo", 100), accountMap, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_account_mixed");
    expect(r.feedback).toContain("絹(フランドル航海)のページ");
  });
  it("左右逆の誤答は、胡椒の行より前の貸借逆の行で説明したまま", () => {
    const r = gradePost(step3, entry("niccolo", "cloth_venture", 100), accountMap, "history");
    expect(r.misconception).toBe("credit_purchase_as_claim");
  });
});

describe("ステップ6: 絹の口のもうけを利益と損失へ移す", () => {
  it("左を胡椒の口にすると、航海の口を取り違える誤解が付く", () => {
    const r = gradePost(step6, entry("pepper_voyage", "profit_and_loss", 30), accountMap, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_account_mixed");
    expect(r.feedback).toContain("胡椒ではなく絹のページ");
  });
  it("かかった額100を移すと、ステップ5の100と同じ誤解が付く", () => {
    const r = gradePost(step6, entry("cloth_venture", "profit_and_loss", 100), accountMap, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_cost_as_profit");
    expect(r.feedback).toContain("100は絹にかかった額です");
  });
  it("売れた額130を移す誤答は、これまでと同じ誤解のまま", () => {
    const r = gradePost(step6, entry("cloth_venture", "profit_and_loss", 130), accountMap, "history");
    expect(r.misconception).toBe("venture_sales_as_profit");
  });
});
