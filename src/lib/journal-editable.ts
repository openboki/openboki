import { type AccountInfo, type JournalEntry, type JournalLine, findAccountByName, formatAmount } from "./accounting";

// 仕訳エディタの入力状態(科目名と金額の文字列)と、勘定科目IDの仕訳との相互変換。
// サーバー(本文の仕訳ブロック)とクライアント(演習)の両方から使うので "use client" のファイルには置かない

export interface EditableLine {
  accountName: string;
  amount: string;
}

export interface EditableEntry {
  debit: EditableLine[];
  credit: EditableLine[];
}

export const emptyEntry = (): EditableEntry => ({
  debit: [{ accountName: "", amount: "" }],
  credit: [{ accountName: "", amount: "" }],
});

export type ParsedAmount = { value: number } | { reason: string };

// 安全な整数ぎりぎりまで通すと、残高や合計を足した時点で丸められて貸借が合わなくなる(Issue #209)。
// 13桁なら、この金額を約900回足しても安全な整数に収まる
const MAX_AMOUNT = 9_999_999_999_999;

// 単元のscenario.currencyに現れる通貨名
const CURRENCY_UNITS = ["円", "ドゥカート"];

/**
 * 金額の入力を通貨単位(既定は円。単元のscenario.currency)の整数として解釈する。IMEをオンのまま打った全角数字・全角カンマ・末尾の通貨名(問題文の「30,000円」のように前に空白があってもよい。Issue #211)は受け付け、
 * それ以外は理由を返す(Issue #43)。`Number()`に任せると「1e6」や上限を超える桁まで通ってしまう。
 * signedはcalc用で、負数と0を許す(当期純損失などを答える課題がある)。
 * 先頭の「ー」はIMEのマイナスキーで出る長音符、「△」「▲」は結果ペインも使う日本の会計の負号なので、負号として読む(Issue #131)。
 */
export function parseAmount(text: string, signed = false, currency = "円"): ParsedAmount {
  let s = text
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，]/g, "");
  if (s.endsWith(currency)) s = s.slice(0, -currency.length).trimEnd();
  s = s.replace(/^[−－ー△▲]/, "-");
  if (s === "") return { reason: "金額を入れてください" };
  // 円の単元に慣れた学習者はドゥカートの単元でも「円」を付けやすいので、半角かどうかではなく単位の違いを伝える(Issue #309)
  const otherUnit = CURRENCY_UNITS.find((u) => u !== currency && s.endsWith(u) && /^-?\d+(\.\d+)?\s*$/.test(s.slice(0, -u.length)));
  if (otherUnit) return { reason: `この単元の金額は${currency}です。「${otherUnit}」を外して数字だけ入れてください` };
  if (/^-?\d+\.\d+$/.test(s)) return { reason: `小数は使えません。${currency}単位の整数で入力してください` };
  if (!signed && s.startsWith("-")) return { reason: "マイナスは使えません。半角の数字で入力してください(例: 100000)" };
  if (!/^-?\d+$/.test(s)) return { reason: signed ? "半角の数字だけで入力してください。マイナスは先頭に - を付けます(例: -100000)" : "半角の数字だけで入力してください(例: 100000)" };
  const value = Number(s);
  if (Math.abs(value) > MAX_AMOUNT) return { reason: "桁が多すぎます" };
  if (!signed && value === 0) return { reason: `1${currency}以上の金額を入れてください` };
  return { value };
}

/** toJournalEntryが落とす行のうち、学習者が何か入れた行か。この行が残っていると入力と記帳内容が食い違う(Issue #71) */
export function isIncompleteLine(line: EditableLine, accounts: AccountInfo[], currency?: string): boolean {
  if (!line.accountName.trim() && !line.amount.trim()) return false;
  return !findAccountByName(line.accountName, accounts) || "reason" in parseAmount(line.amount, false, currency);
}

/**
 * 金額欄に見えている数字の借方・貸方の合計。科目の決まっていない行も含める。
 * 科目の無い行を外すと、左右に1,000が見えているのに「貸方合計0 不一致」と出る(Issue #412)。記帳できない理由は行の「科目を選んでください」が伝える
 */
export function amountTotals(entry: EditableEntry, currency?: string): { debitTotal: number; creditTotal: number; balanced: boolean } {
  const sum = (lines: EditableLine[]) =>
    lines.reduce((t, l) => {
      const amount = parseAmount(l.amount, false, currency);
      return "value" in amount ? t + amount.value : t;
    }, 0);
  const debitTotal = sum(entry.debit);
  const creditTotal = sum(entry.credit);
  return { debitTotal, creditTotal, balanced: debitTotal === creditTotal && debitTotal > 0 };
}

/** 入力中の行を勘定科目IDの仕訳に変換する。科目が解決できない行や金額が解釈できない行は落とす */
export function toJournalEntry(entry: EditableEntry, accounts: AccountInfo[], currency?: string): JournalEntry {
  const convert = (lines: EditableLine[]): JournalLine[] =>
    lines.flatMap((l) => {
      const account = findAccountByName(l.accountName, accounts);
      const amount = parseAmount(l.amount, false, currency);
      return account && "value" in amount ? [{ account: account.id, amount: amount.value }] : [];
    });
  return { debit: convert(entry.debit), credit: convert(entry.credit) };
}

export function fromJournalEntry(entry: JournalEntry, accounts: ReadonlyMap<string, AccountInfo>): EditableEntry {
  const convert = (lines: JournalLine[]): EditableLine[] =>
    lines.map((l) => ({ accountName: accounts.get(l.account)?.name ?? l.account, amount: formatAmount(l.amount) }));
  return { debit: convert(entry.debit), credit: convert(entry.credit) };
}
