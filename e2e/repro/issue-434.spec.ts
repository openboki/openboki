import { expect, type Locator, test } from "@playwright/test";

// 背景を親の不透明な背景と合成し、文字色とのコントラスト比を返す
async function contrast(locator: Locator) {
  return locator.evaluate((el) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    const parse = (c: string) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = c;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let e = el.parentElement;
    let base: number[] | null = null;
    while (e && !base) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c[3] >= 1) base = c;
      e = e.parentElement;
    }
    base ??= [255, 255, 255, 1];
    const b = parse(getComputedStyle(el).backgroundColor);
    const bg = base.slice(0, 3).map((v, i) => v * (1 - b[3]) + b[i] * b[3]);
    const fg = parse(getComputedStyle(el).color);
    const [l1, l2] = [lum(fg), lum(bg)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

for (const theme of ["town-shop", "ai-shu", "ledger-paper", "workbench"]) {
  for (const mode of ["light", "dark"]) {
    test(`${theme}の${mode}で主ボタンのホバー中も4.5:1以上`, async ({ page }) => {
      await page.goto("/units/bookkeeping-basics/five-elements");
      await page.evaluate(
        ([t, m]) => {
          localStorage.setItem("theme", t);
          localStorage.setItem("mode", m);
        },
        [theme, mode],
      );
      await page.reload();
      const next = page.getByRole("button", { name: "次へ →" });
      await next.hover();
      await page.waitForTimeout(300);
      expect(await contrast(next)).toBeGreaterThanOrEqual(4.5);
    });
  }
}
