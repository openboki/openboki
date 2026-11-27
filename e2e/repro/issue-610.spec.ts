import { expect, test } from "@playwright/test";

// 「売れ残りと売上原価」ステップ6「商品の3つの科目」で、本文が「繰越商品だけが資産です。残りは費用と収益」と書くのに、
// 仕分けボードには4つ目の科目として売掛金(資産)が並んでいた(Issue #610)
test("仕分けボードに売掛金が並ぶステップの本文は「繰越商品だけが資産」と言わず、売掛金を資産に入れると正解になる", async ({ page }) => {
  await page.goto("/units/merchandise/cost-of-goods-sold");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const ok = page.getByRole("status").filter({ hasText: "できました" });

  // ステップ2: 売上原価
  await next.click();
  await page.getByPlaceholder("金額(円)").fill("125000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(ok).toBeVisible();
  await next.click();

  // ステップ3: 期首の商品を仕入へ
  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("15000");
  await work.getByLabel("貸方の科目1").fill("繰越商品");
  await work.getByLabel("貸方の金額1").fill("15000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(ok).toBeVisible();
  await next.click();

  // ステップ4: 売れ残りの振替を予想
  for (const [k, v] of [["資産", "増える"], ["負債", "変わらない"], ["純資産", "増える"], ["収益", "変わらない"], ["費用", "減る"]]) {
    await page.getByLabel(`${k}の予想`, { exact: true }).selectOption({ label: v });
  }
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();

  // ステップ5: 当期純利益
  await page.getByPlaceholder("金額(円)").fill("70000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(ok).toBeVisible();
  await next.click();

  // ステップ6: ボードに売掛金が並ぶなら、本文は3科目の中だけの話として「繰越商品だけが資産」と言わない
  const board = page.getByRole("group", { name: "仕分けボード" });
  await expect(board.getByRole("button", { name: "売掛金", exact: true })).toBeVisible();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).not.toContainText("繰越商品だけが資産です");
  await expect(guide).toContainText("売掛金");

  // 売掛金を資産、残りを正しい箱に入れると正解になり、successも売掛金に触れる
  for (const [account, box] of [["繰越商品", "資産"], ["仕入", "費用"], ["売上", "収益"], ["売掛金", "資産"]]) {
    await board.getByRole("button", { name: account, exact: true }).click();
    await board.getByRole("button", { name: `${box} ← ここに入れる`, exact: true }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(ok).toBeVisible();
  await expect(ok).toContainText("売掛金(資産)");
});
