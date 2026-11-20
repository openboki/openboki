import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Issue #334: 用語集の「仮勘定」が全体を「資産でも負債でもなく」と定義し、資産・負債に分ける仮払金・仮受金と食い違っていた。
// 一般の用法に合わせ、仮勘定に仮払金・仮受金を含め、「資産でも負債でもない」は現金過不足だけの性質として書く
test("仮勘定の定義が仮払金・仮受金を含み、「資産でも負債でもない」を現金過不足に限る", async ({ page }) => {
  await page.goto("/glossary");
  await page.getByLabel("用語を検索").first().fill("仮");
  const main = page.locator("main");
  await expect(main).toContainText("仮払金");
  await expect(main).toContainText("仮受金");
  const definition = await main.locator('[id="temporary_account"]').innerText();
  expect(definition).toContain("仮払金");
  expect(definition).toContain("仮受金");
  // 「資産でも負債でもない」の主語は現金過不足
  expect(definition).toMatch(/現金過不足は資産でも負債でもなく/);
  expect(definition).not.toMatch(/勘定科目。[^。]*資産でも負債でもなく/);
});

test("仮払金・仮受金の単元は、仮勘定の仲間だと示しつつ資産・負債だと明示する", () => {
  const units = JSON.parse(readFileSync(".velite/units.json", "utf8"));
  const unit = units.find((u: { id: string }) => u.id === "receivables-and-payables/temporary-and-deposits");
  const step = (title: string) => unit.steps.find((s: { title: string }) => s.title === title).narrative as string;
  const receipt = step("正体不明の入金");
  expect(receipt).toContain("[[temporary_account|仮勘定]]");
  expect(receipt).not.toContain("仮の置き場");
  expect(receipt).toContain("負債");
  const review = step("ふりかえり");
  expect(review).toContain("[[temporary_account|仮勘定]]");
  expect(review).not.toContain("仮の科目は");
  expect(review).toContain("仮払金は資産");
  expect(review).toContain("仮受金は負債");
});
