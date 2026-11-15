import { expect, test } from "@playwright/test";

// 概念マップ(/map、Issue #34)。一覧・図・説明の3つが並び、一覧と説明のつながりから概念をたどれる

const detail = (page: import("@playwright/test").Page) => page.getByRole("article", { name: "概念の説明" });
const index = (page: import("@playwright/test").Page) => page.getByRole("navigation", { name: "概念の一覧" });
const graph = (page: import("@playwright/test").Page) => page.locator("[data-ready] canvas");

test("最初から起点の概念が開いていて、図が描かれる", async ({ page }) => {
  await page.goto("/map");
  await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("簿記");
  await expect(graph(page)).toBeVisible();
  // 広い画面では、図がヘッダーの下から画面の下端までを使う。フッターは出さず、ページ全体はスクロールしない
  const box = (await graph(page).boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y).toBeLessThan(60);
  expect(Math.abs(box.y + box.height - viewport.height)).toBeLessThanOrEqual(1);
  await expect(page.getByRole("contentinfo")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)).toBeLessThanOrEqual(0);

  // 狭い画面では縦に積んでページをスクロールするので、フッターを残す
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("一覧から概念を選ぶと説明が替わり、説明のつながりから別の概念へ移れる", async ({ page }) => {
  await page.goto("/map");
  await index(page).getByRole("button", { name: "5要素", exact: true }).click();
  await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("5要素");
  await expect(detail(page).getByRole("link", { name: "用語集で見る" })).toHaveAttribute("href", "/glossary#five_elements");
  await expect(page).toHaveURL(/\/map\?c=five_elements$/);

  await detail(page).getByRole("button", { name: "資産", exact: true }).click();
  await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("資産");
  await expect(index(page).getByRole("button", { name: "資産", exact: true })).toHaveAttribute("aria-current", "true");

  // URLで概念を指定して開ける
  await page.goto("/map?c=depreciation");
  await expect(detail(page).getByRole("heading", { level: 2 })).toHaveText("減価償却");
});

test("図の点を押すと、その概念の説明が開く", async ({ page }) => {
  await page.goto("/map");
  await expect(graph(page)).toBeVisible();
  // 点の位置は力学モデルが決めるので、図の上を格子状に動かして、ポインタが点に載った(手の形になった)場所を押す
  const box = (await graph(page).boundingBox())!;
  const before = await detail(page).getByRole("heading", { level: 2 }).textContent();
  let clicked = false;
  // 格子は点の直径より細かくする。粗いと、当たるかどうかが配置しだいになる
  for (let y = box.y + box.height * 0.2; y < box.y + box.height * 0.8 && !clicked; y += 8) {
    for (let x = box.x + box.width * 0.1; x < box.x + box.width * 0.9 && !clicked; x += 8) {
      await page.mouse.move(x, y);
      // force-graphは当たり判定を次の描画フレームで行う。待たずに読むと、負荷が高いときに1つ前の位置の結果を見て空振りする
      const cursor = await page
        .locator("[data-ready]")
        .evaluate(
          (el) =>
            new Promise<string>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve((el as HTMLElement).style.cursor))),
            ),
        );
      if (cursor !== "pointer") continue;
      await page.mouse.click(x, y);
      clicked = await expect(detail(page).getByRole("heading", { level: 2 }))
        .not.toHaveText(before!, { timeout: 2000 })
        .then(() => true, () => false);
    }
  }
  expect(clicked).toBe(true);
});

test("検索で一覧が絞られ、読みでも引ける", async ({ page }) => {
  await page.goto("/map");
  await page.getByLabel("概念を検索").fill("げんかしょうきゃく");
  await expect(index(page).getByRole("listitem")).toHaveText(["減価償却"]);
  await page.getByLabel("概念を検索").fill("存在しない語");
  await expect(index(page).getByText("該当する概念がありません")).toBeVisible();
});

test("図を隠すと説明が広がり、戻せる", async ({ page }) => {
  await page.goto("/map");
  await expect(graph(page)).toBeVisible();
  await page.getByRole("button", { name: "図を隠す" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "図を表示" }).click();
  await expect(graph(page)).toBeVisible();

  const separator = page.getByRole("separator", { name: "図の幅" });
  await separator.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(separator).toHaveAttribute("aria-valuenow", "50");
});

test("ヘッダーと用語集から概念マップを開ける", async ({ page }) => {
  await page.goto("/glossary");
  await page.getByRole("navigation").getByRole("link", { name: "概念マップ" }).click();
  await expect(page).toHaveURL(/\/map$/);
  await page.goto("/glossary");
  await page.getByRole("main").getByRole("link", { name: "概念マップ" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "概念マップ" })).toBeAttached();
});
