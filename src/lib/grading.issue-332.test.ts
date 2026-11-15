import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { type TaskOf, gradeCalc } from "./grading";

// Issue #332: 正解の10倍・1/10・符号違いに、桁や符号のずれを言わず汎用文だけが出ていた
const GENERIC = "計算の式と、使う数字";

const calc = (answer: number, wrong_patterns: TaskOf<"calc">["wrong_patterns"] = []) => ({ type: "calc", answer, wrong_patterns }) as unknown as TaskOf<"calc">;

describe("覚え書きと人名勘定 ステップ2(答え70)", () => {
  const task = unitMap.get("birth-of-double-entry/memorandum-and-personal-accounts")!.steps[1].task;
  if (task.type !== "calc") throw new Error("calcではない");

  it.each([
    [700, "桁"],
    [7, "桁"],
    [-70, "符号"],
  ])("%iには、%sのずれを言う", (value, keyword) => {
    const result = gradeCalc(task, value);
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain(keyword);
    expect(result.feedback).not.toContain(GENERIC);
    expect(result.misconception).toBeUndefined();
  });

  it("71は汎用文のまま", () => {
    expect(gradeCalc(task, 71).feedback).toContain(GENERIC);
  });
});

describe("比の判定", () => {
  it.each([400000, 4000, 4])("答え40,000に%iは桁のずれ", (value) => {
    expect(gradeCalc(calc(40000), value).feedback).toContain("桁");
  });

  it("小数の答えでも桁のずれを見る", () => {
    expect(gradeCalc(calc(0.3), 3).feedback).toContain("桁");
    expect(gradeCalc(calc(0.3), 0.03).feedback).toContain("桁");
  });

  it.each([40001, -400000, 0, 20000])("答え40,000に%iは汎用文", (value) => {
    expect(gradeCalc(calc(40000), value).feedback).toContain(GENERIC);
  });

  it("答えが0なら比を取らない", () => {
    expect(gradeCalc(calc(0), 10).feedback).toContain(GENERIC);
    expect(gradeCalc(calc(0), -0).correct).toBe(true);
  });

  it("wrong_patternsに一致する値は単元の説明と誤解を優先する", () => {
    const task = calc(3000, [{ match: -3000, feedback: "費用をマイナスで書いています。", misconception: "expense_as_negative_amount" }, { match: 30000, feedback: "利率の読み違いです。", misconception: "percent_off_by_ten" }]);
    expect(gradeCalc(task, -3000)).toMatchObject({ misconception: "expense_as_negative_amount", feedback: "費用をマイナスで書いています。" });
    expect(gradeCalc(task, 30000)).toMatchObject({ misconception: "percent_off_by_ten" });
  });
});
