import { expect, test } from "@playwright/test";

// Issue #387: 「月割り計算」の定義と誤解「月割りを忘れる」が取得の場面だけを語り、期中に売る場面を含まなかった
test("月割り計算の定義が売却の場面も含む", async ({ page }) => {
  await page.goto("/glossary");
  const entry = page.locator("#monthly_proration");
  await expect(entry).toContainText(/売った/);
  await expect(entry).toContainText("期首から売った月まで");
});

test("期中の売却で1年分を答えたときの誤解の説明が、売った場面も語る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/depreciation/sale-during-period");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel(/4月1日から9月30日までの、マシンの減価償却費/).fill("120000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("よくある思い込み: 月割りを忘れる")).toBeVisible();
  await expect(page.getByText(/期の途中で取得した資産や売った資産でも/)).toBeVisible();
  await expect(page.getByText(/見方: .*売った年は期首から売った月まで/)).toBeVisible();
});
