import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type AccountInfo, findAccountByReading } from "./accounting";

// Issue #292: 読みが他の科目の読みにも含まれる科目(げんきん ⊂ 小口現金・現金過不足)は、読みを最後まで入れても確定しなかった
type RawAccount = Pick<AccountInfo, "id" | "name"> & { aliases?: string[]; reading?: string[] };
const raw: RawAccount[] = parse(readFileSync("content/accounts.yaml", "utf8")).accounts;
const accounts: AccountInfo[] = raw.map((a) => ({
  id: a.id,
  name: a.name,
  aliases: a.aliases ?? [],
  reading: a.reading,
  element: "asset",
  contra: false,
  short: "",
  why: "",
}));

describe("findAccountByReading(Issue #292)", () => {
  it.each([
    ["げんきん", "現金"],
    ["たてもの", "建物"],
    ["びひん", "備品"],
    ["しゃりょううんぱんぐ", "車両運搬具"],
    ["げんかしょうきゃくるいけいがく", "減価償却累計額"],
    ["ゲンキン", "現金"],
  ])("「%s」は%sに確定する", (query, name) => {
    expect(findAccountByReading(query, accounts)?.name).toBe(name);
  });

  it("読みの一部では確定しない", () => {
    expect(findAccountByReading("げん", accounts)).toBeUndefined();
    expect(findAccountByReading("", accounts)).toBeUndefined();
  });

  it("同じ読みの科目が2つあれば確定しない", () => {
    const twin = { ...accounts.find((a) => a.name === "現金")!, id: "twin", name: "双子" };
    expect(findAccountByReading("げんきん", [...accounts, twin])).toBeUndefined();
  });
});
