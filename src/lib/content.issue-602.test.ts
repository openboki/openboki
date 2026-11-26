import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradePost, gradePredict } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #602: 「売れ残りと売上原価」で、誤解IDもno_misconceptionも無い誤答パターンが11件あり、
// ステップ3の仕入 / 売上に「よくある思い込み」が付かなかった
const unit = unitMap.get("merchandise/cost-of-goods-sold")!;

function task<T extends "post" | "predict" | "calc">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

it("単元のすべての誤答パターンに、misconceptionかno_misconceptionが付いている(unbalancedを除く)", () => {
  for (const [i, step] of unit.steps.entries()) {
    const t = step.task;
    if (t.type !== "post" && t.type !== "predict" && t.type !== "calc") continue;
    for (const p of t.wrong_patterns) {
      if (typeof p.match === "object" && "unbalanced" in p.match && p.match.unbalanced) continue;
      expect(Boolean(p.misconception || p.no_misconception), `ステップ${i + 1}: ${JSON.stringify(p.match)}`).toBe(true);
    }
  }
});

it("足した誤解がmisconceptions.yamlにある", () => {
  expect(misconceptionMap.get("inventory_add_subtract_confused")?.name).toBe("期首の商品と売れ残りの足し引きを取り違える");
  expect(misconceptionMap.get("prior_profit_in_net_income")?.name).toBe("前の期のもうけを当期純利益に入れる");
});

describe("ステップ2: 売上原価を計算する", () => {
  it("期首の商品を引く、売れ残りを足すと、足し引きの取り違え", () => {
    expect(gradeCalc(task(1, "calc"), 95000).misconception).toBe("inventory_add_subtract_confused");
    expect(gradeCalc(task(1, "calc"), 169000).misconception).toBe("inventory_add_subtract_confused");
  });
  it("期首の商品だけを答えると、汎用文ではなく期首の商品だと伝える", () => {
    const r = gradeCalc(task(1, "calc"), 15000);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("期首の商品の金額です");
    expect(r.misconception).toBeUndefined();
  });
});

describe("ステップ3: 期首の商品を仕入へ", () => {
  it("右を売上にすると、振替を売買と思う誤解が付く", () => {
    const r = gradePost(task(2, "post"), { debit: [{ account: "purchases", amount: 15000 }], credit: [{ account: "sales", amount: 15000 }] }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("売ったわけではありません");
    expect(r.misconception).toBe("inventory_transfer_as_transaction");
  });
});

describe("ステップ4: 売れ残りを取り出す(予想)", () => {
  it("収益が増えると予想すると、振替を売買と思う誤解が付く", () => {
    const r = gradePredict(task(3, "predict"), { asset: "increase", liability: "none", equity: "increase", revenue: "increase", expense: "decrease" });
    expect(r.correct).toBe(false);
    expect(r.misconceptions).toEqual(["inventory_transfer_as_transaction"]);
  });
  it("純資産だけ見落とした回答は、説明だけで誤解は付かない", () => {
    const r = gradePredict(task(3, "predict"), { asset: "increase", liability: "none", equity: "none", revenue: "none", expense: "decrease" });
    expect(r.feedback).toContain("純資産も増えます");
    expect(r.misconceptions).toEqual([]);
  });
});

describe("ステップ5: 決算後のもうけ", () => {
  it("1年目のもうけを足す、そのまま答えると、前の期のもうけを入れる誤解が付く", () => {
    expect(gradeCalc(task(4, "calc"), 110000).misconception).toBe("prior_profit_in_net_income");
    const r = gradeCalc(task(4, "calc"), 40000);
    expect(r.feedback).toContain("1年目のもうけ");
    expect(r.misconception).toBe("prior_profit_in_net_income");
  });
  it("売上原価をそのまま答えると、汎用文ではなく売上原価だと伝える", () => {
    const r = gradeCalc(task(4, "calc"), 125000);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("それは売上原価です");
    expect(r.misconception).toBeUndefined();
  });
});
