import { describe, expect, it } from "vitest";
import { misconceptionMap, unitMap } from "./content";
import { type TaskOf, gradePost } from "./grading";

// Issue #443: 仕入の返品で右に繰越商品・左に現金を書くと、どちらも「返品を新しい取引として記録」が付き、
// 繰越商品の誤答に当たる「仕入は資産」と、現金の誤答に当たる「掛けで買っても現金が減る」が出なかった
function task() {
  const t = unitMap.get("merchandise/returns-and-costs")!.steps[2].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

function entry(debit: string, credit: string) {
  return { debit: [{ account: debit, amount: 10000 }], credit: [{ account: credit, amount: 10000 }] };
}

describe.each([
  { name: "右に繰越商品", debit: "accounts_payable", credit: "merchandise_inventory", misconception: "purchase_is_asset", word: "右に仕入" },
  { name: "左に現金", debit: "cash", credit: "purchases", misconception: "credit_purchase_paid_in_cash", word: "お金は戻ってきません" },
  { name: "右に現金", debit: "purchases", credit: "cash", misconception: "credit_purchase_paid_in_cash", word: "お金は動きません" },
  { name: "左に買掛金、右に現金", debit: "accounts_payable", credit: "cash", misconception: "credit_purchase_paid_in_cash", word: "現金は動きません" },
])("ステップ3: $name", ({ debit, credit, misconception, word }) => {
  it(`誤解${misconception}と個別の説明を返す`, () => {
    const result = gradePost(task(), entry(debit, credit));
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe(misconception);
    expect(result.feedback).toContain(word);
  });
});

describe("変えない誤答パターン", () => {
  it.each([
    { name: "左右逆", debit: "purchases", credit: "accounts_payable", misconception: "return_as_new_transaction" },
    { name: "右に売上", debit: "accounts_payable", credit: "sales", misconception: "return_as_new_transaction" },
    { name: "左に売掛金", debit: "accounts_receivable", credit: "purchases", misconception: "receivable_payable_confused" },
  ])("$nameは$misconceptionのまま", ({ debit, credit, misconception }) => {
    expect(gradePost(task(), entry(debit, credit)).misconception).toBe(misconception);
  });
});

describe("誤解「掛けで買っても現金が減る」の説明", () => {
  it("仕入れた時点だけでなく返品にも当てはまる", () => {
    const mis = misconceptionMap.get("credit_purchase_paid_in_cash")!;
    expect(mis.description).toContain("返");
    expect(mis.correct).toContain("返");
  });
});
