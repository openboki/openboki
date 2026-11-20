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
      <rect className={TINT} x="28" y="60" width="44" height="32" rx="2" />
      <path strokeWidth={THIN} d="M28 85H72" />
      <path className="fill-card" d="M34 79h8l-1 6h-6Z" />
      <path className="fill-brand-accent" d="M32.5 79a5.500 5.500 0 0 1 11 0Z" />
      <path className="fill-card" d="M46 79h8l-1 6h-6Z" />
      <path className="fill-brand-accent" d="M44.5 79a5.500 5.500 0 0 1 11 0Z" />
      <path className="fill-card" d="M58 79h8l-1 6h-6Z" />
      <path className="fill-brand-accent" d="M56.5 79a5.500 5.500 0 0 1 11 0Z" />
      <rect className="fill-primary" x="78" y="62" width="16" height="42" rx="2" />
      <rect className={TINT} x="81.500" y="66" width="9" height="11" rx="1.500" />
      <circle className="fill-card" cx="82" cy="87" r="1.5" />
    </>
  ),
  shelf: (
    <>
      <rect className="fill-card" x="18" y="14" width="84" height="92" rx="3" />
      <path d="M18 45H102M18 76H102" />
      <rect className="fill-primary" x="27" y="25" width="15" height="20" rx="2" />
      <rect className="fill-brand-accent" x="48" y="29" width="13" height="16" rx="2" />
      <rect className={TINT} x="67" y="23" width="11" height="22" rx="3" />
      <rect className={TINT} x="82" y="23" width="11" height="22" rx="3" />
      <rect className="fill-card" x="27" y="59" width="14" height="17" rx="3" />
      <rect className="fill-brand-accent" x="28.500" y="54" width="11" height="6" rx="1" />
      <rect className="fill-card" x="47" y="59" width="14" height="17" rx="3" />
      <rect className="fill-brand-accent" x="48.500" y="54" width="11" height="6" rx="1" />
      <rect className="fill-primary" x="72" y="56" width="18" height="20" rx="2" />
      <rect className={TINT} x="26" y="87" width="24" height="19" />
      <path strokeWidth={THIN} d="M38 87V95" />
      <rect className="fill-brand-accent" x="58" y="90" width="14" height="16" rx="2" />
      <rect className="fill-card" x="78" y="86" width="14" height="20" rx="2" />
    </>
  ),
  "coffee-beans": (
    <>
      <ellipse className="fill-brand-accent" cx="40" cy="37" rx="8" ry="5.500" />
      <path strokeWidth={THIN} d="M33 37q7-3.500 14 0" />
      <ellipse className="fill-brand-accent" cx="57" cy="37" rx="8" ry="5.500" />
      <path strokeWidth={THIN} d="M50 37q7-3.500 14 0" />
      <ellipse className="fill-brand-accent" cx="74" cy="37" rx="8" ry="5.500" />
      <path strokeWidth={THIN} d="M67 37q7-3.500 14 0" />
      <ellipse className="fill-brand-accent" cx="48.5" cy="28" rx="8" ry="5.500" />
      <path strokeWidth={THIN} d="M41.5 28q7-3.500 14 0" />
      <ellipse className="fill-brand-accent" cx="65.5" cy="28" rx="8" ry="5.500" />
      <path strokeWidth={THIN} d="M58.5 28q7-3.500 14 0" />
      <ellipse className="fill-brand-accent" cx="57" cy="19" rx="8" ry="5.500" />
      <path strokeWidth={THIN} d="M50 19q7-3.500 14 0" />
      <path className="fill-primary" d="M28 46H92L95 100a6 6 0 0 1-6 6H31a6 6 0 0 1-6-6Z" />
      <rect className="fill-card" x="23" y="40" width="74" height="11" rx="4" />
      <circle className="fill-card" cx="60" cy="78" r="15" />
      <ellipse className="fill-brand-accent" cx="60" cy="78" rx="6.500" ry="9.500" />
      <path strokeWidth={THIN} d="M60 69.500q-3.500 8.500 0 17" />
    </>
  ),
  pastry: (
    <>
      <path className="fill-primary" d="M26 60H78L71 106H33Z" />
      <path className="stroke-card" strokeWidth={THIN} d="M39 64l3 38M52 64v38M65 64l-3 38" />
      <path className="fill-brand-accent" d="M20 60a32 32 0 0 1 64 0Z" />
      <circle className="fill-foreground" cx="40" cy="46" r="2" />
      <circle className="fill-foreground" cx="54" cy="38" r="2" />
      <circle className="fill-foreground" cx="64" cy="50" r="2" />
      <circle className="fill-brand-accent" cx="92" cy="89" r="17" />
      <circle className="fill-foreground" cx="86" cy="83" r="2" />
      <circle className="fill-foreground" cx="97" cy="86" r="2" />
      <circle className="fill-foreground" cx="88" cy="95" r="2" />
      <circle className="fill-foreground" cx="99" cy="97" r="2" />
    </>
  ),
  calendar: (
    <>
      <rect className="fill-card" x="18" y="24" width="84" height="82" rx="6" />
      <path className="fill-primary" d="M24 24H96a6 6 0 0 1 6 6V46H18V30a6 6 0 0 1 6-6Z" />
      <path strokeWidth={4} d="M40 15v14M80 15v14" />
      <rect className={TINT} x="27" y="54" width="13" height="11" rx="2" />
      <rect className={TINT} x="44.500" y="54" width="13" height="11" rx="2" />
      <rect className={TINT} x="62" y="54" width="13" height="11" rx="2" />
      <rect className={TINT} x="79.500" y="54" width="13" height="11" rx="2" />
      <rect className={TINT} x="27" y="70" width="13" height="11" rx="2" />
      <rect className={TINT} x="44.500" y="70" width="13" height="11" rx="2" />
      <rect className={TINT} x="62" y="70" width="13" height="11" rx="2" />
      <rect className={TINT} x="79.500" y="70" width="13" height="11" rx="2" />
      <rect className={TINT} x="27" y="86" width="13" height="11" rx="2" />
      <rect className={TINT} x="44.500" y="86" width="13" height="11" rx="2" />
      <rect className={TINT} x="62" y="86" width="13" height="11" rx="2" />
      <rect className="fill-brand-accent" x="79.500" y="86" width="13" height="11" rx="2" />
    </>
  ),
  "office-building": (
    <>
      <path d="M8 104H112" />
      <rect className="fill-card" x="32" y="22" width="56" height="82" />
      <rect className="fill-primary" x="28" y="16" width="64" height="8" rx="2" />
      <rect className={TINT} x="39" y="31" width="42" height="9" />
      <rect className={TINT} x="39" y="45" width="42" height="9" />
      <rect className={TINT} x="39" y="59" width="42" height="9" />
      <rect className={TINT} x="39" y="73" width="42" height="9" />
      <path strokeWidth={THIN} d="M53 31v9M67 31v9M53 45v9M67 45v9M53 59v9M67 59v9M53 73v9M67 73v9" />
      <rect className="fill-primary" x="49" y="90" width="22" height="14" />
      <path className="stroke-card" strokeWidth={THIN} d="M60 90V104" />
      <rect className="fill-brand-accent" x="45" y="86" width="30" height="5" rx="2" />
    </>
  ),
  "delivery-truck": (
    <>
      <rect className="fill-primary" x="10" y="32" width="62" height="52" rx="3" />
      <path className="fill-card" d="M72 46H92L108 64V84H72Z" />
      <path className={TINT} d="M79 53H90L99.500 65H79Z" />
      <circle className="fill-brand-accent" cx="104" cy="75" r="2.5" />
      <circle className="fill-foreground" cx="32" cy="88" r="10" />
      <circle className="fill-brand-accent" cx="32" cy="88" r="4" />
      <circle className="fill-foreground" cx="88" cy="88" r="10" />
      <circle className="fill-brand-accent" cx="88" cy="88" r="4" />
    </>
  ),
  parcel: (
    <>
      <rect className={TINT} x="46" y="18" width="46" height="36" rx="3" />
      <rect className="fill-brand-accent" x="63" y="18" width="12" height="14" />
      <rect className={TINT} x="16" y="52" width="82" height="54" rx="3" />
      <rect className="fill-brand-accent" x="49" y="52" width="16" height="20" />
      <rect className="fill-card" x="24" y="80" width="28" height="18" rx="2" />
      <path strokeWidth={THIN} d="M29 86h18M29 92h11" />
    </>
  ),
  safe: (
    <>
      <rect className="fill-card" x="28" y="92" width="16" height="12" rx="2" />
      <rect className="fill-card" x="76" y="92" width="16" height="12" rx="2" />
      <rect className="fill-primary" x="18" y="14" width="84" height="82" rx="6" />
      <rect className="fill-primary" x="27" y="23" width="66" height="64" rx="3" />
      <circle className="fill-card" cx="52" cy="55" r="13" />
      <circle className="fill-brand-accent" cx="52" cy="55" r="4.500" />
      <path strokeWidth={THIN} d="M52 45v3M52 62v3M42 55h3M59 55h3" />
      <path strokeWidth={5.5} d="M78 44V66" />
    </>
  ),
  "cash-box": (
    <>
      <path strokeWidth={4} d="M38 42V32a5 5 0 0 1 5-5H61a5 5 0 0 1 5 5V42" />
      <rect className="fill-primary" x="12" y="54" width="80" height="46" rx="5" />
      <rect className="fill-card" x="9" y="42" width="86" height="16" rx="4" />
      <circle className="fill-card" cx="52" cy="76" r="8" />
      <circle className="fill-foreground" cx="52" cy="74" r="2" />
      <path strokeWidth={THIN} d="M52 75v5" />
      <circle className="fill-brand-accent" cx="100" cy="94" r="11" />
      <circle strokeWidth={THIN} cx="100" cy="94" r="6.500" />
      <circle className="fill-brand-accent" cx="106" cy="72" r="8" />
      <circle strokeWidth={THIN} cx="106" cy="72" r="4" />
    </>
  ),
  ledger: (
    <>
      <path className="fill-brand-accent" d="M76 90v18l5-4.500 5 4.500V90Z" />
      <rect className="fill-primary" x="10" y="28" width="100" height="70" rx="4" />
      <path className="fill-card" d="M60 36q-22-7-44 0V92q22-7 44 0Z" />
      <path className="fill-card" d="M60 36q22-7 44 0V92q-22-7-44 0Z" />
      <path strokeWidth={THIN} d="M24 50h28M24 60h28M24 70h28M68 50h28M68 60h28" />
      <rect className="fill-brand-accent" x="68" y="67" width="20" height="8" rx="1.500" />
    </>
  ),
  receipt: (
    <>
      <path className="fill-card" d="M32 12H88V100l-7 6-7-6-7 6-7-6-7 6-7-6-7 6-7-6Z" />
      <rect className="fill-primary" x="44" y="21" width="32" height="9" rx="2" />
      <path strokeWidth={THIN} d="M41 42h22M41 52h22M41 62h22M72 42h7M72 52h7M72 62h7" />
      <path d="M41 72H79" />
      <path strokeWidth={THIN} d="M41 84h10" />
      <rect className="fill-brand-accent" x="59" y="79" width="20" height="10" rx="2" />
    </>
  ),
  check: (
    <>
      <rect className="fill-card" x="8" y="24" width="96" height="58" rx="3" />
      <path className="fill-primary" d="M11 24H101a3 3 0 0 1 3 3V37H8V27a3 3 0 0 1 3-3Z" />
      <rect className={TINT} x="48" y="45" width="48" height="13" rx="2" />
      <path strokeWidth={THIN} d="M16 49h22M16 59h22M40 74h34" />
      <path strokeWidth={THIN} d="M44 71q3-7 6 0t6 0t6 0t6 0" />
      <path className="fill-brand-accent" d="M80 76 107 103 101 109 74 82Z" />
      <path className="fill-card" d="M70 72 80 76 74 82Z" />
      <path strokeWidth={THIN} d="M85 81l-6 6" />
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
