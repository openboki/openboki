---
id: bad-debts/allowance-for-doubtful-accounts
title: 貸倒れを見積もる
summary: カフェ3年目の決算で、売掛金のうち回収できない見込みの金額を見積もって貸倒引当金を設定し、翌年からは残高との差額だけを足したり戻したりする流れを身につける
level: 2
order: 2
introduces: [allowance_for_doubtful_accounts, replenishment_method]
concepts: [bad_debt, accounts_receivable, contra_account, closing, expense]
requires: [bad-debts/bad-debt-loss, depreciation/what-is-depreciation]
scenario:
  company: カフェ「マメノキ」
  opening:
    - { account: cash, amount: 310000 }
    - { account: bank_deposit, amount: 400000 }
    - { account: accounts_receivable, amount: 200000 }
    - { account: equipment, amount: 600000 }
    - { account: accounts_payable, amount: 60000 }
    - { account: capital_stock, amount: 1000000 }
    - { account: retained_earnings, amount: 150000 }
    - { account: sales, amount: 1600000 }
    - { account: purchases, amount: 640000 }
    - { account: rent_expense, amount: 600000 }
    - { account: bad_debt_loss, amount: 60000 }
---

## 来年の貸倒れは誰の損?
```illustration
calendar
```
カフェ「マメノキ」の3年目が終わります。きょうは3月31日、[[closing|決算]]の日です。掛けで納める得意先が増えて、[[accounts_receivable|売掛金]]は200,000円になりました。

9月には2件の[[bad_debt|貸倒れ]]があり、[[bad_debt_loss|貸倒損失]]60,000円を記録しました。あれは、貸倒れが起きてから記帳する書き方でした。

では、いまある売掛金200,000円の一部が、来年になってから貸倒れになったらどうでしょう。売上は今年の[[income_statement|損益計算書]]に載っているのに、その代金をもらえなかった損は来年の費用になります。今年のもうけは多すぎ、来年のもうけは少なすぎる計算です。この単元では、決算の日に貸倒れを見積もって、今年の費用にしておく方法を学びます。

## いくら回収できなさそう?
```illustration
calculator
```
どの得意先が貸倒れになるかは、まだ分かりません。分かっているのは、これまでの実績です。マメノキでは、売掛金のおよそ2%が回収できずに終わってきました。

そこで、いまある売掛金200,000円の2%は回収できないものと見積もります。金額を計算してみましょう。

```task
type: calc
question: 売掛金200,000円の2%は回収できないと見積もります。見積額はいくらですか(円)
answer: 4000
wrong_patterns:
  - match: 40000
    no_misconception: 2%を0.2とした桁の計算違いで、貸倒れの考え方の誤りではない
    feedback: それは20%の金額です。2%は100分の2なので、200,000 × 0.02で計算しましょう。
  - match: 400
    no_misconception: 2%を0.002とした桁の計算違いで、貸倒れの考え方の誤りではない
    feedback: それは0.2%の金額です。2%は100分の2なので、200,000 × 0.02で計算しましょう。
  - match: 196000
    no_misconception: 回収できる見込みの金額を答えた問いの読み違いで、考え方の誤りではない
    feedback: それは回収できる見込みの金額です。問われているのは、回収できない見込みの2%の分です。
  - match: 2000
    no_misconception: 1%で計算した数字の読み違いで、考え方の誤りではない
    feedback: それは1%の金額です。見積もる割合は2%です。
hint: 200,000 × 0.02。
success: 見積額は4,000円。まだ起きていない貸倒れですが、今年売った分から出る損なので、今年の費用にします。
```

## 見積もりを記帳する
見積もった4,000円を、「[[provision_for_doubtful_accounts|貸倒引当金繰入]]」という[[expense|費用]]として左に書きます。

右は売掛金ではありません。どの得意先の分が回収できないのかが分からないので、売掛金そのものは減らせないからです。代わりに「[[allowance_for_doubtful_accounts|貸倒引当金]]」という科目に見積額を積みます。

貸倒引当金は、売掛金から差し引く金額を表す[[contra_account|評価勘定]]です。備品に対する[[accumulated_depreciation|減価償却累計額]]と同じ仕組みで、右で増えますが、負債ではなく資産のマイナスです。記帳の前に、5つの要素がどう動くか予想してみましょう。

