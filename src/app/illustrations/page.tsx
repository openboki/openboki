import type { Metadata } from "next";
import Link from "next/link";
import { topics, units } from "#content";
import { SpotIllustration } from "@/components/illustrations/spot-illustration";
import { illustrationUses } from "@/lib/illustration-usage";
import { ILLUSTRATION_NAMES } from "@/lib/illustrations";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/illustrations",
  title: "イラスト一覧",
  description: "単元の物語に添えるスポットイラストの一覧。",
  noindex: true,
});

// 画面に出る幅。当事者の図、トップのテーマ、単元の見出し、テーマのページの順で、最後は細部を見るための拡大
const SIZES = [
  { px: 48, className: "w-12" },
  { px: 64, className: "w-16" },
  { px: 76, className: "w-[4.75rem]" },
  { px: 96, className: "w-24" },
  { px: 160, className: "w-40" },
];

// 絵柄をそろえるための見本(docs/visual-guidelines.md 6章)。新しい絵は既存の絵とここで並べて確かめる。
// 入口はフッターだけで、検索には出さない
export default function IllustrationsPage() {
  const uses = illustrationUses(topics, units);
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">イラスト一覧</h1>
        <p className="text-muted-foreground">単元の物語に出てくる店や道具の絵です。どれもコードで描いていて、テーマを切り替えると色が変わります。</p>
        <p className="text-sm text-muted-foreground">並べているのは画面に出る大きさです。48pxは取引の相手を示す図、64pxはトップのテーマ、76pxは単元の見出し、96pxはテーマのページで、160pxは拡大です。</p>
      </div>
      <ul className="space-y-3">
        {ILLUSTRATION_NAMES.map((name) => {
          const list = uses.get(name) ?? [];
          return (
            <li key={name} className="rounded-lg border bg-surface-guide p-4">
              <code className="text-xs text-muted-foreground">{name}</code>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                {SIZES.map((size) => (
                  <SpotIllustration key={size.px} name={name} className={`${size.className} shrink-0`} />
                ))}
              </div>
              {list.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {list.map((use) => (
                    <li key={use.href}>
                      <Link href={use.href} className="inline-flex min-h-6 items-center underline underline-offset-4">
                        {use.title}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">{use.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">まだどこにも使っていません。</p>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
