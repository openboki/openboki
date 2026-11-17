import { expect, it } from "vitest";
import { accountMap } from "./content";
import { buildStatements } from "./ledger";

// Issue #418: 残高が0になった科目が、そのステップの差分ごと貸借対照表から消えていた
it("残高0でも差分のある科目は金額0の行で残り、差分の無い残高0の科目は出ない", () => {
  const balances = new Map([
    ["cash", 420000],
    ["accounts_receivable", 0],
    ["equipment", 0],
  ]);
  const st = buildStatements(balances, accountMap, new Map([["cash", 20000], ["accounts_receivable", -50000]]));
  expect(st.assets.map((l) => [l.account, l.amount])).toEqual([
    ["cash", 420000],
    ["accounts_receivable", 0],
  ]);
  expect(st.totalAssets).toBe(420000);
});