```figure
type: elements
alt: 貸倒引当金は、売掛金と同じ資産の箱にマイナスとして並ぶ。売掛金の金額はそのまま残る
items:
  - { account: accounts_receivable }
  - { account: allowance_for_doubtful_accounts, highlight: true }
```

```task
type: predict
transaction: 決算にあたり、売掛金200,000円に対して2%の貸倒れを見積もり、貸倒引当金4,000円を設定した
entry:
  debit: [{ account: provision_for_doubtful_accounts, amount: 4000 }]
  credit: [{ account: allowance_for_doubtful_accounts, amount: 4000 }]
answer: { asset: decrease, liability: none, equity: decrease, revenue: none, expense: increase }
wrong_patterns:
  - match: { liability: increase }
    misconception: allowance_as_liability
    feedback: 貸倒引当金は右に書きますが、負債ではありません。誰かに払う義務ではなく、売掛金から差し引く資産のマイナスです。
  - match: { asset: none }
    misconception: allowance_leaves_assets_unchanged
    feedback: 売掛金の200,000はそのままですが、貸倒引当金が資産のマイナスとして4,000並びます。差し引きで資産は減ります。
  - match: { asset: increase }
    misconception: allowance_direction_confused
    feedback: 貸倒引当金は増えますが、資産のマイナスです。マイナスが増えるので、資産の合計は減ります。
  - match: { expense: none }
    misconception: bad_debt_expense_only_when_default
    feedback: 貸倒れはまだ起きていませんが、今年売った分から出る見込みの損です。見積額を、貸倒引当金繰入という今年の費用にします。
  - match: { equity: none }
    no_misconception: 費用と純資産のつながりの見落としで、貸倒引当金の考え方の誤りではない
    feedback: 費用が増えると当期純利益が減り、そのぶん純資産も減ります。
hint: 貸倒引当金(資産のマイナス)が増えて資産が減り、貸倒引当金繰入(費用)が増えます。
success: 貸借対照表では、売掛金200,000の下に貸倒引当金 △4,000が並びました。費用が4,000増え、当期純利益はそのぶん減っています。現金は動いていません。
```

## 回収できる見込みはいくら
結果の[[balance_sheet|貸借対照表]]には、売掛金200,000と貸倒引当金 △4,000が並んでいます。売掛金の金額は、得意先に請求できる権利の総額としてそのまま残っています。

この2つを差し引いた金額が、実際に回収できると見込んでいる金額です。いくらでしょう。

```task
type: calc
question: 売掛金200,000円から貸倒引当金4,000円を差し引いた、回収できる見込みの金額はいくらですか(円)
answer: 196000
wrong_patterns:
  - match: 204000
    misconception: allowance_direction_confused
    feedback: 貸倒引当金は資産のマイナスです。売掛金に足すのではなく、引きましょう。
  - match: 200000
    misconception: allowance_leaves_assets_unchanged
    feedback: それは売掛金の総額です。貸倒引当金4,000を差し引いた金額が、回収できる見込みです。
  - match: 4000
    no_misconception: 貸倒引当金の金額を答えた問いの読み違いで、考え方の誤りではない
    feedback: それは回収できない見込みの金額です。売掛金200,000から引いた残りを答えましょう。
hint: 200,000 − 4,000。
success: 回収できる見込みは196,000円。「請求できるのは200,000、そのうち入ってきそうなのは196,000」が、表から読み取れます。
```

## 1年後の決算
```illustration
office-building
```
1年が過ぎて、4年目の3月31日になりました。この1年に貸倒れは起きず、貸倒引当金は去年の4,000円がそのまま残っています。

得意先はさらに増えました。1年分の掛け売上900,000円と回収800,000円をまとめて帳簿に入れておきます。売掛金は300,000円になりました。

この画面の損益計算書は、3年目の分に4年目の分が足された形で表示されています。この先は、売掛金と貸倒引当金の2行に注目してください。

```task
type: observe
entries:
  - { memo: 4年目の掛け売上(1年分をまとめて記帳), debit: [{ account: accounts_receivable, amount: 900000 }], credit: [{ account: sales, amount: 900000 }] }
  - { memo: 4年目の売掛金の回収(1年分をまとめて記帳), debit: [{ account: bank_deposit, amount: 800000 }], credit: [{ account: accounts_receivable, amount: 800000 }] }
```

## 足りない分だけ足す
4年目の決算でも、売掛金300,000円の2%を回収できないと見積もります。見積額は6,000円です。

