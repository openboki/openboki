import type { Metadata } from "next";
import Link from "next/link";
import { buildConceptEdges } from "@/lib/concept-graph";
import { conceptList, glossaryMap, sortedDomains } from "@/lib/content";
import { ConceptMap } from "./concept-map";
import { layoutConcepts } from "./elk-layout";

export const metadata: Metadata = { title: "概念マップ" };

export default async function MapPage() {
  const edges = buildConceptEdges(conceptList);
  const positions = await layoutConcepts(
    conceptList.map((c) => c.id),
    edges,
  );
  const concepts = conceptList.map((c) => {
    const entry = glossaryMap.get(c.id)!;
    return {
      id: c.id,
      domain: c.domain,
      position: positions[c.id],
      name: entry.name,
      aliases: entry.aliases,
      reading: entry.reading,
      short: entry.short,
      summary: entry.summary,
      example: entry.example,
      unit: entry.unit,
      requires: c.requires,
      related: c.related,
      contrasts: c.contrasts,
    };
  });
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">概念マップ</h1>
        <p className="text-muted-foreground">
          <Link href="/glossary" className="underline">
            用語集
          </Link>
          の概念{concepts.length}件を、前提・関連・対比の線でつないだ図です。左にある概念ほど先に学びます。概念を押すと説明が出ます。
        </p>
      </div>
      <ConceptMap concepts={concepts} edges={edges} domains={sortedDomains.map((d) => ({ id: d.id, title: d.title }))} />
    </div>
  );
}
