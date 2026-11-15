import { expect, type Page, test } from "@playwright/test";

// 科目欄のエラー文が欄から参照されず、スクリーンリーダーでは金額の誤りしか読まれなかった
async function openStep2(page: Page) {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const later = page.getByRole("button", { name: "今はしない" });
  if (await later.isVisible().catch(() => false)) await later.click();
  await page.getByRole("button", { name: "次へ →" }).click();
  return page.getByRole("region", { name: "ワークスペース" });
}

test("科目に無い語を入れた科目欄は、エラー文をaria-describedbyで指しaria-invalidになる", async ({ page }) => {
  const work = await openStep2(page);
  const account = work.getByLabel("借方の科目1");
  await account.fill("売上債権");
  await page.keyboard.press("Tab");
  await expect(work.getByText("「売上債権」という科目はありません。候補から選んでください")).toBeVisible();
  await expect(account).toHaveAttribute("aria-invalid", "true");
  await expect(account).toHaveAccessibleDescription(/「売上債権」という科目はありません/);

  // 正しい科目に選び直したら誤りの印は外れる
  await account.fill("現金");
  await page.keyboard.press("Tab");
  await expect(account).not.toHaveAttribute("aria-invalid", "true");
  await expect(account).not.toHaveAttribute("aria-describedby");
});

test("読みで入れて候補が無いときと、科目が空で金額だけあるときも科目欄が誤りを指す", async ({ page }) => {
  const work = await openStep2(page);
  const account = work.getByLabel("借方の科目1");
  await account.fill("うりあげさいけん");
  await page.keyboard.press("Tab");
  await expect(account).toHaveAttribute("aria-invalid", "true");
  await expect(account).toHaveAccessibleDescription("候補から選ぶか、漢字の一部を入れてください");

  await account.fill("");
  await work.getByLabel("借方の金額1").fill("100");
  await page.keyboard.press("Tab");
  await expect(account).toHaveAttribute("aria-invalid", "true");
  await expect(account).toHaveAccessibleDescription("科目を選んでください");
});
