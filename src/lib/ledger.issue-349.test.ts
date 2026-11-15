import { describe, expect, it } from "vitest";
import type { AccountInfo, Element } from "./accounting";
import { buildTrialBalance, orderAccountIds } from "./ledger";

// 試算表と元帳の科目の並びを、マスタで資産と負債が混ざっていても5要素ごとにまとめる(Issue #349)
const account = (id: string, element: Element): [string, AccountInfo] => [id, { id, name: id, aliases: [], element, contra: false, short: "", why: "" }];
const accounts = new Map([account("cash", "asset"), account("niccolo", "liability"), account("silk", "asset"), account("pepper", "asset"), account("capital", "equity")]);

describe("試算表と元帳の科目の並び", () => {
  it("試算表の行は5要素の順、同じ要素の中はマスタの順になる", () => {
    const tb = buildTrialBalance(
      [
        { account: "capital", amount: 300 },
        { account: "cash", amount: 200 },
        { account: "pepper", amount: 100 },
      ],
      [{ debit: [{ account: "silk", amount: 100 }], credit: [{ account: "niccolo", amount: 100 }] }],
      accounts,
    );
    expect(tb.lines.map((l) => l.account)).toEqual(["cash", "silk", "pepper", "niccolo", "capital"]);
  });

  it("元帳が使う並びは出てきた順によらず試算表と同じになる", () => {
    expect(orderAccountIds(["cash", "pepper", "capital", "silk", "niccolo", "unknown"], accounts)).toEqual(["cash", "silk", "pepper", "niccolo", "capital"]);
  });
});
