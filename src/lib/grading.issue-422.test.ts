import { describe, expect, it } from "vitest";
import { unitMap } from "./content";
import { gradePost, type TaskOf } from "./grading";
import type { JournalEntry } from "./accounting";

// Issue #422: 貸借不一致の固定文が正解の金額を「左は現金20,000と貸倒損失30,000です」と学習者の仕訳のように並べていた
type PostTask = TaskOf<"post">;

/** 単元の中で、正解のその側にその科目を含む最初のpost課題 */
function findPost(unitId: string, account: string, side: "debit" | "credit" = "debit"): PostTask {
  const unit = unitMap.get(unitId);
  if (!unit) throw new Error(`単元が無い: ${unitId}`);
  for (const step of unit.steps) {
    const task = step.task;
    if (task?.type !== "post") continue;
    if (task.answer[side].some((l) => l.account === account)) return task;
  }
  throw new Error(`post課題が無い: ${unitId} ${account}`);
}

function unbalancedFeedback(task: PostTask, entry: JournalEntry): string {
  const result = gradePost(task, entry);
  expect(result.correct).toBe(false);
  expect(result.feedback).toContain("そろっていません");
  return result.feedback;
}

describe("売掛金が回収できない ステップ5(一部回収と貸倒れ)", () => {
  const task = findPost("bad-debts/bad-debt-loss", "bad_debt_loss");

  it("現金を2,000と打ち間違えても、左を現金20,000と言い切らず、どちらも50,000にするよう言う", () => {
    const feedback = unbalancedFeedback(task, {
      debit: [{ account: "cash", amount: 2000 }, { account: "bad_debt_loss", amount: 30000 }],
      credit: [{ account: "accounts_receivable", amount: 50000 }],
    });
    expect(feedback).not.toContain("左は現金20,000");
    expect(feedback).toContain("どちらも50,000");
  });

  it("右を40,000と打ち間違えても同じ案内になる", () => {
    const feedback = unbalancedFeedback(task, {
      debit: [{ account: "cash", amount: 20000 }, { account: "bad_debt_loss", amount: 30000 }],
      credit: [{ account: "accounts_receivable", amount: 40000 }],
    });
    expect(feedback).not.toContain("右の売掛金50,000に対して");
    expect(feedback).toContain("どちらも50,000");
  });
});

describe("仮払金と預り金", () => {
  it("給料の預り金を300と打ち間違えても、右を預り金3,000と言い切らない", () => {
    const task = findPost("receivables-and-payables/temporary-and-deposits", "deposits_received", "credit");
    const feedback = unbalancedFeedback(task, {
      debit: [{ account: "salaries_expense", amount: 100000 }],
      credit: [{ account: "bank_deposit", amount: 97000 }, { account: "deposits_received", amount: 300 }],
    });
    expect(feedback).not.toContain("預り金3,000がそろっていません");
    expect(feedback).toContain("どちらも100,000");
  });

  it("精算で現金を200と打ち間違えても、左を現金2,000と言い切らない", () => {
    const task = findPost("receivables-and-payables/temporary-and-deposits", "travel_expense");
    const feedback = unbalancedFeedback(task, {
      debit: [{ account: "travel_expense", amount: 18000 }, { account: "cash", amount: 200 }],
      credit: [{ account: "suspense_payment", amount: 20000 }],
    });
    expect(feedback).not.toContain("現金2,000と");
    expect(feedback).toContain("どちらも20,000");
  });
});

it("前払金の精算で買掛金を3,000と打ち間違えても、右を買掛金30,000と言い切らない", () => {
  const task = findPost("receivables-and-payables/other-receivables-and-payables", "advance_payment", "credit");
  const feedback = unbalancedFeedback(task, {
    debit: [{ account: "purchases", amount: 40000 }],
    credit: [{ account: "advance_payment", amount: 10000 }, { account: "accounts_payable", amount: 3000 }],
  });
  expect(feedback).not.toContain("買掛金30,000がそろっていません");
  expect(feedback).toContain("どちらも40,000");
});

it("運賃込みの仕入で左を5,200と打ち間違えても、左の合計を52,000と言い切らない", () => {
  const task = findPost("merchandise/returns-and-costs", "accounts_payable", "credit");
  const feedback = unbalancedFeedback(task, {
    debit: [{ account: "purchases", amount: 5200 }],
    credit: [{ account: "accounts_payable", amount: 50000 }, { account: "cash", amount: 2000 }],
  });
  expect(feedback).not.toContain("左の合計52,000と");
  expect(feedback).toContain("どちらも52,000");
});

