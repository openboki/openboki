import { expect, test } from "@playwright/test";

// Issue #420: 口別の勘定(胡椒の航海)が「◆ 資産」と出て、元帳も左を「増える側」としていた。
// かかった額と売った額を1ページに集める勘定で5要素に収まらないので、要素のバッジと増える側を出さない
test("口別の勘定は、ポップオーバーに要素のバッジを出さず、元帳に増える側を出さない", async ({ page }) => {
  const next = page.getByRole("button", { name: "次へ →" });
  const result = page.getByRole("region", { name: "結果" });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  const calc = page.getByRole("region", { name: "ワークスペース" }).locator("input").first();
  await calc.fill("30");
  await calc.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();

  // T勘定。胡椒のページは見出しに要素の記号が無く、左に「増える側」が付かない。現金(資産)には残る
  await expect(result).toContainText("◆現金借方(増える側)");
  await expect(result).toContainText("胡椒(アレクサンドリア航海)借方胡椒50袋");
  await expect(result).not.toContainText("◆胡椒");

  const trigger = result.locator("[data-slot=popover-trigger]", { hasText: "胡椒" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "胡椒(アレクサンドリア航海)" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("口別の勘定");
  await expect(dialog).not.toContainText("資産");
});
