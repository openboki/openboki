import { expect, test } from "@playwright/test";

// 誤答のフィードバックが出ているとき、「場所を示す」で光らせた仕訳エディタがフィードバック欄に隠れる
test("場所を示すで光らせた仕訳エディタはフィードバック欄に隠れない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("3000");
  await work.getByLabel("貸方の科目1").fill("現金過不足");
  await work.getByLabel("貸方の金額1").fill("3000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await page.getByRole("button", { name: "使い方" }).first().click();
  const help = page.getByRole("dialog", { name: "使い方" });
  const topic = help.locator("div[id]").filter({ has: page.locator("dt", { hasText: /^仕訳帳に書く$/ }) });
  await topic.getByRole("button", { name: /場所を示す/ }).click();
  await expect(help).toBeHidden();
  await expect(page.locator("[data-spotlight='journal']")).toBeVisible();
  // 貸方の金額と「記帳する」が、ペインの外の下のバー(フィードバック欄)に隠れず見えている
  const hits = () =>
    page.evaluate(() =>
      ["[aria-label='貸方の金額1']", "[data-tour='post-button']"].map((s) => {
        const el = document.querySelector(`[data-tour='journal'] ${s}`)!;
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!hit && el.contains(hit);
      }),
    );
  await expect.poll(hits).toEqual([true, true]);
  // 光る枠の中の点(下端近く)が、フィードバック欄(role=status)ではなく仕訳エディタに当たる
  const ringBottomHit = await page.evaluate(() => {
    const ring = document.querySelector("[data-spotlight='journal'] > div")!.getBoundingClientRect();
    const top = document.elementFromPoint(ring.left + ring.width / 2, ring.bottom - 20);
    return !!top?.closest("[data-tour='journal']") && !top.closest("[role=status]");
  });
  expect(ringBottomHit).toBe(true);
});
