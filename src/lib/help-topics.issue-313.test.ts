import { describe, expect, it } from "vitest";
import { currentTopics, helpTopic, topicBody } from "./help-topics";

// Issue #313: view: ledgerの単元で、画面に無い「会社のかたち」と財務諸表前提の「帳簿をさかのぼる」を案内していた

const ctx = { taskType: "calc", postedCount: 2, isLast: false, hasHint: true, currency: "円" } as const;

describe("issue 313", () => {
  it("view: ledgerでは会社のかたちを出さず、さかのぼるは試算と元帳を説明する", () => {
    const ledger = { ...ctx, view: "ledger" } as const;
    expect(currentTopics(ledger).map((t) => t.id)).not.toContain("shape");
    const body = topicBody(helpTopic("rewind"), ledger);
    expect(body).not.toContain("貸借対照表");
    expect(body).toContain("試算と元帳");
  });

  it("view: statementsでは従来どおり会社のかたちと財務諸表の説明を出す", () => {
    const statements = { ...ctx, view: "statements" } as const;
    expect(currentTopics(statements).map((t) => t.id)).toContain("shape");
    expect(topicBody(helpTopic("rewind"), statements)).toContain("貸借対照表と損益計算書");
  });
});
