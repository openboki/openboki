import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #376: 立て替えた送料を通信費・消耗品費・給料にする、回収した入金を受取利息にすると、誤解の説明が無く汎用文だけが出ていた
const GENERIC = "結果の表で何が動くはずか";

function task(step: number) {
  const t = unitMap.get("receivables-and-payables/temporary-and-deposits")!.steps[step].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

function entry(debit: string, credit: string, amount: number) {
  return { debit: [{ account: debit, amount }], credit: [{ account: credit, amount }] };
}

describe.each([
  { step: 3, debit: "shipping_expense", credit: "cash", amount: 2000, misconception: "advance_for_others_is_expense" },
  { step: 3, debit: "communication_expense", credit: "cash", amount: 2000, misconception: "advance_for_others_is_expense" },
  { step: 3, debit: "supplies_expense", credit: "cash", amount: 2000, misconception: "advance_for_others_is_expense" },
  { step: 3, debit: "salaries_expense", credit: "cash", amount: 2000, misconception: "advance_for_others_is_expense" },
  { step: 7, debit: "suspense_receipt", credit: "sales", amount: 50000, misconception: "receivable_collection_is_sale" },
  { step: 7, debit: "suspense_receipt", credit: "interest_income", amount: 50000, misconception: "receivable_collection_is_sale" },
])("ステップ$step: 左$debit / 右$credit", ({ step, debit, credit, amount, misconception }) => {
  it("誤解IDと立替金・未収入金の説明を返す", () => {
    const result = gradePost(task(step), entry(debit, credit, amount));
    expect(result.correct).toBe(false);
    expect(result.feedback).not.toContain(GENERIC);
    expect(result.feedback).toContain(step === 3 ? "立替金" : "未収入金");
    expect(result.misconception).toBe(misconception);
  });
});

describe("正解の判定は変わらない", () => {
  it("ステップ4の立替金 / 現金は正解", () => {
    expect(gradePost(task(3), entry("advances_paid", "cash", 2000)).correct).toBe(true);
  });
  it("ステップ8の仮受金 / 未収入金は正解", () => {
    expect(gradePost(task(7), entry("suspense_receipt", "accounts_receivable_other", 50000)).correct).toBe(true);
  });
});
