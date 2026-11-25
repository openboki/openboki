import { expect, test } from "@playwright/test";

// Issue #600: 「減価償却とは何か」の誤答の説明が、ステップ7で初めて定義する「帳簿価額」を使っていた
test("累計額を負債に入れたときの説明は、まだ習っていない語を使わない", async ({ page }) => {
  await page.goto("/units/depreciation/what-is-depreciation");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  const retry = page.getByRole("status").filter({ hasText: "もう一歩" });
  const read: string[] = [await guide.innerText()];

  await next.click();
  read.push(await guide.innerText());
  for (const [name, pick] of [["資産", "減る"], ["負債", "変わらない"], ["純資産", "減る"], ["収益", "変わらない"], ["費用", "増える"]])
    await page.getByLabel(`${name}の予想`, { exact: true }).selectOption({ label: pick });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  read.push(await guide.innerText());
  await work.getByPlaceholder("金額(円)").fill("-260000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  read.push(await guide.innerText());
  await next.click();
  read.push(await guide.innerText());

  // ステップ5: 貸方を建物の累計額にした誤答の説明にも「帳簿価額」を使わない
  await work.getByLabel("借方の科目1").fill("減価償却費");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("建物減価償却累計額");
  await work.getByLabel("貸方の金額1").fill("100000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(retry).toBeVisible();
  await expect(retry).toContainText("よくある思い込み");
  await expect(retry).not.toContainText("帳簿価額");

  await work.getByLabel("貸方の科目1").fill("備品減価償却累計額");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  read.push(await guide.innerText());

  // ステップ6までの本文に「帳簿価額」は出ていない
  expect(read.join("\n")).not.toContain("帳簿価額");

  const board = page.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [["accumulated_depreciation_equipment", "liability"], ["depreciation_expense", "expense"], ["equipment", "asset"], ["loans_payable", "liability"]]) {
    await board.locator(`[data-chip="${chip}"]`).click();
    await board.locator(`[data-drop="${box}"] > button`).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(retry).toBeVisible();
  await expect(retry).toContainText("資産のマイナス");
  await expect(retry).not.toContainText("帳簿価額");
});
