import { expect, test, type Page } from "@playwright/test";

const UNIT = "/units/birth-of-double-entry/memorandum-and-personal-accounts";

// ステップ4(仕分けボード)まで進める
async function goToBoard(page: Page) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto(UNIT);
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ2 / 7")).toBeVisible();
  await work.getByPlaceholder(/^金額\(/).fill("70");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 7")).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ4 / 7")).toBeVisible();
}

// 項目を押してから箱を押して入れる
async function place(page: Page, item: RegExp, box: RegExp) {
  const board = page.getByRole("group", { name: "仕分けボード" });
  await board.getByRole("button", { name: item }).click();
  await board.getByRole("button", { name: box }).click();
}

// Issue #404: 箱の見出し「左(彼がこちらに負う)」「右(こちらが彼に負う)」は負いが増える側の名前なのに、
// 受け取った・払ったのように負いを減らす行の置き場所が課題の前に出てこず、見出しの字面どおりに置くと2件とも間違えた
test("人名勘定の仕分けボードの前に、受け取った・払った行の置き場所が本文と課題文に出る", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await goToBoard(page);

  // 課題文で、受け取り(右)と支払い(左)が並べて説明されている
  await expect(guide.getByText(/受け取ったら彼の負いが減るので右/)).toBeVisible();
  await expect(guide.getByText(/払ったらこちらの負いが減るので左/)).toBeVisible();

  // 見出しの字面どおりに置く: 受け取ったを左、払ったを右
  await place(page, /^3月9日/, /^左\(/);
  await place(page, /^3月20日/, /^左\(/);
  await place(page, /^3月18日/, /^右\(/);
  await place(page, /^3月14日/, /^左\(/);
  await place(page, /^3月22日/, /^右\(/);
  await work.getByRole("button", { name: "確認する" }).click();
  // 結果の箱はワークスペースの外(role=status)に出る
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  // 付く誤解は「見出しの字面に従った」誤りで、「お金の向きで決める」ではない
  await expect(status.getByText(/よくある思い込み: 減らす行を/)).toBeVisible();
  await expect(status.getByText(/お金や物の向きで決める/)).toHaveCount(0);

  // 14日と22日を入れ替えると正解になる
  const board = page.getByRole("group", { name: "仕分けボード" });
  await board.getByRole("button", { name: /^3月14日/ }).click();
  await board.getByRole("button", { name: /^3月22日/ }).click();
  await place(page, /^3月14日/, /^右\(/);
  await place(page, /^3月22日/, /^左\(/);
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true }).first()).toBeVisible();
});

// 課題の前のステップ3でも、支払いが左になる理由が受け取りと並んで出る
test("人ごとにページを分けるの本文で、払った行が左になる理由が受け取りと並ぶ", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  await page.goto(UNIT);
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("region", { name: "ワークスペース" }).getByPlaceholder(/^金額\(/).fill("70");
  await page.getByRole("region", { name: "ワークスペース" }).getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 7")).toBeVisible();
  await expect(guide.getByText(/受け取ったので彼の負いが減って右/)).toBeVisible();
  await expect(guide.getByText(/払ったときはこちらの負いが減って左/)).toBeVisible();
});
