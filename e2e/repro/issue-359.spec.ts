import { expect, test } from "@playwright/test";

// Issue #359: 通信費と消耗品費の金額を入れ替えただけで「切手代も消耗品費」の誤解が付く
test("小口現金の報告で金額を入れ替えると、切手代の誤解ではなく金額の見直しを案内する", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const add = work.getByRole("button", { name: "行を追加" }).first();
  await page.goto("/units/cash-and-deposits/petty-cash");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByLabel("借方の科目1").fill("小口現金");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("当座預金");
  await work.getByLabel("貸方の金額1").fill("30000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  await add.click();
  await add.click();
  await work.getByLabel("借方の科目1").fill("通信費");
  await work.getByLabel("借方の金額1").fill("6500");
  await work.getByLabel("借方の科目2").fill("消耗品費");
  await work.getByLabel("借方の金額2").fill("4000");
  await work.getByLabel("借方の科目3").fill("旅費交通費");
  await work.getByLabel("借方の金額3").fill("2000");
  await work.getByLabel("貸方の科目1").fill("小口現金");
  await work.getByLabel("貸方の金額1").fill("12500");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("切手代も消耗品費");
  await expect(status).toContainText("科目は合っています");
});
