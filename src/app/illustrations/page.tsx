import type { Metadata } from "next";
import { SpotIllustration } from "@/components/illustrations/spot-illustration";
import { ILLUSTRATION_NAMES } from "@/lib/illustrations";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/illustrations",
  title: "イラスト一覧",
  description: "単元の物語に添えるスポットイラストの一覧。",
  noindex: true,
});

// 絵柄をそろえるための見本(docs/visual-guidelines.md 6章)。新しい絵は既存の絵とここで並べて確かめる。
// 入口はフッターだけで、検索には出さない
export default function IllustrationsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">イラスト一覧</h1>
        <p className="text-muted-foreground">単元の物語に出てくる店や道具の絵です。どれもコードで描いていて、テーマを切り替えると色が変わります。左が単元の見出しに出る大きさ、右が拡大です。</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ILLUSTRATION_NAMES.map((name) => (
          <li key={name} className="rounded-lg border bg-surface-guide p-4">
            <div className="flex items-end gap-4">
              <SpotIllustration name={name} className="w-[4.75rem] shrink-0" />
              <SpotIllustration name={name} className="w-40 shrink-0" />
            </div>
            <code className="mt-2 block text-xs text-muted-foreground">{name}</code>
          </li>
        ))}
      </ul>
    </article>
  );
}
