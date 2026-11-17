import { describe, expect, it } from "vitest";
import { findAccountByReading, matchesAccountQuery } from "./accounting";
import { unitAccountList, unitMap } from "./content";

// Issue #366: 単元限定の科目(scenario.accounts)も読みで引ける
describe("単元限定の科目の読み", () => {
  const accounts = unitAccountList(unitMap.get("birth-of-double-entry/venetian-method-and-pacioli")!.scenario.accounts);
  it.each([
    ["きぬ", "cloth_venture"],
    ["こしょう", "pepper_voyage"],
    ["りえきとそんしつ", "profit_and_loss"],
    ["もとで", "owner_capital"],
  ])("「%s」で%sが候補に出て、読みの完全一致でも決まる", (reading, id) => {
    expect(accounts.filter((a) => matchesAccountQuery(a, reading)).map((a) => a.id)).toContain(id);
    expect(findAccountByReading(reading, accounts)?.id).toBe(id);
  });
  it("読みはポップオーバーの項目にも渡る", () => {
    expect(accounts.find((a) => a.id === "owner_capital")!.glossary.reading).toEqual(["もとで"]);
  });
  it("読みを書いていない科目は空の配列になる", () => {
    expect(accounts.find((a) => a.id === "giovanni")!.reading).toEqual([]);
  });
});
