import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./accounting";

// Issue #295: 用語集で「t勘定」と小文字で検索すると「T勘定」に当たらなかった
describe("normalizeSearchText(Issue #295)", () => {
  it("英字の大文字・小文字と全角・半角を区別しない", () => {
    const expected = normalizeSearchText("T勘定");
    expect(normalizeSearchText("t勘定")).toBe(expected);
    expect(normalizeSearchText("ｔ勘定")).toBe(expected);
    expect(normalizeSearchText("Ｔ勘定")).toBe(expected);
  });
});
