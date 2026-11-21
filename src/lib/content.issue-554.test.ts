import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradeClassify } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #554: 人名勘定の仕分けで売った2行を右に置く、ページの残高を左右の合計を足して180と答えると、誤解の説明が付かず汎用文だけが出た
const unit = unitMap.get("birth-of-double-entry/memorandum-and-personal-accounts")!;

function task<T extends "classify" | "calc">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

describe("ステップ4: 残りの行を写す", () => {
  const right = { mar9_wine: "left", mar14_receipt: "right", mar18_cloth: "right", mar20_pepper: "left", mar22_payment: "left" };
  const t = () => task(3, "classify");

  it("正解は変わらない", () => {
    expect(gradeClassify(t(), right, accountMap).correct).toBe(true);
  });
  it("売った2行を右に置くと、お金や物の向きで左右を決める誤解が付く", () => {
    const r = gradeClassify(t(), { ...right, mar9_wine: "right", mar20_pepper: "right" }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.wrong.map((w) => w.misconception)).toEqual(["personal_account_by_cash_direction", "personal_account_by_cash_direction"]);
    expect(r.misconception).toBe("personal_account_by_cash_direction");
  });
});

describe("ステップ5: ページを読む", () => {
  it("左右の合計を足した180に、左右を足す誤解が付く", () => {
    const r = gradeCalc(task(4, "calc"), 180);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("balance_adds_both_sides");
    expect(misconceptionMap.get("balance_adds_both_sides")?.name).toBe("残高を左右の合計の和と思う");
  });
});
