import { describe, expect, it } from "vitest";
import { helpTopic, topicBody, topicShort } from "./help-topics";

// Issue #399: view: ledgerの単元で、「影響の表示」が画面に無い5要素と当期純利益の動きを案内していた

const ctx = { taskType: "post", postedCount: 0, isLast: false, hasHint: true, currency: "ドゥカート" } as const;

describe("issue 399", () => {
  it("view: ledgerでは影響の表示が5要素と当期純利益に触れず、借方合計と貸方合計を説明する", () => {
    const ledger = { ...ctx, view: "ledger" } as const;
    const impact = helpTopic("impact");
    for (const text of [topicShort(impact, ledger), topicBody(impact, ledger)]) {
      expect(text).not.toContain("5要素");
      expect(text).not.toContain("当期純利益");
      expect(text).toContain("借方合計と貸方合計");
    }
  });

  it("view: statementsでは従来どおり5要素と当期純利益の動きを説明する", () => {
    const statements = { ...ctx, view: "statements" } as const;
    const impact = helpTopic("impact");
    expect(topicShort(impact, statements)).toContain("5要素と当期純利益がどう動くか");
    expect(topicBody(impact, statements)).toContain("動く要素だけに色が付きます");
  });
});
