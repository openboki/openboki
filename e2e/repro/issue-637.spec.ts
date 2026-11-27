import { test, expect, type Page } from "@playwright/test";

// Issue #637: 誤答の比較表で食い違う行(bg-diff-fg/10)の赤字が、藍と朱・ライトのpostで4.45:1、
// 帳簿用紙・ライトのpredictで4.43:1と4.5:1に届かなかった

async function diffRowRatios(page: Page) {
  return page.getByRole("status").first().locator("tr.font-medium td, tr.font-medium td *").evaluateAll((els) => els
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
    .map((el) => {
      const rgb = (c: string) => { const cv = document.createElement("canvas").getContext("2d")!; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const lum = ([r, g, b]: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const layers: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) { const c = rgb(getComputedStyle(n).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] === 1) break; }
      let bg = [255, 255, 255];
      for (const l of layers.reverse()) bg = [0, 1, 2].map((i) => l[i] * l[3] + bg[i] * (1 - l[3]));
      const fg = rgb(getComputedStyle(el).color);
      const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    }));
}

test("食い違い行の文字が藍と朱・帳簿用紙のライトで4.5:1以上", async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.x) { localStorage.theme = "ai-shu"; localStorage.mode = "light"; sessionStorage.x = "1"; } });
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  const fill = async (d: string, c: string) => {
    await work.getByLabel("借方の科目1").fill(d); await work.getByLabel("借方の金額1").fill("1000000");
    await work.getByLabel("貸方の科目1").fill(c); await work.getByLabel("貸方の金額1").fill("1000000");
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await fill("資本金", "現金");
  await expect(page.getByRole("status").first()).toContainText("もう一歩");
  const post = await diffRowRatios(page);
  expect(post.length).toBeGreaterThan(0);
  for (const r of post) expect(r).toBeGreaterThanOrEqual(4.5);

  await fill("現金", "資本金");
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.evaluate(() => { localStorage.theme = "ledger-paper"; });
  await page.reload();
  // 再訪の案内が出ないこともあるので、出たときだけ押す(triageの所見)
  const resume = page.getByRole("button", { name: "続きから" });
  if (await resume.waitFor({ timeout: 3000 }).then(() => true, () => false)) await resume.click();
  await work.locator("select").first().selectOption("increase");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByRole("status").first()).toContainText("もう一歩");
  const predict = await diffRowRatios(page);
  expect(predict.length).toBeGreaterThan(0);
  for (const r of predict) expect(r).toBeGreaterThanOrEqual(4.5);
});
