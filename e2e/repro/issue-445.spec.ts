import { type Page, expect, test } from "@playwright/test";

// 小口現金の報告(ステップ4)で、3つの支払いのうち2つを1つの費用に合算して2行で書くと、
// 誤解の説明が無く「使っている科目を見直しましょう」の汎用文だけが出ていた

// [借方の2行, 合算に含めてしまった支払い]
const forms: [[string, string][], string][] = [
  [[["通信費", "4000"], ["消耗品費", "8500"]], "電車代"],
  [[["通信費", "6000"], ["消耗品費", "6500"]], "電車代"],
  [[["通信費", "4000"], ["旅費交通費", "8500"]], "文房具代"],
  [[["通信費", "10500"], ["旅費交通費", "2000"]], "文房具代"],
  [[["消耗品費", "6500"], ["旅費交通費", "6000"]], "切手代"],
];

async function openStep4(page: Page) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/cash-and-deposits/petty-cash");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByLabel("借方の科目1").fill("小口現金");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("当座預金");
  await work.getByLabel("貸方の金額1").fill("30000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 /")).toBeVisible();
  return work;
}

test("2つの支払いを1つの費用に合算すると、どの支払いを含めたかを名指しした誤解の説明が出る", async ({ page }) => {
  const work = await openStep4(page);
  const remove = work.locator("button[aria-label='行を削除']:not([disabled])");
  for (const [[[a1, v1], [a2, v2]], payment] of forms) {
    await test.step(`${a1}${v1} + ${a2}${v2}`, async () => {
      while ((await remove.count()) > 0) await remove.first().click();
      await work.getByLabel("借方の科目1").fill(a1);
      await work.getByLabel("借方の金額1").fill(v1);
      await work.getByRole("button", { name: "行を追加" }).nth(0).click();
      await work.getByLabel("借方の科目2").fill(a2);
      await work.getByLabel("借方の金額2").fill(v2);
      await work.getByLabel("貸方の科目1").fill("小口現金");
      await work.getByLabel("貸方の金額1").fill("12500");
      await work.getByRole("button", { name: "記帳する" }).click();
      const status = page.getByRole("status").filter({ hasText: "もう一歩" });
      await expect(status).toBeVisible();
      await expect(status).toContainText("よくある思い込み");
      await expect(status).toContainText(payment);
      await expect(status).not.toContainText("使っている科目を見直しましょう");
    });
  }
});
