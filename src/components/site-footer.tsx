"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REPO_URL } from "@/lib/repo";

// 会計IDE(/units/*)は上下の固定バーで画面を使い切るので出さない。
// 出すと低い画面(844×390など)でページが伸び、固定バーが「記帳する」に重なる
export function SiteFooter() {
  if (usePathname().startsWith("/units/")) return null;
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-4xl flex-wrap gap-x-5 gap-y-1 px-4 py-3 text-xs text-muted-foreground">
        <Link href="/about" className="hover:text-foreground">
          このサイトについて
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          プライバシーポリシー
        </Link>
        <a href={`${REPO_URL}/discussions`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
          質問・報告・提案(GitHubアカウントが要ります)
          <span className="sr-only">(GitHub Discussionsを新しいタブで開く)</span>
        </a>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
          GitHub
          <span className="sr-only">(リポジトリを新しいタブで開く)</span>
        </a>
        {/* 条件の説明は/aboutに任せ、ここは種類だけを示す */}
        <p className="basis-full">教材はCC BY-SA 4.0、コードはApache 2.0で公開しています。</p>
      </div>
    </footer>
  );
}
