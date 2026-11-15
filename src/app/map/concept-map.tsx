"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  applyNodeChanges,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeChange,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "cn";
import { normalizeSearchText } from "@/lib/accounting";
import { type ConceptEdge, NODE_HEIGHT, NODE_WIDTH, type RelationKind } from "@/lib/concept-graph";
import { Input } from "@/components/ui/input";

// 概念マップの描画と操作(ズーム、ドラッグ、検索、分野の絞り込み、概念の説明)。座標はページが静的生成のときに計算して渡す

export interface MapConcept {
  id: string;
  domain: string;
  position: { x: number; y: number };
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

type ConceptNodeData = { name: string; domainTitle: string; matched: boolean };
type ConceptFlowNode = Node<ConceptNodeData, "concept">;

// 色ではなく線の形で関係を区別する(テーマに分類用の色トークンが無く、5要素の色は要素の意味に限るため)
const EDGE_STYLE: Record<RelationKind, { label: string; note: string; dash?: string; color: string }> = {
  requires: { label: "前提", note: "矢印の元を先に学ぶ", color: "var(--foreground)" },
  contrasts: { label: "対比", note: "比べると違いが分かる", dash: "8 4", color: "var(--muted-foreground)" },
  related: { label: "関連", note: "一緒に出てくる", dash: "1 5", color: "var(--muted-foreground)" },
};

function ConceptNode({ data, selected }: NodeProps<ConceptFlowNode>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border bg-card px-2 text-center text-card-foreground",
        (selected || data.matched) && "border-primary",
        selected && "ring-2 ring-ring",
      )}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} className="opacity-0" />
      <span className="text-sm leading-tight font-medium">{data.name}</span>
      <span className="text-[10px] leading-tight text-muted-foreground">{data.domainTitle}</span>
      <Handle type="source" position={Position.Right} isConnectable={false} className="opacity-0" />
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

// React Flowの既定は英語。ボタンのツールチップと読み上げに出る
const ARIA_LABELS = {
  "node.a11yDescription.default": "EnterかSpaceで概念を選び、Escで解除します。",
  "node.a11yDescription.keyboardDisabled": "EnterかSpaceで概念を選び、矢印キーで動かせます。Escで解除します。",
  "controls.ariaLabel": "図の操作",
  "controls.zoomIn.ariaLabel": "拡大",
  "controls.zoomOut.ariaLabel": "縮小",
  "controls.fitView.ariaLabel": "全体を表示",
};

export function ConceptMap(props: { concepts: MapConcept[]; edges: ConceptEdge[]; domains: { id: string; title: string }[] }) {
  return (
    <ReactFlowProvider>
      <ConceptMapInner {...props} />
    </ReactFlowProvider>
  );
}

