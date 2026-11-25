import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost, gradePredict } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #599: 「預かったお金、仮のお金」で、誤解IDもno_misconceptionも無い誤答パターンが12件あり、
// ステップ8の普通預金 / 未収入金に「よくある思い込み」が付かず、ステップ7の予想では説明文が2つ重なった
const unit = unitMap.get("receivables-and-payables/temporary-and-deposits")!;

function task<T extends "post" | "predict">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

const post = (step: number, debit: [string, number][], credit: [string, number][]) =>
  gradePost(task(step, "post"), { debit: debit.map(([account, amount]) => ({ account, amount })), credit: credit.map(([account, amount]) => ({ account, amount })) }, accountMap);

it("単元のすべての誤答パターンに、misconceptionかno_misconceptionが付いている(unbalancedを除く)", () => {
  for (const [i, step] of unit.steps.entries()) {
    const t = step.task;
    if (t.type !== "post" && t.type !== "predict") continue;
    for (const p of t.wrong_patterns) {
      if ("unbalanced" in p.match && p.match.unbalanced) continue;
      expect(Boolean(p.misconception || p.no_misconception), `ステップ${i + 1}: ${JSON.stringify(p.match)}`).toBe(true);
    }
  }
});

it("足した誤解がmisconceptions.yamlにある", () => {
  expect(misconceptionMap.get("advances_deposits_side_confused")?.name).toBe("立替金と預り金、仮払金と仮受金の取り違え");
  expect(misconceptionMap.get("deposit_received_accounts_confused")?.name).toBe("預かったお金の科目を取り違える");
  expect(misconceptionMap.get("temporary_account_not_cleared")?.name).toBe("分かった日に仮勘定を消さない");
});

describe("ステップ2: 給料を払う", () => {
  it("手取りを現金で払うと、現金と普通預金の取り違え", () => {
    const r = post(1, [["salaries_expense", 100000]], [["cash", 97000], ["deposits_received", 3000]]);
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("deposit_is_cash");
  });
  it("預かった税金を立替金にすると、払った側と受け取った側の取り違え", () => {
    expect(post(1, [["salaries_expense", 100000]], [["bank_deposit", 97000], ["advances_paid", 3000]]).misconception).toBe("advances_deposits_side_confused");
  });
  it("預かった税金を未払金・仮受金にすると、預かったお金の科目の取り違え", () => {
    expect(post(1, [["salaries_expense", 100000]], [["bank_deposit", 97000], ["accounts_payable_other", 3000]]).misconception).toBe("deposit_received_accounts_confused");
    expect(post(1, [["salaries_expense", 100000]], [["bank_deposit", 97000], ["suspense_receipt", 3000]]).misconception).toBe("deposit_received_accounts_confused");
  });
});

describe("ステップ3: 預かった税金を納める(予想)", () => {
  const t = () => task(2, "predict");
  it("純資産が減るとだけ見た回答に、お金を払うと元手が減る誤解が付く", () => {
    const r = gradePredict(t(), { asset: "decrease", liability: "decrease", equity: "decrease", revenue: "none", expense: "none" });
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("payment_reduces_capital");
  });
  it("費用と見た上で純資産が減ると答えた回答は、費用の誤解だけになる", () => {
    const r = gradePredict(t(), { asset: "decrease", liability: "decrease", equity: "decrease", revenue: "none", expense: "increase" });
    expect(r.misconceptions).toEqual(["withholding_tax_is_expense"]);
    expect(r.feedback).not.toContain("純資産は変わりません");
  });
});

describe("ステップ4: スタッフの代わりに払う", () => {
  it("立て替えを預り金にすると、払った側と受け取った側の取り違え", () => {
    expect(post(3, [["deposits_received", 2000]], [["cash", 2000]]).misconception).toBe("advances_deposits_side_confused");
  });
});

describe("ステップ6: 精算する", () => {
  it("仮払金を左に書くと、仮勘定を消さない誤解", () => {
    const r = post(5, [["suspense_payment", 20000]], [["cash", 20000]]);
    expect(r.misconception).toBe("temporary_account_not_cleared");
    expect(r.feedback).toContain("右に書いて消します");
  });
  it("右に仮受金を書くと、仮払金と仮受金の取り違え", () => {
    expect(post(5, [["travel_expense", 18000], ["cash", 2000]], [["suspense_receipt", 20000]]).misconception).toBe("advances_deposits_side_confused");
  });
});

describe("ステップ7: 正体不明の入金(予想)", () => {
  const t = () => task(6, "predict");
  it("売上と見て負債を変わらないにすると、説明は売上の1文だけで重ならない", () => {
    const r = gradePredict(t(), { asset: "increase", liability: "none", equity: "none", revenue: "increase", expense: "none" });
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("suspense_receipt_is_revenue");
    expect(r.feedback.split("\n")).toHaveLength(1);
    expect(r.feedback).not.toContain("返すことになるかもしれないお金");
  });
  it("負債だけ見落とした回答には、負債の説明が出る", () => {
    const r = gradePredict(t(), { asset: "increase", liability: "none", equity: "none", revenue: "none", expense: "none" });
    expect(r.feedback).toContain("仮受金という負債に置きます");
    expect(r.misconceptions).toEqual([]);
  });
});

describe("ステップ8: 正体が分かった", () => {
  it("入金をもう一度書くと、仮勘定を消さない誤解が付く", () => {
    const r = post(7, [["bank_deposit", 50000]], [["accounts_receivable_other", 50000]]);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("普通預金は入金のときに増やしてあります");
    expect(r.misconception).toBe("temporary_account_not_cleared");
  });
});
