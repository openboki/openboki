import { describe, expect, it } from "vitest";
import { glossaryAccountList, ideAccountList, unitMap } from "./content";

// Issue #331: 歴史の単元では、時代に無い現代の科目を科目の候補に出さない
describe("歴史の単元の科目", () => {
  const ids = (unitId: string) => ideAccountList(unitMap.get(unitId)!).map((a) => a.id);

  it.each([
    ["birth-of-double-entry/venetian-method-and-pacioli", ["purchases", "accounts_payable", "retained_earnings"]],
    ["birth-of-double-entry/venture-profit-and-double-entry", ["accounts_receivable", "sales", "retained_earnings"]],
  ])("%sに%sが無い", (unitId, modern) => {
    for (const id of modern) expect(ids(unitId)).not.toContain(id);
  });

  it("単元限定の科目と、単元が参照する現代の科目は残る", () => {
    expect(ids("birth-of-double-entry/venetian-method-and-pacioli")).toEqual(expect.arrayContaining(["cash", "cloth_venture", "niccolo", "profit_and_loss"]));
  });

  it("lessonの単元は全体マスタの科目をすべて出す", () => {
    expect(ideAccountList(unitMap.get("bookkeeping-basics/five-elements")!)).toHaveLength(glossaryAccountList.length);
  });
});
