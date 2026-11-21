import { expect, it } from "vitest";
import { type TaskOf, gradePost } from "./grading";
import { unitMap } from "./content";

// Issue #535: 期中の売却のステップ7(スクーターを売り、代金は来月受け取る)で借方に未収入金ではなく未払金を書くと、
// 前の単元「固定資産の売却」では付く未収入金と未払金の取り違えの誤解が付かず、汎用文だけが出ていた

it("ステップ7で借方に未払金を書くと、未収入金と未払金の取り違えとして説明する", () => {
  const task = unitMap.get("depreciation/sale-during-period")!.steps[6].task as TaskOf<"post">;
  expect(task.type).toBe("post");
  const result = gradePost(task, {
    debit: [
      { account: "accounts_payable_other", amount: 210000 },
      { account: "accumulated_depreciation_vehicle", amount: 108000 },
      { account: "depreciation_expense", amount: 54000 },
    ],
    credit: [
      { account: "vehicle", amount: 360000 },
      { account: "gain_on_sale_of_fixed_assets", amount: 12000 },
    ],
  });
  expect(result.correct).toBe(false);
  expect(result.misconception).toBe("nontrade_receivable_payable_confused");
  expect(result.feedback).toContain("未収入金");
});
