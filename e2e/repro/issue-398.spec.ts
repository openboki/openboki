import { expect, test } from "@playwright/test";

// Issue #398: ジョヴァンニの貸しを60と答えると、売りと受け取りを全部拾った人にも「9日と20日にも売っています」と出て、誤解の説明も付かなかった
test("ジョヴァンニの残高を60と答えると、誤解の説明が付き、売りの見落としとは決めつけない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("region", { name: "ワークスペース" }).getByPlaceholder("金額(ドゥカート)").fill("60");
  await page.getByRole("button", { name: "確認する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toContainText("よくある思い込み: 人名勘定の左右をお金や物の向きで決める");
  await expect(status).not.toContainText("9日と20日にも売っています");
  // 18日の買いと22日の支払いの扱いに触れる
  await expect(status).toContainText("22日");
});
