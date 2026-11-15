"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { normalizeSearchText } from "@/lib/accounting";
import type { ConceptLink } from "@/lib/concept-graph";
import { Input } from "@/components/ui/input";
import { GraphCanvas, type GraphNode } from "./graph-canvas";

// 概念マップの画面。左に概念の一覧、中央に図、右に選んだ概念の説明を並べ、ヘッダーの下を全部使う。
// 一覧で探し、図でつながりを見て、説明で読む

export interface MapConcept {
  id: string;
  domain: string;
  name: string;
  aliases: string[];
  reading: string[];
  short: string;
  summary: string;
  example?: string;
  unit?: { id: string; title: string };
  requires: string[];
  related: string[];
  contrasts: string[];
}

interface Props {
  concepts: MapConcept[];
  links: ConceptLink[];
  domains: { id: string; title: string }[];
}

const swatch = (category: number) => ({ background: `var(--cat-${category})` });

export function ConceptMap({ concepts, links, domains }: Props) {
  const byId = useMemo(() => new Map(concepts.map((c) => [c.id, c])), [concepts]);
  const category = useMemo(() => Object.fromEntries(domains.map((d, i) => [d.id, i + 1])), [domains]);
  const nodes = useMemo<GraphNode[]>(() => {
    const degree = new Map<string, number>();
    for (const l of links) for (const id of [l.source, l.target]) degree.set(id, (degree.get(id) ?? 0) + 1);
    return concepts.map((c) => ({ id: c.id, name: c.name, category: category[c.domain], degree: degree.get(c.id) ?? 0 }));
  }, [concepts, links, category]);

  // 起点は最初の分野の最初の概念(簿記)。図で大きく描き、最初から説明を開いておく
  const anchorId = concepts[0].id;
  const [selectedId, setSelectedId] = useState(anchorId);
  const [query, setQuery] = useState("");
  const [graphOpen, setGraphOpen] = useState(true);
  const [graphWidth, setGraphWidth] = useState(55);
  const panes = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  // ?c=<id> で概念を指定して開ける。静的生成のHTMLは起点のままなので、読み込み後に合わせる
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("c");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部(URL)との同期。サーバーではURLの問い合わせ部分を読めない
    if (requested && byId.has(requested)) setSelectedId(requested);
  }, [byId]);

  useEffect(() => {
    sidebar.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const select = (id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `?c=${id}`);
  };

  const q = normalizeSearchText(query);
  const matchedIds = useMemo(
    () => (q ? new Set(concepts.filter((c) => [c.name, ...c.aliases, ...c.reading].some((t) => normalizeSearchText(t).includes(q))).map((c) => c.id)) : null),
    [concepts, q],
  );
  const groups = domains
    .map((d) => ({ ...d, items: concepts.filter((c) => c.domain === d.id && (!matchedIds || matchedIds.has(c.id))) }))
    .filter((g) => g.items.length > 0);

  const resizeTo = (clientX: number) => {
    const rect = panes.current!.getBoundingClientRect();
    setGraphWidth(Math.min(75, Math.max(25, ((clientX - rect.left) / rect.width) * 100)));
  };

  const selected = byId.get(selectedId)!;

  return (
    // 45pxはヘッダーの高さ。ヘッダーの下を画面いっぱいに使い、ページ全体はスクロールさせない(広い画面のとき)
    <div className="lg:flex lg:h-[calc(100dvh-45px)]">
      <nav ref={sidebar} aria-label="概念の一覧" className="max-h-56 space-y-3 overflow-y-auto border-b bg-surface-guide p-3 lg:max-h-none lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">
            概念 <span className="font-normal text-muted-foreground">{concepts.length}</span>
          </h2>
          <button type="button" className="text-xs underline" aria-pressed={!graphOpen} onClick={() => setGraphOpen(!graphOpen)}>
            {graphOpen ? "図を隠す" : "図を表示"}
          </button>
        </div>
        <Input placeholder="概念を検索" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="概念を検索" className="h-8" />
        {groups.map((g) => (
          <section key={g.id}>
            <h3 className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-full" style={swatch(category[g.id])} aria-hidden />
              {g.title}
            </h3>
            <ul>
              {g.items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={c.id === selectedId}
                    onClick={() => select(c.id)}
                    className={cn("w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-accent", c.id === selectedId && "bg-accent font-medium")}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="text-xs text-muted-foreground">該当する概念がありません</p>}
      </nav>

      <div ref={panes} className="min-w-0 flex-1 lg:flex">
        {graphOpen && (
          <>
            <div className="relative h-[55dvh] w-full overflow-hidden border-b bg-surface-work lg:h-auto lg:w-(--graph-width) lg:shrink-0 lg:border-b-0" style={{ "--graph-width": `${graphWidth}%` } as React.CSSProperties}>
              <GraphCanvas nodes={nodes} links={links} selectedId={selectedId} anchorId={anchorId} matchedIds={matchedIds} onSelect={select} />
              {/* 図の中に重ねる。図の幅を変えても説明の欄にはみ出さない */}
              <div className="pointer-events-none absolute bottom-3 left-3 space-y-2 text-xs text-muted-foreground">
                <p className="hidden lg:block">ドラッグで移動 · ホイールで拡大 · 点を押すと説明</p>
                <ul className="flex max-w-xs flex-wrap gap-x-3 gap-y-1" aria-label="分野の色">
                  {domains.map((d) => (
                    <li key={d.id} className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={swatch(category[d.id])} aria-hidden />
                      {d.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="図の幅"
              aria-valuenow={Math.round(graphWidth)}
              aria-valuemin={25}
              aria-valuemax={75}
              tabIndex={0}
              className="relative hidden w-px shrink-0 cursor-col-resize touch-none bg-border after:absolute after:inset-y-0 after:-right-1.5 after:-left-1.5 hover:bg-primary focus-visible:bg-primary focus-visible:outline-none lg:block"
              onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
              onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && resizeTo(e.clientX)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setGraphWidth((w) => Math.max(25, w - 5));
                if (e.key === "ArrowRight") setGraphWidth((w) => Math.min(75, w + 5));
              }}
            />
          </>
        )}
        <article aria-label="概念の説明" className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
          <ConceptDetail concept={selected} concepts={concepts} byId={byId} domainTitle={domains.find((d) => d.id === selected.domain)!.title} onSelect={select} />
        </article>
      </div>
    </div>
  );
}

function ConceptDetail({
  concept,
  concepts,
  byId,
  domainTitle,
  onSelect,
}: {
  concept: MapConcept;
  concepts: MapConcept[];
  byId: Map<string, MapConcept>;
  domainTitle: string;
  onSelect: (id: string) => void;
}) {
  // 関連と対比は片側のYAMLにしか書かれていないことがあるので、相手側からの指定も拾う
  const mutual = (kind: "related" | "contrasts") => [...new Set([...concept[kind], ...concepts.filter((c) => c[kind].includes(concept.id)).map((c) => c.id)])];
  const dependents = concepts.filter((c) => c.requires.includes(concept.id)).map((c) => c.id);
  const listed = new Set([...concept.requires, ...dependents]);
  const contrasts = mutual("contrasts").filter((id) => !listed.has(id));
  // 図の線は1種類なので、関係の種類はここで読む。1つの概念は1か所にだけ並べる
  const groups = [
    { title: "先に学ぶ概念", ids: concept.requires },
    { title: "これを前提にする概念", ids: dependents },
    { title: "比べる概念", ids: contrasts },
    { title: "関連する概念", ids: mutual("related").filter((id) => !listed.has(id) && !contrasts.includes(id)) },
  ].filter((g) => g.ids.length > 0);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">{domainTitle}</p>
        <h2 className="text-2xl font-bold">{concept.name}</h2>
        {concept.aliases.length > 0 && <p className="text-xs text-muted-foreground">別名: {concept.aliases.join("、")}</p>}
      </div>
      <p className="text-lg">{concept.short}</p>
      <hr />
      <p>{concept.summary}</p>
      {concept.example && <p className="text-muted-foreground">例: {concept.example}</p>}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href={`/glossary#${concept.id}`} className="underline">
          用語集で見る
        </Link>
        {concept.unit && (
          <Link href={`/units/${concept.unit.id}`} className="underline">
            詳しく: {concept.unit.title}
          </Link>
        )}
      </div>
      {groups.map((g) => (
        <section key={g.title} className="space-y-1.5">
          <h3 className="text-xs text-muted-foreground">{g.title}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {g.ids.map((id) => (
              <li key={id}>
                <button type="button" className="rounded-full border px-2.5 py-0.5 text-sm hover:bg-accent" onClick={() => onSelect(id)}>
                  {byId.get(id)!.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
