import { expect, test } from "@playwright/test";

// transitionの途中の枠色を拾わないように、動きを抑えて測る
test.use({ reducedMotion: "reduce" });

// forced-colorsで、選択中のテーマ・明るさ、ステップの点、会社のかたちの帯が見分けられること
test("forced-colorsでも選択中のテーマと会社のかたちが見える", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 3000 }).catch(() => {});
  await page.getByRole("button", { name: "テーマ", exact: true }).click();
  await page.getByRole("group", { name: "テーマ" }).getByRole("button", { name: /藍と朱/ }).click();
  await page.getByRole("group", { name: "明るさ" }).getByRole("button", { name: "ライト" }).click();
  await page.emulateMedia({ forcedColors: "active" });
  // 直前に押したボタンの:hoverとフォーカスの枠で見た目が変わらないように、マウスとフォーカスを外して測る
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));

  // 枠の色・太さ・outlineのどれかで、選択中と他を見分けられる
  const look = (group: string, name: string | RegExp) =>
    page.getByRole("group", { name: group }).getByRole("button", { name }).evaluate((b) => {
      const c = getComputedStyle(b);
      // outline-styleがnoneでもoutline-widthは既定の値を返すので、noneなら幅を数えない
      return [c.borderTopColor, c.borderTopWidth, c.outlineStyle, c.outlineStyle === "none" ? "0px" : c.outlineWidth].join(" ");
    });
  expect(await look("テーマ", /藍と朱/)).not.toBe(await look("テーマ", /帳簿用紙/));
  expect(await look("明るさ", "ライト")).not.toBe(await look("明るさ", "ダーク"));
  await page.keyboard.press("Escape");

  // 背景色だけで描いた印はforced-colorsで消えるので、枠かforced-color-adjust: noneが要る
  const visibleInForced = (el: Element) => {
    const c = getComputedStyle(el);
    return c.forcedColorAdjust === "none" || parseFloat(c.borderTopWidth) > 0 || c.outlineStyle !== "none";
  };
  const current = page.locator("li[aria-current=step]");
  expect(await current.evaluate(visibleInForced)).toBe(true);

  const shape = page.getByRole("region", { name: "会社のかたち" });
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await page.keyboard.press("Escape");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" }).first()).toBeVisible();
  // 透明な背景はforced-colorsでrgba(255, 255, 255, 0)と返るので、アルファ0で除く
  const bars = await shape.evaluate((sec) =>
    [...sec.querySelectorAll("*")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 20 && r.height > 20 && e.children.length === 0 && !/,\s*0\)$/.test(getComputedStyle(e).backgroundColor);
      })
      .map((e) => {
        const c = getComputedStyle(e);
        return c.forcedColorAdjust === "none" || parseFloat(c.borderTopWidth) > 0;
      }),
  );
  expect(bars.length).toBeGreaterThan(0);
  expect(bars.every(Boolean)).toBe(true);
});
