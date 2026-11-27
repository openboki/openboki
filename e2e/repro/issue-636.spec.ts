import { test, expect } from "@playwright/test";
import { THEMES } from "../../src/themes";

// 科目を選んでいない間も、仕分けボードの箱の見出しが全テーマ × 明暗で4.5:1以上で読める
test("仕分けボードの箱の見出しが科目を選ぶ前も4.5:1以上", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const post = async (d: string, c: string, n: number) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(String(n));
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(String(n));
    await work.getByRole("button", { name: "記帳する" }).click();
    await next();
  };
  await next();
  await post("現金", "資本金", 1000000);
  await work.locator("select").first().selectOption("none");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next();
  await post("現金", "借入金", 300000);
  await post("現金", "売上", 80000);
  await post("支払家賃", "現金", 50000);
  const headings = work.getByRole("group", { name: "仕分けボード" }).locator("button.text-xs");
  await expect(headings).toHaveCount(5);

  for (const { id } of THEMES) {
    for (const mode of ["light", "dark"]) {
      await page.evaluate(([t, m]) => {
        document.documentElement.dataset.theme = t;
        document.documentElement.dataset.mode = m;
      }, [id, mode]);
      const ratios = await headings.evaluateAll((els) =>
        els.map((el) => {
          const rgb = (c: string) => {
            const cv = document.createElement("canvas").getContext("2d")!;
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
          let bgEl: Element | null = el;
          while (bgEl && rgb(getComputedStyle(bgEl).backgroundColor)[3] === 0) bgEl = bgEl.parentElement;
          const bg = rgb(getComputedStyle(bgEl!).backgroundColor);
          const fgRaw = rgb(getComputedStyle(el).color);
          let a = fgRaw[3] / 255;
          for (let e: Element | null = el; e; e = e.parentElement) a *= parseFloat(getComputedStyle(e).opacity);
          const fg = [0, 1, 2].map((i) => fgRaw[i] * a + bg[i] * (1 - a));
          const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          return (hi + 0.05) / (lo + 0.05);
        }),
      );
      for (const r of ratios) expect(r, `${id} / ${mode}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
