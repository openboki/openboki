import { describe, expect, it } from "vitest";
import { type TaskOf, gradeCalc, gradeClassify, gradePost, gradePredict } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #622: 「掛けで売る、掛けで買う」で、掛けの回収の右を未収入金にしても、
// 仕分けで仕入を負債に入れても誤解が付かず、単元内に誤解IDもno_misconceptionも無い誤答パターンが11件あった
const unit = unitMap.get("merchandise/credit-transactions")!;

function task<T extends "post" | "predict" | "calc" | "classify">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
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

it("足した誤解がmisconceptions.yamlにある", () => {
  expect(misconceptionMap.get("payable_as_loan")?.name).toBe("後で払う代金も借入金");
});

describe("ステップ2: 問屋から掛けで仕入れる", () => {
  it("右を借入金にすると、後払いを借入と思う誤解が付く", () => {
    const r = gradePost(task(1, "post"), { debit: [{ account: "purchases", amount: 40000 }], credit: [{ account: "loans_payable", amount: 40000 }] }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("payable_as_loan");
  });
});

describe("ステップ3: 会社に掛けで納品する(予想)", () => {
  it("費用が増えると予想すると、仕入を資産と思う誤解が付く", () => {
    const r = gradePredict(task(2, "predict"), { asset: "increase", liability: "none", equity: "increase", revenue: "increase", expense: "increase" });
    expect(r.correct).toBe(false);
    expect(r.misconceptions).toEqual(["purchase_is_asset"]);
  });
});

describe("ステップ4: ここまでのもうけ", () => {
  it("掛けの仕入を費用から外すと、支払った時に費用と思う誤解が付く", () => {
    expect(gradeCalc(task(3, "calc"), 80000).misconception).toBe("expense_at_payment");
  });
  it("売上の合計を答えると、汎用文ではなく売上の合計だと伝える", () => {
    const r = gradeCalc(task(3, "calc"), 230000);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("それは売上の合計です");
    expect(r.misconception).toBeUndefined();
  });
});

describe("ステップ5: 月末、代金が振り込まれる", () => {
  it("右を未収入金にすると、商品の後払いを未収入金と思う誤解が付く", () => {
    const r = gradePost(task(4, "post"), { debit: [{ account: "bank_deposit", amount: 60000 }], credit: [{ account: "accounts_receivable_other", amount: 60000 }] }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("右は売掛金です");
    expect(r.misconception).toBe("trade_as_nontrade");
  });
});

describe("ステップ6: 問屋に代金を払う", () => {
  it("右を仕入にすると、支払いで仕入を動かす誤解が付く", () => {
    const r = gradePost(task(5, "post"), { debit: [{ account: "accounts_payable", amount: 40000 }], credit: [{ account: "purchases", amount: 40000 }] }, accountMap);
    expect(r.misconception).toBe("payable_payment_is_purchase");
  });
  it("左を借入金にすると、後払いを借入と思う誤解が付く", () => {
    const r = gradePost(task(5, "post"), { debit: [{ account: "loans_payable", amount: 40000 }], credit: [{ account: "cash", amount: 40000 }] }, accountMap);
    expect(r.misconception).toBe("payable_as_loan");
  });
});

describe("ステップ7: 権利と義務を分ける", () => {
  it("仕入を負債の箱に入れると、費用と負債の混同が付く", () => {
    const r = gradeClassify(task(6, "classify"), { accounts_receivable: "asset", accounts_payable: "liability", sales: "revenue", purchases: "liability", bank_deposit: "asset" }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.misconceptions).toEqual(["expense_as_liability"]);
  });
});

it("商品売買の4単元の仕分けボードで、仕入 → 負債に費用と負債の混同が定義されている", () => {
  for (const id of ["merchandise/three-account-method", "merchandise/credit-transactions", "merchandise/cost-of-goods-sold", "merchandise/returns-and-costs"]) {
    const classify = unitMap.get(id)!.steps.map((s) => s.task).find((t) => t.type === "classify") as TaskOf<"classify"> | undefined;
    expect(classify?.misconceptions?.purchases?.liability, id).toBe("expense_as_liability");
  }
});