貸倒引当金には、去年積んだ4,000円がもう入っています。ここへ6,000円をまるごと積むと、残高は10,000円になり、見積額を超えてしまいます。積むのは、残高を見積額に合わせるのに足りない分だけです。この方法を[[replenishment_method|差額補充法]]と呼びます。

今年の決算で積む金額を計算してみましょう。

```figure
type: taccount
alt: 貸倒引当金のT勘定。右側に去年の決算で積んだ4,000円がある。今年の見積額は6,000円なので、足りない分だけをこの下に積む
account: allowance_for_doubtful_accounts
credit:
  - { label: 3年目の決算, amount: 4000 }
```

```task
type: calc
question: 売掛金300,000円の2%を見積額とします。貸倒引当金の残高が4,000円あるとき、今年の決算で積む金額はいくらですか(円)
answer: 2000
wrong_patterns:
  - match: 6000
    misconception: allowance_full_amount_each_year
    feedback: 6,000は今年の見積額です。貸倒引当金にはもう4,000が入っているので、積むのは足りない分だけです。
  - match: 10000
    no_misconception: 残高と見積額を足した計算の誤りで、考え方の誤解ではない
    feedback: 残高4,000と見積額6,000を足しています。残高を6,000に合わせたいので、6,000 − 4,000で計算しましょう。
  - match: 4000
    no_misconception: 去年の残高を答えた問いの読み違いで、考え方の誤りではない
    feedback: それは去年積んだ残高です。今年の見積額6,000に合わせるには、あといくら足りないかを答えましょう。
hint: 300,000 × 0.02 = 6,000。6,000 − 4,000を計算します。
success: 積むのは2,000円。残高4,000に2,000を足して、今年の見積額6,000にそろえます。
```

## 差額を記帳する
```illustration
ledger
```
足りない2,000円を記帳しましょう。科目は去年と同じで、左が費用の貸倒引当金繰入、右が貸倒引当金です。

```task
type: post
transaction: 4年目の決算にあたり、売掛金300,000円に対して2%の貸倒れを見積もった。貸倒引当金の残高は4,000円であり、差額補充法で処理する
answer:
  debit: [{ account: provision_for_doubtful_accounts, amount: 2000 }]
  credit: [{ account: allowance_for_doubtful_accounts, amount: 2000 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: debit_means_increase
    feedback: 貸倒引当金繰入は費用なので左、貸倒引当金は右で増えます。左右を入れ替えてみましょう。
  - match: { debit: [{ account: provision_for_doubtful_accounts, amount: 6000 }] }
    misconception: allowance_full_amount_each_year
    feedback: 6,000は今年の見積額です。貸倒引当金にはもう4,000が入っているので、積むのは差額の2,000だけです。
  - match: { credit: [{ account: accounts_receivable }] }
    misconception: allowance_direct_writeoff
    feedback: 売掛金は減らしません。どの得意先の分が回収できないのかは、まだ分からないからです。見積額は貸倒引当金に積みます。
  - match: { debit: [{ account: bad_debt_loss }] }
    misconception: estimate_as_bad_debt_loss
    feedback: 貸倒損失は、貸倒れが実際に起きたときに使う科目です。決算で見積もった分は、貸倒引当金繰入という費用で記録します。
  - match: { credit: [{ account: cash }] }
    misconception: bad_debt_is_cash_outflow
    feedback: 見積もりを記帳するだけなので、お金は動きません。右は貸倒引当金です。
  - match: { credit: [{ account: bank_deposit }] }
    misconception: bad_debt_is_cash_outflow
    feedback: 見積もりを記帳するだけなので、お金は動きません。右は貸倒引当金です。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも2,000にしましょう。
hint: 左に貸倒引当金繰入2,000、右に貸倒引当金2,000です。
success: 貸倒引当金が6,000になり、売掛金300,000の2%とそろいました。今年の費用になったのは、差額の2,000だけです。損益計算書の貸倒引当金繰入6,000は、3年目の4,000に今年の2,000が足された金額です。
```

## 売掛金が減った年
さらに1年が過ぎ、5年目の決算です。この年も貸倒れは起きませんでした。大口の得意先との取引が終わったので、売掛金は150,000円に減っています。1年分の掛け売上700,000円と回収850,000円を帳簿に入れておきます。

この画面の損益計算書も、3年目からの3年分が足された形で表示されています。売上3,200,000は3年分の合計、貸倒引当金繰入6,000は3年目の4,000と4年目の2,000の合計です。

