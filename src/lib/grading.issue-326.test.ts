import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { evaluateFormula } from "./formulas";
import { type TaskOf, gradeTweak, tweakRestoreValues } from "./grading";

// Issue #326: tweakの保存値を検証せずに復元し、スライダーの位置と計算結果が食い違っていた
const tweakSteps = [...unitMap.values()].flatMap((unit) =>
  unit.steps.flatMap((step, index) => (step.task.type === "tweak" ? [{ name: `${unit.id}ステップ${index + 1}`, task: step.task }] : [])),
);
const broken = [{ useful_life: -3, cost: 1e308, residual_value: 5e307 }, { useful_life: 0, cost: 1200000, residual_value: 0 }, { useful_life: "abc" }, { useful_life: 1e9 }, { useful_life: 6.5 }, {}, null, "x", [6]];
const onSlider = (task: TaskOf<"tweak">, values: Record<string, number>) =>
  task.params.every((p) => values[p.id] >= p.min && values[p.id] <= p.max && Number.isInteger(Math.round(((values[p.id] - p.min) / p.step) * 1e6) / 1e6));

describe("tweakの保存値の復元", () => {
  it.each(tweakSteps)("$name: 壊れた保存値を捨て、スライダーで取れて目標を満たす値で戻す", ({ task }) => {
    for (const saved of broken) {
      const values = tweakRestoreValues(task, saved);
      expect(onSlider(task, values)).toBe(true);
      expect(gradeTweak(task, evaluateFormula(task.formula, values).outputs).correct).toBe(true);
    }
  });

  it("目標を満たす正しい保存値はそのまま使う", () => {
    const task = unitMap.get("depreciation/straight-line")!.steps[2].task as TaskOf<"tweak">;
    expect(tweakRestoreValues(task, { cost: 1200000, residual_value: 0, useful_life: 6 })).toEqual({ cost: 1200000, residual_value: 0, useful_life: 6 });
  });

  // Issue #454: 固定した条件が初期値と違う保存値は、画面で作れない組み合わせなので使わない
  it("固定した条件を動かした保存値は捨て、動かせる条件だけで目標に届く値で戻す", () => {
    const task = unitMap.get("depreciation/straight-line")!.steps[2].task as TaskOf<"tweak">;
    expect(tweakRestoreValues(task, { cost: 1800000, residual_value: 600000, useful_life: 6 })).toEqual({ cost: 1200000, residual_value: 0, useful_life: 6 });
  });
});
