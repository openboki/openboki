import { expect, test } from "@playwright/test";

// Issue #428: ?from=にプロトタイプのキーを入れると、Object.prototypeのプロパティが単元名として描画されていた
for (const from of ["__proto__", "constructor", "toString"]) {
  test(`チュートリアルのfrom=${from}で画面が壊れず、戻るリンクを出さない`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(`/units/tutorial/first-entry?tour=1&from=${from}`);
    const tour = page.getByRole("dialog", { name: "チュートリアル" });
    const broken = page.getByRole("heading", { name: "ページを表示できませんでした" });
    // ハイドレーション前に判定しないよう、ツアーかエラー見出しが出るまで待つ
    await expect(tour.or(broken).first()).toBeVisible();
    await expect(broken).toHaveCount(0);
    await tour.getByRole("button", { name: "スキップ" }).click();
    await expect(tour).toHaveCount(0);
    await expect(page.getByRole("link", { name: /へ戻る/ }).filter({ hasNotText: "トップ" })).toHaveCount(0);
    expect(errors.filter((e) => /not valid as a React child|error #31/.test(e))).toEqual([]);
  });
}

test("登録された単元のfromでは戻るリンクを出す", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry?tour=1&from=bookkeeping-basics/five-elements");
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await expect(tour).toBeVisible();
  await tour.getByRole("button", { name: "スキップ" }).click();
  await expect(page.getByRole("link", { name: "「5つの要素と仕訳」へ戻る" })).toHaveAttribute("href", "/units/bookkeeping-basics/five-elements");
});
