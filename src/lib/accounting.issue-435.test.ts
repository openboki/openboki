import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type AccountInfo, findAccountByName, matchesAccountQuery } from "./accounting";

// Issue #435: 科目欄に未収入金の略称「未収金」と入れても候補に出ず、「科目はありません」になっていた
type RawAccount = Pick<AccountInfo, "id" | "name"> & { aliases?: string[]; reading?: string[] };
const raw: RawAccount[] = parse(readFileSync("content/accounts.yaml", "utf8")).accounts;
const toInfo = (a: RawAccount): AccountInfo => ({
  ...a,
  aliases: a.aliases ?? [],
  element: "asset",
  contra: false,
  short: "",
  why: "",
});
const accounts = raw.map(toInfo);
const receivable = accounts.find((a) => a.id === "accounts_receivable_other")!;

describe("未収入金の別名(Issue #435)", () => {
  it.each(["未収金", "みしゅうきん"])("「%s」で未収入金が候補に当たる", (query) => {
    expect(matchesAccountQuery(receivable, query)).toBe(true);
  });

  it("「未収金」は未収入金として確定する", () => {
    expect(findAccountByName("未収金", accounts)?.id).toBe("accounts_receivable_other");
  });
});
