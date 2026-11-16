import { describe, expect, it } from "vitest";
import { ELEMENTS, type Element } from "./accounting";
import { accountList, accountMap, unitMap } from "./content";
import { deniedElement, gradeClassify, type TaskOf } from "./grading";

// Issue #377: 仕分けボードの説明が、学習者が選んでいない箱を否定していた

describe("預かったお金、仮のお金 ステップ9の仕分けボード", () => {
  const t = unitMap.get("receivables-and-payables/temporary-and-deposits")!.steps[8].task;
  if (t.type !== "classify") throw new Error("classifyではない");
  const feedbackOf = (placed: Record<string, Element>, account: string) => gradeClassify(t, placed, accountMap).wrong.find((w) => w.account === account)!.feedback;

  it("立替金を負債、預り金を資産に入れると、費用・もうけを否定する文が出ない", () => {
    const placed = { advances_paid: "liability", deposits_received: "asset", suspense_payment: "asset", suspense_receipt: "liability" } as const;
    expect(feedbackOf(placed, "advances_paid")).toBe("立替金は資産です。後で本人から返してもらう権利で、将来お金に変わる財産だからです。");
    expect(feedbackOf(placed, "deposits_received")).toBe("預り金は負債です。本人の代わりに納める義務を負っている他人のお金だからです。");
  });

  it("立替金を費用、預り金を収益に入れたときは否定文が残る", () => {
    const placed = { advances_paid: "expense", deposits_received: "revenue", suspense_payment: "asset", suspense_receipt: "liability" } as const;
    expect(feedbackOf(placed, "advances_paid")).toContain("会社の費用ではありません。");
    expect(feedbackOf(placed, "deposits_received")).toContain("会社のもうけではありません。");
  });
});

describe("whyが要素を否定する科目", () => {
  const denying = accountList.filter((a) => a.why.split(/(?<=。)/).some((s) => deniedElement(s) !== undefined));

  it("5科目で、否定している要素が1つに決まる", () => {
    expect(denying.map((a) => a.id).sort()).toEqual(["accumulated_depreciation", "advance_payment", "advance_received", "advances_paid", "deposits_received"]);
    for (const a of denying) {
      const negations = a.why.split(/(?<=。)/).filter((s) => s.endsWith("ではありません。"));
      expect(negations, a.id).toHaveLength(1);
      expect(deniedElement(negations[0]), a.id).toBeDefined();
    }
  });

  it("否定している要素以外の箱に入れると、否定文が出ない", () => {
    const task: TaskOf<"classify"> = { type: "classify", accounts: denying.map((a) => a.id), misconceptions: {} };
    for (const a of denying) {
      const denied = deniedElement(a.why.split(/(?<=。)/).find((s) => s.endsWith("ではありません。"))!);
      for (const el of ELEMENTS) {
        if (el === a.element) continue;
        const { feedback } = gradeClassify(task, { [a.id]: el }, accountMap).wrong.find((w) => w.account === a.id)!;
        expect(feedback.endsWith("。"), `${a.id} → ${el}`).toBe(true);
        expect(feedback.includes("ではありません"), `${a.id} → ${el}`).toBe(el === denied);
      }
    }
  });
});

describe("deniedElement", () => {
  it("否定文でなければundefined", () => {
    expect(deniedElement("手元にある財産だからです。")).toBeUndefined();
  });

  it("否定文は言葉で要素を引く", () => {
    expect(deniedElement("まだ仕入ではありません。")).toBe("expense");
    expect(deniedElement("会社のもうけではありません。")).toBe("revenue");
    expect(deniedElement("支払う義務ではないので負債ではありません。")).toBe("liability");
    expect(deniedElement("純資産ではありません。")).toBe("equity");
    expect(deniedElement("資産ではありません。")).toBe("asset");
  });
});
