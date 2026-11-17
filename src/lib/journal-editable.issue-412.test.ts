import { describe, expect, it } from "vitest";
import { amountTotals } from "./journal-editable";

// 科目の無い行を合計から外すと、左右に1,000が見えているのに「貸方合計0 不一致」と出ていた(Issue #412)
describe("amountTotals", () => {
  it("科目が空でも金額欄の数字を合計する", () => {
    const totals = amountTotals({ debit: [{ accountName: "", amount: "1000" }], credit: [{ accountName: "", amount: "1,000" }] });
    expect(totals).toEqual({ debitTotal: 1000, creditTotal: 1000, balanced: true });
  });

  it("片側だけ科目を入れても、もう片側の金額を落とさない", () => {
    const totals = amountTotals({ debit: [{ accountName: "現金", amount: "1000" }], credit: [{ accountName: "", amount: "1000" }] });
    expect(totals).toEqual({ debitTotal: 1000, creditTotal: 1000, balanced: true });
  });

  it("解釈できない金額は合計に入れない", () => {
    const totals = amountTotals({ debit: [{ accountName: "", amount: "1000" }, { accountName: "", amount: "abc" }], credit: [{ accountName: "", amount: "" }] });
    expect(totals).toEqual({ debitTotal: 1000, creditTotal: 0, balanced: false });
  });

  it("単元の通貨単位を付けた金額も読む", () => {
    const totals = amountTotals({ debit: [{ accountName: "", amount: "300ドゥカート" }], credit: [{ accountName: "", amount: "300" }] }, "ドゥカート");
    expect(totals.balanced).toBe(true);
  });
});
