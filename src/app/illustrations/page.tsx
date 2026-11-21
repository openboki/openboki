import type { Metadata } from "next";
import { SpotIllustration } from "@/components/illustrations/spot-illustration";
import { ILLUSTRATION_LABELS, ILLUSTRATION_NAMES } from "@/lib/illustrations";
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
        <p className="text-muted-foreground">単元の物語に出てくる店や道具の絵です。</p>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ILLUSTRATION_NAMES.map((name) => (
          <li key={name} className="flex flex-col items-center rounded-lg border bg-surface-guide p-2 text-center">
            <SpotIllustration name={name} className="w-full max-w-40" />
            <span className="mt-1 text-sm">{ILLUSTRATION_LABELS[name]}</span>
            <code className="text-xs text-muted-foreground">{name}</code>
          </li>
        ))}
      </ul>
    </article>
  );
}
