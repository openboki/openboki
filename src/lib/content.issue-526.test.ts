import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #526: 売却損益の科目を正解と逆の側に置く(益の代わりに損を貸方、損の代わりに益を借方)と、
// 貸借はそろうのに誤解の説明が付かず、汎用の文言と比較表だけが出ていた
function postTask(unitId: string, step: number) {
  const t = unitMap.get(unitId)!.steps[step].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

function entry(debit: [string, number][], credit: [string, number][]) {
  return {
    debit: debit.map(([account, amount]) => ({ account, amount })),
    credit: credit.map(([account, amount]) => ({ account, amount })),
  };
}

describe("固定資産の売却", () => {
  it("ステップ3: 売却損の代わりに固定資産売却益を借方に書くと、売却益と売却損の取り違えが付く", () => {
    const r = gradePost(
      postTask("depreciation/sale-of-fixed-assets", 2),
      entry(
        [
          ["cash", 850000],
          ["accumulated_depreciation_vehicle", 300000],
          ["gain_on_sale_of_fixed_assets", 50000],
        ],
        [["vehicle", 1200000]],
      ),
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("sale_gain_loss_confused");
    expect(r.feedback).toContain("固定資産売却損");
  });

  it("ステップ5: 売却益の代わりに固定資産売却損を貸方に書くと、売却益と売却損の取り違えが付く", () => {
    const r = gradePost(
      postTask("depreciation/sale-of-fixed-assets", 4),
      entry(
        [
          ["accounts_receivable_other", 480000],
          ["accumulated_depreciation_equipment", 150000],
        ],
        [
          ["equipment", 600000],
          ["loss_on_sale_of_fixed_assets", 30000],
        ],
      ),
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("sale_gain_loss_confused");
    expect(r.feedback).toContain("固定資産売却益");
  });
});

describe("期中の売却", () => {
  it("ステップ4: 売却損の代わりに固定資産売却益を借方に書くと、売却益と売却損の取り違えが付く", () => {
    const r = gradePost(
      postTask("depreciation/sale-during-period", 3),
      entry(
        [
          ["cash", 400000],
          ["accumulated_depreciation_equipment", 240000],
          ["depreciation_expense", 60000],
          ["gain_on_sale_of_fixed_assets", 20000],
        ],
        [["equipment", 720000]],
      ),
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("sale_gain_loss_confused");
    expect(r.feedback).toContain("固定資産売却損");
  });

  it("ステップ7: 売却益の代わりに固定資産売却損を貸方に書くと、売却益と売却損の取り違えが付く", () => {
    const r = gradePost(
      postTask("depreciation/sale-during-period", 6),
      entry(
        [
          ["accounts_receivable_other", 210000],
          ["accumulated_depreciation_vehicle", 108000],
          ["depreciation_expense", 54000],
        ],
        [
          ["vehicle", 360000],
          ["loss_on_sale_of_fixed_assets", 12000],
        ],
      ),
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("sale_gain_loss_confused");
    expect(r.feedback).toContain("固定資産売却益");
  });
});
