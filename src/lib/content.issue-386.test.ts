import { describe, expect, it } from "vitest";
import { type TaskOf, gradeClassify, gradePost } from "./grading";
import { accountMap, unitMap } from "./content";

// Issue #386: 借方に未払金を書く・仕分けボードで売却益と売却損を入れ替えると、単元に誤解があるのに「よくある思い込み」が出なかった
const unit = unitMap.get("depreciation/sale-of-fixed-assets")!;

function task<T extends "post" | "classify">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

function entry(debit: [string, number][], credit: [string, number][]) {
  return {
    debit: debit.map(([account, amount]) => ({ account, amount })),
    credit: credit.map(([account, amount]) => ({ account, amount })),
  };
}

describe("ステップ5: マシンを売る", () => {
  it("借方に未払金を書くと、未収入金と未払金の取り違えが付く", () => {
    const r = gradePost(
      task(4, "post"),
      entry(
        [
          ["accounts_payable_other", 480000],
          ["accumulated_depreciation_equipment", 150000],
        ],
        [
          ["equipment", 600000],
          ["gain_on_sale_of_fixed_assets", 30000],
        ],
      ),
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("nontrade_receivable_payable_confused");
  });
});

describe("ステップ6: 売却益と売却損はどの箱?", () => {
  const right = {
    gain_on_sale_of_fixed_assets: "revenue",
    loss_on_sale_of_fixed_assets: "expense",
    accounts_receivable_other: "asset",
    accumulated_depreciation_equipment: "asset",
  };
  const t = () => task(5, "classify");

  it("正解は変わらない", () => {
    expect(gradeClassify(t(), right, accountMap).correct).toBe(true);
  });
  it("売却益と売却損を入れ替えると、売却益と売却損の取り違えが付く", () => {
    const r = gradeClassify(t(), { ...right, gain_on_sale_of_fixed_assets: "expense", loss_on_sale_of_fixed_assets: "revenue" }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.wrong.map((w) => w.misconception)).toEqual(["sale_gain_loss_confused", "sale_gain_loss_confused"]);
    expect(r.misconception).toBe("sale_gain_loss_confused");
  });
  it("未収入金を負債に入れたときの誤解はそのまま", () => {
    const r = gradeClassify(t(), { ...right, accounts_receivable_other: "liability" }, accountMap);
    expect(r.misconception).toBe("nontrade_receivable_payable_confused");
  });
});
