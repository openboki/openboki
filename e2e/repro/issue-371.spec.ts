import { expect, test } from "@playwright/test";

// Issue #371: ステップ3の本文が「結果の仕訳帳」と書くが、仕訳帳は結果ペインではなくワークスペースのタブにある
test("航海の儲けと複式の発見のステップ3が仕訳帳を結果ペインにあると書かない", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByRole("textbox").or(work.getByRole("spinbutton")).first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  await expect(guide.getByText("結果の仕訳帳")).toHaveCount(0);
  // 本文が指す「仕訳帳」はワークスペースのタブとして実在する
  await expect(guide.getByText("ワークスペースの仕訳帳")).toBeVisible();
  await expect(work.getByRole("tab", { name: /仕訳帳/ })).toBeVisible();
});
