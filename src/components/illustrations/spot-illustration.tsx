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
      <path className="fill-card" d="M29 66h12l-1.500 10h-9Z" />
      <path className="fill-brand-accent" d="M27 66a8 8 0 0 1 16 0Z" />
      <path className="fill-card" d="M49 66h12l-1.500 10h-9Z" />
      <path className="fill-brand-accent" d="M47 66a8 8 0 0 1 16 0Z" />
      <rect className="fill-primary" x="72" y="56" width="18" height="20" rx="2" />
      <rect className={TINT} x="26" y="87" width="24" height="19" />
      <path strokeWidth={THIN} d="M38 87V95" />
      <rect className="fill-brand-accent" x="58" y="90" width="14" height="16" rx="2" />
      <rect className="fill-card" x="78" y="86" width="14" height="20" rx="2" />
    </>
  ),
  "coffee-beans": (
    <>
      <path className="fill-primary" d="M34 34H86L92 106H28Z" />
      <rect className="fill-card" x="32" y="20" width="56" height="14" rx="2" />
      <path strokeWidth={THIN} d="M40 27H80" />
      <circle className="fill-card" cx="60" cy="70" r="17" />
      <ellipse className="fill-brand-accent" cx="60" cy="70" rx="7.500" ry="10.500" />
      <path strokeWidth={THIN} d="M60 60.500q-4 9.500 0 19" />
      <ellipse className="fill-brand-accent" cx="103" cy="92" rx="7" ry="5" />
      <path strokeWidth={THIN} d="M97 92q6-3 12 0" />
      <ellipse className="fill-brand-accent" cx="97" cy="104" rx="7" ry="5" />
      <path strokeWidth={THIN} d="M91 104q6-3 12 0" />
      <ellipse className="fill-brand-accent" cx="17" cy="103" rx="7" ry="5" />
      <path strokeWidth={THIN} d="M11 103q6-3 12 0" />
    </>
  ),
  pastry: (
    <>
      <circle className="fill-brand-accent" cx="97" cy="89" r="12" />
      <circle className="fill-foreground" cx="94" cy="85" r="1.5" />
      <circle className="fill-foreground" cx="101" cy="88" r="1.5" />
      <circle className="fill-foreground" cx="95" cy="94" r="1.5" />
      <path className="fill-card" d="M32 60H80L74 101H38Z" />
      <path strokeWidth={THIN} d="M45 62l2 37M56 62v37M67 62l-2 37" />
      <path className="fill-brand-accent" d="M26 60a30 30 0 0 1 60 0Z" />
      <circle className="fill-foreground" cx="46" cy="46" r="2" />
      <circle className="fill-foreground" cx="60" cy="40" r="2" />
      <circle className="fill-foreground" cx="68" cy="51" r="2" />
      <rect className="fill-primary" x="12" y="101" width="98" height="8" rx="3" />
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
      <rect className="fill-card" x="30" y="20" width="60" height="84" />
      <rect className="fill-primary" x="25" y="12" width="70" height="10" rx="2" />
      <rect className={TINT} x="38" y="30" width="10" height="10" rx="1" />
      <rect className={TINT} x="55" y="30" width="10" height="10" rx="1" />
      <rect className={TINT} x="72" y="30" width="10" height="10" rx="1" />
      <rect className={TINT} x="38" y="46" width="10" height="10" rx="1" />
      <rect className={TINT} x="55" y="46" width="10" height="10" rx="1" />
      <rect className={TINT} x="72" y="46" width="10" height="10" rx="1" />
      <rect className={TINT} x="38" y="62" width="10" height="10" rx="1" />
      <rect className={TINT} x="55" y="62" width="10" height="10" rx="1" />
      <rect className={TINT} x="72" y="62" width="10" height="10" rx="1" />
      <rect className="fill-primary" x="51" y="84" width="18" height="20" rx="1" />
      <path strokeWidth={THIN} d="M60 84V104" />
      <rect className="fill-brand-accent" x="46" y="79" width="28" height="6" rx="2" />
    </>
  ),
  "delivery-truck": (
    <>
      <rect className="fill-primary" x="10" y="32" width="62" height="52" rx="3" />
      <rect className="fill-brand-accent" x="30" y="46" width="22" height="20" rx="2" />
      <path strokeWidth={THIN} d="M41 46V54" />
      <path className="fill-card" d="M72 46H92L108 64V84H72Z" />
      <path className={TINT} d="M79 53H90L99.500 65H79Z" />
      <circle className="fill-brand-accent" cx="104" cy="75" r="2.5" />
      <circle className="fill-foreground" cx="32" cy="88" r="10" />
      <circle className="fill-card" cx="32" cy="88" r="4" />
      <circle className="fill-foreground" cx="88" cy="88" r="10" />
      <circle className="fill-card" cx="88" cy="88" r="4" />
    </>
  ),
  parcel: (
    <>
      <rect className={TINT} x="22" y="46" width="76" height="58" rx="3" />
      <rect className="fill-card" x="30" y="72" width="30" height="22" rx="2" />
      <path strokeWidth={THIN} d="M36 80h18M36 86h11" />
      <rect className="fill-primary" x="68" y="72" width="22" height="22" rx="2" />
      <path className="stroke-card" strokeWidth={THIN} d="M79 89V77M74 82l5-5 5 5" />
      <rect className="fill-brand-accent" x="52" y="46" width="16" height="16" />
      <rect className={TINT} x="16" y="32" width="88" height="16" rx="3" />
      <rect className="fill-brand-accent" x="52" y="32" width="16" height="16" />
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
