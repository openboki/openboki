import { test, expect, type Page } from "@playwright/test";

// Issue #425: 科目欄に1文字打つと、名前がその文字で始まる科目が先頭で選ばれる
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function openCreditAccount(page: Page) {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const skip = page.getByRole("button", { name: "今はしない" });
  if (await skip.count()) await skip.click();
  await page.getByRole("button", { name: "次へ →" }).first().click();
  await page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name: "ワークスペース" }).click();
  return page.getByRole("region", { name: "ワークスペース" }).getByLabel("貸方の科目1");
}

test("科目欄に「借」と打つと、前方一致の借入金が先頭で選ばれる", async ({ page }) => {
  const input = await openCreditAccount(page);
  await input.pressSequentially("借");
  await expect(page.getByRole("option").first()).toContainText("借入金");
  await input.press("Enter");
  await expect(input).toHaveValue("借入金");
});

test("科目欄に「受」と打つと、受取利息が先頭に出る", async ({ page }) => {
  const input = await openCreditAccount(page);
  await input.pressSequentially("受");
  await expect(page.getByRole("option").first()).toContainText("受取利息");
});
