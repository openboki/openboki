import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { gradeClassify } from "./grading";

// Issue #404: 仕分けボードの見出し「左(彼がこちらに負う)」「右(こちらが彼に負う)」は負いが増える側の名前なのに、
// 受け取った・払ったのように負いを減らす行の置き場所が課題の前に出てこず、字面どおりに置くと2件とも間違えた
describe("覚え書きと人名勘定: 減らす行の置き場所", () => {
  const unit = unitMap.get("birth-of-double-entry/memorandum-and-personal-accounts")!;
  const task = unit.steps[3].task;
  if (task.type !== "classify") throw new Error("classifyではない");

  it("ステップ3の本文で、払った行が左になる理由が受け取りと並ぶ", () => {
    expect(unit.steps[2].narrative).toContain("受け取ったので彼の負いが減って右");
    expect(unit.steps[2].narrative).toContain("払ったときはこちらの負いが減って左");
  });

  it("ステップ4の課題文に、受け取り(右)と支払い(左)の置き場所が出る", () => {
    expect(unit.steps[3].narrative).toContain("受け取ったら彼の負いが減るので右");
    expect(unit.steps[3].narrative).toContain("払ったらこちらの負いが減るので左");
  });

  it("見出しの字面どおりに置くと、字面に従った誤解が返り、お金の向きの誤解は返らない", () => {
    const answer = Object.fromEntries(task.items!.map((i) => [i.id, i.answer]));
    const r = gradeClassify(task, { ...answer, mar14_receipt: "left", mar22_payment: "right" }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.misconceptions).toEqual(["personal_account_reduction_on_its_side"]);
    expect(r.misconceptions).not.toContain("personal_account_by_cash_direction");
  });
});
