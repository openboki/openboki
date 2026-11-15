---
name: monkey-test
description: Claude Codeが学習者の人格になり、Open簿記のローカル環境(Supabase + pnpm dev)をPlaywrightで探索的に壊すMonkeyテスト。「モンキーテスト」「人格で壊して」「/monkey-test <人格> [step数]」で使う。
---

# Monkeyテスト(人格型)

Claude Codeがテスター人格として会計IDEを操作し、不具合・状態不整合・分かりにくさを探す。
設計と背景は`docs/quality-loop.md` §4.1。人格は`personas/*.md`、起票の書式は`issue-template.md`、
起票しない既知の挙動は`known.md`。

引数: `/monkey-test <人格名> [step数]`。step数の既定は20。人格名が無ければ`personas/`を列挙して1つ選ぶ。

## 前提の確認(必ず最初に行う)

1. `scripts/services.sh status`でSupabase(54321)とNext(3000)がupであること。downなら`scripts/services.sh up`。
2. `.velite/units.json`があること(無ければ`pnpm content`)。正解と科目名はここから読む。
3. セッションのディレクトリを決める: 環境変数`MONKEY_SESSION_DIR`があればそこ、無ければ
   `logs/monkey/<日時>-<人格>/`を作る。スクリーンショット・所見・操作履歴・操作スクリプトはすべてここに置く。

## 画面の地図

| 画面 | URL | 主な要素 |
| --- | --- | --- |
| トップ | `/` | 最初のボタン(進捗なしは「チュートリアルを始める」、学習中の単元があれば「続きから: 〜」、完了だけなら「次の単元へ: 〜」)、「3級合格パスを見る」、学習パス一覧、テーマ一覧 |
| 学習パス | `/paths/boki-3`、`/paths/accounting-history` | セクションごとの単元リンク。3級は試験の情報、歴史は時代の説明を持つ |
| テーマ | `/topics/<topic>` | 単元一覧と学習状況(未着手 / 学習中 / 完了) |
| 単元(会計IDE) | `/units/<topic>/<unit>` | 3ペイン: region「ガイド」「ワークスペース」「結果」。lg未満はタブ「ペインの切り替え」で1ペインずつ |
| 用語集 | `/glossary` | 「用語を検索」、`#<id>`へのアンカー |
| チュートリアル | `/units/tutorial/first-entry`(`?tour=1`で強制開始) | dialog「チュートリアル」(はじめる / 次へ / スキップ / 閉じる) |
| 全画面共通 | ヘッダーとフッター | ヘッダーに「Open簿記」「3級合格パス」「用語集」、button「テーマ」(group「テーマ」の4つとgroup「明るさ」の自動 / ライト / ダーク。`<html>`の`data-theme` / `data-mode`に反映)。フッター(単元の画面には無い)に「プライバシーポリシー」(`/privacy`)とGitHub Discussionsへのリンク |

IDEの要素(アクセシブルネーム): 「次へ →」「← 前へ」「記帳する」「予想して記帳する」「確認する」「答えを見る」(2回間違えた後)、
「行を追加」「行を削除」、「借方の科目1」「借方の金額1」「貸方の科目1」…、select「資産の予想」など5つ、
group「仕分けボード」、placeholder「金額(円)」(単元の通貨で「金額(ドゥカート)」にもなる)、radio「n行目: 摘要」(debugの行選び)、slider(「条件を変える」)、range「帳簿をさかのぼる」(2件以上記帳後)、
「使い方」(ヘッダー。中の「場所を示す」で対象が光る)、見出し横の「?」(button「〜の説明」)、note「初めての「〜」」の「わかった」「くわしく」(課題の種類の初出)、「今はしない」(初回バナー)、section「貸借対照表」「損益計算書」「このステップの影響」「会社のかたち」、
用語のポップオーバー(本文のリンク → dialog、用語名がaria-label)。
ワークスペースのタブ「仕訳帳(記帳済み)」「総勘定元帳(T勘定)」、科目の入力はcombobox(listbox「科目の候補」)、問題文の金額はbutton「〜を仕訳帳に入れる」、最後のステップの「自由に試す」。
「テーマ」は2つの意味で出る。学習テーマ(`/topics/<topic>`)と、見た目のテーマ(ヘッダーの「テーマ」)。履歴とIssueでは書き分ける。
単元IDと各ステップの課題(`task.type`: observe / post / predict / tweak / classify / calc / debug、`answer`)は`.velite/units.json`。
単元には種類(`kind`: lesson / history / forensics)と結果ペインの段階(`scenario.view`)がある。`statements`は貸借対照表と損益計算書、`ledger`はsection「試算」「元帳」、
`none`は「この時代にはまだ仕訳帳も結果の表もありません」だけ。歴史の単元は時代(`scenario.era`)をガイドと結果ペインに出し、通貨(`scenario.currency`)と単元限定の科目(`scenario.accounts`)を持つ。
debugは`solveDebug(page, task, nameOf)`(session.mjs)で正解の行を選んで直せる。

