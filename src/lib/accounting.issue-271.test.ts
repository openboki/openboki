import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type AccountInfo, findAccountByName, matchesAccountQuery } from "./accounting";

// Issue #271: 品目名の「切手代」が通信費の別名になっていて、品目を科目に振り分けるステップが素通りになっていた
type RawAccount = Pick<AccountInfo, "id" | "name"> & { aliases?: string[]; reading?: string[] };
const raw: RawAccount[] = parse(readFileSync("content/accounts.yaml", "utf8")).accounts;
const accounts: AccountInfo[] = raw.map((a) => ({
  id: a.id,
  name: a.name,
  aliases: a.aliases ?? [],
  reading: a.reading,
  element: "expense",
  contra: false,
  short: "",
  why: "",
}));
const communication = accounts.find((a) => a.id === "communication_expense")!;

describe("content/accounts.yaml(Issue #271)", () => {
  it("「切手代」は科目として確定しない(文房具代・電車代と同じ扱い)", () => {
    for (const item of ["切手代", "文房具代", "電車代"]) {
      expect(findAccountByName(item, accounts), item).toBeUndefined();
    }
  });

  it("通信費の候補検索は「切手」「きって」では引けない", () => {
    expect(matchesAccountQuery(communication, "切手")).toBe(false);
    expect(matchesAccountQuery(communication, "きって")).toBe(false);
    expect(matchesAccountQuery(communication, "つうしん")).toBe(true);
  });
});
