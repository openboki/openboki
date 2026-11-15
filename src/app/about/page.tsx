import type { Metadata } from "next";
import Link from "next/link";
import { REPO_URL } from "@/lib/repo";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "このサイトについて",
  description: "Open簿記が目指していること、運営者、ライセンス、参加の方法、問い合わせ先。すべての教材を無料で、ログインなしで使えます。",
});

// 非公開の連絡先は未定(#76)。決まったら「問い合わせ先」に足す
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;
const FILE_URL = `${REPO_URL}/blob/main`;

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
      {children}
      <span className="sr-only">(新しいタブで開く)</span>
    </a>
  );
}

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 space-y-6 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:pt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">このサイトについて</h1>
        <p className="text-muted-foreground">
          Open簿記(オープン簿記)は、会計を原理から、手を動かして学ぶ学習サイトです。短い解説を読み、仕訳を記帳し、貸借対照表と損益計算書が動くのを見て確かめます。
        </p>
      </div>

      <section className="space-y-2">
        <h2>目指していること</h2>
        <p>
          日本の会計教育に、オープンソースの文化を持ち込むことです。誰でも無料で学べるようにし、教材を特定の個人や企業のものにせず、学習者・実務家・専門家が直しながら育てる共有財産にします。
        </p>
        <p>
          試験対策だけのサイトではありません。資格の合格は途中の成果と考え、勘定科目がなぜその要素に属するのか、取引で財務諸表がどう変わるのかを、仕訳のたびに確かめられるようにしています。
        </p>
      </section>

      <section className="space-y-2">
        <h2>無料で、ログインは要りません</h2>
        <p>
          すべての教材と機能を無料で使えます。ログインも登録も要りません。学習の記録をどう保存し、いつ消すかは
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            プライバシーポリシー
          </Link>
          に書いています。
        </p>
      </section>

      <section className="space-y-2">
        <h2>運営者</h2>
        <p>Open簿記運営が運営しています。</p>
      </section>

      <section className="space-y-2">
        <h2>ライセンス</h2>
        <ul>
          <li>
            教材(解説、演習、用語、図解): <External href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja">CC BY-SA 4.0</External>
            。出典を示し、改変したものを同じ条件で公開すれば、授業や研修(有償を含む)でも複製・改変・再配布できます。
          </li>
          <li>
            コード: <External href={`${FILE_URL}/LICENSE`}>Apache License 2.0</External>。
          </li>
          <li>
            名称「Open簿記」「オープン簿記」「OpenBoki」とロゴは、どちらのライセンスの対象にも含めません。複製して別のサービスを作るのは自由ですが、同じ名前は名乗れません。
          </li>
        </ul>
        <p>
          教材とコードはすべて<External href={REPO_URL}>GitHubのリポジトリ</External>で公開しています。
        </p>
      </section>

      <section className="space-y-2">
        <h2>使っている素材</h2>
        <ul>
          <li>
            フォント: BIZ UDPGothic、Zen Maru Gothic、Zen Kaku Gothic New、Zen Old Mincho、Noto Sans JP、M PLUS 1 Code、IBM Plex Mono(いずれもSIL Open Font License 1.1)
          </li>
          <li>アイコン: Lucide(ISC License)</li>
        </ul>
        <p>図解はすべてこのプロジェクトで描いたもので、教材と同じCC BY-SA 4.0で公開しています。</p>
      </section>

      <section className="space-y-2">
        <h2>参加する</h2>
        <ul>
          <li>
            質問、誤りの報告、提案: <External href={DISCUSSIONS_URL}>GitHub Discussions</External>(GitHubアカウントが要ります)
          </li>
          <li>
            教材やコードを直す: <External href={`${FILE_URL}/CONTRIBUTING.md`}>貢献の仕方(CONTRIBUTING.md)</External>
          </li>
          <li>
            これからの計画: <External href={`${FILE_URL}/docs/roadmap.md`}>ロードマップ</External>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>問い合わせ先</h2>
        <p>
          このサイトについての問い合わせも<External href={DISCUSSIONS_URL}>GitHub Discussions</External>
          で受け付けます。書いた内容は公開されるので、個人を特定できる情報は書かないでください。
        </p>
      </section>
    </article>
  );
}
