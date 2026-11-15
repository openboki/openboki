import { describe, expect, it } from "vitest";
import { accountMap, unitAccountList, unitMap } from "./content";
import { gradeDebug, gradePost, type TaskOf } from "./grading";

// Issue #300: 歴史の単元で、想定外の誤答に「結果の表で何が動くはずか」の汎用文が出ていた
const GENERIC_WRONG = "まだ合っていません。結果の表で何が動くはずかを考えて、もう一度試してみましょう。";

const venture = unitMap.get("birth-of-double-entry/venture-profit-and-double-entry")!;
const accounts = new Map(unitAccountList(venture.scenario.accounts).map((a) => [a.id, a]));

describe("歴史の単元で想定外の誤答", () => {
  it("postでは、結果の表ではなくページの左右の言葉で返す", () => {
    const task = venture.steps[6].task as TaskOf<"post">;
    const entry = { debit: task.answer.debit, credit: [{ account: "giovanni", amount: 30 }] };
    expect(gradePost(task, entry, accounts).feedback).toBe(GENERIC_WRONG);
    const r = gradePost(task, entry, accounts, venture.kind);
    expect(r.correct).toBe(false);
    expect(r.feedback).not.toContain("結果の表");
    expect(r.feedback).toContain("左と右");
  });

  it("debugで正しい行を想定外に直したときも同じ", () => {
    const task = venture.steps[5].task as TaskOf<"debug">;
    const entry = { debit: [{ account: "giovanni", amount: 50 }], credit: [{ account: "owner_capital", amount: 50 }] };
    const r = gradeDebug(task, { index: task.answer.index, entry }, accounts, venture.kind);
    expect(r.correct).toBe(false);
    expect(r.feedback).not.toContain("結果の表");
  });

  it("lessonの単元では従来の文のまま", () => {
    const five = unitMap.get("bookkeeping-basics/five-elements")!;
    const task = { ...(five.steps[1].task as TaskOf<"post">), wrong_patterns: [] };
    const entry = { debit: [{ account: "rent_expense", amount: 1 }], credit: [{ account: "loans_payable", amount: 1 }] };
    expect(gradePost(task, entry, accountMap, five.kind).feedback).toBe(GENERIC_WRONG);
  });
});
