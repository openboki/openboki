import { expect, test } from "@playwright/test";

// Issue #282: 新しいタブで開き、「続きから」を押さずに「次へ →」で正解済みのステップへ進むと、未回答に戻っていた
const UNIT = "/units/birth-of-double-entry/venture-profit-and-double-entry";

test.use({ viewport: { width: 390, height: 844 } });

test("「次へ →」で入った正解済みのステップは正解済みのまま", async ({ page }) => {
  await page.goto(UNIT);
  await page.getByRole("button", { name: "今はしない" }).click();
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await expect(page.getByText("ステップ2 / 9")).toBeVisible();
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByPlaceholder(/金額/).fill("30");
  // 回答の保存で匿名サインインした後、そのユーザーで進捗を残すまで待つ
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/rest/v1/attempts") && r.request().method() === "POST"),
    page.waitForResponse((r) => r.url().includes("/unit_progress") && r.request().method() === "POST"),
    work.getByRole("button", { name: "確認する" }).click(),
  ]);
  await expect(page.getByRole("status")).toContainText("できました");

  // 新しいタブで開いた状態にする
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "続きから" })).toBeVisible();

  await next.click();
  await expect(page.getByText("ステップ2 / 9")).toBeVisible();
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  await expect(page.getByRole("status")).toContainText("できました");
});
