import { describe, expect, it } from "vitest";
import { units } from "#content";
import { nextUnit, pathsOfUnit, unitMap } from "./content";

// Issue #623: 「5つの要素と仕訳」は3級パスと歴史パスに共通の単元。ふりかえりが3級パスの次の単元を名指しすると、
// 歴史パスを順に進める学習者が商品売買へ送られる。本文は特定の単元を「次」と呼ばず、パスの一覧へ戻る道を出す
describe("複数のパスに共通の単元のふりかえり(Issue #623)", () => {
  const unit = unitMap.get("bookkeeping-basics/five-elements")!;

  it("5つの要素と仕訳は3級パスと歴史パスの両方に含まれる", () => {
    expect(pathsOfUnit(unit.id).map((p) => p.id)).toEqual(["boki-3", "accounting-history"]);
  });

  it("どのパスにも無い単元には学習パスを出さない", () => {
    const outside = units.find((u) => !pathsOfUnit(u.id).length);
    expect(outside, "パスの外の単元(チュートリアル)がある前提").toBeDefined();
    expect(pathsOfUnit(outside!.id)).toEqual([]);
  });

  it("ふりかえりはテーマ順の次の単元「仕入と売上」を名指ししない", () => {
    const text = unit.steps.at(-1)!.narrative;
    expect(nextUnit(unit)!.title).toBe("仕入と売上");
    expect(text).not.toContain("仕入と売上");
    expect(text).not.toMatch(/次の単元「/);
    expect(text).toContain("学習パス");
  });
});
