import { expect, test } from "@playwright/test";

// 貸借対照表で科目の無い区分に出る「—」が、全テーマ・明暗で本文の基準4.5:1を満たす

const contrast = () => {
  const el = [...document.querySelectorAll("section[aria-label='貸借対照表'] *")].find(
    (e) => e.childElementCount === 0 && e.textContent?.trim() === "—",
  );
  if (!el) return null;
  const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  c.canvas.width = c.canvas.height = 1;
  const rgb = (v: string) => {
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = v;
    c.fillRect(0, 0, 1, 1);
    return [...c.getImageData(0, 0, 1, 1).data];
  };
  let bgEl: Element | null = el;
  while (bgEl && rgb(getComputedStyle(bgEl).backgroundColor)[3] === 0) bgEl = bgEl.parentElement;
  const bg = rgb(getComputedStyle(bgEl ?? document.body).backgroundColor);
  const fg = rgb(getComputedStyle(el).color);
  const a = fg[3] / 255;
  const f = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  const L = (x: number[]) => {
    const v = x.map((n) => {
      n /= 255;
      return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const l1 = L(f),
    l2 = L(bg.slice(0, 3));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const cases = [
  // 負債の区分が空
  ...["town-shop", "ai-shu", "ledger-paper", "workbench"].flatMap((theme) =>
    ["light", "dark"].map((mode) => ({ path: "/units/depreciation/sale-during-period", theme, mode })),
  ),
  // ステップ1で資産の区分が空
  { path: "/units/bookkeeping-basics/five-elements", theme: "town-shop", mode: "light" },
];

for (const { path, theme, mode } of cases) {
  test(`空の区分の「—」が読める(${path} ${theme} / ${mode})`, async ({ page }) => {
    await page.addInitScript(
      ([t, m]) => {
        localStorage.setItem("theme", t);
        localStorage.setItem("mode", m);
      },
      [theme, mode],
    );
    await page.goto(path);
    await expect(page.locator("section[aria-label='貸借対照表']")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.waitForTimeout(400); // テーマ切替のtransitionを待つ
    const ratio = await page.evaluate(contrast);
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeGreaterThanOrEqual(4.5);
  });
}
