import { test, expect, devices, type Locator, type Page } from "@playwright/test";

// Issue #329: 予想欄がビューポート幅のsmで5列に固定され、約430pxの真ん中ペインで「変わらない」が「変わら」に切れていた
const ELEMENTS = ["資産", "負債", "純資産", "収益", "費用"];

async function openPredict(page: Page, mobile: boolean) {
  const showWork = async () => {
    if (mobile) await page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name: "ワークスペース" }).click();
  };
  await page.goto("/units/receivables-and-payables/loans");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 3000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" }).first();
  await next.click();
  await expect(page.getByText(/ステップ2 \//).first()).toBeVisible();
  await showWork();
  await page.getByLabel("借方の科目1").fill("貸付金");
  await page.getByLabel("借方の金額1").fill("100000");
  await page.getByLabel("貸方の科目1").fill("普通預金");
  await page.getByLabel("貸方の金額1").fill("100000");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();
  await expect(page.getByText(/ステップ3 \//).first()).toBeVisible();
  await showWork();
}

/** 閉じたselectの内側の幅と、選んだ選択肢の文字幅 */
function measure(select: Locator) {
  return select.evaluate((e: HTMLSelectElement) => {
    const s = getComputedStyle(e);
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = `${s.fontSize} ${s.fontFamily}`;
    return { box: e.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight), text: ctx.measureText(e.selectedOptions[0].text).width };
  });
}

async function expectAllFit(page: Page) {
  for (const el of ELEMENTS) {
    const select = page.getByLabel(`${el}の予想`, { exact: true });
    await select.selectOption("none");
    const m = await measure(select);
    expect(m.text, el).toBeLessThanOrEqual(m.box);
  }
}

test.describe("1280×800", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test("予想のselectで「変わらない」が切れずに見える", async ({ page }) => {
    await openPredict(page, false);
    await expectAllFit(page);
  });
});

test.describe("スマホ幅", () => {
  const { defaultBrowserType: _omit, ...iPhone } = devices["iPhone 13"];
  test.use({ ...iPhone });
  test("予想のselectで「変わらない」が切れずに見える", async ({ page }) => {
    await openPredict(page, true);
    await expectAllFit(page);
  });
});
