import { expect, test } from "@playwright/test";

// 航海の儲けと複式の発見で、ワインを10樽売り切っていたので、胡椒の口だけ閉じるステップ7で
// ワインの口にもうけ5が残ったまま、成功文が「財産がいくら増えたかが1つの数字で見えた」と言っていた
test("胡椒の口を閉じた後、ワインの口は売れ残りを含む途中の残高で、成功文が財産の増加を言い切らない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const entry = async (d: string, da: number, c: string, ca: number) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(String(da));
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(String(ca));
  };
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await page.getByPlaceholder(/金額/).fill("30");
  await page.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await next.click();
  await entry("ジョヴァンニ", 60, "胡椒(アレクサンドリア航海)", 60);
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  await page.getByRole("button", { name: "わかった" }).click({ timeout: 2000 }).catch(() => {});
  await work.getByRole("radio").nth(2).check();
  await entry("ジョヴァンニ", 50, "ワイン(クレタ航海)", 50);
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).toContainText("ワインの航海はまだ終わっていません");
  await entry("胡椒(アレクサンドリア航海)", 30, "元手", 30);
  await page.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status");
  await expect(status).toContainText("できました");
  await expect(status).not.toContainText("財産がいくら増えたか");
  await expect(status).toContainText("売れ残っている");
  // ワインの口は左90・右80で、売れ残った2樽の分を含む途中の残高が左に残る
  const result = page.getByRole("region", { name: "結果" });
  await expect(result).toContainText("残高10(借方)");
  await expect(result).not.toContainText("残高5(貸方)");
});
