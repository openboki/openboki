import type { MetadataRoute } from "next";
import { units } from "#content";
import { sortedPaths, sortedTopics } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/about",
    "/glossary",
    "/privacy",
    ...sortedPaths.map((p) => `/paths/${p.id}`),
    ...sortedTopics.map((t) => `/topics/${t.id}`),
    // 非表示テーマ(チュートリアル)の単元もトップページからの入口なので含める
    ...units.map((u) => `/units/${u.id}`),
  ];
  return pages.map((path) => ({ url: `${SITE_URL}${path}` }));
}
