import { test, expect, type Locator, type Page } from "@playwright/test";

// セルの中身を行ごとに分けて返す(Rangeの行ボックスのtopで文字を振り分ける)
async function cellLines(cells: Locator) {
  return cells.evaluateAll((els) =>
    els.map((el) => {
      const byTop = new Map<number, string>();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
          const r = document.createRange();
          r.setStart(node, i);
          r.setEnd(node, i + 1);
          const rect = r.getClientRects()[0];
          if (!rect) continue;
          const top = Math.round(rect.top);
          byTop.set(top, (byTop.get(top) ?? "") + text[i]);
        }
      }
      return [...byTop.entries()].sort((a, b) => a[0] - b[0]).map(([, s]) => s);
    }),
  );
}

async function openStep(page: Page, step: 3 | 5) {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByPlaceholder(/金額/).fill("70");
  await page.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 7")).toBeVisible();
  if (step === 5) {
    const work = page.getByRole("region", { name: "ワークスペース" });
    await page.getByRole("button", { name: "次へ →" }).click();
    await work.getByRole("button", { name: "わかった" }).click().catch(() => {});
    for (const [item, side] of [
      ["3月9日", "左"],
      ["3月14日", "右"],
      ["3月18日", "右"],
      ["3月20日", "左"],
      ["3月22日", "左"],
    ]) {
      await work.getByRole("button", { name: new RegExp("^" + item) }).click();
      await work.getByRole("button", { name: new RegExp("^" + side) }).click();
    }
    await work.getByRole("button", { name: "確認する" }).click();
    await page.getByRole("button", { name: "次へ →" }).click();
    await expect(page.getByText("ステップ5 / 7")).toBeVisible();
  }
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.locator("table")).toBeVisible();
  return guide;
}

for (const step of [3, 5] as const) {
  test(`ジョヴァンニのページの見出しと摘要が語の途中で折れない(ステップ${step}、1280幅)`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const guide = await openStep(page, step);
    const headers = await cellLines(guide.locator("table th", { hasText: "ドゥカート" }));
    expect(headers.length).toBe(2);
    for (const lines of headers) expect(lines).toEqual(["ドゥカート"]);
    // 3列目の摘要は1行か、空白の位置でだけ折れる
    const notes = await cellLines(guide.locator("table td", { hasText: "受け取った" }));
    expect(notes.length).toBeGreaterThan(0);
    for (const lines of notes) {
      if (lines.length === 1) continue;
      expect(lines.map((l) => l.trim()), `${lines.join("|")}が語の途中で折れている`).toEqual([
        expect.stringMatching(/^\d+月\d+日$/),
        "受け取った",
      ]);
    }
  });
}

test("ジョヴァンニのページの表が狭い画面でもガイドの幅を超えない(390幅)", async ({ page }) => {
  // 狭い画面では金額の入力が別のタブに隠れるので、ステップ3まで進めてから幅を縮める
  await page.setViewportSize({ width: 1280, height: 800 });
  await openStep(page, 3);
  await page.setViewportSize({ width: 390, height: 844 });
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.locator("table")).toBeVisible();
  const overflow = await guide.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
