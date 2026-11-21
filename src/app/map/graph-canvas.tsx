"use client";

import { useEffect, useRef } from "react";
import type ForceGraph from "force-graph";
import { CATEGORY_COLORS, CATEGORY_SHAPES, type ConceptLink } from "@/lib/concept-graph";

// 概念マップの図。force-graph(canvas)で、分野の色と形の点と線を力学モデルで配置する。
// 名前は、ポインタを載せた点、選んだ点とその隣、拡大したときにだけ出す(一覧が常に見える索引なので、図は形とつながりを見せる)

export interface GraphNode {
  id: string;
  name: string;
  // 分野の色トークンの番号(1始まり)
  category: number;
  degree: number;
}

type RenderNode = GraphNode & { x?: number; y?: number };
type RenderLink = { source: RenderNode | string; target: RenderNode | string };

const LABEL_ZOOM = 2.2;
const radius = (n: GraphNode, anchor: boolean) => 4 + Math.min(7, n.degree * 0.45) + (anchor ? 3 : 0);
const endId = (end: RenderNode | string) => (typeof end === "string" ? end : end.id);

/** 分野の形で点の輪郭をなぞる */
function tracePoint(ctx: CanvasRenderingContext2D, category: number, x: number, y: number, r: number) {
  const shape = CATEGORY_SHAPES[category - 1];
  ctx.beginPath();
  if (!shape) {
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    return;
  }
  shape.forEach(([px, py], i) => (i === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x + px * r, y + py * r));
  ctx.closePath();
}

