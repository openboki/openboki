import { describe, expect, it } from "vitest";
import { misconceptionMap, unitMap } from "./content";

// Issue #450: 「貸したお金、借りたお金」の誤答パターンに誤解IDも免除の理由も無く、
// 単元が想定した誤答(利息を1年分で答える、貸付金の左を支払利息にする)で「よくある思い込み」が出なかった。
// 貸借不一致以外の誤答パターンは、misconceptionかno_misconceptionのどちらかを持つ(docs/content-model.md 3.5)
describe("貸したお金、借りたお金 の誤答パターン(Issue #450)", () => {
  const unit = unitMap.get("receivables-and-payables/loans")!;
  const patterns = unit.steps.flatMap((step, index) => {
    const task = step.task;
    if (!task || !("wrong_patterns" in task)) return [];
    return task.wrong_patterns
      .filter((p) => !(typeof p.match === "object" && p.match !== null && "unbalanced" in p.match))
      .map((p) => ({ step: index + 1, type: task.type, p }));
  });

  it("貸借不一致以外の誤答パターンがある", () => {
    expect(patterns.length).toBeGreaterThan(0);
  });

  it.each(patterns.map(({ step, type, p }) => [step, type, JSON.stringify(p.match), p]))(
    "ステップ%i(%s)の誤答%sに誤解IDか免除の理由がある",
    (_step, _type, _match, p) => {
      expect(Boolean(p.misconception) !== Boolean(p.no_misconception)).toBe(true);
      if (p.misconception) expect(misconceptionMap.has(p.misconception)).toBe(true);
    },
  );

  it("利息を1年分で答える6,000と、貸付金の左を支払利息にする誤答は、考え方の誤りとして誤解IDを持つ", () => {
    const calc = patterns.find(({ step, p }) => step === 5 && p.match === 6000)!;
    const lend = patterns.find(({ step, p }) => step === 2 && JSON.stringify(p.match).includes("interest_expense"))!;
    expect(calc.p.misconception).toBeTruthy();
    expect(lend.p.misconception).toBeTruthy();
  });
});
