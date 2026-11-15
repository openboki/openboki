import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { units } from "#content";
import { sortedPaths, sortedTopics } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// そのページの元になるファイルの最終コミット日。内容が変わったときだけ日付が動くよう、ビルド日は使わない。
// gitの無い環境(履歴を持たないビルド)では日付を出さない
function lastCommitDate(...files: string[]): Date | undefined {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...files], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const glossarySources = ["content/concepts", "content/accounts.yaml"];
  const pages: [path: string, sources: string[]][] = [
    ["/", ["content", "src/app/page.tsx"]],
    ["/about", ["src/app/about"]],
    ["/glossary", glossarySources],
    ["/map", glossarySources],
    ["/privacy", ["src/app/privacy"]],
    // 一覧には単元の題と要約が載るので、単元の変更も一覧の更新に数える
    ...sortedPaths.map((p): [string, string[]] => [`/paths/${p.id}`, [`content/paths/${p.id}.yaml`, ...p.sections.flatMap((s) => s.units.map((id) => `content/topics/${id}.md`))]]),
    ...sortedTopics.map((t): [string, string[]] => [`/topics/${t.id}`, [`content/topics/${t.id}`]]),
    // 非表示テーマ(チュートリアル)の単元もトップページからの入口なので含める
    ...units.map((u): [string, string[]] => [`/units/${u.id}`, [`content/topics/${u.id}.md`]]),
  ];
  return pages.map(([path, sources]) => ({ url: `${SITE_URL}${path}`, lastModified: lastCommitDate(...sources) }));
}