```task
type: observe
entries:
  - { memo: 5年目の掛け売上(1年分をまとめて記帳), debit: [{ account: accounts_receivable, amount: 700000 }], credit: [{ account: sales, amount: 700000 }] }
  - { memo: 5年目の売掛金の回収(1年分をまとめて記帳), debit: [{ account: bank_deposit, amount: 850000 }], credit: [{ account: accounts_receivable, amount: 850000 }] }
```

## 多すぎる分を戻す
売掛金150,000円の2%は3,000円です。貸倒引当金には6,000円が入っているので、今度は3,000円多すぎます。

多すぎる分は、貸倒引当金から取り除きます。右で増える科目なので、減らすときは左です。相手の右には「[[reversal_of_allowance|貸倒引当金戻入]]」という[[revenue|収益]]を書きます。前の年までに費用にしすぎていた分を、今年のもうけに戻す科目です。

記帳すると、損益計算書には3年目と4年目の繰入6,000と今年の戻入3,000が並びます。この画面が3年分を合計しているからで、5年目だけの損益計算書なら出るのは戻入3,000だけです。差額補充法では、1つの年に記帳するのは繰入か戻入のどちらか片方だけです。

記帳の前に、5つの要素がどう動くか予想してみましょう。資産のマイナスが減ると、資産はどうなるでしょう。

```task
type: predict
transaction: 5年目の決算にあたり、売掛金150,000円に対して2%の貸倒れを見積もった。貸倒引当金の残高は6,000円であり、多すぎる3,000円を戻し入れた
entry:
  debit: [{ account: allowance_for_doubtful_accounts, amount: 3000 }]
  credit: [{ account: reversal_of_allowance, amount: 3000 }]
answer: { asset: increase, liability: none, equity: increase, revenue: increase, expense: none }
wrong_patterns:
  - match: { asset: decrease }
    misconception: allowance_direction_confused
    feedback: 貸倒引当金は資産のマイナスです。マイナスが3,000減るので、資産の合計は増えます。
  - match: { asset: none }
    misconception: allowance_leaves_assets_unchanged
    feedback: 売掛金は動きませんが、資産のマイナスである貸倒引当金が3,000減ります。差し引きで資産は増えます。
  - match: { liability: decrease }
    misconception: allowance_as_liability
    feedback: 貸倒引当金は負債ではなく、資産のマイナスです。負債は動きません。
  - match: { expense: decrease }
    misconception: allowance_reversal_reduces_expense
    feedback: 今年の費用を減らすのではありません。前の年までに費用にしすぎた分なので、貸倒引当金戻入という収益で記録します。
  - match: { revenue: none }
    no_misconception: 戻入が収益であることの見落としで、どの誤解かをこの回答だけでは決められない
    feedback: 多すぎた3,000は、貸倒引当金戻入という収益になります。
  - match: { equity: none }
    no_misconception: 収益と純資産のつながりの見落としで、貸倒引当金の考え方の誤りではない
    feedback: 収益が増えると当期純利益が増え、そのぶん純資産も増えます。
hint: 貸倒引当金(資産のマイナス)が減って資産が増え、貸倒引当金戻入(収益)が増えます。
success: 貸倒引当金が3,000になり、売掛金150,000の2%とそろいました。損益計算書に並ぶ繰入6,000は3年目と4年目の分、戻入3,000は今年の分です。足りなければ足し、多ければ戻す。どちらも、残高を今年の見積額に合わせる差額補充法です。
```

## ふりかえり
決算の日に、売掛金のうち回収できない見込みの金額を見積もり、貸倒引当金繰入という費用にします。売った年の売上と、その売上から出る貸倒れの損を、同じ年の損益計算書にそろえるためです。

相手の科目は売掛金ではなく貸倒引当金です。どの得意先が貸倒れになるかは分からないので、売掛金はそのまま残し、差し引く金額を別に積みます。貸倒引当金は右で増えますが、負債ではなく資産のマイナスです。

翌年からは差額補充法です。残高が見積額に足りなければ差額を貸倒引当金繰入で足し、多ければ差額を貸倒引当金戻入で戻します。

見積もっておいた貸倒れが実際に起きたときは、費用はもう計上済みなので、貸倒損失ではなく貸倒引当金を使って売掛金を消します。その単元はいま準備中です。
