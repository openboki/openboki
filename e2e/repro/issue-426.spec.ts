import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// ふりかえりの要約が、当座借越の前提(契約)を落とさない
const unit = JSON.parse(readFileSync(".velite/units.json", "utf8")).find(
  (u: { id: string }) => u.id === "cash-and-deposits/checking-account",
);
const recap = unit.steps.find((s: { title: string }) => s.title === "ふりかえり");

test("小切手で払う ふりかえりで当座借越の契約に触れる(ステップ9)", () => {
  expect(recap.narrative).toContain("当座預金はマイナス");
  expect(recap.narrative).toMatch(/契約/);
});
