import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topics } from "#content";
import { LEVEL_LABELS, unitsOfTopic } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
import { UnitList } from "@/components/unit-list";

export function generateStaticParams() {
  return topics.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = topics.find((t) => t.id === topicId);
  // 非表示のテーマ(チュートリアル)の一覧はどこからもリンクしないので、検索にも出さない
  return topic ? pageMetadata({ path: `/topics/${topic.id}`, title: topic.title, description: topic.summary, noindex: topic.hidden }) : {};
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) notFound();
  const units = unitsOfTopic(topic.id);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <p className="text-muted-foreground">{topic.summary}</p>
        <p className="text-sm text-muted-foreground">入門から順に深くなります。前提となる単元は各単元の冒頭に示します。</p>
      </div>
      <UnitList units={units.map((u) => ({ id: u.id, title: u.title, level: LEVEL_LABELS[u.level], summary: u.summary }))} />
    </div>
  );
}
