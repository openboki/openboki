import { describe, expect, it } from "vitest";
import { accountList as accounts } from "./content";

// Issue #393: 減価償却費のshortが「今年の分」で、10月〜3月の6か月を当期の分とする月割りの単元と食い違う
describe("減価償却費の説明", () => {
  const account = accounts.find((a) => a.id === "depreciation_expense")!;

  it("shortは暦年に読める「今年」ではなく、会計期間の分だと分かる言い方にする", () => {
    expect(account.short).not.toContain("今年");
    expect(account.short).toContain("当期");
  });

  it("exampleは期の途中で買ったときの月割りに触れる", () => {
    expect(account.example).toContain("か月分");
  });

  it("科目の説明に「今年」を使わない(会計期間と暦年の取り違えを招くため)", () => {
    const bad = accounts
      .filter((a) => [a.short, a.why, a.example].some((text) => text?.includes("今年")))
      .map((a) => a.id);
    expect(bad).toEqual([]);
  });
});
