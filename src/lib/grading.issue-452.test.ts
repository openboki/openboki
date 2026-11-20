import { describe, expect, it } from "vitest";
import { unitAccountList, unitMap } from "./content";
import { gradeDebug, gradePost, type TaskOf } from "./grading";

// Issue #452: ステップ7(もうけを元手に移す)で、胡椒ではなくワインの口から30を移すと、誤解の説明が無く汎用文だけが出ていた
const venture = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;
const accounts = new Map(unitAccountList(venture.scenario.accounts).map((a) => [a.id, a]));
const task = venture.steps[6].task as TaskOf<"post">;

describe("航海の儲けと複式の発見 ステップ7で、ワインの口からもうけを移す", () => {
  it("postの課題で、answerで正解になる", () => {
    expect(task.type).toBe("post");
    expect(gradePost(task, task.answer, accounts, "history").correct).toBe(true);
  });

  it("借方 ワイン30 / 貸方 元手30はventure_account_mixedで、胡椒の口を指す", () => {
    const r = gradePost(task, { debit: [{ account: "wine_voyage", amount: 30 }], credit: [{ account: "owner_capital", amount: 30 }] }, accounts, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_account_mixed");
    expect(r.feedback).toContain("胡椒");
    expect(r.feedback).not.toContain("どのページに書くかを見直しましょう");
  });

  it("借方 ワイン180のように金額も違っても、口の取り違えとして説明する", () => {
    const r = gradePost(task, { debit: [{ account: "wine_voyage", amount: 180 }], credit: [{ account: "owner_capital", amount: 180 }] }, accounts, "history");
    expect(r.misconception).toBe("venture_account_mixed");
  });

  it("借方 ワイン30 / 貸方 現金30は従来どおりprofit_is_cash", () => {
    const r = gradePost(task, { debit: [{ account: "wine_voyage", amount: 30 }], credit: [{ account: "cash", amount: 30 }] }, accounts, "history");
    expect(r.misconception).toBe("profit_is_cash");
  });

  it("借方 胡椒180は従来どおりventure_sales_as_profit", () => {
    const r = gradePost(task, { debit: [{ account: "pepper_voyage", amount: 180 }], credit: [{ account: "owner_capital", amount: 180 }] }, accounts, "history");
    expect(r.misconception).toBe("venture_sales_as_profit");
  });
});

// ステップ6(写し忘れを見つける)で、行は合っているが書き足す右のページを取り違える
describe("航海の儲けと複式の発見 ステップ6で、写し忘れの右を別のページにする", () => {
  const debug = venture.steps[5].task as TaskOf<"debug">;
  const fix = (account: string) => ({ index: 2, entry: { debit: [{ account: "giovanni", amount: 50 }], credit: [{ account, amount: 50 }] } });

  it("右を胡椒にするとventure_account_mixedで、ワインの口を指す", () => {
    const r = gradeDebug(debug, fix("pepper_voyage"), accounts, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("venture_account_mixed");
    expect(r.feedback).toContain("ワイン");
  });

  it("右を現金にすると、まだ受け取っていないと説明する", () => {
    const r = gradeDebug(debug, fix("cash"), accounts, "history");
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("まだ受け取っていません");
  });

  it("answerは正解のまま", () => {
    expect(gradeDebug(debug, debug.answer, accounts, "history").correct).toBe(true);
  });
});
