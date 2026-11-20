// 概念マップ(/map)の線を、概念のrequires / related / contrastsから組み立てる

// 分野の色トークン(--cat-1 〜)の数。分野がこれを超えたらトークンを足す(色を使い回さない)
export const CATEGORY_COLORS = 6;

// 分野ごとの点の形(色と同じ並び)。色だけだと色覚の型によって見分けられない組が出る(#439)。
// 半径1の点に対する頂点の座標で、nullは円。見た目の大きさが円とそろうよう多角形は少し大きく取る
const star = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 1.3 : 0.55;
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
});
export const CATEGORY_SHAPES: (readonly (readonly [number, number])[] | null)[] = [
  null,
  [[-0.85, -0.85], [0.85, -0.85], [0.85, 0.85], [-0.85, 0.85]],
  [[0, -1.25], [1.08, 0.62], [-1.08, 0.62]],
  [[0, -1.2], [1.2, 0], [0, 1.2], [-1.2, 0]],
  [[0, 1.25], [1.08, -0.62], [-1.08, -0.62]],
  star,
];

export interface ConceptLink {
  source: string;
  target: string;
}

interface ConceptRelations {
  id: string;
  requires: string[];
  related: string[];
  contrasts: string[];
}

/** 図の線は「つながっている」の1種類だけにする。同じ2概念を複数の関係が結んでいても1本 */
export function buildConceptLinks(concepts: ConceptRelations[]): ConceptLink[] {
  const seen = new Set<string>();
  const links: ConceptLink[] = [];
  for (const c of concepts) {
    for (const other of [...c.requires, ...c.related, ...c.contrasts]) {
      const pair = [c.id, other].sort().join("|");
      if (other === c.id || seen.has(pair)) continue;
      seen.add(pair);
      links.push({ source: c.id, target: other });
    }
  }
  return links;
}
