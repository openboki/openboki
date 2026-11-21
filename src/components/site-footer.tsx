"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, MessagesSquare } from "lucide-react";
import { REPO_URL } from "@/lib/repo";
import { cn } from "@/lib/utils";

// LucideはブランドのアイコンをもたないのでGitHubのマークだけ自前で持つ(docs/design-system.md 3.3)
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const externalLink = "inline-flex items-center gap-1.5 py-1 text-foreground hover:underline underline-offset-4";
// 折り返したときに上下のリンクを押し分けられるよう、リンクの高さを24px(WCAG 2.2 2.5.8)にする
const minorLink = "inline-flex min-h-6 items-center hover:text-foreground";

// 会計IDE(/units/*)は上下の固定バーで画面を使い切るので出さない。
// 出すと低い画面(844×390など)でページが伸び、固定バーが「記帳する」に重なる
// 概念マップ(/map)は広い画面でヘッダーの下を使い切り、ペインの中だけをスクロールさせるので、そのときは出さない
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/units/")) return null;
  return (
    <footer className={cn("border-t", pathname === "/map" && "lg:hidden")}>
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="font-heading font-bold text-foreground">Open簿記</p>
            <p className="text-xs">会計を原理から、手を動かして学ぶ</p>
          </div>
          <ul className="flex flex-col gap-2 sm:flex-row sm:gap-8">
            <li>
              <a href={`${REPO_URL}/discussions`} target="_blank" rel="noopener noreferrer" className={externalLink}>
                <MessagesSquare className="size-4" aria-hidden="true" />
                質問・報告・提案
                <ExternalLink className="size-3 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">(GitHub Discussionsを新しいタブで開く)</span>
              </a>
              <p className="text-xs">GitHubアカウントが要ります</p>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={externalLink}>
                <GitHubMark className="size-4" />
                GitHub
                <ExternalLink className="size-3 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">(リポジトリを新しいタブで開く)</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 border-t pt-3 text-xs">
          <Link href="/about" className={minorLink}>
            このサイトについて
          </Link>
          <Link href="/privacy" className={minorLink}>
            プライバシーポリシー
          </Link>
          <Link href="/illustrations" className={minorLink}>
            イラスト一覧
          </Link>
          {/* 条件の説明は/aboutに任せ、ここは種類だけを示す */}
          <p className="basis-full py-1 sm:ml-auto sm:basis-auto">教材はCC BY-SA 4.0、コードはApache 2.0で公開しています。</p>
        </div>
      </div>
    </footer>
  );
}
