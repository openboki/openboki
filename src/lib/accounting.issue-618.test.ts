import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type AccountInfo, findAccountByName, findAccountByReading, groupAccountCandidates } from "./accounting";

// Issue #618: 科目欄に「手付金」と打つと候補が0件で「という科目はありません」と出た。
// 手付金は払った側なら前払金、受け取った側なら前受金なので、両方を候補に出し、どちらにも自動では確定させない
type RawAccount = Pick<AccountInfo, "id" | "name" | "element"> & { aliases?: string[]; reading?: string[]; keywords?: string[] };
const raw: RawAccount[] = parse(readFileSync("content/accounts.yaml", "utf8")).accounts;
const accounts: AccountInfo[] = raw.map((a) => ({ ...a, aliases: a.aliases ?? [], contra: false, short: "", why: "" }));
const candidateIds = (query: string) => groupAccountCandidates(accounts, query).flatMap((g) => g.items.map((a) => a.id));

describe("手付金の候補(Issue #618)", () => {
  it.each(["手付金", "てつけきん", "手付", "てつけ"])("「%s」で前払金と前受金の両方が候補に出る", (query) => {
    expect(candidateIds(query)).toEqual(["advance_payment", "advance_received"]);
  });

  it("「手付金」はどの科目にも確定しない", () => {
    expect(findAccountByName("手付金", accounts)).toBeUndefined();
    expect(findAccountByReading("てつけきん", accounts)).toBeUndefined();
  });

  it("別名・読みでの確定はこれまでどおり", () => {
    expect(findAccountByName("前渡金", accounts)?.id).toBe("advance_payment");
    expect(findAccountByReading("まえうけきん", accounts)?.id).toBe("advance_received");
  });
});
