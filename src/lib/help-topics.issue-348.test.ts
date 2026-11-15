import { describe, expect, it } from "vitest";
import { helpTopic, topicBody } from "./help-topics";

// Issue #348: ドゥカートの単元でも「金額で答える」が「「円」は付けても」と案内していた

const ctx = { taskType: "calc", postedCount: 0, isLast: false, hasHint: false, view: "ledger" } as const;

describe("issue 348", () => {
  it("ドゥカートの単元では通貨名をドゥカートで案内する", () => {
    const body = topicBody(helpTopic("calc"), { ...ctx, currency: "ドゥカート" });
    expect(body).toContain("「ドゥカート」は付けても");
    expect(body).not.toContain("円");
  });

  it("円の単元では従来の文言のまま", () => {
    expect(topicBody(helpTopic("calc"), { ...ctx, currency: "円" })).toBe(
      "問題文を読んで金額を入力し、「確認する」を押します(Enterでも可)。桁区切りのカンマや「円」は付けても付けなくても構いません。",
    );
  });
});
