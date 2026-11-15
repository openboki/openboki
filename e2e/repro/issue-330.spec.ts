import { expect, test } from "@playwright/test";

// Issue #330: T勘定で仮勘定の現金過不足が「◆資産」の見出しと「借方(増える側)」で出ていた
test("T勘定で現金過不足を資産として見せない", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金過不足");
  await work.getByLabel("借方の金額1").fill("3000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("3000");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await work.getByRole("tab", { name: "総勘定元帳(T勘定)" }).click();
  const head = work.getByRole("button", { name: "現金過不足", exact: true }).last().locator("..");
  await expect(head).toHaveText("現金過不足(仮)");
  await expect(head).not.toHaveClass(/bg-asset-bg/);
  await expect(head.locator("..")).not.toContainText("(増える側)");
  // 仮勘定でない現金は資産のまま
  const cash = work.getByRole("button", { name: "現金", exact: true }).last().locator("..");
  await expect(cash).toContainText("◆");
  await expect(cash.locator("..")).toContainText("(増える側)");
});
