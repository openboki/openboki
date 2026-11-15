import { devices, expect, test } from "@playwright/test";

const { defaultBrowserType: _ignored, ...iPhone } = devices["iPhone 13"];
test.use(iPhone);

// Issue #324: 390pxで科目欄が115pxしかなく、減価償却累計額の名前が途中で切れて選んだ科目を確かめられなかった
test("スマホ幅の科目欄で、減価償却累計額の名前が最後まで見える", async ({ page }) => {
  await page.goto("/units/depreciation/straight-line");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).first().click();
  await page.getByRole("tab", { name: "ワークスペース", exact: true }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("減価償却費");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の金額1").fill("100000");

  const account = work.getByLabel("貸方の科目1");
  for (const name of ["車両運搬具減価償却累計額", "備品減価償却累計額"]) {
    await account.fill(name);
    await work.getByLabel("借方の金額1").click();
    const { sw, cw } = await account.evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  }
});
