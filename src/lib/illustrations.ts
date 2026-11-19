// スポットイラストの名前(docs/visual-guidelines.md 6章)。コンテンツ検査と描画の両方が参照する
export const ILLUSTRATION_NAMES = ["cafe", "cash", "coffee-machine", "bank", "coffee-sale", "shop-key"] as const;
export type IllustrationName = (typeof ILLUSTRATION_NAMES)[number];
