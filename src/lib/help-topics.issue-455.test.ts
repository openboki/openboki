import { describe, expect, it } from "vitest";
import { HELP_TOPICS, canShowTarget, helpTopic, onView } from "./help-topics";

// Issue #455: view: ledgerの単元で「すべての機能」が画面に無い財務諸表を案内し、画面にある試算の説明が無かった

const ctx = { taskType: "observe", postedCount: 2, isLast: false, hasHint: false, currency: "ドゥカート" } as const;
const resultIds = (view: "ledger" | "statements") =>
  HELP_TOPICS.filter((t) => t.category === "result" && onView(t, { ...ctx, view })).map((t) => t.id);

describe("issue 455", () => {
  it("view: ledgerでは試算を出し、財務諸表・会社のかたち・動いた要素を出さない", () => {
    expect(resultIds("ledger")).toEqual(["trial", "rewind"]);
    expect(canShowTarget(helpTopic("statements"), { ...ctx, view: "ledger" })).toBe(false);
    expect(canShowTarget(helpTopic("trial"), { ...ctx, view: "ledger" })).toBe(true);
  });

  it("view: statementsでは従来どおり財務諸表を出し、試算を出さない", () => {
    expect(resultIds("statements")).toEqual(["statements", "shape", "rewind", "changed"]);
    expect(canShowTarget(helpTopic("statements"), { ...ctx, view: "statements" })).toBe(true);
  });
});
