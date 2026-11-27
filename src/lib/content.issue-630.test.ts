import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradeDebug, gradePost } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #630: 「航海の儲けと複式の発見」で、かかった額150をもうけと答えても(ステップ2・7)誤解が付かず、
// 単元内に誤解IDもno_misconceptionも無い誤答パターンが6件あった
const unit = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;

function task<T extends "post" | "calc" | "debug">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

it("単元のすべての誤答パターンに、misconceptionかno_misconceptionが付いている(unbalancedを除く)", () => {
  for (const [i, step] of unit.steps.entries()) {
    const t = step.task;
    if (t.type !== "post" && t.type !== "calc" && t.type !== "debug") continue;
    for (const p of t.wrong_patterns) {
      if (typeof p.match === "object" && "unbalanced" in p.match && p.match.unbalanced) continue;
      expect(Boolean(p.misconception || p.no_misconception), `ステップ${i + 1}: ${JSON.stringify(p.match)}`).toBe(true);
    }
  }
});

describe("ステップ2: 航海1口のページ", () => {
  it("かかった額の合計150を答えると、かかった額をもうけと思う誤解が付く", () => {
    const r = gradeCalc(task(1, "calc"), 150);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("150はかかった額の合計です");
    expect(r.misconception).toBe("venture_cost_as_profit");
    expect(misconceptionMap.get("venture_cost_as_profit")?.remediation).toBe(unit.id);
  });
});

describe("ステップ4: 2つのページに書く", () => {
  it("代金を受け取っていないのに左を現金にすると、後払いで売っても現金が増える誤解が付く", () => {
    const r = gradePost(task(3, "post"), { debit: [{ account: "cash", amount: 60 }], credit: [{ account: "pepper_voyage", amount: 60 }] }, accountMap, "history");
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("まだ受け取っていません");
    expect(r.misconception).toBe("credit_sale_as_cash_receipt");
  });
});

describe("ステップ6: 写し忘れを見つける", () => {
  it("写し忘れた行の右を現金にすると、後払いで売っても現金が増える誤解が付く", () => {
    const r = gradeDebug(task(5, "debug"), { index: 2, entry: { debit: [{ account: "giovanni", amount: 50 }], credit: [{ account: "cash", amount: 50 }] } }, accountMap, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("credit_sale_as_cash_receipt");
  });
  it("両側そろった行を選ぶのは行の選び間違いで、誤解は付かない", () => {
    for (const index of [0, 4]) {
      const r = gradeDebug(task(5, "debug"), { index, entry: { debit: [], credit: [] } }, accountMap, "history");
      expect(r.correct).toBe(false);
      expect(r.feedback).toContain("両側そろっています");
      expect(r.misconception).toBeUndefined();
    }
  });
});

describe("ステップ7: もうけを元手に移す", () => {
  it("かかった額150を元手へ移すと、かかった額をもうけと思う誤解が付く", () => {
    const r = gradePost(task(6, "post"), { debit: [{ account: "pepper_voyage", amount: 150 }], credit: [{ account: "owner_capital", amount: 150 }] }, accountMap, "history");
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("150はかかった額の合計です");
    expect(r.misconception).toBe("venture_cost_as_profit");
  });
});

it("足した誤解は人名勘定の言葉で書かれ、案内先は歴史の単元", () => {
  const m = misconceptionMap.get("credit_sale_as_cash_receipt")!;
  expect(m.name).toBe("後払いで売っても現金が増える");
  expect(m.remediation).toBe("birth-of-double-entry/memorandum-and-personal-accounts");
  expect(m.concepts).toContain("personal_account");
  for (const word of ["売掛金", "売上", "掛け"]) {
    expect(`${m.name} ${m.description} ${m.correct}`, word).not.toContain(word);
  }
});
