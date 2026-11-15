import type { Metadata } from "next";
import { buildConceptLinks } from "@/lib/concept-graph";
import { conceptList, glossaryMap, sortedDomains } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
import { ConceptMap } from "./concept-map";

export const metadata: Metadata = pageMetadata({
  path: "/map",
  title: "概念マップ",
  description: "簿記の概念どうしの前提・関連・対比を、図でたどれる概念マップ。",
});

export default function MapPage() {
  // 分野の順(簿記の構造が先頭)に並べる。先頭の概念が起点になる
  const concepts = sortedDomains.flatMap((d) => conceptList.filter((c) => c.domain === d.id)).map((c) => {
    const entry = glossaryMap.get(c.id)!;
    return {
      id: c.id,
      domain: c.domain,
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
    <>
      <h1 className="sr-only">概念マップ</h1>
      <ConceptMap concepts={concepts} links={buildConceptLinks(conceptList)} domains={sortedDomains.map((d) => ({ id: d.id, title: d.title }))} />
    </>
  );
}
