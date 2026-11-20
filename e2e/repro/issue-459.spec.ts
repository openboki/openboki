import { devices, expect, test } from "@playwright/test";

// Issue #459: スマホ幅で誤答の説明が出ると下部バーが画面の半分を占め、Tabで移った入力欄がその裏に残ってスクロールされなかった
test.describe("390pxタッチ", () => {
  const { defaultBrowserType: _ignored, ...iPhone } = devices["iPhone 13"];
  test.use(iPhone);

  test("フィードバック表示中にTabで移った入力欄は固定バーの上に見える", async ({ page }) => {
    await page.goto("/units/bad-debts/bad-debt-loss");
    await page.getByRole("button", { name: "次へ →" }).click();
    await page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name: "ワークスペース" }).click();
    const work = page.getByRole("region", { name: "ワークスペース" });
    await work.getByLabel("借方の科目1").fill("売上");
    await work.getByLabel("借方の金額1").fill("30000");
    await work.getByLabel("貸方の科目1").fill("売掛金");
    await work.getByLabel("貸方の金額1").fill("30000");
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByRole("status").filter({ hasText: "もう一歩" })).toBeVisible();

    await work.getByLabel("借方の科目1").focus();
    for (const name of ["借方の金額1", "行を追加", "貸方の科目1", "貸方の金額1"]) {
      await page.keyboard.press("Tab");
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const a = document.activeElement as HTMLElement;
              const r = a.getBoundingClientRect();
              const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              return a.contains(hit);
            }),
          { message: `${name}が固定バーに隠れている` },
        )
        .toBe(true);
    }
  });

  // Portalで出したポップオーバーの中身へのフォーカスでページが飛ばない(レビュー指摘)
  test("フィードバック表示中に「?」を開いてもスクロール位置が変わらない", async ({ page }) => {
    await page.goto("/units/bad-debts/bad-debt-loss");
    await page.getByRole("button", { name: "次へ →" }).click();
    await page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name: "ワークスペース" }).click();
    const work = page.getByRole("region", { name: "ワークスペース" });
    await work.getByLabel("借方の科目1").fill("売上");
    await work.getByLabel("借方の金額1").fill("30000");
    await work.getByLabel("貸方の科目1").fill("売掛金");
    await work.getByLabel("貸方の金額1").fill("30000");
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByRole("status").filter({ hasText: "もう一歩" })).toBeVisible();

    const help = work.getByRole("button", { name: "「仕訳帳に書く」の説明" });
    // 誤答のあとに直そうとして少し下へスクロールした位置から開く
    await page.evaluate(() => window.scrollTo(0, 140));
    const before = await page.evaluate(() => scrollY);
    expect(before).toBeGreaterThan(0);
    await help.dispatchEvent("click");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => scrollY)).toBe(before);
  });
});
