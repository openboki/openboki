import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

type LearningPath = { sections: { units: string[] }[] };

// Issue #524: 歴史パスの単元が、歴史パスに無い3級パスの単元を「あとの単元」と呼ぶと、
// 歴史パスだけを順に進める学習者には行き先の位置が分からない。
// 「あとの単元」と呼べるのは、同じパスで後ろに来る単元だけ
describe("歴史パスの「あとの単元」の行き先(Issue #524)", () => {
  const path = parse(readFileSync("content/paths/accounting-history.yaml", "utf8")) as LearningPath;
  const order = path.sections.flatMap((s) => s.units);

  it.each(order.map((unitId, index) => [unitId, index]))("%sが「あとの単元」と呼ぶ単元は歴史パスで後ろに来る", (unitId, index) => {
    const body = readFileSync(`content/topics/${unitId}.md`, "utf8");
    const targets = [...body.matchAll(/あとの単元[^\n]*?\]\(\/units\/([^)]+)\)/g)].map((m) => m[1]);
    for (const target of targets) expect(order.indexOf(target), `${unitId} → ${target}`).toBeGreaterThan(index);
  });
});
