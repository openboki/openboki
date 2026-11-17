import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

// Issue #407: 歴史の単元(1386年・1494年の商人の店)でも共通の科目「現金」を使うのに、
// 説明が「会社が手元に持っているお金」で、同じ画面の元手(商人が店に入れた財産)と時代が食い違った
type RawAccount = { id: string; short: string; why: string };
const raw: RawAccount[] = parse(readFileSync("content/accounts.yaml", "utf8")).accounts;
const cash = raw.find((a) => a.id === "cash")!;

describe("現金の説明(Issue #407)", () => {
  it("shortとwhyが「会社」を前提にしない", () => {
    expect(cash.short).not.toContain("会社");
    expect(cash.why).not.toContain("会社");
  });
});
