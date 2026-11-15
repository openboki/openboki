import { describe, expect, it } from "vitest";
import { parseAmount } from "./journal-editable";

// 単元の通貨と違う単位を付けたとき、「半角の数字だけで」ではなく単位の違いを伝える(Issue #309)
describe("parseAmount 単元と違う通貨名", () => {
  it("ドゥカートの単元で「70円」は、単元の通貨がドゥカートだと伝える", () => {
    for (const signed of [false, true]) {
      const r = parseAmount("70円", signed, "ドゥカート");
      expect(r).toEqual({ reason: "この単元の金額はドゥカートです。「円」を外して数字だけ入れてください" });
    }
  });

  it("円の単元で「5000ドゥカート」は、単元の通貨が円だと伝える", () => {
    expect(parseAmount("5000ドゥカート", false, "円")).toEqual({
      reason: "この単元の金額は円です。「ドゥカート」を外して数字だけ入れてください",
    });
    expect(parseAmount("5,000 ドゥカート")).toHaveProperty("reason", expect.stringContaining("この単元の金額は円です"));
  });

  it("単元の通貨名はこれまでどおり外して読む", () => {
    expect(parseAmount("70ドゥカート", false, "ドゥカート")).toEqual({ value: 70 });
    expect(parseAmount("70円")).toEqual({ value: 70 });
  });

  it("通貨名でない単位はこれまでどおり「半角の数字だけで」", () => {
    expect(parseAmount("120万")).toEqual({ reason: "半角の数字だけで入力してください(例: 100000)" });
  });
});
