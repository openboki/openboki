import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #382: 仕入の返品を「現金 / 仕入」、売上の返品を「雑損 / 売掛金」と記帳すると、誤解の説明が無く汎用文だけが出ていた
const GENERIC = "結果の表で何が動くはずか";

function task(step: number) {
  const t = unitMap.get("merchandise/returns-and-costs")!.steps[step].task;
  if (t.type !== "post") throw new Error("postではない");
  return t as TaskOf<"post">;
}

function entry(debit: string, credit: string, amount: number) {
  return { debit: [{ account: debit, amount }], credit: [{ account: credit, amount }] };
}

// 仕入の返品で左に現金を書く誤答は、#443で「掛けで買っても現金が減る」に付け替えた
describe.each([
  { step: 2, debit: "cash", credit: "purchases", amount: 10000, word: "買掛金", misconception: "credit_purchase_paid_in_cash" },
  { step: 4, debit: "miscellaneous_loss", credit: "accounts_receivable", amount: 5000, word: "売上", misconception: "return_as_new_transaction" },
])("ステップ$step: 左$debit / 右$credit", ({ step, debit, credit, amount, word, misconception }) => {
  it(`誤解${misconception}と、逆仕訳の案内を返す`, () => {
    const result = gradePost(task(step), entry(debit, credit, amount));
    expect(result.correct).toBe(false);
    expect(result.feedback).not.toContain(GENERIC);
    expect(result.feedback).toContain(word);
    expect(result.misconception).toBe(misconception);
  });
});

describe("既存のパターンは変わらない", () => {
  it("ステップ2で右に現金を書くと、お金は動かない説明のまま", () => {
    const result = gradePost(task(2), entry("accounts_payable", "cash", 10000));
    expect(result.feedback).toContain("現金は動きません");
  });
  it("ステップ4で左右を逆にすると、新しく売ったときの仕訳だと返す", () => {
    const result = gradePost(task(4), entry("accounts_receivable", "sales", 5000));
    expect(result.feedback).toContain("新しく売ったとき");
  });
});
