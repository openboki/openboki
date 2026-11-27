import { expect, test } from "@playwright/test";

// Issue #639: 「商品以外の後払いと手付金」ステップ3で費用増と予想すると、誤解「購入時に全額費用」の見方が
// 4単元先の固定資産の分野で初めて定義する「費用配分の原則」「減価償却費」で説明されていた
test("椅子の購入を費用と予想したときの説明は、減価償却より前の語だけで読める", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });

  await next.click();
  await work.getByLabel("借方の科目1").fill("未収入金");
  await work.getByLabel("借方の金額1").fill("50000");
  await work.getByLabel("貸方の科目1").fill("備品");
  await work.getByLabel("貸方の金額1").fill("50000");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();

  for (const [name, pick] of [["資産", "増える"], ["負債", "変わらない"], ["純資産", "変わらない"], ["収益", "変わらない"], ["費用", "増える"]])
    await page.getByLabel(`${name}の予想`, { exact: true }).selectOption({ label: pick });
  await page.getByRole("button", { name: "予想して記帳する" }).click();

  const feedback = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText("よくある思い込み: 購入時に全額費用");
  await expect(feedback).not.toContainText("減価償却費");
  await expect(feedback).not.toContainText("費用配分の原則");
});
