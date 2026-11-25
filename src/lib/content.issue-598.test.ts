import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradePost } from "./grading";
import { misconceptionMap, unitMap } from "./content";

// Issue #598: ヴェネツィア式とパチョーリの4つの誤答パターンに、説明はあるが誤解IDが無かった
const unit = unitMap.get("birth-of-double-entry/venetian-method-and-pacioli")!;

function task<T extends "post" | "calc">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

describe("ステップ3: 仕訳帳に書く", () => {
  it("まだ払っていないのに右を現金にすると、掛けで買っても現金が減る誤解が付く", () => {
    const r = gradePost(task(2, "post"), {
      debit: [{ account: "cloth_venture", amount: 100 }],
      credit: [{ account: "cash", amount: 100 }],
    }, undefined, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("credit_purchase_paid_in_cash");
    expect(r.feedback).toContain("まだ払っていません");
  });
});

describe("ステップ5: 絹の口のもうけ", () => {
  it("かかった額100を答えると、かかった額をもうけと思う誤解が付く", () => {
    const r = gradeCalc(task(4, "calc"), 100);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_cost_as_profit");
    expect(misconceptionMap.get("venture_cost_as_profit")?.name).toBe("かかった額がもうけ");
  });
});

describe("ステップ6: 利益と損失のページ", () => {
  it("右を元手にすると、利益と損失を通さない誤解が付く", () => {
    const r = gradePost(task(5, "post"), {
      debit: [{ account: "cloth_venture", amount: 30 }],
      credit: [{ account: "owner_capital", amount: 30 }],
    }, undefined, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("profit_skips_profit_and_loss");
    expect(misconceptionMap.get("profit_skips_profit_and_loss")?.remediation).toBe(unit.id);
  });
});

describe("ステップ8: 帳簿を閉じる", () => {
  it("損を引き忘れた30に、損を引かずに今年のもうけとする誤解が付く", () => {
    const r = gradePost(task(7, "post"), {
      debit: [{ account: "profit_and_loss", amount: 30 }],
      credit: [{ account: "owner_capital", amount: 30 }],
    }, undefined, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("year_profit_ignores_loss");
    expect(r.feedback).toContain("30は絹のもうけだけです");
    expect(misconceptionMap.get("year_profit_ignores_loss")?.remediation).toBe(unit.id);
  });
});

it("この単元の誤答パターンは、貸借不一致を除いてすべて誤解IDか理由を持つ", () => {
  for (const step of unit.steps) {
    const t = step.task;
    if (t.type !== "post" && t.type !== "calc") continue;
    for (const p of t.wrong_patterns) {
      if (typeof p.match === "object" && "unbalanced" in p.match) continue;
      expect(p.misconception ?? p.no_misconception, `${step.title}: ${JSON.stringify(p.match)}`).toBeTruthy();
    }
  }
});
