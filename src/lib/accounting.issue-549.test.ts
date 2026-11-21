import { describe, expect, it } from "vitest";
import { groupAccountCandidates } from "./accounting";
import { unitAccountList, unitMap } from "./content";

// Issue #549: 前方一致の科目は、別の要素グループの部分一致より先に並ぶ
describe("groupAccountCandidates(Issue #549)", () => {
  const accounts = unitAccountList(unitMap.get("merchandise/three-account-method")!.scenario.accounts);
  const names = (query: string) => groupAccountCandidates(accounts, query).flatMap((g) => g.items.map((a) => a.name));
  const before = (list: string[], a: string, b: string) => {
    expect(list).toContain(a);
    expect(list).toContain(b);
    expect(list.indexOf(a)).toBeLessThan(list.indexOf(b));
  };

  it("「し」では仕入・資本金・支払家賃が貸倒引当金・減価償却累計額より先に並ぶ", () => {
    const list = names("し");
    for (const hit of ["仕入", "資本金", "支払家賃"]) {
      before(list, hit, "貸倒引当金");
      before(list, hit, "減価償却累計額");
    }
  });

  it("「う」では売上・受取利息が当座預金・普通預金より先に並ぶ", () => {
    const list = names("う");
    for (const hit of ["売上", "受取利息"]) {
      before(list, hit, "当座預金");
      before(list, hit, "普通預金");
    }
  });
});
