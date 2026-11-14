import { expect, test } from "@playwright/test";

// Issue #273: 1280px幅のT勘定で、摘要が数文字幅の列に押し込まれて10行以上に折り返された
test.use({ viewport: { width: 1280, height: 800 } });

test("1280pxのT勘定で摘要が数行に収まる", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 15000 });
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("給料");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("普通預金");
  await work.getByLabel("貸方の金額1").fill("97000");
  await work.getByRole("button", { name: "行を追加" }).nth(1).click();
  await work.getByLabel("貸方の科目2").fill("預り金");
  await work.getByLabel("貸方の金額2").fill("3000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();

  await work.getByRole("tab", { name: /総勘定元帳/ }).click();
  const memo = "アルバイトの給料100,000円から所得税3,000円を差し引き、残額97,000円を普通預金から振り込んだ";
  const memos = work.getByRole("tabpanel", { name: /総勘定元帳/ }).getByText(memo);
  await expect(memos.first()).toBeVisible();
  const lines = await memos.evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().height / (parseFloat(getComputedStyle(e).lineHeight) || 16))),
  );
  for (const n of lines) expect(n).toBeLessThanOrEqual(4);
});