/** #rrggbbに不透明度を付ける。トークンは16進で定義している */
function alpha(hex: string, a: number): string {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? [...v].map((c) => c + c).join("") : v, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

interface Props {
  nodes: GraphNode[];
  links: ConceptLink[];
  selectedId: string;
  anchorId: string;
  // 検索に一致した概念。nullは絞り込みなし
  matchedIds: ReadonlySet<string> | null;
  onSelect: (id: string) => void;
}

export function GraphCanvas({ nodes, links, selectedId, anchorId, matchedIds, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  // 描画関数は毎フレーム呼ばれるので、Reactの再描画を待たずに最新の状態を読めるようrefに置く
  const view = useRef({ selectedId, matchedIds, onSelect, hoverId: null as string | null });
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    view.current = { ...view.current, selectedId, matchedIds, onSelect };
    redraw.current();
  }, [selectedId, matchedIds, onSelect]);

  useEffect(() => {
    const el = container.current!;
    const neighbors = new Map<string, Set<string>>(nodes.map((n) => [n.id, new Set()]));
    for (const l of links) {
      neighbors.get(l.source)!.add(l.target);
      neighbors.get(l.target)!.add(l.source);
    }

    let colors = readColors(el);
    // ポインタを載せている間はその点を、離れたら選んだ点を中心に強調する
    const focusId = () => view.current.hoverId ?? view.current.selectedId;
    const isNear = (id: string) => id === focusId() || neighbors.get(focusId())!.has(id);
    const isFiltered = (id: string) => view.current.matchedIds !== null && !view.current.matchedIds.has(id);

    const paintNode = (n: RenderNode, ctx: CanvasRenderingContext2D, scale: number) => {
      if (n.x === undefined || n.y === undefined) return;
      const selected = n.id === view.current.selectedId;
      const near = isNear(n.id);
      const filtered = isFiltered(n.id);
      const color = colors.categories[n.category - 1];
      const r = radius(n, n.id === anchorId);

      if (!filtered) {
        const glowRadius = r * (selected ? 3.4 : near ? 2.8 : 2.2);
        const glow = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, glowRadius);
        glow.addColorStop(0, alpha(color, selected ? 0.5 : near ? 0.38 : 0.2));
        glow.addColorStop(1, alpha(color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.globalAlpha = filtered ? 0.15 : near ? 1 : 0.75;
      tracePoint(ctx, n.category, n.x, n.y, r);
      ctx.fillStyle = color;
      ctx.fill();
      if (selected || near) {
        // 選んだ点は太い輪、隣は細い輪。色だけに頼らず形でも分かるようにする
        ctx.lineWidth = (selected ? 3 : 1.5) / scale;
        ctx.lineJoin = "round";
        ctx.strokeStyle = colors.foreground;
        ctx.stroke();
      }

      const hovered = n.id === view.current.hoverId;
      if (!filtered && (near || hovered || scale >= LABEL_ZOOM)) {
        labels.push({ n, r, selected, rank: selected ? 0 : hovered ? 1 : near ? 2 : 3 });
      }
      ctx.globalAlpha = 1;
    };

    // ラベルは点をすべて描いた後に、選んだ点 > ポインタの点 > 隣 > その他の順で置く。
    // 縮めた図では点どうしが近く、真下に固定で描くと名前が重なって読めないので、
    // 真下・真上・右・左の順に空いている場所を探し、どこも埋まっていれば出さない(説明ペインに文字で一覧がある)
    let labels: { n: RenderNode; r: number; selected: boolean; rank: number }[] = [];
    const paintLabels = (ctx: CanvasRenderingContext2D, scale: number) => {
      const placed: { x: number; y: number; w: number; h: number }[] = [];
      const size = Math.max(11 / scale, 3.2);
      const gap = 2.5 / scale;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineWidth = 3.5 / scale;
      ctx.lineJoin = "round";
      for (const { n, r, selected } of labels.sort((a, b) => a.rank - b.rank)) {
        const x = n.x!;
        const y = n.y!;
        ctx.font = `${selected ? 700 : 500} ${size}px ${colors.font}`;
        const w = ctx.measureText(n.name).width;
        const spots = [
          { x, y: y + r + gap },
          { x, y: y - r - gap - size },
          { x: x + r + gap + w / 2, y: y - size / 2 },
          { x: x - r - gap - w / 2, y: y - size / 2 },
        ];
        const rect = spots
          .map((p) => ({ x: p.x - w / 2 - gap, y: p.y - gap / 2, w: w + gap * 2, h: size + gap }))
          .find((a) => placed.every((b) => a.x >= b.x + b.w || b.x >= a.x + a.w || a.y >= b.y + b.h || b.y >= a.y + a.h));
        if (!rect) continue;
        placed.push(rect);
        const tx = rect.x + gap + w / 2;
        const ty = rect.y + gap / 2;
        ctx.strokeStyle = alpha(colors.surface, 0.9);
        ctx.strokeText(n.name, tx, ty);
        ctx.fillStyle = colors.foreground;
        ctx.fillText(n.name, tx, ty);
      }
      labels = [];
    };

    const isLinkNear = (l: RenderLink) => endId(l.source) === focusId() || endId(l.target) === focusId();
    const linkColor = (l: RenderLink) => {
      if (isFiltered(endId(l.source)) || isFiltered(endId(l.target))) return alpha(colors.muted, 0.06);
      return isLinkNear(l) ? colors.primary : alpha(colors.muted, 0.35);
    };

    let graph: ForceGraph<RenderNode, RenderLink> | undefined;
    let disposed = false;
    let fitted = false;
    const fit = () => {
      if (fitted || !graph) return;
      fitted = true;
      graph.zoomToFit(0, 40);
      // 初回だけ0にしている。戻さないと、点をドラッグしても周りが付いてこない
      graph.cooldownTicks(60);
    };

    // force-graphはwindowに触るので、ブラウザでだけ読み込む
    import("force-graph").then(({ default: ForceGraphCtor }) => {
      if (disposed) return;
      graph = new ForceGraphCtor<RenderNode, RenderLink>(el)
        .width(el.clientWidth)
        .height(el.clientHeight)
        .backgroundColor("rgba(0,0,0,0)")
        .nodeCanvasObjectMode(() => "replace")
        .nodeCanvasObject(paintNode)
        .onRenderFramePre(() => (labels = []))
        .onRenderFramePost(paintLabels)
        .nodePointerAreaPaint((n, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(n.x ?? 0, n.y ?? 0, radius(n, n.id === anchorId) + 3, 0, 2 * Math.PI);
          ctx.fill();
        })
        .linkColor(linkColor)
        .linkWidth((l) => (isLinkNear(l) ? 2 : 0.7))
        .linkCurvature(0.12)
        // 最初の描画までに配置を終わらせ、点が動くところも倍率が切り替わるところも見せない。
        // d3-forceの既定の減衰では300回でalphaが0.001を下回る
        .warmupTicks(300)
        .cooldownTicks(0)
        .onEngineStop(fit)
        // 選んでも視点は動かさない。読むために押しただけで図が動くと、見ていた場所を見失う
        .onNodeClick((n) => view.current.onSelect(n.id))
        .onNodeHover((n) => {
          el.style.cursor = n ? "pointer" : "";
          view.current.hoverId = n?.id ?? null;
          redraw.current();
        })
        .graphData({ nodes: nodes.map((n) => ({ ...n })), links: links.map((l) => ({ ...l })) });
      // 指で操作する端末では図が画面の幅いっぱいを占めるので、1本指の縦スワイプはページのスクロールに渡す。
      // 図の移動と拡大は2本指で行い、点のドラッグは止める(1本指の操作を図が取るとページを読み進められない)
      if (matchMedia("(pointer: coarse)").matches) {
        graph.enableNodeDrag(false).enablePanInteraction((ev: Event) => !("touches" in ev) || (ev as TouchEvent).touches.length > 1);
        el.querySelector("canvas")!.style.touchAction = "pan-y";
      }
      // 既定のままだと同じ分野の点が固まり、選んだときの名前が重なる
      graph.d3Force("charge")?.strength(-220);
      graph.d3Force("link")?.distance(42);
      // 何も動いていないときforce-graphは描画を止めるので、状態が変わったら描画関数を入れ直して描かせる
      redraw.current = () => graph?.nodeCanvasObject(paintNode).linkColor(linkColor);
      el.dataset.ready = "true";
    });

    const resize = new ResizeObserver(() => graph?.width(el.clientWidth).height(el.clientHeight));
    resize.observe(el);
    // テーマと明るさの切り替えは <html> の属性で伝わる。canvasはCSS変数を自動では追わない
    const theme = new MutationObserver(() => {
      colors = readColors(el);
      redraw.current();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });

    return () => {
      disposed = true;
      resize.disconnect();
      theme.disconnect();
      redraw.current = () => {};
      graph?._destructor();
      delete el.dataset.ready;
    };
  }, [nodes, links, anchorId]);

  return <div ref={container} className="size-full" />;
}

function readColors(el: HTMLElement) {
  const style = getComputedStyle(el);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    surface: token("--surface-work"),
    foreground: token("--foreground"),
    muted: token("--muted-foreground"),
    primary: token("--primary"),
    categories: Array.from({ length: CATEGORY_COLORS }, (_, i) => token(`--cat-${i + 1}`)),
    font: getComputedStyle(document.body).fontFamily,
  };
}
