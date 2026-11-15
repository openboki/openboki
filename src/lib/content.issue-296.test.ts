import { expect, it } from "vitest";
import { conceptMap } from "./content";

// Issue #296: 3帳簿のaliasesに3冊の帳簿の名前(覚え書き・仕訳帳・元帳)を持たない
// 別名は同じものの言い換えで、用語集の表示と完全一致の検索に使う。3冊の名前はshortとsummaryで説明する
it("3帳簿の別名に覚え書き・仕訳帳・元帳を含めない", () => {
  const aliases = conceptMap.get("three_books")!.aliases;
  expect(aliases.filter((a) => /覚え書き|仕訳帳|元帳/.test(a))).toEqual([]);
});
