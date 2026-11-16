import Link from "next/link";
import { units } from "#content";
import { LEVEL_LABELS, nextUnit, sortedDomains, sortedPaths, sortedTopics, unitsOfTopic } from "@/lib/content";
import { HomeStart } from "@/components/home-start";
import type { HomeStartUnit } from "@/lib/home-start";
import { pageMetadata } from "@/lib/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = pageMetadata({ path: "/" });

export default function Home() {
  // キーの順がコンテンツの順になるよう、テーマ順の単元を先に入れる(重複したキーは最初の位置のまま)。非表示テーマ(チュートリアル)は後ろに付く(Issue #360)
  const ordered = [...sortedTopics.flatMap((t) => unitsOfTopic(t.id)), ...units];
  const startUnits: Record<string, HomeStartUnit> = Object.fromEntries(
    ordered.map((u) => [u.id, { title: u.title, kind: u.kind, nextId: nextUnit(u)?.id }]),
  );
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-10">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">会計を原理から、手を動かして学ぶ</h1>
          <p className="text-muted-foreground">
            短い解説を読み、その場で仕訳を切り、5要素と財務諸表がどう動くかを確かめる。暗記ではなく「なぜ」を積み上げる学習サイトです。
          </p>
        </div>
        <HomeStart units={startUnits} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">学習パス</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedPaths.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/paths/${p.id}`} className="hover:underline">
                    {p.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{p.summary}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">テーマから学ぶ</h2>
        {sortedDomains.map((d) => {
          const topicsInDomain = sortedTopics.filter((t) => t.domain === d.id);
          if (topicsInDomain.length === 0) return null;
          return (
            <div key={d.id} className="space-y-2">
              <h3 className="font-medium">{d.title}</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {topicsInDomain.map((t) => {
                  const units = unitsOfTopic(t.id);
                  const levels = [...new Set(units.map((u) => u.level))].map((l) => LEVEL_LABELS[l]).join("・");
                  return (
                    <li key={t.id} className="rounded-md border p-3">
                      <Link href={`/topics/${t.id}`} className="font-medium hover:underline">
                        {t.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{t.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {units.length}単元({levels})
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
