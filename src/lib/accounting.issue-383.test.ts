import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type AccountInfo, findAccountByName, matchesAccountQuery } from "./accounting";

// Issue #383: 科目欄に「送料」「運賃」と入れても発送費が候補に出ず、記帳できなかった
type RawAccount = Pick<AccountInfo, "id" | "name"> & { aliases?: string[]; reading?: string[] };
const raw: RawAccount[] = parse(readFileSync("content/accounts.yaml", "utf8")).accounts;
const toInfo = (a: RawAccount): AccountInfo => ({
  ...a,
  aliases: a.aliases ?? [],
  element: "expense",
  contra: false,
  short: "",
  why: "",
});
const accounts = raw.map(toInfo);
const shipping = accounts.find((a) => a.id === "shipping_expense")!;

describe("発送費の別名(Issue #383)", () => {
  it.each(["送料", "運賃", "発送運賃"])("「%s」で発送費が候補に当たる", (query) => {
    expect(matchesAccountQuery(shipping, query)).toBe(true);
  });

  it("「送料」は発送費として確定する", () => {
    expect(findAccountByName("送料", accounts)?.id).toBe("shipping_expense");
  });

  it("「運賃」は仕入諸掛も指すので、どの科目にも確定しない", () => {
    expect(findAccountByName("運賃", accounts)).toBeUndefined();
  });
});
