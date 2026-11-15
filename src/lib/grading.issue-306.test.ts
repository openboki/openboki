import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePredict } from "./grading";

// Issue #306: 小切手で払う ステップ3で資産を「変わらない」と予想すると、現金が減ると思い込む誤解(check_is_cash)が付いていた
const steps = unitMap.get("cash-and-deposits/checking-account")!.steps;
const predictTask = () => {
  const task = steps[2].task;
  if (task.type !== "predict") throw new Error("predictではない");
  return task;
};

describe("買掛金を小切手で払う(ステップ3)", () => {
  it("資産を変わらないと予想すると、引き落としまで当座預金は減らないという誤解になる", () => {
    const result = gradePredict(predictTask(), { ...predictTask().answer, asset: "none" });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("check_reduces_deposit_at_clearing");
    expect(result.feedback).toContain("小切手を渡した日に");
  });

  it("正解は正解のまま", () => {
    expect(gradePredict(predictTask(), predictTask().answer).correct).toBe(true);
  });
});
