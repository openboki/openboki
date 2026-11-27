import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradePost, gradePredict } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #633: 「仕入と売上」で、豆を消耗品費にする(ステップ2)・純資産を「変わらない」と予想する(ステップ3)・
// 売ったときに右を仕入にする(ステップ4)と説明文だけが出て誤解が付かず、単元内に誤解IDもno_misconceptionも無い誤答パターンが7件あった
const unit = unitMap.get("merchandise/three-account-method")!;

function task<T extends "post" | "calc" | "predict">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

it("単元のすべての誤答パターンに、misconceptionかno_misconceptionのどちらか一方だけが付いている(unbalancedを除く)", () => {
  for (const [i, step] of unit.steps.entries()) {
    const t = step.task;
    if (t.type !== "post" && t.type !== "calc" && t.type !== "predict") continue;
    for (const p of t.wrong_patterns) {
      if (typeof p.match === "object" && "unbalanced" in p.match && p.match.unbalanced) continue;
      const where = `ステップ${i + 1}: ${JSON.stringify(p.match)}`;
      expect(Boolean(p.misconception) !== Boolean(p.no_misconception), where).toBe(true);
      if (p.misconception) expect(misconceptionMap.has(p.misconception), where).toBe(true);
    }
  }
});

describe("ステップ2: 豆を仕入れる", () => {
  it("豆を消耗品費にすると、売り物を消耗品費と思う誤解が付く", () => {
    const r = gradePost(task(1, "post"), { debit: [{ account: "supplies_expense", amount: 30000 }], credit: [{ account: "cash", amount: 30000 }] }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("売り物の豆は仕入です");
    expect(r.misconception).toBe("merchandise_as_supplies");
    expect(misconceptionMap.get("merchandise_as_supplies")?.remediation).toBe(unit.id);
  });
});

describe("ステップ3: 焼き菓子も仕入れる", () => {
  it("純資産を「変わらない」と予想するのは費用と純資産のつながりの見落としで、誤解は付かない", () => {
    const r = gradePredict(task(2, "predict"), { asset: "decrease", liability: "none", equity: "none", revenue: "none", expense: "increase" });
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("純資産も減ります");
    expect(r.misconception).toBeUndefined();
  });
});

describe("ステップ4: 豆と菓子が売れる", () => {
  it("売ったときに右を仕入にすると、仕入を資産と思う誤解が付く", () => {
    const r = gradePost(task(3, "post"), { debit: [{ account: "cash", amount: 90000 }], credit: [{ account: "purchases", amount: 90000 }] }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("売ったときに仕入を減らす必要はありません");
    expect(r.misconception).toBe("purchase_is_asset");
  });
});

describe("ステップ5: 売上と仕入の差", () => {
  it("引き忘れ・問いの読み違いの4つの誤答には誤解が付かず、説明文だけが出る", () => {
    for (const [value, phrase] of [
      [60000, "焼き菓子の20,000も仕入です"],
      [70000, "先月分も含めた当期純利益です"],
      [120000, "先月のコーヒーの80,000が入っています"],
      [50000, "それは仕入の合計です"],
    ] as const) {
      const r = gradeCalc(task(4, "calc"), value);
      expect(r.correct, String(value)).toBe(false);
      expect(r.feedback, String(value)).toContain(phrase);
      expect(r.misconception, String(value)).toBeUndefined();
    }
  });
});

it("足した誤解は売る物と使う物の区別として書かれ、案内先はこの単元", () => {
  const m = misconceptionMap.get("merchandise_as_supplies")!;
  expect(m.name).toBe("売り物も消耗品費");
  expect(m.remediation).toBe(unit.id);
  expect(m.concepts).toContain("merchandise");
  expect(m.concepts).toContain("purchase");
});
