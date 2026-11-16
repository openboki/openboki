import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Issue #373: ステップ3の本文が借方・貸方を「左に書くページ」「右に書くページ」とページの名前として定義し、
// ポップオーバー(仕訳の左側・右側)と前の単元(人名勘定の左右の欄の名前)の定義と食い違っていた
test("航海の儲けと複式の発見のステップ3が借方・貸方をページの左側・右側の名前として説明する", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByRole("textbox").or(work.getByRole("spinbutton")).first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  await expect(guide).toContainText("複式簿記");
  await expect(guide).not.toContainText("左に書くページを借方");
  await expect(guide).not.toContainText("右に書くページを貸方");
  // 本文はマッテオの例で、ページの左側が借方、右側が貸方だと示す
  await expect(guide).toContainText("マッテオのページの借方(左)に90");
  await expect(guide).toContainText("胡椒のページの貸方(右)に90");
  // 同じ画面のポップオーバーの定義(仕訳の左側・右側)と同じ向き
  await guide.getByRole("button", { name: "借方", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "借方と貸方" })).toContainText("仕訳の左側(借方)と右側(貸方)");
});

test("ふりかえりも借方・貸方をページの名前にしない", () => {
  const body = readFileSync("content/topics/birth-of-double-entry/venture-profit-and-double-entry.md", "utf8");
  const recap = body.split("## ふりかえり")[1];
  expect(recap).not.toMatch(/どのページの左に書き、どのページの右に書くかを決める言葉/);
  expect(body).not.toMatch(/ページを(借方|貸方)/);
  expect(recap).toMatch(/借方.*貸方/);
});
