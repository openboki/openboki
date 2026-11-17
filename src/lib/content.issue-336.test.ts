import { describe, expect, it } from "vitest";
import { unitAccountList, unitMap } from "./content";

// Issue #336: 単元限定の科目の「もっと見る」が行き止まりで、説明文が言う人名勘定・口別計算へ進めなかった
describe("単元限定の科目の関連", () => {
  it("conceptsを関連として名前付きで出す", () => {
    const pepper = { id: "pepper_voyage", name: "胡椒(アレクサンドリア航海)", reading: ["こしょう"], element: "asset" as const, why: "口別の勘定です。", concepts: ["venture_accounting"] };
    const entry = unitAccountList([pepper]).find((a) => a.id === "pepper_voyage")!.glossary;
    expect(entry.related).toEqual([{ id: "venture_accounting", name: "口別計算" }]);
  });

  it.each([
    ["birth-of-double-entry/venetian-method-and-pacioli", "pepper_voyage", "venture_accounting"],
    ["birth-of-double-entry/venetian-method-and-pacioli", "giovanni", "personal_account"],
    ["birth-of-double-entry/venetian-method-and-pacioli", "owner_capital", "equity"],
    ["birth-of-double-entry/venetian-method-and-pacioli", "profit_and_loss", "profit_and_loss_account"],
    ["birth-of-double-entry/venture-profit-and-double-entry", "giovanni", "personal_account"],
    ["birth-of-double-entry/venture-profit-and-double-entry", "wine_voyage", "venture_accounting"],
    ["birth-of-double-entry/venture-profit-and-double-entry", "owner_capital", "equity"],
  ])("%sの%sから%sへ進める", (unitId, accountId, conceptId) => {
    const unit = unitMap.get(unitId)!;
    const entry = unitAccountList(unit.scenario.accounts).find((a) => a.id === accountId)!.glossary;
    expect(entry.related.map((r) => r.id)).toContain(conceptId);
  });

  it("歴史の単元限定の科目はすべて関連を持つ", () => {
    for (const unit of unitMap.values()) {
      for (const a of unit.scenario.accounts) expect(a.concepts, `${unit.id}の${a.id}`).not.toEqual([]);
    }
  });
});
