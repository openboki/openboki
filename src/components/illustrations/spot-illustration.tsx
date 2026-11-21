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
  passbook: (
    <>
      <rect className="fill-card" x="28" y="18" width="62" height="88" rx="5" />
      <rect className="fill-primary" x="22" y="12" width="62" height="88" rx="5" />
      <path className="stroke-card" strokeWidth={THIN} d="M45 44v10M53 44v10M61 44v10M41 56h24" />
      <path className="fill-card" d="M39 42 53 31 67 42Z" />
      <rect className="fill-card" x="33" y="68" width="40" height="18" rx="2" />
      <path strokeWidth={THIN} d="M39 74h28M39 80h16" />
      <circle className="fill-brand-accent" cx="94" cy="92" r="12" />
      <circle strokeWidth={THIN} cx="94" cy="92" r="7" />
    </>
  ),
  showcase: (
    <>
      <rect className="fill-card" x="20" y="100" width="12" height="7" rx="1.500" />
      <rect className="fill-card" x="88" y="100" width="12" height="7" rx="1.500" />
      <rect className={TINT} x="18" y="22" width="84" height="60" />
      <path d="M18 42H102M18 62H102" />
      <path strokeWidth={THIN} d="M27 35l7-7M27 41l13-13" />
      <rect className="fill-primary" x="13" y="14" width="94" height="9" rx="2" />
      <rect className="fill-primary" x="13" y="82" width="94" height="19" rx="3" />
      <rect className="fill-brand-accent" x="22" y="88" width="76" height="6" rx="2" />
    </>
  ),
  chair: (
    <>
      <path strokeWidth={5.5} d="M36 40V106M80 68V106" />
      <path d="M36 88H80" />
      <rect className="fill-primary" x="30" y="14" width="12" height="38" rx="4" />
      <rect className="fill-brand-accent" x="38" y="51" width="46" height="9" rx="3" />
      <rect className="fill-primary" x="30" y="59" width="56" height="10" rx="3" />
    </>
  ),
  "pay-envelope": (
    <>
      <rect className="fill-card" x="34" y="14" width="48" height="34" rx="2" />
      <rect className="fill-primary" x="62" y="14" width="10" height="24" />
      <circle strokeWidth={THIN} cx="47" cy="26" r="5" />
      <rect className={TINT} x="28" y="36" width="60" height="70" rx="3" />
      <rect className="fill-card" x="38" y="56" width="40" height="22" rx="2" />
      <path strokeWidth={THIN} d="M44 63h28M44 71h16" />
      <circle className="fill-brand-accent" cx="94" cy="95" r="11" />
      <circle strokeWidth={THIN} cx="94" cy="95" r="6.500" />
    </>
  ),
  suitcase: (
    <>
      <path strokeWidth={4} d="M46 34V24a5 5 0 0 1 5-5H69a5 5 0 0 1 5 5V34" />
      <rect className="fill-card" x="24" y="98" width="12" height="8" rx="2" />
      <rect className="fill-card" x="84" y="98" width="12" height="8" rx="2" />
      <rect className="fill-primary" x="14" y="34" width="92" height="66" rx="9" />
      <rect className="fill-brand-accent" x="31" y="34" width="9" height="66" />
      <rect className="fill-brand-accent" x="80" y="34" width="9" height="66" />
      <rect className="fill-card" x="29" y="58" width="13" height="10" rx="2" />
      <rect className="fill-card" x="78" y="58" width="13" height="10" rx="2" />
    </>
  ),
  "shuttered-shop": (
    <>
      <path d="M8 104H112" />
      <rect className="fill-card" x="22" y="32" width="76" height="72" />
      <rect className="fill-primary" x="16" y="16" width="88" height="18" rx="3" />
      <circle className="fill-brand-accent" cx="60" cy="25" r="4.5" />
      <rect className={TINT} x="32" y="50" width="56" height="54" />
      <path strokeWidth={THIN} d="M32 60H88M32 70H88M32 80H88M32 90H88" />
      <rect className="fill-card" x="28" y="43" width="64" height="8" rx="2" />
      <rect className="fill-card" x="49" y="58" width="22" height="19" rx="1.5" />
      <path strokeWidth={THIN} d="M54 65h12M54 71h7" />
      <rect className="fill-brand-accent" x="30" y="97" width="60" height="7" rx="2" />
    </>
  ),
  calculator: (
    <>
      <rect className="fill-primary" x="26" y="10" width="68" height="98" rx="7" />
      <rect className="fill-card" x="35" y="20" width="50" height="19" rx="3" />
      <path strokeWidth={THIN} d="M64 32h14" />
      <rect className="fill-card" x="35" y="48" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="48.5" y="48" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="62" y="48" width="9.5" height="9.5" rx="2" />
      <rect className="fill-brand-accent" x="75.5" y="48" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="35" y="61.5" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="48.5" y="61.5" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="62" y="61.5" width="9.5" height="9.5" rx="2" />
      <rect className="fill-brand-accent" x="75.5" y="61.5" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="35" y="75" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="48.5" y="75" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="62" y="75" width="9.5" height="9.5" rx="2" />
      <rect className="fill-brand-accent" x="75.5" y="75" width="9.5" height="23" rx="2" />
      <rect className="fill-card" x="35" y="88.5" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="48.5" y="88.5" width="9.5" height="9.5" rx="2" />
      <rect className="fill-card" x="62" y="88.5" width="9.5" height="9.5" rx="2" />
    </>
  ),
  "light-bulb": (
    <>
      <path d="M60 4v6M26 14l4.500 4.500M94 14l-4.500 4.500M12 44h6M102 44h6" />
      <path className={TINT} d="M48 82V74Q48 71 43.5 67A28 28 0 1 1 76.5 67Q72 71 72 74V82Z" />
      <path strokeWidth={THIN} d="M55 82V56M65 82V56" />
      <circle className="fill-brand-accent" cx="60" cy="46" r="10" />
      <rect className="fill-primary" x="46" y="82" width="28" height="18" rx="3" />
      <path className="stroke-card" strokeWidth={THIN} d="M51 88H69M51 94H69" />
      <rect className="fill-foreground" x="54" y="100" width="12" height="7" rx="2" />
    </>
  ),
  van: (
    <>
      <path className="fill-primary" d="M16 34H86L106 58V84H12V38a4 4 0 0 1 4-4Z" />
      <rect className={TINT} x="20" y="42" width="24" height="15" rx="2" />
      <rect className={TINT} x="50" y="42" width="22" height="15" rx="2" />
      <path className={TINT} d="M78 42H85L96.500 57H78Z" />
      <path className="stroke-card" strokeWidth={THIN} d="M47 62V80M75 62V80" />
      <circle className="fill-brand-accent" cx="102" cy="68" r="2.5" />
      <circle className="fill-foreground" cx="32" cy="88" r="10" />
      <circle className="fill-brand-accent" cx="32" cy="88" r="4" />
      <circle className="fill-foreground" cx="86" cy="88" r="10" />
      <circle className="fill-brand-accent" cx="86" cy="88" r="4" />
    </>
  ),
  "price-tag": (
    <>
      <path className="fill-primary" d="M54 12L82 38V98a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V38Z" />
      <circle className="fill-card" cx="54" cy="36" r="6" />
      <path strokeWidth={THIN} d="M56 31q6-15 26-18" />
      <rect className="fill-card" x="36" y="56" width="36" height="34" rx="2" />
      <path strokeWidth={THIN} d="M42 65h24M42 73h14" />
      <rect className="fill-brand-accent" x="52" y="78" width="14" height="7" rx="1.5" />
      <circle className="fill-brand-accent" cx="96" cy="92" r="11" />
      <circle strokeWidth={THIN} cx="96" cy="92" r="6.500" />
    </>
  ),
  scooter: (
    <>
      <circle className="fill-foreground" cx="30" cy="90" r="11" />
      <circle className="fill-foreground" cx="94" cy="90" r="11" />
      <path strokeWidth={4} d="M84 40 82 28M74 27H90" />
      <path className="fill-primary" d="M16 82Q16 58 32 58H58V74H70L79 40H89L85 82Z" />
      <rect className="fill-brand-accent" x="24" y="49" width="36" height="9" rx="4" />
      <path className="stroke-card" strokeWidth={THIN} d="M26 70H48" />
      <circle className={TINT} cx="92" cy="48" r="5" />
      <circle className="fill-brand-accent" cx="30" cy="90" r="4.500" />
      <circle className="fill-brand-accent" cx="94" cy="90" r="4.500" />
    </>
  ),
  "merchant-ship": (
    <>
      <path strokeWidth={4} d="M60 72V12" />
      <path className="fill-brand-accent" d="M60 10H76l-4 4.500 4 4.500H60Z" />
      <path className="fill-card" d="M30 26H90Q95 43 90 60H30Q25 43 30 26Z" />
      <path strokeWidth={THIN} d="M46 26Q43 43 46 60M74 26Q77 43 74 60" />
      <rect className="fill-card" x="16" y="58" width="18" height="14" rx="1.5" />
      <rect className={TINT} x="21" y="62" width="8" height="6" rx="1" />
      <path className="fill-primary" d="M14 76H106Q100 98 84 98H34Q20 98 14 76Z" />
      <rect className="fill-brand-accent" x="10" y="70" width="100" height="7" rx="2" />
      <circle className="fill-card" cx="44" cy="87" r="2.5" />
      <circle className="fill-card" cx="60" cy="87" r="2.5" />
      <circle className="fill-card" cx="76" cy="87" r="2.5" />
      <path d="M12 108q6-5 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0" />
    </>
  ),
  "coin-pouch": (
    <>
      <path className="fill-primary" d="M36 52L29 34Q52 42 75 34L68 52Z" />
      <path className="fill-primary" d="M34 52Q14 72 20 92Q24 106 52 106Q80 106 84 92Q90 72 70 52Z" />
      <rect className="fill-card" x="33" y="47" width="38" height="8" rx="4" />
      <path className="stroke-card" strokeWidth={THIN} d="M36 74Q32 84 36 94" />
      <circle className="fill-brand-accent" cx="100" cy="62" r="9" />
      <circle strokeWidth={THIN} cx="100" cy="62" r="5" />
      <path className="fill-brand-accent" d="M80 102v-6a14 5 0 0 1 28 0v6a14 5 0 0 1-28 0z" />
      <path className="fill-brand-accent" d="M80 96v-6a14 5 0 0 1 28 0v6a14 5 0 0 1-28 0z" />
      <ellipse className="fill-brand-accent" cx="94" cy="90" rx="14" ry="5" />
    </>
  ),
  quill: (
    <>
      <path className={TINT} d="M62 60Q64 28 104 12Q104 50 72 64Z" />
      <path d="M50 72L104 12" />
      <path strokeWidth={THIN} d="M78 41h10M70 50h9" />
      <rect className="fill-card" x="36" y="66" width="28" height="10" rx="2" />
      <path className="fill-primary" d="M30 76H70V98a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z" />
      <rect className="fill-brand-accent" x="40" y="84" width="20" height="9" rx="2" />
    </>
  ),
  "pepper-sack": (
    <>
      <path className="fill-foreground" d="M30 40Q54 14 78 40Z" />
      <path className={TINT} d="M26 44H82L86 98a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6Z" />
      <rect className="fill-card" x="20" y="38" width="68" height="10" rx="5" />
      <rect className="fill-primary" x="40" y="62" width="28" height="22" rx="2" />
      <path className="stroke-card" strokeWidth={THIN} d="M46 69h16M46 76h10" />
      <circle className="fill-foreground" cx="98" cy="88" r="3.5" />
      <circle className="fill-foreground" cx="106" cy="99" r="3.5" />
      <circle className="fill-foreground" cx="95" cy="101" r="3.5" />
    </>
  ),
  "wine-barrel": (
    <>
      <path className="fill-primary" d="M34 14H86Q98 60 86 106H34Q22 60 34 14Z" />
      <path className="stroke-card" strokeWidth={THIN} d="M48 38V82M72 38V82" />
      <rect className="fill-brand-accent" x="28.500" y="28" width="63" height="8" rx="2" />
      <rect className="fill-brand-accent" x="28.500" y="84" width="63" height="8" rx="2" />
      <circle className="fill-card" cx="60" cy="60" r="5" />
      <circle className="fill-foreground" cx="60" cy="60" r="1.5" />
    </>
  ),
  book: (
    <>
      <rect className="fill-card" x="32" y="20" width="62" height="88" rx="3" />
      <path strokeWidth={THIN} d="M88 100H94M88 94H94" />
      <rect className="fill-primary" x="24" y="12" width="64" height="90" rx="4" />
      <path className="stroke-card" strokeWidth={THIN} d="M36 12V102" />
      <rect className="fill-card" x="44" y="28" width="34" height="20" rx="2" />
      <path strokeWidth={THIN} d="M50 35h22M50 41h14" />
      <path className="fill-brand-accent" d="M61 60 71 72 61 84 51 72Z" />
      <rect className="fill-brand-accent" x="82" y="34" width="14" height="7" rx="2" />
      <rect className="fill-brand-accent" x="82" y="74" width="14" height="7" rx="2" />
    </>
  ),
  "cloth-bolt": (
    <>
      <path className="fill-primary" d="M24 48H84V96Q69 86 54 96T24 96Z" />
      <rect className="fill-brand-accent" x="24" y="62" width="60" height="7" />
      <path className="stroke-card" strokeWidth={THIN} d="M42 76V88M66 76V88" />
      <rect className="fill-primary" x="14" y="22" width="84" height="28" rx="4" />
      <rect className="fill-brand-accent" x="30" y="22" width="7" height="28" />
      <ellipse className="fill-card" cx="98" cy="36" rx="8" ry="14" />
      <ellipse strokeWidth={THIN} cx="98" cy="36" rx="3" ry="6" />
    </>
  ),
  letter: (
    <>
      <rect className="fill-card" x="12" y="28" width="96" height="66" rx="4" />
      <path className="fill-primary" d="M14 30H106L60 64Z" />
      <path strokeWidth={THIN} d="M14 92 44 62M106 92 76 62" />
      <circle className="fill-brand-accent" cx="60" cy="64" r="11" />
      <circle strokeWidth={THIN} cx="60" cy="64" r="6" />
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
