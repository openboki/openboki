import { describe, expect, it } from "vitest";
import { units } from "#content";
import { nextUnit, unitMap } from "./content";

const closing = (id: string) => unitMap.get(id)!.steps.at(-1)!.narrative;

// Issue #146: ふりかえりの予告は、1行下の「次の単元」リンクと同じ行き先を指す
describe("ふりかえりの予告", () => {
  it("5つの要素と仕訳は、減価償却を次の話として予告しない", () => {
    const text = closing("bookkeeping-basics/five-elements");
    expect(text).not.toContain("次の単元では、1年の終わりに");
    // 3級パスと歴史パスに共通の単元なので、特定の単元を「次」と名指ししない(Issue #623)
    expect(text).not.toMatch(/次の単元「/);
    // コーヒーマシンの予告そのものを外した。費用ではなく資産と言い切った直後に、少しずつ費用にする話を出さない
    expect(text).not.toContain("固定資産のテーマ");
  });
  it("売れ残りと売上原価は、2テーマ先の固定資産を「次」と呼ばない", () => {
    const text = closing("merchandise/cost-of-goods-sold");
    expect(text).not.toContain("次の固定資産のテーマ");
    expect(text).toContain("後の固定資産のテーマ");
  });
  it("次の単元が無い単元は「次」を予告しない", () => {
    const noNext = units.filter((u) => !nextUnit(u));
    expect(noNext.map((u) => u.id)).toContain("bad-debts/allowance-for-doubtful-accounts");
    for (const u of noNext) expect(closing(u.id), u.id).not.toMatch(/次の単元|次のテーマ|次は/);
  });
});
