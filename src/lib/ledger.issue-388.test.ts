import { expect, it } from "vitest";
import { accountMap } from "./content";
import { buildStatements } from "./ledger";

// Issue #388: 減価償却累計額が資産の末尾にまとまり、控除する資産と隣り合わなかった
it("貸借対照表の資産は、固定資産ごとにその減価償却累計額が直後に並ぶ", () => {
  const balances = new Map([
    ["accumulated_depreciation_vehicle", -300000],
    ["vehicle", 1200000],
    ["accumulated_depreciation_building", -100000],
    ["accumulated_depreciation_equipment", -150000],
    ["equipment", 600000],
    ["building", 2000000],
    ["cash", 950000],
  ]);
  const { assets } = buildStatements(balances, accountMap);
  expect(assets.map((l) => l.account)).toEqual([
    "cash",
    "building",
    "accumulated_depreciation_building",
    "equipment",
    "accumulated_depreciation_equipment",
    "vehicle",
    "accumulated_depreciation_vehicle",
  ]);
});
