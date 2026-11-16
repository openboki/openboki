import { expect, test } from "@playwright/test";

// 「続きから」で再開しても、保存済みの最後の誤答と同じ答えは2回目の誤答に数えない
test("同じ誤答を開き直しの前後に1回ずつ入れても「答えを見る」は出ない(calc)", async ({ browser }) => {
  const context = await browser.newContext();
  let page = await context.newPage();
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).first().click();
  let work = page.getByRole("region", { name: "ワークスペース" });
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/attempts") && r.request().method() === "POST" && r.ok());
  await work.getByPlaceholder(/^金額\(/).fill("999");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await saved;
  await page.waitForLoadState("networkidle");
  await page.close();

  page = await context.newPage();
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "続きから" }).click();
  work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByPlaceholder(/^金額\(/).fill("999");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(page.getByText("さっきと同じ答えです")).toBeVisible();
  await expect(page.getByRole("button", { name: "答えを見る" })).toHaveCount(0);

  // 答えを変えて間違えれば2回目に数える
  await work.getByPlaceholder(/^金額\(/).fill("998");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("button", { name: "答えを見る" })).toBeVisible();
  await context.close();
});

// postの答えはDB(jsonb)を通るとキーの順が変わる。順が違っても同じ答えと判定する
test("同じ誤った仕訳を開き直しの前後に1回ずつ記帳しても「答えを見る」は出ない(post)", async ({ browser }) => {
  const context = await browser.newContext();
  let page = await context.newPage();
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click();
  const next = () => page.getByRole("button", { name: "次へ →" }).first();
  await next().click();
  let work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByPlaceholder(/^金額\(/).fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next().click();
  await next().click();
  const postSwapped = async () => {
    await work.getByLabel("借方の科目1").fill("胡椒(アレクサンドリア航海)");
    await work.getByLabel("借方の金額1").fill("60");
    await work.getByLabel("貸方の科目1").fill("ジョヴァンニ");
    await work.getByLabel("貸方の金額1").fill("60");
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/attempts") && r.request().method() === "POST" && r.ok() && r.request().postData()?.includes("#3") === true);
  await postSwapped();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await saved;
  await page.waitForLoadState("networkidle");
  await page.close();

  page = await context.newPage();
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "続きから" }).click();
  work = page.getByRole("region", { name: "ワークスペース" });
  await postSwapped();
  await expect(page.getByText("さっきと同じ答えです")).toBeVisible();
  await expect(page.getByRole("button", { name: "答えを見る" })).toHaveCount(0);
  await context.close();
});