## セッションの進め方

1. 人格ファイルを読み、性格・狙い・癖を把握する。
2. 操作履歴`history.md`を作る。各stepを1行で追記する: `step / URL / 観測した状態 / 選んだ操作 / 結果(正常・異常)`。
3. ループ(step数まで)。**1 step = 操作スクリプト1本**(1〜5操作):
   - **観測**: 前のstepの出力(`check()`の所見、スクリーンショット、必要なら`page.content()`の抜粋)から状態を判定する。
   - **選択**: 人格の癖に沿って、いまの状態で可能な操作を選ぶ。同じ操作を3回続けない。
   - **実行**: `step-NN.mjs`をセッションのディレクトリに書き、`node <パス>`で実行する。雛形:

     ```js
     import { openSession, fillEntry, loadContent, db } from "<repo絶対パス>/scripts/monkey/session.mjs";
     const s = await openSession({ dir: process.env.MONKEY_SESSION_DIR });   // mobile: trueで390×844、fresh: trueで新しいゲスト
     await s.page.goto("/units/bookkeeping-basics/five-elements");
     // …操作(Playwrightのpage API)…
     await s.check("操作の名前");          // 所見をoracle.jsonlへ。expectError: trueはわざと失敗させたとき
     await s.shot("場面の名前");           // 異常があった場面、UXを記録したい場面
     await s.close();                      // 同じゲストが次のスクリプトへ続く(state.json)
     ```

     ブラウザはスクリプトごとに開き直す(= タブを閉じて開き直す挙動が毎回入る)。途中まで進めた単元は、次のスクリプトでは
     ステップ1にガイドの「続きから」が出た状態で開くので、続けるなら「続きから」を押す。同じスクリプト内のreloadではステップと入力がそのまま戻る。1つの操作列の途中状態を見たいときは
     1本のスクリプトにまとめる。50ms以内の連打や並列操作は`page.evaluate` / `Promise.all`でページ内から行う。
     Playwright MCP(`browser_snapshot`等)は「いま何が見えているか」を手早く確かめる用途に使ってよいが、
     スクリーンショットが残らないので、記録したい操作はスクリプトで行う。
   - **点検**: `check()`の所見と、画面を見て感じた分かりにくさ(人格として迷った点)を履歴に書く。
4. 終了時:
   1. 異常の一覧を履歴の末尾にまとめる。
   2. 再現を1回試みる(`repro-<slug>.mjs`。`trace: true`で開く)。再現したものだけ起票する。
   3. 重複確認: `gh issue list --state open --label bug --json number,title,body --jq '.[] | "#\(.number) \(.title)"'`。
      同じ現象があれば新規に作らず、該当Issueへ観測(日時・手順・数値)をコメントする。`known.md`にあるものは起票しない。
   4. 起票: `issue-template.md`の書式で`gh issue create --title "…" --label "bug,needs-triage,p2,area:ide" --body-file <file>`。
      再現スクリプトは本文に貼る(`e2e/repro/issue-<n>.spec.ts`に昇格できるPlaywright testの形で)。
      分かりにくさ(UX)は不具合とは分け、`p3` + 該当areaで起票する。人格として「ここで迷った」を具体的に書く。
   5. 未再現は「未再現」として履歴に残すだけにする。
5. 無人実行(`scripts/monkey-loop.sh`から`claude -p`で起動された場合)は、ユーザーに質問せず自分で判断し、
   最後に異常の一覧とIssue番号を要約として出力して終える。

### 状態の判定

