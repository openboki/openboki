import { expect, test } from "@playwright/test";
import { db } from "../../scripts/monkey/session.mjs";

const UNIT = "bookkeeping-basics/five-elements";

// 完了済みの単元で保存stepが範囲外(ステップを減らした改訂の後)でも、開くと完了の案内が出ること
test("完了済みで範囲外のstepでも「この単元は完了しています」が出る", async ({ page, context }) => {
  await page.addInitScript(() => localStorage.setItem("tutorial-state", JSON.stringify({ status: "done", enabled: true })));
  await page.goto(`/units/${UNIT}`);
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() === "POST");
  await page.getByRole("button", { name: "次へ →" }).click();
  await saved;

  const token = (await context.cookies()).filter((c) => c.name.includes("auth-token")).sort((a, b) => (a.name < b.name ? -1 : 1)).map((c) => c.value).join("");
  const userId = JSON.parse(Buffer.from(decodeURIComponent(token).replace(/^base64-/, ""), "base64url").toString()).user.id;
  // 最後まで終えた学習者を模す(10ステップの単元の最後はindex 9)
  db(`update unit_progress set status='completed', step=9 where user_id='${userId}' and unit_id='${UNIT}'`);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByText("この単元は完了しています。")).toBeVisible();

  // 改訂でステップが減った後を模す
  db(`update unit_progress set step=99 where user_id='${userId}' and unit_id='${UNIT}'`);
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("この単元は完了しています。")).toBeVisible();
    await expect(page.getByRole("button", { name: "最後のステップを見る" })).toBeVisible();
  }
  // DBも最後の位置に直っている
  await expect.poll(() => db(`select status, step from unit_progress where user_id='${userId}' and unit_id='${UNIT}'`)).toEqual([["completed", "9"]]);
});