function ConceptMapInner({ concepts, edges, domains }: { concepts: MapConcept[]; edges: ConceptEdge[]; domains: { id: string; title: string }[] }) {
  const { setCenter, getNode } = useReactFlow();
  const byId = useMemo(() => new Map(concepts.map((c) => [c.id, c])), [concepts]);
  const domainTitle = useMemo(() => Object.fromEntries(domains.map((d) => [d.id, d.title])), [domains]);

  // ドラッグで動かした位置と計測済みの寸法はReact Flowの変更通知で受け取る
  const [baseNodes, setBaseNodes] = useState<ConceptFlowNode[]>(() =>
    concepts.map((c) => ({
      id: c.id,
      type: "concept",
      position: c.position,
      ariaLabel: c.name,
      data: { name: c.name, domainTitle: "", matched: false },
    })),
  );
  // 全部を収めると文字が読めない倍率になるので、最初は出発点から4段目までを映す。全体は「全体を表示」のボタンで見る
  const [startNodes] = useState(() => {
    const limit = [...new Set(concepts.map((c) => c.position.x))].sort((a, b) => a - b)[3];
    return concepts.filter((c) => c.position.x <= limit).map((c) => ({ id: c.id }));
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hiddenDomains, setHiddenDomains] = useState<ReadonlySet<string>>(new Set());

  const visible = (id: string) => !hiddenDomains.has(byId.get(id)!.domain);
  const q = normalizeSearchText(query);
  const matches = q
    ? concepts.filter((c) => visible(c.id) && [c.name, ...c.aliases, ...c.reading].some((t) => normalizeSearchText(t).includes(q)))
    : [];
  const matchedIds = new Set(matches.map((c) => c.id));

  const selected = selectedId ? byId.get(selectedId) : undefined;
  const neighbors = new Set(selectedId ? edges.filter((e) => e.source === selectedId || e.target === selectedId).flatMap((e) => [e.source, e.target]) : []);
  // 選んだ概念があればその近傍を、無ければ検索に一致した概念を残し、ほかを薄くする
  const dimmed = (id: string) => (selectedId ? id !== selectedId && !neighbors.has(id) : q ? !matchedIds.has(id) : false);

  const nodes = baseNodes.map((n) => ({
    ...n,
    hidden: !visible(n.id),
    selected: n.id === selectedId,
    className: cn("transition-opacity", dimmed(n.id) && "opacity-25"),
    data: { ...n.data, domainTitle: domainTitle[byId.get(n.id)!.domain], matched: matchedIds.has(n.id) },
  }));

  const flowEdges: Edge[] = edges.map((e) => {
    const style = EDGE_STYLE[e.kind];
    // 関連と対比には向きが無い。ハンドルは左が入口、右が出口なので、左にある概念から右へ引くと線が折り返さない
    const flip = e.kind !== "requires" && byId.get(e.source)!.position.x > byId.get(e.target)!.position.x;
    const active = !selectedId || e.source === selectedId || e.target === selectedId;
    return {
      id: e.id,
      source: flip ? e.target : e.source,
      target: flip ? e.source : e.target,
      hidden: !visible(e.source) || !visible(e.target),
      focusable: false,
      selectable: false,
      markerEnd: e.kind === "requires" ? { type: MarkerType.ArrowClosed, color: style.color } : undefined,
      style: { stroke: style.color, strokeDasharray: style.dash, strokeLinecap: "round", opacity: active ? (selectedId ? 1 : 0.55) : 0.08 },
    };
  });

  const onNodesChange = (changes: NodeChange<ConceptFlowNode>[]) => {
    // 選択はselectedIdが正。クリックとキーボード(Enter / Space)の両方がここを通る
    for (const change of changes) {
      if (change.type !== "select") continue;
      if (change.selected) setSelectedId(change.id);
      else setSelectedId((current) => (current === change.id ? null : current));
    }
    setBaseNodes((current) => applyNodeChanges(changes, current));
  };

  const focusConcept = (id: string) => {
    const concept = byId.get(id)!;
    if (hiddenDomains.has(concept.domain)) setHiddenDomains(new Set([...hiddenDomains].filter((d) => d !== concept.domain)));
    setSelectedId(id);
    const position = getNode(id)?.position ?? concept.position;
    setCenter(position.x + NODE_WIDTH / 2, position.y + NODE_HEIGHT / 2, { zoom: 1, duration: 300 });
  };

  const toggleDomain = (id: string) => {
    const next = new Set(hiddenDomains);
    if (!next.delete(id)) next.add(id);
    setHiddenDomains(next);
    if (selected && next.has(selected.domain)) setSelectedId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (matches[0]) focusConcept(matches[0].id);
          }}
        >
          <Input placeholder="概念を検索" value={query} onChange={(e) => setQuery(e.target.value)} className="w-48" aria-label="概念を検索" />
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {q && (matches.length > 0 ? `${matches.length}件。Enterで最初の概念へ移動` : "該当する概念がありません")}
          </span>
        </form>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="表示する分野">
          {domains.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={!hiddenDomains.has(d.id)}
              onClick={() => toggleDomain(d.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                hiddenDomains.has(d.id) ? "text-muted-foreground line-through" : "border-primary bg-secondary text-secondary-foreground",
              )}
            >
              {d.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div
          className="h-[70dvh] min-h-96 overflow-hidden rounded-lg border bg-surface-work"
          style={
            {
              "--xy-background-color": "transparent",
              "--xy-controls-button-background-color": "var(--card)",
              "--xy-controls-button-background-color-hover": "var(--accent)",
              "--xy-controls-button-color": "var(--foreground)",
              "--xy-controls-button-color-hover": "var(--foreground)",
              "--xy-controls-button-border-color": "var(--border)",
              "--xy-attribution-background-color": "transparent",
            } as React.CSSProperties
          }
        >
          <ReactFlow
            nodes={nodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            fitView
            fitViewOptions={{ nodes: startNodes, padding: 0.05 }}
            minZoom={0.15}
            nodesConnectable={false}
            deleteKeyCode={null}
            selectionKeyCode={null}
            multiSelectionKeyCode={null}
            aria-label="概念マップ"
            ariaLabelConfig={ARIA_LABELS}
          >
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <aside className="space-y-3 text-sm" aria-label="概念の説明">
          {selected ? (
            <ConceptDetail concept={selected} concepts={concepts} byId={byId} domainTitle={domainTitle[selected.domain]} onSelect={focusConcept} />
          ) : (
            <p className="text-muted-foreground">概念を押すと、説明と、つながっている概念がここに出ます。ドラッグで動かし、ホイールやピンチで拡大・縮小できます。</p>
          )}
          <dl className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
            {(Object.keys(EDGE_STYLE) as RelationKind[]).map((kind) => (
              <div key={kind} className="flex items-center gap-2">
                <dt className="flex items-center gap-2">
                  <svg width="36" height="8" aria-hidden>
                    <line x1="1" y1="4" x2="35" y2="4" stroke={EDGE_STYLE[kind].color} strokeWidth="1.5" strokeDasharray={EDGE_STYLE[kind].dash} strokeLinecap="round" />
                  </svg>
                  {EDGE_STYLE[kind].label}
                </dt>
                <dd>{EDGE_STYLE[kind].note}</dd>
              </div>
            ))}
          </dl>
        </aside>
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
  const contrasts = mutual("contrasts");
  const dependents = concepts.filter((c) => c.requires.includes(concept.id)).map((c) => c.id);
  // 図の線と同じく、1つの概念は前提 > 対比 > 関連のうち1か所にだけ並べる
  const groups = [
    { title: "先に学ぶ概念", ids: concept.requires },
    { title: "これを前提にする概念", ids: dependents },
    { title: "対比", ids: contrasts.filter((id) => !concept.requires.includes(id) && !dependents.includes(id)) },
    { title: "関連", ids: mutual("related").filter((id) => !contrasts.includes(id) && !concept.requires.includes(id) && !dependents.includes(id)) },
  ].filter((g) => g.ids.length > 0);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">
        {concept.name}
        <span className="ml-2 text-xs font-normal text-muted-foreground">{domainTitle}</span>
      </h2>
      <p>{concept.short}</p>
      <p className="text-muted-foreground">{concept.summary}</p>
      {concept.example && <p className="text-muted-foreground">例: {concept.example}</p>}
      {groups.map((g) => (
        <div key={g.title}>
          <h3 className="text-xs text-muted-foreground">{g.title}</h3>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {g.ids.map((id) => (
              <li key={id}>
                <button type="button" className="underline" onClick={() => onSelect(id)}>
                  {byId.get(id)!.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex flex-wrap gap-3 text-xs">
        <Link href={`/glossary#${concept.id}`} className="underline">
          用語集で見る
        </Link>
        {concept.unit && (
          <Link href={`/units/${concept.unit.id}`} className="underline">
            詳しく: {concept.unit.title}
          </Link>
        )}
      </div>
    </div>
  );
}
