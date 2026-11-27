import { describe, expect, it } from "vitest";
import { misconceptionMap, unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #614: 1494年の単元で後払いの絹の右を現金にすると、三分法向けの誤解(買掛金・仕入・掛け)が出て簿記3級の単元へ案内されていた
const unit = unitMap.get("birth-of-double-entry/venetian-method-and-pacioli")!;
const MODERN_TERMS = ["買掛金", "仕入", "掛け", "負債", "返品"];

describe("ヴェネツィア式とパチョーリ ステップ3: 仕訳帳に書く", () => {
  const task = unit.steps[2].task;
  if (task.type !== "post") throw new Error("postではない");

  it("右を現金にすると、人名勘定の言葉で書かれた歴史向けの誤解が付く", () => {
    const r = gradePost(task, {
      debit: [{ account: "cloth_venture", amount: 100 }],
      credit: [{ account: "cash", amount: 100 }],
    }, undefined, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("credit_purchase_as_cash_payment");
    expect(r.feedback).toContain("まだ払っていません");

    const m = misconceptionMap.get(r.misconception!)!;
    expect(m.remediation).toBe("birth-of-double-entry/memorandum-and-personal-accounts");
    expect(m.concepts).toContain("personal_account");
    for (const word of MODERN_TERMS) {
      expect(`${m.name} ${m.description} ${m.correct}`, word).not.toContain(word);
    }
  });
});

it("歴史の3単元の誤解は、どれも案内先が歴史の単元", () => {
  for (const u of unitMap.values()) {
    if (u.kind !== "history") continue;
    for (const step of u.steps) {
      const t = step.task;
      if (t.type !== "post" && t.type !== "calc") continue;
      for (const p of t.wrong_patterns) {
        if (!p.misconception) continue;
        const m = misconceptionMap.get(p.misconception)!;
        expect(m.remediation, `${u.id} ${step.title}: ${p.misconception}`).toMatch(/^birth-of-double-entry\//);
      }
    }
  }
});
