import { expect, test } from "@playwright/test";

// Issue #305: sitemap、robots、OG画像が無く、検索エンジンとSNSでの見え方が決まっていなかった

test("sitemap.xmlにトップ・固定ページ・パス・テーマ・単元(チュートリアルを含む)が入る", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  for (const path of ["/", "/about", "/glossary", "/privacy", "/paths/boki-3", "/topics/bookkeeping-basics", "/units/bookkeeping-basics/five-elements", "/units/tutorial/first-entry"]) {
    expect(locs).toContain(path);
  }
  // 非表示テーマの一覧ページは無い
  expect(locs).not.toContain("/topics/tutorial");
});

test("robots.txtは全体を許可し、sitemapを指す", async ({ request }) => {
  const text = await (await request.get("/robots.txt")).text();
  expect(text).toMatch(/User-Agent: \*/i);
  expect(text).toMatch(/Allow: \//);
  expect(text).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
});

test("OG画像が絶対URLで出て、1200×630のPNGを返す", async ({ page, request }) => {
  await page.goto("/about");
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toMatch(/^https?:\/\//);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Open簿記");

  const res = await request.get(new URL(image!).pathname + new URL(image!).search);
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toBe("image/png");
});
