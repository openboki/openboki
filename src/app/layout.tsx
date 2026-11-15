import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { fontVariables } from "@/themes/fonts";
import { DEFAULT_THEME } from "@/themes";
import { HashHistorySync } from "@/components/hash-history-sync";
import { ThemeBoot } from "@/components/theme-boot";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "Open簿記", locale: "ja_JP", type: "website" },
  title: { template: "%s | Open簿記", default: "Open簿記" },
  description: "Open簿記(オープン簿記)。会計を原理から、手を動かして学ぶ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // サーバーは既定テーマ・ライトで描き、<head> のスクリプトが描画前にlocalStorageの設定で属性を置き換える。
    // その差分は意図したものなのでsuppressHydrationWarning
    <html lang="ja" className={fontVariables} data-theme={DEFAULT_THEME} data-mode="light" suppressHydrationWarning>
      <head>
        <ThemeBoot />
      </head>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased font-sans">
        <HashHistorySync />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-2">
          本文へ移動
        </a>
        <header className="border-b">
          <nav className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2 text-sm sm:gap-5">
            {/* 狭い幅では語が割れるリンクの代わりにブランド名を省略して収める */}
            <Link href="/" className="truncate font-heading font-bold">
              Open簿記
            </Link>
            <Link href="/paths/boki-3" className="whitespace-nowrap text-muted-foreground hover:text-foreground">
              3級合格パス
            </Link>
            <Link href="/glossary" className="whitespace-nowrap text-muted-foreground hover:text-foreground">
              用語集
            </Link>
            {/* 狭い幅ではブランド名が省略されてしまうので出さない。用語集の冒頭からも開ける */}
            <Link href="/map" className="hidden whitespace-nowrap text-muted-foreground hover:text-foreground sm:inline">
              概念マップ
            </Link>
            <span className="flex-1" />
            <ThemeSwitcher />
          </nav>
        </header>
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
