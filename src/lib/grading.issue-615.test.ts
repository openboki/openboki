import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { accountMap, unitMap } from "./content";

// Issue #615: 「5つの要素と仕訳」ステップ6で、家賃を現金で払った仕訳の右を未払金・買掛金にすると、
// 借入金と同じ「払い終えたのに支払う義務を書いた」取り違えなのに誤解が付かず汎用文だけが出た
const unit = unitMap.get("bookkeeping-basics/five-elements")!;
const step6 = unit.steps[5].task as TaskOf<"post">;

const entry = (debit: string, credit: string, amount: number) => ({
  debit: [{ account: debit, amount }],
  credit: [{ account: credit, amount }],
});

describe("ステップ6: 家賃を払う", () => {
  it("対象の課題は家賃の支払いの記帳", () => {
    expect(step6.transaction).toContain("家賃");
  });
  it("右を未払金にすると、費用と負債の混同が付く", () => {
    const r = gradePost(step6, entry("rent_expense", "accounts_payable_other", 50000), accountMap);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("expense_as_liability");
    expect(r.feedback).toContain("右は現金");
  });
  it("右を買掛金にすると、費用と負債の混同が付く", () => {
    const r = gradePost(step6, entry("rent_expense", "accounts_payable", 50000), accountMap);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("expense_as_liability");
    expect(r.feedback).toContain("右は現金");
  });
  it("右を借入金にした誤答は、これまでと同じ誤解のまま", () => {
    const r = gradePost(step6, entry("rent_expense", "loans_payable", 50000), accountMap);
    expect(r.misconception).toBe("expense_as_liability");
    expect(r.feedback).toContain("銀行に返す義務");
  });
});
