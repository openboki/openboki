import type { ReactNode } from "react";
import type { IllustrationName } from "@/lib/illustrations";

// 物語の場面のスポットイラスト。描き方の決まり(枠、線、塗りの4色)はdocs/visual-guidelines.md 6章

const TINT = "fill-[color-mix(in_srgb,var(--brand-accent)_28%,var(--card))]";
const THIN = 1.8;

const DRAWINGS: Record<IllustrationName, ReactNode> = {
  cafe: (
    <>
      <path d="M8 104H114" />
      <rect className="fill-card" x="22" y="44" width="76" height="60" />
      <rect className="fill-primary" x="38" y="10" width="44" height="16" rx="4" />
      <path className="stroke-card" strokeWidth={THIN} d="M60 22v-5m0 1c-1-4-6-4-7-2 1 3 5 4 7 2zm0-1c1-3 5-4 7-2-1 3-5 4-7 2z" />
      <path className="fill-brand-accent" d="M24 26H96L104 46H16Z" />
      <path strokeWidth={THIN} d="M35 26 29 46M47 26 43.5 46M60 26V46M73 26 76.5 46M85 26 91 46" />
      <path className="fill-card" d="M16 46q5.5 9 11 0q5.5 9 11 0q5.5 9 11 0q5.5 9 11 0q5.5 9 11 0q5.5 9 11 0q5.5 9 11 0q5.5 9 11 0Z" />
      <rect className={TINT} x="30" y="64" width="24" height="20" rx="2" />
      <path strokeWidth={THIN} d="M42 64V84" />
      <rect className="fill-brand-accent" x="27" y="84" width="30" height="6" rx="2" />
      <rect className="fill-primary" x="64" y="64" width="22" height="40" rx="2" />
      <rect className={TINT} x="68" y="68" width="14" height="14" rx="1.5" />
      <circle className="fill-foreground" cx="68.5" cy="90" r="1.2" />
      <path d="M106 94V76" />
      <path className="fill-primary" d="M106 84c-2-6-9-6-10-3 1 5 7 6 10 3zM106 78c2-6 8-6 9-3-1 4-6 6-9 3z" />
      <path className="fill-brand-accent" d="M100 94h12l-1.500 10h-9z" />
    </>
  ),
  cash: (
    <>
      <rect className="fill-card" x="26" y="58" width="72" height="36" rx="4" />
      <rect className="fill-card" x="20" y="50" width="72" height="36" rx="4" />
      <rect className="fill-card" x="14" y="42" width="72" height="36" rx="4" />
      <rect className="fill-primary" x="60" y="42" width="12" height="36" />
      <circle cx="38" cy="60" r="9" />
      <path strokeWidth={THIN} d="M20 48h6M20 72h6" />
      <path className="fill-brand-accent" d="M74 102v-6a16 5.500 0 0 1 32 0v6a16 5.500 0 0 1-32 0z" />
      <path className="fill-brand-accent" d="M74 96v-6a16 5.500 0 0 1 32 0v6a16 5.500 0 0 1-32 0z" />
      <ellipse className="fill-brand-accent" cx="90" cy="90" rx="16" ry="5.5" />
      <path d="M100 18v14M93 25h14" />
      <path strokeWidth={THIN} d="M24 24v8M20 28h8" />
    </>
  ),
  "coffee-machine": (
    <>
      <rect className="fill-card" x="26" y="10" width="16" height="10" rx="2" />
      <rect className="fill-card" x="46" y="10" width="16" height="10" rx="2" />
      <path className="fill-primary" d="M24 20H94a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H52V92H18V26a6 6 0 0 1 6-6Z" />
      <circle className="fill-card" cx="35" cy="64" r="8" />
      <path strokeWidth={THIN} d="M35 64l4-4" />
      <circle className="fill-brand-accent" cx="70" cy="34" r="4" />
      <circle className="fill-card" cx="84" cy="34" r="4" />
      <rect className="fill-card" x="62" y="48" width="26" height="7" rx="1" />
      <path className="fill-brand-accent" d="M67 55h16l-3 5H70z" />
      <path strokeWidth={4} d="M90 51.500h14" />
      <path strokeWidth={THIN} d="M72 63v3M78 63v3" />
      <path d="M87 73q8 0 7 6-1 4-8 4" />
      <path className="fill-card" d="M62 69H88V78a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8Z" />
      <rect className={TINT} x="54" y="86" width="46" height="6" rx="1" />
      <rect className="fill-card" x="12" y="92" width="96" height="10" rx="3" />
    </>
  ),
  bank: (
    <>
      <path d="M8 106H112" />
      <rect className={TINT} x="26" y="54" width="68" height="36" />
      <rect className="fill-primary" x="55" y="68" width="10" height="22" rx="1" />
      <rect className="fill-card" x="28" y="54" width="10" height="36" />
      <rect className="fill-card" x="42" y="54" width="10" height="36" />
      <rect className="fill-card" x="68" y="54" width="10" height="36" />
      <rect className="fill-card" x="82" y="54" width="10" height="36" />
      <rect className="fill-card" x="22" y="46" width="76" height="8" rx="1" />
      <path className="fill-primary" d="M16 46 60 18l44 28Z" />
      <circle className="fill-brand-accent" cx="60" cy="35" r="6" />
      <rect className="fill-card" x="20" y="90" width="80" height="8" rx="1" />
      <rect className="fill-card" x="14" y="98" width="92" height="8" rx="1" />
    </>
  ),
  "coffee-sale": (
    <>
      <path d="M40 40q-5-7 0-14t0-14M54 42q-5-7 0-14M66 40q-5-7 0-14t0-14" />
      <ellipse className="fill-card" cx="52" cy="98" rx="38" ry="8" />
      <path d="M78 64q17-1 15 12-2 10-18 11" />
      <path className="fill-card" d="M26 58H78V70A26 26 0 0 1 26 70Z" />
      <ellipse className={TINT} cx="52" cy="58" rx="26" ry="6" />
      <path className="fill-primary" d="M52 84c-1-5-8-5-9-2 1 4 6 5 9 2zm0-2c1-5 7-5 8-2-1 4-5 5-8 2z" />
      <circle className="fill-brand-accent" cx="100" cy="94" r="11" />
      <circle strokeWidth={THIN} cx="100" cy="94" r="6.5" />
      <circle className="fill-brand-accent" cx="106" cy="72" r="8" />
      <circle strokeWidth={THIN} cx="106" cy="72" r="4" />
    </>
  ),
  "shop-key": (
    <>
      <path strokeWidth={5.5} d="M54 50 102 98" />
      <path strokeWidth={4} d="M86 82l-8 8M96 92l-8 8" />
      <circle className="fill-brand-accent" cx="40" cy="36" r="20" />
      <circle className="fill-card" cx="36" cy="32" r="7" />
      <path strokeWidth={THIN} d="M33 36q-9 16-3 34" />
      <path className="fill-primary" d="M14 86 30 70 46 86V108H14Z" />
      <rect className="fill-card" x="25" y="92" width="10" height="16" rx="1" />
    </>
  ),
  bakery: (
    <>
      <path d="M8 104H112" />
      <rect className="fill-card" x="22" y="48" width="76" height="56" />
      <path className="fill-card" d="M38 36V30a22 16 0 0 1 44 0V36Z" />
      <path className="fill-card" d="M54.500 27h11l-1.500 6h-8Z" />
      <path className="fill-brand-accent" d="M52 27a8 7 0 0 1 16 0Z" />
      <rect className="fill-primary" x="16" y="36" width="88" height="14" rx="3" />
      <rect className={TINT} x="28" y="58" width="44" height="34" rx="2" />
      <path strokeWidth={THIN} d="M28 85H72" />
      <path className="fill-card" d="M33.500 75h13l-2 10h-9Z" />
      <path className="fill-brand-accent" d="M31 75a9 9 0 0 1 18 0Z" />
      <circle className="fill-foreground" cx="40" cy="65" r="1.5" />
      <path className="fill-card" d="M53.500 75h13l-2 10h-9Z" />
      <path className="fill-brand-accent" d="M51 75a9 9 0 0 1 18 0Z" />
      <circle className="fill-foreground" cx="60" cy="65" r="1.5" />
      <rect className="fill-primary" x="78" y="62" width="16" height="42" rx="2" />
      <rect className={TINT} x="81.500" y="66" width="9" height="11" rx="1.500" />
      <circle className="fill-card" cx="82" cy="87" r="1.5" />
    </>
  ),
};

export function SpotIllustration({ name, className }: { name: IllustrationName; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      data-illustration={name}
      className={`fill-none stroke-foreground ${className ?? ""}`}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {DRAWINGS[name]}
    </svg>
  );
}
