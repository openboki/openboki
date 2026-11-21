import { describe, expect, it } from "vitest";
import { amountTotals, parseAmount } from "./journal-editable";

// カンマを位置を見ずに消していたので、「1,0,0」が100、「30,0」が300と読まれていた(Issue #543)
describe("parseAmountのカンマの位置", () => {
  it.each(["1,0,0", "10,0", "100,", "30,0", ",100", "1,00,000", "1,0000", "１０，０"])("%sは理由を返す", (text) => {
    for (const signed of [false, true]) {
      expect(parseAmount(text, signed)).toHaveProperty("reason", expect.stringContaining("3桁ごと"));
    }
  });

  it("小数のつもりの「30,0」には、単元の通貨の整数で入れるよう伝える", () => {
    expect(parseAmount("30,0", true, "ドゥカート")).toHaveProperty("reason", expect.stringContaining("ドゥカート単位の整数"));
  });

  it.each([
    ["1,000", false, 1000],
    ["30,000円", false, 30000],
    ["３０，０００", false, 30000],
    ["-1,000", true, -1000],
    ["△1,000", true, -1000],
    ["999", false, 999],
  ] as const)("3桁区切りの%sはこれまでどおり読む", (text, signed, value) => {
    expect(parseAmount(text, signed)).toEqual({ value });
  });

  it("崩れたカンマの金額は合計に入れない", () => {
    expect(amountTotals({ debit: [{ accountName: "", amount: "1,0,0" }], credit: [{ accountName: "", amount: "10,0" }] })).toEqual({
      debitTotal: 0,
      creditTotal: 0,
      balanced: false,
    });
  });
});
