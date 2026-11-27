import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #617: 貸借を逆にしたうえで科目も取り違えると、どの誤答パターンにも当たらず
// 「5つの要素の動きは合っています」か汎用文だけが出て、誤解が付いていなかった
describe("商品以外の後払いと手付金の複合誤答", () => {
  const unit = unitMap.get("receivables-and-payables/other-receivables-and-payables")!;
  const showcase = unit.steps[1].task;
  const deposit = unit.steps[3].task;
  if (showcase.type !== "post" || deposit.type !== "post") throw new Error("postではない");
  const one = (debit: string, credit: string, amount: number) => ({
    debit: [{ account: debit, amount }],
    credit: [{ account: credit, amount }],
  });

  it("ステップ2の備品 / 売掛金は売掛金の誤解が付き、向きにも触れる", () => {
    const r = gradePost(showcase, one("equipment", "accounts_receivable", 50000), accountMap);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("nontrade_as_trade");
    expect(r.feedback).toContain("未収入金");
    expect(r.feedback).toContain("左");
    expect(r.feedback).not.toContain("5つの要素の動きは合っています");
  });

  it("ステップ2の備品 / 未払金は未収入金と未払金の取り違えが付く", () => {
    const r = gradePost(showcase, one("equipment", "accounts_payable_other", 50000), accountMap);
    expect(r.misconception).toBe("nontrade_receivable_payable_confused");
    expect(r.feedback).toContain("未収入金");
  });

  it("ステップ2の単独の誤りの判定は変わらない", () => {
    expect(gradePost(showcase, one("equipment", "accounts_receivable_other", 50000), accountMap).misconception).toBe("outflow_on_debit");
    expect(gradePost(showcase, one("accounts_receivable", "equipment", 50000), accountMap).misconception).toBe("nontrade_as_trade");
    expect(gradePost(showcase, one("accounts_payable_other", "equipment", 50000), accountMap).misconception).toBe("nontrade_receivable_payable_confused");
    expect(gradePost(showcase, one("accounts_receivable_other", "equipment", 50000), accountMap).correct).toBe(true);
  });

  it("ステップ4の現金 / 未収入金・現金 / 前受金・現金 / 仕入に、取り違えた科目の誤解が付く", () => {
    const cases: [string, string][] = [
      ["accounts_receivable_other", "advance_payment_as_receivable"],
      ["advance_received", "advance_payment_received_confused"],
      ["purchases", "advance_is_expense"],
    ];
    for (const [credit, misconception] of cases) {
      const r = gradePost(deposit, one("cash", credit, 10000), accountMap);
      expect(r.correct, credit).toBe(false);
      expect(r.misconception, credit).toBe(misconception);
      expect(r.feedback, credit).toContain("前払金");
      expect(r.feedback, credit).not.toContain("5つの要素の動きは合っています");
    }
  });

  it("ステップ4の単独の誤りの判定は変わらない", () => {
    expect(gradePost(deposit, one("cash", "advance_payment", 10000), accountMap).misconception).toBe("outflow_on_debit");
    expect(gradePost(deposit, one("purchases", "cash", 10000), accountMap).misconception).toBe("advance_is_expense");
    expect(gradePost(deposit, one("advance_received", "cash", 10000), accountMap).misconception).toBe("advance_payment_received_confused");
    expect(gradePost(deposit, one("accounts_receivable_other", "cash", 10000), accountMap).misconception).toBe("advance_payment_as_receivable");
    expect(gradePost(deposit, one("advance_payment", "cash", 10000), accountMap).correct).toBe(true);
  });
});
