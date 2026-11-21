import { describe, expect, it } from "vitest";
import { topics, units } from "#content";
import { illustrationUses } from "./illustration-usage";
import { ILLUSTRATION_NAMES } from "./illustrations";

// Issue #506: イラスト一覧に出す使用箇所の集計
describe("illustrationUses", () => {
  it("テーマ、ステップの見出し、当事者の図を1つの一覧にまとめる", () => {
    const uses = illustrationUses(
      [{ id: "t1", title: "テーマ1", illustration: "cafe" }, { id: "t2", title: "テーマ2" }],
      [
        {
          id: "t1/u1",
          title: "単元1",
          steps: [
            { illustration: "cafe", figures: [] },
            { figures: [{ type: "flow" }] },
            { illustration: "cafe", figures: [{ type: "parties", rows: [{ left: { illustration: "cafe" }, right: { illustration: "bank" } }, { left: { illustration: "cafe" }, right: { illustration: "bakery" } }] }] },
          ],
        },
      ],
    );
    expect(uses.get("cafe")).toEqual([
      { href: "/topics/t1", title: "テーマ1", detail: "テーマの絵" },
      { href: "/units/t1/u1", title: "単元1", detail: "ステップ1・3、ステップ3の図" },
    ]);
    expect(uses.get("bank")).toEqual([{ href: "/units/t1/u1", title: "単元1", detail: "ステップ3の図" }]);
    expect(uses.has("cash")).toBe(false);
  });

  it("いまのコンテンツでは、どの絵も1か所以上で使っている", () => {
    const uses = illustrationUses(topics, units);
    expect(ILLUSTRATION_NAMES.filter((name) => !uses.has(name))).toEqual([]);
  });
});
