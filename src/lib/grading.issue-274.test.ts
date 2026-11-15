import { describe, expect, it } from "vitest";
import { accountMap, unitAccountList, unitMap } from "./content";
import { gradeDebug, gradePost, type TaskOf } from "./grading";

// Issue #274: 歴史の単元(ページの左右で学ぶ)で、5要素の動きが同じ誤答に5要素の言葉の汎用文が出ていた
const SAME_IMPACT = "5つの要素の動きは合っています。使っている科目を見直しましょう。";
const SAME_IMPACT_HISTORY = "左右に書く金額は合っています。どのページに書くかを見直しましょう。";

const venture = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;
const accounts = new Map(unitAccountList(venture.scenario.accounts).map((a) => [a.id, a]));

describe("歴史の単元で5要素の動きが同じ誤答", () => {
  it("postでは、ページの左右の言葉で科目の見直しを促す", () => {
    const task = venture.steps[6].task as TaskOf<"post">;
    const entry = { debit: [{ account: "wine_voyage", amount: 30 }], credit: [{ account: "owner_capital", amount: 30 }] };
    expect(gradePost(task, entry, accounts).feedback).toBe(SAME_IMPACT);
    const r = gradePost(task, entry, accounts, venture.kind);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(SAME_IMPACT_HISTORY);
  });

  it("debugで正しい行の貸方を現金にしたときも同じ", () => {
    const task = venture.steps[5].task as TaskOf<"debug">;
    const entry = { debit: task.answer.entry.debit, credit: [{ account: "cash", amount: 50 }] };
    expect(gradeDebug(task, { index: task.answer.index, entry }, accounts, venture.kind).feedback).toBe(SAME_IMPACT_HISTORY);
  });

  it("lessonの単元では従来の5要素の文のまま", () => {
    const five = unitMap.get("bookkeeping-basics/five-elements")!;
    const task = five.steps[1].task as TaskOf<"post">;
    const entry = { debit: [{ account: "bank_deposit", amount: 1000000 }], credit: task.answer.credit };
    expect(gradePost(task, entry, accountMap, five.kind).feedback).toBe(SAME_IMPACT);
  });
});
