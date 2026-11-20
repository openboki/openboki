import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Issue #451: 「利息の計算」が借入金の年利率2%を「〜でした」と既出のように言うので、その前のステップで先に示しておく
const source = readFileSync("content/topics/receivables-and-payables/loans.md", "utf8");
const sections = source.split(/^## /m).slice(1);
const sectionText = (title: string) => sections.find((s) => s.startsWith(title))!.replace(/```[\s\S]*?```/g, "");

describe("借入金の年利率の初出(Issue #451)", () => {
  it("「借入金の利息を払う」の本文で年利率2%を示している", () => {
    expect(sectionText("借入金の利息を払う")).toContain("年利率]]2%");
  });

  it("年利率2%の初出は「利息の計算」の見出しより前にある", () => {
    const first = source.search(/年利率(\]\])?2%/);
    expect(first).toBeGreaterThan(-1);
    expect(first).toBeLessThan(source.indexOf("## 利息の計算"));
  });

  it("貸付金側と同じく、計算の前提は仕訳のステップで先に示し、計算のステップでは振り返る", () => {
    expect(sectionText("お金を貸す")).toContain("年利率]]は4%");
    expect(sectionText("利息の計算")).toContain("年利率2%、半年分でした");
  });
});
