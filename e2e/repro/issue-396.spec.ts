import { expect, test } from "@playwright/test";

// Issue #396: 絹の口のもうけを利益と損失へ移すステップで、売れた額130を移す誤答に「売った額がもうけ」の説明が付かず、汎用文だけが出ていた
test("売れた額を利益と損失へ移すと、売った額がもうけの誤解を返す", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const fill = async (d: string, da: string, c: string, ca: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(da);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(ca);
  };
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await fill("絹(フランドル航海)", "100", "ニッコロ", "100");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ5 / 10")).toBeVisible();
  await work.getByPlaceholder(/金額/).fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ6 / 10")).toBeVisible();
  await fill("絹(フランドル航海)", "130", "利益と損失", "130");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText("よくある思い込み: 売った額がもうけ")).toBeVisible();
  await expect(page.getByText("130は売れた額です。絹にかかった100を引いた30が、この口のもうけです。")).toBeVisible();
});
