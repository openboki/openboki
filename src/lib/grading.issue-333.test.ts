import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type EffectAnswer, type TaskOf, gradePredict } from "./grading";

// Issue #333: コーヒーマシンを現金で買う予想で資産「増える」を選ぶと、誤答パターンが無く汎用文だけが出ていた
const unitPath = "content/topics/bookkeeping-basics/five-elements.md";
const tasks = [...readFileSync(unitPath, "utf8").matchAll(/```task\n([\s\S]*?)```/g)].map((m) => parse(m[1]) as { type: string });
const task = tasks.find((t) => t.type === "predict") as TaskOf<"predict">;
const none: EffectAnswer = { asset: "none", liability: "none", equity: "none", revenue: "none", expense: "none" };

describe("5つの要素と仕訳 ステップ3の予想(Issue #333)", () => {
  it("資産「増える」は、資産の中の入れ替えで合計が動くという誤解として返す", () => {
    const r = gradePredict(task, { ...none, asset: "increase" });
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("asset_transfer_changes_total");
    expect(r.feedback).toContain("入れ替わ");
    expect(r.feedback).not.toContain("予想と実際の動きが違いました");
  });

  it("資産「減る」は従来どおり「資産は現金だけ」の誤解として返す", () => {
    const r = gradePredict(task, { ...none, asset: "decrease" });
    expect(r.misconception).toBe("cash_is_only_asset");
  });
});
