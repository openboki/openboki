import { describe, expect, it } from "vitest";
import { unitMap } from "./content";

// Issue #553: 複式簿記の言い換えを概念double_entryの定義(2つのページの左と右に同じ額)に揃える。
// 「2か所に書く」だけでは、この単元の覚え書きから人名勘定へ写す手順と区別できない
describe("覚え書きと人名勘定の複式簿記の説明", () => {
  const unit = unitMap.get("birth-of-double-entry/memorandum-and-personal-accounts")!;
  const first = unit.steps[0].narrative;
  const last = unit.steps[unit.steps.length - 1].narrative;

  it("ステップ1は複式簿記を2つのページの左と右に同じ額で書くものとして紹介する", () => {
    expect(first).not.toMatch(/2か所に書く複式簿記/);
    expect(first).toMatch(/2つのページの左と右に同じ額で書く複式簿記/);
  });

  it("ふりかえりは次の単元の予告を「2か所に書き始める」とは言わない", () => {
    expect(last).not.toMatch(/同じ出来事を2か所に書き始め/);
    expect(last).toMatch(/2つのページの左と右に同じ額で書き始め/);
  });

  it("次の単元が前の単元を引くとき、元の文のとおり「この店にはまだありません」と書く", () => {
    const next = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;
    const texts = next.steps.map((s) => s.narrative).join("\n");
    expect(texts).not.toMatch(/「この店にはまだない」/);
    expect(texts).toMatch(/「この店にはまだありません」/);
  });
});
