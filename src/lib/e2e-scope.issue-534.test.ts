import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// 関門で回すE2Eの範囲を決める規則(scripts/e2e-scope.sh、ADR 0005)
function scope(...files: string[]) {
  return execFileSync("scripts/e2e-scope.sh", { input: files.join("\n"), encoding: "utf8" }).trim().split("\n");
}

describe("e2e-scope", () => {
  it("単元の本文だけの変更は、基幹のspecとその単元を開くreproに絞る", () => {
    const specs = scope("content/topics/cash-and-deposits/petty-cash.md");
    expect(specs).toContain("e2e/learning-loop.spec.ts");
    // issue-24は /units/cash-and-deposits/petty-cashを開く
    expect(specs).toContain("e2e/repro/issue-24.spec.ts");
    // issue-386は別の単元(depreciation/sale-of-fixed-assets)だけを開く
    expect(specs).not.toContain("e2e/repro/issue-386.spec.ts");
  });

  it("topic.yamlの変更は、そのテーマの単元を開くreproを含める", () => {
    const specs = scope("content/topics/depreciation/topic.yaml");
    expect(specs).toContain("e2e/repro/issue-386.spec.ts");
    expect(specs).not.toContain("e2e/repro/issue-24.spec.ts");
  });

  it("誤解だけの変更は基幹のspecを回す", () => {
    const specs = scope("content/misconceptions.yaml");
    expect(specs).toContain("e2e/learning-loop.spec.ts");
    expect(specs.some((s) => s.startsWith("e2e/repro/"))).toBe(false);
  });

  it("変更したspecはそのspecだけを回す", () => {
    expect(scope("docs/roadmap.md", "e2e/repro/issue-24.spec.ts")).toEqual(["e2e/repro/issue-24.spec.ts"]);
  });

  it("docsと単体テストだけの変更はE2Eを回さない", () => {
    expect(scope("docs/roadmap.md", "README.md", "src/lib/grading.issue-1.test.ts")).toEqual(["none"]);
  });

  it("範囲を決められない変更は全件に倒す", () => {
    expect(scope("src/components/ide/ide-shell.tsx", "e2e/repro/issue-24.spec.ts")).toEqual(["full"]);
    expect(scope("content/topics/cash-and-deposits/petty-cash.md", "src/lib/grading.ts")).toEqual(["full"]);
    expect(scope("content/concepts/cash.yaml")).toEqual(["full"]);
    expect(scope("content/accounts.yaml")).toEqual(["full"]);
    expect(scope("scripts/check.sh")).toEqual(["full"]);
    expect(scope("package.json")).toEqual(["full"]);
  });

  it("差分が無ければ全件", () => {
    expect(scope()).toEqual(["full"]);
  });
});
