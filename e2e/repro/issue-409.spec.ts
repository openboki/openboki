import { devices, expect, test } from "@playwright/test";

// Issue #409: 横向き(844×390)で答えると下部の固定バーが50dvh(195px)まで伸び、結果の表を読む高さが150pxしか残らなかった

const { defaultBrowserType: _ignored, ...landscape } = devices["iPhone 13 landscape"];
test.use({ ...landscape, viewport: { width: 844, height: 390 } });

test("横向きで誤答しても、下部の固定バーが画面の半分を占めず、講評はバーの中でスクロールして読める", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/checking-account");
  const notNow = page.getByRole("button", { name: "今はしない" });
  if (await notNow.isVisible().catch(() => false)) await notNow.click();
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click({ timeout: 15000 });
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("普通預金");
  await work.getByLabel("借方の金額1").fill("200000");
  await work.getByLabel("貸方の科目1").fill("当座預金");
  await work.getByLabel("貸方の金額1").fill("200000");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await page.getByRole("tab", { name: "結果" }).click();
  await page.waitForTimeout(400);

  const barHeight = await next.evaluate((e) => {
    let x: HTMLElement | null = e as HTMLElement;
    while (x && !["sticky", "fixed"].includes(getComputedStyle(x).position)) x = x.parentElement;
    return x!.getBoundingClientRect().height;
  });
  expect(barHeight).toBeLessThan(390 * 0.4);
  await expect(next).toBeInViewport();

  // 講評は切り捨てず、バーの中のスクロール領域で末尾まで読める
  const scroll = await status.evaluate((e) => {
    const box = e.parentElement!;
    return { overflow: getComputedStyle(box).overflowY, scrollable: box.scrollHeight > box.clientHeight };
  });
  expect(scroll.overflow).toBe("auto");
  const feedback = status.locator("p.whitespace-pre-wrap");
  await feedback.scrollIntoViewIfNeeded();
  await expect(feedback).toBeInViewport();
  await expect(next).toBeInViewport();
});
