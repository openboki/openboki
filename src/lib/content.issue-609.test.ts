import { describe, expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { accountMap, unitMap } from "./content";

// Issue #609: 「売れ残りと売上原価」ステップ3で、期首の商品の振替の右を普通預金・買掛金にすると、
// 現金・売上と同じ取り違えなのに誤解が付かず汎用文だけが出た
const unit = unitMap.get("merchandise/cost-of-goods-sold")!;
const step3 = unit.steps[2].task as TaskOf<"post">;

const entry = (debit: string, credit: string) => ({
  debit: [{ account: debit, amount: 15000 }],
  credit: [{ account: credit, amount: 15000 }],
});

describe("ステップ3: 期首の商品を仕入へ", () => {
  it("右を普通預金にすると、振替を売買と思う誤解が付く", () => {
    const r = gradePost(step3, entry("purchases", "bank_deposit"), accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("右に普通預金は書きません");
    expect(r.misconception).toBe("inventory_transfer_as_transaction");
  });
  it("右を買掛金にすると、振替を売買と思う誤解が付く", () => {
    const r = gradePost(step3, entry("purchases", "accounts_payable"), accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("掛けで仕入れたわけではありません");
    expect(r.misconception).toBe("inventory_transfer_as_transaction");
  });
  it("左を普通預金にしても、同じ誤解が付く", () => {
    const r = gradePost(step3, entry("bank_deposit", "merchandise_inventory"), accountMap);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("左に普通預金は書きません");
    expect(r.misconception).toBe("inventory_transfer_as_transaction");
  });
});
