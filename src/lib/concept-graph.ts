// 概念マップ(/map)の線を、概念のrequires / related / contrastsから組み立てる

// 分野の色トークン(--cat-1 〜)の数。分野がこれを超えたらトークンを足す(色を使い回さない)
export const CATEGORY_COLORS = 6;

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
