import { expect, type Page, test } from "@playwright/test";

// Issue #317: ツアーの途中で記帳してトップへ戻ると「続きから: はじめての記帳」が出るが、押すとツアーがステップ0から始まり直していた

async function journalInTour(page: Page) {
  const dlg = page.getByRole("dialog", { name: "チュートリアル" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/");
  await page.getByRole("link", { name: "チュートリアルを始める" }).click();
  await dlg.getByRole("button", { name: "はじめる" }).click();
  await dlg.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("100000");
  for (let i = 0; i < 3; i++) await dlg.getByRole("button", { name: "次へ" }).click();
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  await expect(dlg.getByText("ここは結果")).toBeVisible();
  await page.waitForLoadState("networkidle");
}

test("ツアーの途中で離れたあと、トップのボタンは「続きから」を約束しない", async ({ page }) => {
  await journalInTour(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const main = page.locator("main");
  await expect(main.getByRole("link", { name: "チュートリアルを始める" })).toBeVisible();
  await expect(main.getByRole("link", { name: /^続きから/ })).toHaveCount(0);
  await expect(main.getByRole("link", { name: /^次の単元へ/ })).toHaveCount(0);
});

test("ツアーをスキップした後は、トップの「続きから」で記帳済みの続きに戻れる", async ({ page }) => {
  await journalInTour(page);
  await page.getByRole("dialog", { name: "チュートリアル" }).getByRole("button", { name: "スキップ" }).click();
  await page.goto("/");
  const link = page.locator("main").getByRole("link", { name: "続きから: はじめての記帳" });
  await expect(link).toBeVisible({ timeout: 10_000 });
  await link.click();
  await expect(page).toHaveURL(/first-entry/);
  // トップの「続きから」は案内を挟まず前回のステップを開く(Issue #375)
  await expect(page.getByText(/^ステップ2 \/ /)).toBeVisible({ timeout: 10_000 });
});
