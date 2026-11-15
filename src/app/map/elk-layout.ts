import ELK from "elkjs/lib/elk.bundled.js";
import { type ConceptEdge, NODE_HEIGHT, NODE_WIDTH } from "@/lib/concept-graph";

// 概念マップの座標。elkjsは重いのでクライアントへ送らず、ページの静的生成のときだけ動かす

/** 前提の線だけで段を決める(前提が左、それを使う概念が右。横長の画面に収まりやすい)。関連と対比は段を持たないので配置に使わない */
export async function layoutConcepts(ids: string[], edges: ConceptEdge[]): Promise<Record<string, { x: number; y: number }>> {
  const result = await new ELK().layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.layered.spacing.nodeNodeBetweenLayers": "60",
      "elk.spacing.nodeNode": "14",
      // 既定の配置は線をまっすぐ通すために縦へ2倍近く広がる。線はReact Flowが引き直すので、詰める方を取る
      "elk.layered.nodePlacement.strategy": "SIMPLE",
      "elk.spacing.edgeNode": "4",
      "elk.spacing.edgeEdge": "2",
      "elk.layered.spacing.edgeEdgeBetweenLayers": "2",
    },
    children: ids.map((id) => ({ id, width: NODE_WIDTH, height: NODE_HEIGHT })),
    edges: edges.filter((e) => e.kind === "requires").map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  });
  return Object.fromEntries((result.children ?? []).map((n) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
}
