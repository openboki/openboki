// スポットイラストの名前(docs/visual-guidelines.md 6章)。コンテンツ検査と描画の両方が参照する
export const ILLUSTRATION_NAMES = ["cafe", "cash", "coffee-machine", "bank", "coffee-sale", "shop-key", "bakery", "shelf", "coffee-beans", "pastry", "calendar", "office-building", "delivery-truck", "parcel", "safe", "cash-box", "ledger", "receipt", "check", "passbook", "showcase", "chair", "pay-envelope", "suitcase", "shuttered-shop", "calculator"] as const;
export type IllustrationName = (typeof ILLUSTRATION_NAMES)[number];

// イラスト一覧に出す日本語の名前。コンテンツに書くのは英語の名前のまま
export const ILLUSTRATION_LABELS: Record<IllustrationName, string> = {
  cafe: "カフェ",
  cash: "現金",
  "coffee-machine": "コーヒーマシン",
  bank: "銀行",
  "coffee-sale": "コーヒーの売上",
  "shop-key": "店の鍵",
  bakery: "焼き菓子店",
  shelf: "商品棚",
  "coffee-beans": "コーヒー豆",
  pastry: "焼き菓子",
  calendar: "カレンダー",
  "office-building": "オフィスビル",
  "delivery-truck": "配送トラック",
  parcel: "荷物",
  safe: "金庫",
  "cash-box": "手提げ金庫",
  ledger: "帳簿",
  receipt: "領収書",
  check: "小切手",
  passbook: "通帳",
  showcase: "ショーケース",
  chair: "椅子",
  "pay-envelope": "給料袋",
  suitcase: "スーツケース",
  "shuttered-shop": "シャッターの下りた店",
  calculator: "電卓",
};
