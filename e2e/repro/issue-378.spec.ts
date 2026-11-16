import { expect, test, type Page } from "@playwright/test";

// フォーカス枠と隣の背景のコントラスト比が3:1以上(WCAG 1.4.11)。見た目のテーマ × 明るさの全組み合わせで確かめる

const themes = ["town-shop", "ai-shu", "ledger-paper", "workbench"];
const modes = ["light", "dark"];

async function applyTheme(page: Page, path: string, theme: string, mode: string) {
  await page.goto(path);
  await page.evaluate(
    ([t, m]) => {
      localStorage.setItem("theme", t);
      localStorage.setItem("mode", m);
    },
    [theme, mode],
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

// フォーカス中の要素について、枠の色(outlineまたはbox-shadowの輪)を不透明な祖先の背景に重ね、背景との比を返す
function focusRingContrast(page: Page, source: "outline" | "ring") {
  return page.evaluate((src) => {
    const el = document.activeElement as HTMLElement;
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const parse = (c: string) => {
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = "#000";
      cv.fillStyle = c;
      cv.fillRect(0, 0, 1, 1);
      return [...cv.getImageData(0, 0, 1, 1).data];
    };
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let bg = [255, 255, 255, 255];
    for (let e = el.parentElement; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c[3] > 250) {
        bg = c;
        break;
      }
    }
    let color: string | undefined;
    if (src === "outline") {
      color = getComputedStyle(el).outlineColor;
    } else {
      // box-shadowは複数の層を持つので、広がりがあり透明でない層を輪とみなす
      const layers = getComputedStyle(el).boxShadow.split(/,(?![^(]*\))/);
      color = layers
        .map((l) => l.trim())
        .find((l) => /\s[1-9][\d.]*px\s*$/.test(l) && parse(l.replace(/\s-?[\d.]+px.*$/, ""))[3] > 0)
        ?.replace(/\s-?[\d.]+px.*$/, "");
    }
    if (!color) return 0;
    const rc = parse(color);
    const a = rc[3] / 255;
    const mix = [0, 1, 2].map((k) => rc[k] * a + bg[k] * (1 - a));
    const [l1, l2] = [lum(mix), lum(bg)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, source);
}

for (const theme of themes) {
  for (const mode of modes) {
    test(`${theme} / ${mode}でヘッダーのリンクのフォーカス枠が3:1以上`, async ({ page }) => {
      await applyTheme(page, "/glossary", theme, mode);
      await page.getByRole("link", { name: "3級合格パス" }).focus();
      await page.keyboard.press("Tab");
      expect(await focusRingContrast(page, "outline")).toBeGreaterThanOrEqual(3);
    });

    test(`${theme} / ${mode}で単元の「次へ →」のフォーカスの輪が3:1以上`, async ({ page }) => {
      await applyTheme(page, "/units/depreciation/straight-line", theme, mode);
      const next = page.getByRole("button", { name: "次へ →" });
      await next.focus();
      await expect(next).toBeFocused();
      // ボタンはtransition-allで輪が伸びるので、描き終わるまで待つ
      await expect.poll(() => focusRingContrast(page, "ring")).toBeGreaterThanOrEqual(3);
    });
  }
}
