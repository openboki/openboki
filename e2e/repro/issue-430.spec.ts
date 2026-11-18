import { expect, test } from "@playwright/test";

// calcの正解後に金額欄がdisabled(opacity 0.5)になり、答えた数字が薄れていた
test("calcの正解後も答えの金額欄が読める濃さで残る", async ({ page }) => {
  await page.goto("/units/bad-debts/allowance-for-doubtful-accounts");
  await page.evaluate(() => {
    localStorage.setItem("theme", "town-shop");
    localStorage.setItem("mode", "light");
  });
  await page.reload();
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const amount = work.getByPlaceholder(/金額/);
  await amount.fill("4000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" }).first()).toBeVisible();
  // 仕訳エディタと同じく読み取り専用で、薄くしない
  await expect(amount).toHaveValue(/4,?000/);
  await expect(amount).not.toBeDisabled();
  await expect(amount).toHaveJSProperty("readOnly", true);
  await expect(amount).toHaveCSS("opacity", "1");
  // 正解後は打ち替えても値が変わらない
  await amount.press("5");
  await expect(amount).toHaveValue(/4,?000/);
});
