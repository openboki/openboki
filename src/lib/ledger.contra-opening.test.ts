import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { buildStatements, buildTrialBalance, computeBalances } from "./ledger";

// 開始残高に評価勘定(減価償却累計額)を置く最初の単元。累計額は資産の控除として並び、貸借が一致する
describe("評価勘定を含む開始残高(固定資産の売却)", () => {
  const unit = unitMap.get("depreciation/sale-of-fixed-assets")!;
  const opening = unit.scenario.opening;
  const entries = unit.steps.flatMap((s) => (s.task.type === "post" ? [s.task.answer] : s.task.type === "predict" ? [s.task.entry] : []));

  it("開始時の貸借対照表で累計額が △ になり、資産と負債・純資産が一致する", () => {
    const st = buildStatements(computeBalances(opening, [], accountMap), accountMap);
    expect(st.assets).toContainEqual({ account: "accumulated_depreciation_vehicle", name: "車両運搬具減価償却累計額", amount: -300000, contra: true, temporary: false });
    expect(st.totalAssets).toBe(2300000);
    expect(st.totalLiabilities + st.totalEquity).toBe(2300000);
  });

  it("開始残高の試算表は左右の合計が一致する", () => {
    const tb = buildTrialBalance(opening, [], accountMap);
    expect(tb.debit).toBe(tb.credit);
  });

  it("2つの売却と入金を記帳すると、固定資産と累計額が消えて当期純損失20,000になる", () => {
    const st = buildStatements(computeBalances(opening, entries, accountMap), accountMap);
    expect(st.assets.map((l) => l.account)).toEqual(["cash"]);
    expect(st.assets[0].amount).toBe(2280000);
    expect(st.netIncome).toBe(-20000);
    expect(st.totalLiabilities + st.totalEquity).toBe(2280000);
  });
});
