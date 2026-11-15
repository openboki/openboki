// 概念マップ(/map)の辺を、概念のrequires / related / contrastsから組み立てる

// ノードの大きさ。レイアウト計算(ビルド時)と描画(クライアント)で同じ値を使う
export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 44;

export type RelationKind = "requires" | "contrasts" | "related";

export interface ConceptEdge {
  id: string;
  // requiresでは前提になる概念。それ以外では向きに意味は無い
  source: string;
  target: string;
  kind: RelationKind;
}

interface ConceptRelations {
  id: string;
  requires: string[];
  related: string[];
  contrasts: string[];
}

// 同じ2概念を複数の関係が結ぶと線が重なって読めないので、1組に1本だけ残す。
// 前提は配置を決めるので最優先、対比は関連より情報が多いので次にする
const PRIORITY: RelationKind[] = ["requires", "contrasts", "related"];

export function buildConceptEdges(concepts: ConceptRelations[]): ConceptEdge[] {
  const seen = new Set<string>();
  const edges: ConceptEdge[] = [];
  for (const kind of PRIORITY) {
    for (const c of concepts) {
      for (const other of c[kind]) {
        const pair = [c.id, other].sort().join("|");
        if (other === c.id || seen.has(pair)) continue;
        seen.add(pair);
        edges.push(kind === "requires" ? { id: pair, source: other, target: c.id, kind } : { id: pair, source: c.id, target: other, kind });
      }
    }
  }
  return edges;
}
