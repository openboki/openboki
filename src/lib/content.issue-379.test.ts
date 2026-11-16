import { describe, expect, it } from "vitest";
import { type TaskOf, gradeClassify, gradePost, gradePredict } from "./grading";
import { accountMap, misconceptionMap, unitMap } from "./content";

// Issue #379: 似た4科目(未収入金・未払金・前払金・前受金)の取り違えに誤解IDが無く、「よくある思い込み」が出なかった
const unit = unitMap.get("receivables-and-payables/other-receivables-and-payables")!;

function task<T extends "post" | "predict" | "calc" | "classify">(step: number, type: T) {
  const t = unit.steps[step].task;
  if (t.type !== type) throw new Error(`${type}ではない`);
  return t as TaskOf<T>;
}

function entry(debit: [string, number][], credit: [string, number][]) {
  return {
    debit: debit.map(([account, amount]) => ({ account, amount })),
    credit: credit.map(([account, amount]) => ({ account, amount })),
  };
}

describe("誤答パターンに誤解IDか免除の理由がある(Issue #272の展開)", () => {
  const patterns = unit.steps.flatMap((s, step) => {
    const t = s.task;
    if (!t || !("wrong_patterns" in t)) return [];
    return t.wrong_patterns
      .filter((p) => !(typeof p.match === "object" && p.match !== null && "unbalanced" in p.match))
      .map((p) => ({ step, type: t.type, p }));
  });

  it("貸借不一致以外の誤答パターンがある", () => {
    expect(patterns.length).toBeGreaterThan(0);
  });

  it.each(patterns.map(({ step, type, p }) => [step + 1, type, JSON.stringify(p.match), p]))(
    "ステップ%i(%s)の誤答%sに誤解IDか免除の理由がある",
    (_step, _type, _match, p) => {
      expect(Boolean(p.misconception) !== Boolean(p.no_misconception)).toBe(true);
      if (p.misconception) expect(misconceptionMap.has(p.misconception)).toBe(true);
    },
  );
});

describe("前払金と前受金の取り違えに誤解の説明が付く", () => {
  it("ステップ4: 払った手付金を前受金にする", () => {
    const r = gradePost(task(3, "post"), entry([["advance_received", 10000]], [["cash", 10000]]));
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("advance_payment_received_confused");
  });
  it("ステップ5: 前払金の代わりに前受金を消す", () => {
    const r = gradePost(
      task(4, "post"),
      entry([["purchases", 40000]], [["advance_received", 10000], ["accounts_payable", 30000]]),
    );
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("advance_payment_received_confused");
  });
  it("ステップ6: 純資産が増えると予想するのは、手付金をもうけと読む誤り", () => {
    const r = gradePredict(task(5, "predict"), { asset: "increase", liability: "none", equity: "increase", revenue: "none", expense: "none" });
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("advance_received_is_revenue");
  });
});

describe("ステップ8の仕分けボードで取り違えた科目に誤解IDが付く", () => {
  const right = { accounts_receivable_other: "asset", accounts_payable_other: "liability", advance_payment: "asset", advance_received: "liability" };
  const t = () => task(7, "classify");

  it("正解は変わらない", () => {
    expect(gradeClassify(t(), right, accountMap).correct).toBe(true);
  });
  it("未収入金と未払金を入れ替える", () => {
    const r = gradeClassify(t(), { ...right, accounts_receivable_other: "liability", accounts_payable_other: "asset" }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.wrong.map((w) => w.misconception)).toEqual(["nontrade_receivable_payable_confused", "nontrade_receivable_payable_confused"]);
    expect(r.misconception).toBe("nontrade_receivable_payable_confused");
  });
  it("前払金と前受金を入れ替える", () => {
    const r = gradeClassify(t(), { ...right, advance_payment: "liability", advance_received: "asset" }, accountMap);
    expect(r.correct).toBe(false);
    expect(r.wrong.map((w) => w.misconception)).toEqual(["advance_payment_received_confused", "advance_payment_received_confused"]);
  });
});
