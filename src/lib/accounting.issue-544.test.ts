import { describe, expect, it } from "vitest";
import { findAccountByReading, matchesAccountQuery } from "./accounting";
import { unitAccountList, unitMap } from "./content";

// Issue #544: 人名勘定(ジョヴァンニ・ニッコロ・マッテオ)に読みが無く、
// 表記ゆれの「ジョバンニ」「ニコロ」「マテオ」で科目の候補が0件になっていた
const accountsOf = (unitId: string) => unitAccountList(unitMap.get(unitId)!.scenario.accounts);

describe("人名勘定の表記ゆれ(Issue #544)", () => {
  const cases = [
    ["birth-of-double-entry/venetian-method-and-pacioli", "ジョバンニ", "giovanni"],
    ["birth-of-double-entry/venetian-method-and-pacioli", "じょばんに", "giovanni"],
    ["birth-of-double-entry/venetian-method-and-pacioli", "ニコロ", "niccolo"],
    ["birth-of-double-entry/venetian-method-and-pacioli", "にころ", "niccolo"],
    ["birth-of-double-entry/venture-profit-and-double-entry", "ジョバンニ", "giovanni"],
    ["birth-of-double-entry/venture-profit-and-double-entry", "マテオ", "matteo"],
    ["birth-of-double-entry/venture-profit-and-double-entry", "まてお", "matteo"],
  ] as const;

  it.each(cases)("%sで「%s」は%sの候補に当たる", (unitId, query, id) => {
    const hits = accountsOf(unitId).filter((a) => matchesAccountQuery(a, query));
    expect(hits.map((a) => a.id)).toEqual([id]);
  });

  it.each(cases)("%sで「%s」のまま欄を離れると%sとして確定する", (unitId, query, id) => {
    expect(findAccountByReading(query, accountsOf(unitId))?.id).toBe(id);
  });
});
