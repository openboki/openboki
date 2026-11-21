import { expect, test } from "@playwright/test";

// Issue #544: 人名勘定「ジョヴァンニ」「ニッコロ」に読みが無く、表記ゆれの「ジョバンニ」「ニコロ」で候補が0件になり、
// 欄を離れると「漢字の一部を入れてください」と案内されていた
test("人名勘定は表記ゆれでも候補に出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const options = page.getByRole("listbox", { name: "科目の候補" }).getByRole("option");
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  const account = work.getByLabel("貸方の科目1");
  await account.fill("ジョバンニ");
  await expect(options.filter({ hasText: "ジョヴァンニ" })).toHaveCount(1);
  await account.fill("ニコロ");
  await expect(options.filter({ hasText: "ニッコロ" })).toHaveCount(1);
  // 「ニコロ」のまま欄を離れてもニッコロとして確定する
  await account.press("Tab");
  await expect(account).toHaveValue("ニッコロ");
  await expect(work.getByText("候補から選ぶか、漢字の一部を入れてください")).toHaveCount(0);
});
