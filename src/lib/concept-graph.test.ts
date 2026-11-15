import { describe, expect, it } from "vitest";
import { buildConceptLinks, CATEGORY_COLORS } from "./concept-graph";
import { conceptList, sortedDomains } from "./content";

describe("buildConceptLinks", () => {
  it("同じ2概念を結ぶ関係は、種類や向きが違っても1本にまとめる", () => {
    const links = buildConceptLinks([
      { id: "a", requires: [], related: ["b", "c"], contrasts: ["c"] },
      { id: "b", requires: ["a"], related: ["a"], contrasts: [] },
      { id: "c", requires: [], related: ["a"], contrasts: ["a"] },
    ]);
    expect(links).toEqual([
      { source: "a", target: "b" },
      { source: "a", target: "c" },
    ]);
  });

  it("実際の概念で、どの概念も少なくとも1本の線につながる", () => {
    const connected = new Set(buildConceptLinks(conceptList).flatMap((l) => [l.source, l.target]));
    expect(conceptList.filter((c) => !connected.has(c.id)).map((c) => c.id)).toEqual([]);
  });

  it("分野の数が色トークンの数に収まる", () => {
    expect(sortedDomains.length).toBeLessThanOrEqual(CATEGORY_COLORS);
  });
});
