import { describe, expect, it } from "vitest";
import { buildConceptEdges } from "./concept-graph";
import { conceptList } from "./content";

describe("buildConceptEdges", () => {
  it("前提は、前提になる概念から学ぶ概念へ向ける", () => {
    const edges = buildConceptEdges([
      { id: "a", requires: [], related: [], contrasts: [] },
      { id: "b", requires: ["a"], related: [], contrasts: [] },
    ]);
    expect(edges).toEqual([{ id: "a|b", source: "a", target: "b", kind: "requires" }]);
  });

  it("同じ2概念を結ぶ関係は1本にまとめ、前提 > 対比 > 関連の順で残す", () => {
    const edges = buildConceptEdges([
      { id: "a", requires: [], related: ["b", "c"], contrasts: ["c"] },
      { id: "b", requires: ["a"], related: ["a"], contrasts: ["a"] },
      { id: "c", requires: [], related: ["a"], contrasts: ["a"] },
    ]);
    expect(edges.map((e) => [e.id, e.kind])).toEqual([
      ["a|b", "requires"],
      ["a|c", "contrasts"],
    ]);
  });

  it("実際の概念で、どの概念も少なくとも1本の線につながる", () => {
    const edges = buildConceptEdges(conceptList);
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]));
    expect(conceptList.filter((c) => !connected.has(c.id)).map((c) => c.id)).toEqual([]);
    expect(new Set(edges.map((e) => e.id)).size).toBe(edges.length);
  });
});
