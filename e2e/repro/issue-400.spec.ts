import { expect, test } from "@playwright/test";

// Issue #400: ステップ4の本文が「ここで初めて費用を記録します」、成功文が「3つの費用が損益計算書に現れ」と言うが、
// 損益計算書には記帳前から通信費2,000などの費用があり、通信費は2,000から6,000に増えるだけだった
test("小口現金の報告の本文と成功文が、既にある費用と食い違わない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const guide = page.getByRole("region", { name: "ガイド" });
  const next = page.getByRole("button", { name: "次へ →" });
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
  // 前提: 記帳前から通信費が損益計算書にある
  await expect(page.getByRole("region", { name: "損益計算書" }).getByText("通信費")).toBeVisible();
  await expect(guide.getByText(/ここで初めて費用を記録します/)).toHaveCount(0);

  await work.getByLabel("借方の科目1").fill("通信費");
  await work.getByLabel("借方の金額1").fill("4000");
  await work.getByRole("button", { name: "行を追加" }).first().click();
  await work.getByLabel("借方の科目2").fill("消耗品費");
  await work.getByLabel("借方の金額2").fill("6500");
  await work.getByRole("button", { name: "行を追加" }).first().click();
  await work.getByLabel("借方の科目3").fill("旅費交通費");
  await work.getByLabel("借方の金額3").fill("2000");
  await work.getByLabel("貸方の科目1").fill("小口現金");
  await work.getByLabel("貸方の金額1").fill("12500");
  await work.getByRole("button", { name: "記帳する" }).click();
  // 成功文は、通信費が増えたことに触れ、「現れ」とは言わない
  const status = page.getByRole("status").filter({ hasText: "できました" });
  await expect(status).toContainText("6,000");
  await expect(status).not.toContainText("現れ");
});