| 状態 | 見るもの |
| --- | --- |
| 単元の途中 | 「ステップn / m」。課題の種類は入力欄の種類(仕訳エディタ / 予想のselect / 仕分けボード / 金額 / スライダー) |
| 課題が未達 | 「課題ができると次へ進めます」、「次へ →」が`aria-disabled` |
| 正解 | role=statusに「できました」 |
| 不正解 | role=statusに「もう一歩」、誤解の説明、「あなたの仕訳」との比較 |
| 保存失敗 | role=alert「保存エラー: …」 |
| 初回バナー | ガイド上部のrole=note「初めてですか?」(通常の単元を初めて開いたとき)。「はじめる」「今はしない」 |
| 再開の案内 | ガイド上部の「前回はステップnまで進みました。」と「続きから」(完了済みは「最後のステップを見る」)。最初のステップにいる間だけ出る |
| 記録の読み込み失敗 | role=alert「学習の記録を読み込めませんでした。…」 |
| ツアー中 | dialog「チュートリアル」 |
| 帳簿をさかのぼり中 | 「最新に戻る」が見える |

### 異常の判定(これに当たったら記録)

`check()`が自動で拾うもの: 未捕捉例外、`console.error`、hydration警告、5xx、`requestfailed`、Supabase RESTの401 / 403、
静的ファイルの404、横スクロール、role=alert、貸借対照表の「左右の合計が一致していません」、資産合計 ≠ 負債・純資産合計。
貸借対照表の無い単元(`view`が`ledger` / `none`)では合計の検査が効かないので、試算の借方合計と貸方合計は自分で見る(debugのステップはわざと合わない帳簿を見せる)。

自分で見るもの:

- **採点の整合**: `.velite/units.json`の`answer`を入れたのに「できました」が出ない。定義された誤答(貸借逆、科目違い)に誤解の説明が付かない。
- **進捗**: 正解・記帳の後でreload・再訪しても元のステップと記帳済み仕訳が戻る(`db("select unit_id,status,step from unit_progress order by updated_at desc limit 5")`と`attempts`の件数で確かめる)。
- **操作の詰まり**: 課題ができたのに「次へ →」が有効にならない。ツアーが「次へ」を押せないまま進めない。ポップオーバーが閉じられない。
- **表示**: 結果ペインの数値が記帳した金額と合わない。影響の矢印(＋/－)が仕訳の内容と逆。390pxで要素が重なる・切れる。金額の単位が単元の通貨と違う。見た目のテーマやダークで文字が読めない。
- **UX**: 何をすればよいか分からず10秒以上止まる箇所、説明と画面の語が一致しない箇所、誤解の説明が当たっていない箇所。

## してはいけないこと

- `.env*`、`supabase/config.toml`、`content/`、`src/`の変更。コードの修正はしない(起票だけ)。
- `pnpm db:reset` / `pnpm db:stop`、Supabaseの`auth.users`の削除(他のセッションと共有している)。
- gitのcommit / push、Issueのクローズや編集(コメントと新規作成だけ)。
- リポジトリ直下やセッションのディレクトリ以外に作業ファイルを作ること。
- 本番環境・外部サービスへのアクセス(ローカル以外のURLを開かない)。
- 同じ現象でIssueを2つ作ること(重複確認を省かない)。

## seed付きMonkeyの所見を起票する(`/monkey-test scripted <seed>`)

`scripts/monkey-scripted.sh`から呼ばれる。人格は使わず、`e2e/monkey.spec.ts`がseedで見つけた所見をIssueにする。

1. セッションのディレクトリの`scripted.log`を読む(1行1操作。末尾の`## findings`が所見)。
2. 所見を現象ごとにまとめる(同じconsole.errorが複数stepに出ていれば1件)。`known.md`にあるものは除く。
3. それぞれを最小の手順で再現する: 所見が出たstepまでの操作列を参考に、`step-NN.mjs`(人格型と同じ`session.mjs`)で
   同じ画面・同じ操作を行い、`check()`で同じ所見が出ることを確かめる。再現しなければ
   `MONKEY=1 MONKEY_SEED=<seed> MONKEY_STEPS=<所見のstep> pnpm exec playwright test e2e/monkey.spec.ts`でseedごと再現する。
4. 再現したものを、重複確認のうえ起票する(書式・ラベルは人格型と同じ。本文に「seed <seed> のstep <n>」を書く)。
5. 要約として起票したIssue番号を出力する。
