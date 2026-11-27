import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc } from "./grading";
import { misconceptionMap, unitMap } from "./content";

// Issue #632: 「5つの要素と仕訳」で、当期純利益に売上だけの80000、資産の合計に純資産の1030000を答えると、
// 説明文は出るのに誤解IDが付かず、attempts.misconception_idがNULLになっていた
const unit = unitMap.get("bookkeeping-basics/five-elements")!;

function calc(step: number) {
  const t = unit.steps[step].task;
  if (t.type !== "calc") throw new Error("calcではない");
  return t as TaskOf<"calc">;
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

it("足した誤解がmisconceptions.yamlにあり、復習先がこの単元", () => {
  for (const [id, name] of [["revenue_is_profit", "売上がそのままもうけ"], ["equity_as_total_assets", "資産の合計と純資産の取り違え"]]) {
    const m = misconceptionMap.get(id);
    expect(m?.name, id).toBe(name);
    expect(m?.remediation, id).toBe("bookkeeping-basics/five-elements");
  }
});

describe("ステップ8: この1か月の当期純利益", () => {
  it("売上の80000をそのまま答えると、売上がもうけという誤解が付き、家賃の引き忘れを伝える", () => {
    const r = gradeCalc(calc(7), 80000);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("revenue_is_profit");
    expect(r.feedback).toContain("家賃の50,000を引き忘れています");
  });
  it("130000は従来どおり費用を足す誤解が付く", () => {
    expect(gradeCalc(calc(7), 130000).misconception).toBe("expense_added_to_profit");
  });
});

describe("ステップ9: 月末の資産の合計", () => {
  it("純資産の1030000を答えると、資産と純資産の取り違えが付き、負債を引く前の金額だと伝える", () => {
    const r = gradeCalc(calc(8), 1030000);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("equity_as_total_assets");
    expect(r.feedback).toContain("純資産の金額です");
  });
  it("730000は従来どおり資産は現金だけの誤解が付く", () => {
    expect(gradeCalc(calc(8), 730000).misconception).toBe("cash_is_only_asset");
  });
});
