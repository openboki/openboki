import { describe, expect, it } from "vitest";
import { units } from "#content";

// ```journalブロックの「借方: 現金 2,000」は表記ルールの例外なので、地の文だけを見る
const prose = (narrative: string) => narrative.replace(/```[\s\S]*?```/g, "");

// Issue #279: 「[[id|表示語]] 1,000」と書くと半角スペースがそのまま描画され、「現金1,000」と不揃いになる
describe("用語リンクと数字の間の空白", () => {
  it.each(units.map((u) => u.id))("%s: 地の文の]]の直後に「 数字」が無い", (unitId) => {
    const unit = units.find((u) => u.id === unitId)!;
    const bad = unit.steps.flatMap((s, i) =>
      [...prose(s.narrative).matchAll(/\[\[[^\]]*\]\] [0-9]/g)].map((m) => `step${i + 1} ${m[0]}`),
    );
    expect(bad).toEqual([]);
  });
});
