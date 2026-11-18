import { describe, expect, it } from "vitest";
import { groupAccountCandidates } from "./accounting";
import { unitAccountList, unitMap } from "./content";

// Issue #425: 名前が入力で始まる科目を候補の先頭に出す
describe("groupAccountCandidates(Issue #425)", () => {
  const accounts = unitAccountList(unitMap.get("bookkeeping-basics/five-elements")!.scenario.accounts);
  const names = (query: string) => groupAccountCandidates(accounts, query).flatMap((g) => g.items.map((a) => a.name));

  it("「借」では借入金が当座借越より先に並ぶ", () => {
    const list = names("借");
    expect(list[0]).toBe("借入金");
    expect(list).toContain("当座借越");
  });

  it("「受」では別の要素の受取利息が負債の前受金より先に並ぶ", () => {
    const groups = groupAccountCandidates(accounts, "受");
    expect(groups[0].element).toBe("revenue");
    expect(names("受")[0]).toBe("受取利息");
    expect(names("受")).toContain("前受金");
  });

  it("前方一致が無い要素どうしは要素順のまま", () => {
    expect(groupAccountCandidates(accounts, "").map((g) => g.element)).toEqual(["asset", "liability", "equity", "revenue", "expense"]);
    expect(names("売").slice(0, 2)).toEqual(["売掛金", "売上"]);
  });
});
