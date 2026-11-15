import { units } from "#content";
import { describe, expect, it } from "vitest";

// 出典の注記は最終ステップの「出典」欄に学習者向けにそのまま出る。
// 執筆中の照合メモ(「確定時に照合する」「転記しない」など)を公開しない
describe("歴史・不正会計の単元の出典", () => {
  const sourced = units.filter((u) => u.kind === "history" || u.kind === "forensics");

  it("対象の単元がある", () => {
    expect(sourced.length).toBeGreaterThan(0);
  });

  it.each(sourced.map((u) => [u.id, u] as const))("%sの出典の注記に執筆メモが残っていない", (_id, unit) => {
    for (const source of unit.sources) {
      expect(source.note ?? "").not.toMatch(/照合する|確定前|確定時|転記しない/);
    }
  });
});