describe("固定資産の売却(売却損益の行の書き忘れと打ち間違いを分ける)", () => {
  it("期中売却の売却損の行を書き忘れると、その行を足すよう言う", () => {
    const task = findPost("depreciation/sale-during-period", "loss_on_sale_of_fixed_assets");
    const result = gradePost(task, {
      debit: [
        { account: "cash", amount: 400000 },
        { account: "accumulated_depreciation_equipment", amount: 240000 },
        { account: "depreciation_expense", amount: 60000 },
      ],
      credit: [{ account: "equipment", amount: 720000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("固定資産売却損として左に足しましょう");
  });

  it("期中売却で現金を40,000と打ち間違えると、左を現金400,000と言い切らない", () => {
    const task = findPost("depreciation/sale-during-period", "loss_on_sale_of_fixed_assets");
    const feedback = unbalancedFeedback(task, {
      debit: [
        { account: "cash", amount: 40000 },
        { account: "accumulated_depreciation_equipment", amount: 240000 },
        { account: "depreciation_expense", amount: 60000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 20000 },
      ],
      credit: [{ account: "equipment", amount: 720000 }],
    });
    expect(feedback).not.toContain("左は現金400,000");
    expect(feedback).not.toContain("足しましょう");
    expect(feedback).toContain("どちらも720,000");
  });

  it("期中売却の売却益の行を書き忘れると、その行を足すよう言う", () => {
    const task = findPost("depreciation/sale-during-period", "gain_on_sale_of_fixed_assets", "credit");
    const result = gradePost(task, {
      debit: [
        { account: "accounts_receivable_other", amount: 210000 },
        { account: "accumulated_depreciation_vehicle", amount: 108000 },
        { account: "depreciation_expense", amount: 54000 },
      ],
      credit: [{ account: "vehicle", amount: 360000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("固定資産売却益として右に足しましょう");
  });

  it("期中売却で未収入金を21,000と打ち間違えると、左を未収入金210,000と言い切らない", () => {
    const task = findPost("depreciation/sale-during-period", "gain_on_sale_of_fixed_assets", "credit");
    const feedback = unbalancedFeedback(task, {
      debit: [
        { account: "accounts_receivable_other", amount: 21000 },
        { account: "accumulated_depreciation_vehicle", amount: 108000 },
        { account: "depreciation_expense", amount: 54000 },
      ],
      credit: [{ account: "vehicle", amount: 360000 }, { account: "gain_on_sale_of_fixed_assets", amount: 12000 }],
    });
    expect(feedback).not.toContain("左は未収入金210,000");
    expect(feedback).toContain("どちらも372,000");
  });

  it("軽バンの売却損の行を書き忘れると、その行を足すよう言う", () => {
    const task = findPost("depreciation/sale-of-fixed-assets", "loss_on_sale_of_fixed_assets");
    const result = gradePost(task, {
      debit: [{ account: "cash", amount: 850000 }, { account: "accumulated_depreciation_vehicle", amount: 300000 }],
      credit: [{ account: "vehicle", amount: 1200000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("固定資産売却損として左に足しましょう");
  });

  it("軽バンの売却で現金を85,000と打ち間違えると、左を現金850,000と言い切らない", () => {
    const task = findPost("depreciation/sale-of-fixed-assets", "loss_on_sale_of_fixed_assets");
    const feedback = unbalancedFeedback(task, {
      debit: [
        { account: "cash", amount: 85000 },
        { account: "accumulated_depreciation_vehicle", amount: 300000 },
        { account: "loss_on_sale_of_fixed_assets", amount: 50000 },
      ],
      credit: [{ account: "vehicle", amount: 1200000 }],
    });
    expect(feedback).not.toContain("左の現金850,000");
    expect(feedback).toContain("どちらも1,200,000");
  });

  it("マシンの売却益の行を書き忘れると、その行を足すよう言う", () => {
    const task = findPost("depreciation/sale-of-fixed-assets", "gain_on_sale_of_fixed_assets", "credit");
    const result = gradePost(task, {
      debit: [{ account: "accounts_receivable_other", amount: 480000 }, { account: "accumulated_depreciation_equipment", amount: 150000 }],
      credit: [{ account: "equipment", amount: 600000 }],
    });
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
    expect(result.feedback).toContain("固定資産売却益として右に足しましょう");
  });

  it("マシンの売却で未収入金を48,000と打ち間違えると、左を未収入金480,000と言い切らない", () => {
    const task = findPost("depreciation/sale-of-fixed-assets", "gain_on_sale_of_fixed_assets", "credit");
    const feedback = unbalancedFeedback(task, {
      debit: [{ account: "accounts_receivable_other", amount: 48000 }, { account: "accumulated_depreciation_equipment", amount: 150000 }],
      credit: [{ account: "equipment", amount: 600000 }, { account: "gain_on_sale_of_fixed_assets", amount: 30000 }],
    });
    expect(feedback).not.toContain("左は未収入金480,000");
    expect(feedback).toContain("どちらも630,000");
  });
});
