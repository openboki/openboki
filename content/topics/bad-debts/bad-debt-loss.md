---
id: bad-debts/bad-debt-loss
title: 売掛金が回収できない
summary: 掛けで豆を納めていた得意先が倒産した。受け取れなくなった売掛金を帳簿から消し、貸倒損失という費用にする流れを、売上を取り消さない理由と合わせて身につける
level: 1
order: 1
introduces: [bad_debt]
concepts: [accounts_receivable, credit_transaction, asset, expense, revenue]
requires: [merchandise/returns-and-costs]
scenario:
  company: カフェ「マメノキ」
  opening:
    - { account: cash, amount: 400000 }
    - { account: bank_deposit, amount: 300000 }
    - { account: accounts_receivable, amount: 50000 }
    - { account: equipment, amount: 600000 }
    - { account: accounts_payable, amount: 40000 }
    - { account: capital_stock, amount: 1000000 }
    - { account: retained_earnings, amount: 150000 }
    - { account: sales, amount: 700000 }
    - { account: purchases, amount: 290000 }
    - { account: rent_expense, amount: 250000 }
---

## 払ってもらえないかもしれない
```illustration
ledger
```
テーマが変わるので、時点をあらためます。カフェ「マメノキ」は開店3年目、きょうは9月1日です。近所の店や会社に、コーヒー豆を[[credit_transaction|掛け]]で納める取引が増えてきました。

結果の表の[[accounts_receivable|売掛金]]50,000円は、7月に雑貨店へ納めた豆の代金です。売掛金は「後で代金を受け取る権利」で、資産でした。

では、相手の店がつぶれて、その代金を受け取れなくなったらどうなるでしょう。受け取れない権利を資産に載せたままにすると、[[balance_sheet|貸借対照表]]は実際より財産が多く見えます。この単元では、回収できなくなった売掛金の後始末を記帳します。

```figure
type: flow
alt: 掛けで売ると売掛金という受け取る権利が生まれる。ふつうは回収してお金に変わるが、回収できないと分かったときは、売掛金を消して費用にする
nodes: [商品を渡す, 売掛金を記録, 回収できないと分かる, 売掛金を消して費用にする]
highlight: 2
```

## デザイン事務所に納品する
```illustration
office-building
```
9月1日、近所のデザイン事務所に豆30,000円分を納めました。代金は月末に受け取る約束です。

掛けで売ったときの仕訳を、思い出しながら記帳してみましょう。お金はまだ動いていません。

```task
type: post
transaction: 9月1日、デザイン事務所にコーヒー豆(商品)30,000円分を納品し、代金は月末に受け取ることにした
answer:
  debit: [{ account: accounts_receivable, amount: 30000 }]
  credit: [{ account: sales, amount: 30000 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: debit_means_increase
    feedback: 増えた売掛金(資産)は左、売上(収益)は右です。左右を入れ替えてみましょう。
  - match: { debit: [{ account: cash }] }
    misconception: receivable_is_cash
    feedback: 代金を受け取るのは月末です。きょう増えたのは現金ではなく、後で受け取る権利である売掛金です。
  - match: { debit: [{ account: bank_deposit }] }
    misconception: receivable_is_cash
    feedback: 代金が振り込まれるのは月末です。きょう増えたのは預金ではなく、後で受け取る権利である売掛金です。
  - match: { debit: [{ account: accounts_receivable_other }] }
    misconception: trade_as_nontrade
    feedback: 未収入金は、商品以外の物を売ったときの科目です。豆は商品なので、売掛金を使います。
  - match: { debit: [{ account: accounts_payable }] }
    misconception: receivable_payable_confused
    feedback: 買掛金は、仕入れた代金を後で払う義務です。納品して代金を受け取る側なので、左は売掛金です。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも30,000にしましょう。
hint: 左に売掛金30,000、右に売上30,000です。
success: 売掛金が80,000になりました。雑貨店の50,000と、デザイン事務所の30,000です。売上も30,000増えています。
```

## 事務所が倒産した
```illustration
shuttered-shop
```
9月20日、デザイン事務所が倒産したと知らせが届きました。事務所に財産は残っておらず、30,000円は受け取れません。

売掛金のような「受け取る権利」が、相手の倒産などで回収できなくなることを[[bad_debt|貸倒れ]]と呼びます。受け取れないと決まった30,000円は、もう財産ではないので、売掛金から消します。

消した相手に書くのは[[bad_debt_loss|貸倒損失]]という[[expense|費用]]です。売上は取り消しません。豆を渡して売った事実は変わらず、損をしたのは「代金を回収できなかった」という別の出来事だからです。記帳の前に、5つの要素がどう動くか予想してみましょう。

```task
type: predict
transaction: 9月20日、デザイン事務所が倒産し、当期に生じた売掛金30,000円が回収できなくなった
entry:
  debit: [{ account: bad_debt_loss, amount: 30000 }]
  credit: [{ account: accounts_receivable, amount: 30000 }]
answer: { asset: decrease, liability: none, equity: decrease, revenue: none, expense: increase }
wrong_patterns:
  - match: { asset: none }
    misconception: uncollectible_receivable_kept
    feedback: 受け取れないと決まった売掛金は、もう財産ではありません。売掛金を30,000消すので、資産は減ります。
  - match: { revenue: decrease }
    misconception: bad_debt_cancels_sales
    feedback: 売上は取り消しません。豆を渡して売った事実は変わらないからです。回収できなかった損は、貸倒損失という費用で記録します。
  - match: { expense: none }
    no_misconception: 費用が立つことの見落としで、どの誤解かをこの回答だけでは決められない
    feedback: 回収できなかった30,000は、貸倒損失という費用になります。売上を減らすのではなく、費用を増やします。
  - match: { liability: increase }
    misconception: expense_as_liability
    feedback: 誰かに払う義務が生まれたわけではありません。受け取る権利が消えただけなので、負債は動きません。
  - match: { equity: none }
    no_misconception: 費用と純資産のつながりの見落としで、貸倒れの考え方の誤りではない
    feedback: 費用が増えると当期純利益が減り、そのぶん純資産も減ります。
hint: 売掛金(資産)が減り、貸倒損失(費用)が増えます。費用が増えれば純資産も減ります。
success: 売掛金が50,000に戻り、損益計算書に貸倒損失30,000が載りました。売上の30,000はそのまま残っています。現金は動いていません。
```

## 結局いくら損をした?
```illustration
coffee-beans
```
デザイン事務所との取引だけを取り出してみます。売上は30,000円、[[bad_debt_loss|貸倒損失]]も30,000円です。差し引きゼロで、損はしていないように見えます。

でも、渡した豆はただではありません。問屋から18,000円で[[purchase|仕入れ]]た豆で、その代金は仕入という費用にもう入っています。

売上、仕入、貸倒損失の3つを合わせると、この取引でもうけはいくら動いたでしょう。損ならマイナスを付けて答えます。

```task
type: calc
question: デザイン事務所との取引全体(売上30,000円、豆の仕入18,000円、貸倒損失30,000円)で、もうけはいくら動きましたか(円。損ならマイナス)
answer: -18000
wrong_patterns:
  - match: 18000
    no_misconception: 符号の付け忘れで、考え方の誤解ではない
    feedback: 金額は合っています。もうけが減ったので、マイナスを付けて答えましょう。
  - match: 0
    no_misconception: 仕入を式に入れ忘れた計算の誤りで、貸倒れの考え方の誤りではない
    feedback: 売上30,000と貸倒損失30,000だけを比べています。渡した豆の仕入18,000も費用です。
  - match: -30000
    no_misconception: 売上を式に入れ忘れた計算の誤りで、貸倒れの考え方の誤りではない
    feedback: 貸倒損失30,000だけを見ています。売上30,000は取り消していないので収益に残っていて、仕入18,000も費用です。3つを合わせましょう。
  - match: 12000
    no_misconception: 貸倒損失を式に入れ忘れた計算の誤りで、貸倒れの考え方の誤りではない
    feedback: それは代金を回収できた場合のもうけ(30,000 − 18,000)です。回収できなかったので、貸倒損失30,000も引きましょう。
  - match: -48000
    no_misconception: 売上を足さずに費用だけを合計した計算の誤りで、貸倒れの考え方の誤りではない
    feedback: 費用の合計(18,000 + 30,000)を答えています。売上30,000は収益として残っているので、そこから費用を引きましょう。
hint: 30,000 − 18,000 − 30,000。
success: もうけは18,000円減りました。豆を渡して代金をもらえなかったのだから、損は渡した豆の仕入値の分です。売上を残して貸倒損失を立てる書き方でも、この結果になります。
```

## 半分だけ回収できた
```illustration
cash
```
9月30日、今度は雑貨店が店をたたむことになりました。7月に納めた豆の売掛金50,000円のうち、20,000円だけは現金で払ってもらえました。残りは受け取れません。

受け取った分は、いつもの回収と同じです。貸倒れになるのは、受け取れなかった分だけです。左が2行、右が1行の仕訳を組み立ててみましょう。

```task
type: post
transaction: 9月30日、雑貨店に対する当期に生じた売掛金50,000円のうち20,000円を現金で回収し、残りは貸倒れとして処理した
answer:
  debit:
    - { account: cash, amount: 20000 }
    - { account: bad_debt_loss, amount: 30000 }
  credit: [{ account: accounts_receivable, amount: 50000 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: outflow_on_debit
    feedback: 受け取った現金と貸倒損失(費用)は左、消す売掛金は右です。左右を入れ替えてみましょう。
  - match: { debit: [{ account: bad_debt_loss, amount: 50000 }] }
    misconception: partial_bad_debt_full_loss
    feedback: 50,000のうち20,000は現金で受け取りました。貸倒損失にするのは、受け取れなかった30,000だけです。
  - match: { credit: [{ account: accounts_receivable, amount: 30000 }] }
    misconception: partial_collection_leaves_receivable
    feedback: 雑貨店への売掛金は50,000です。回収した20,000も、貸倒れの30,000も、どちらも売掛金を消します。右は50,000です。
  - match: { credit: [{ account: accounts_receivable, amount: 20000 }] }
    misconception: uncollectible_receivable_kept
    feedback: 回収した20,000だけを消しています。残りの30,000も受け取れないと決まったので、売掛金から消して貸倒損失にします。右は50,000です。
  - match: { debit: [{ account: sales }] }
    misconception: bad_debt_cancels_sales
    feedback: 売上は取り消しません。豆を渡して売った事実は変わらないからです。受け取れなかった30,000は、貸倒損失という費用で記録します。
  - match: { credit: [{ account: sales }] }
    misconception: receivable_collection_is_sale
    feedback: 売上は7月に納めた日に記録済みです。ここでは売掛金を消すので、右は売掛金です。
  - match: { debit: [{ account: miscellaneous_loss }] }
    misconception: bad_debt_as_miscellaneous_loss
    feedback: 雑損は、原因の分からない現金の不足などに使う科目です。売掛金を回収できなかった損は、原因がはっきりしているので貸倒損失を使います。
  - match: { debit: [{ account: allowance_for_doubtful_accounts }] }
    misconception: allowance_for_unestimated_bad_debt
    feedback: 貸倒引当金は、前の期末に見積もって積んでおいた分を取り崩すときの科目です。雑貨店への売掛金は当期に生じたもので、まだ見積もっていません。受け取れなかった30,000は、全額を貸倒損失(費用)にします。
  - match: { credit: [{ account: cash }] }
    misconception: bad_debt_is_cash_outflow
    feedback: 貸倒れでお金は出ていきません。入ってくるはずだったお金が入らなかっただけです。現金は受け取った20,000を左に書きます。
  - match: { debit: [{ account: bank_deposit }] }
    misconception: deposit_is_cash
    feedback: 取引文では20,000を現金で受け取っています。普通預金は動いていないので、左は現金です。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも50,000にしましょう。
hint: 左に現金20,000と貸倒損失30,000、右に売掛金50,000です。
success: 売掛金がゼロになり、現金が20,000増えました。貸倒損失は、デザイン事務所の分と合わせて60,000です。
```

## これは貸倒れ?
得意先からお金が入ってこない場面が、どれも貸倒れとは限りません。貸倒れは、回収できないと決まったときの話です。

4つの場面を、貸倒れとして処理するものと、そうでないものに分けてみましょう。

```task
type: classify
labels:
  bad_debt: 貸倒れとして処理する
  not_bad_debt: 貸倒れではない
items:
  - { id: bankrupt, label: 得意先が倒産し、売掛金を受け取れないと決まった, answer: bad_debt }
  - { id: late, label: 得意先の支払いが約束より1か月遅れている, answer: not_bad_debt }
  - { id: returned, label: 納めた豆が傷んでいて、得意先から返品された, answer: not_bad_debt }
  - { id: vanished, label: 得意先が夜逃げして連絡が取れず、回収をあきらめた, answer: bad_debt }
misconceptions:
  late:
    bad_debt: late_payment_is_bad_debt
  returned:
    bad_debt: return_as_bad_debt
  bankrupt:
    not_bad_debt: uncollectible_receivable_kept
  vanished:
    not_bad_debt: uncollectible_receivable_kept
hint: 支払いが遅れているだけなら、受け取る権利はまだ生きています。返品は、売ったこと自体を取り消す取引でした。
success: 遅れているだけの売掛金は、まだ資産です。返品は売上と売掛金を取り消す取引で、貸倒れとは別物です。貸倒れは、売った事実は残したまま、回収できなかった損を費用にします。
```

## ふりかえり
回収できないと決まった売掛金は、帳簿から消して貸倒損失という費用にします。現金は動きません。入ってくるはずだったお金が、入らなかっただけだからです。

売上は取り消しません。売った事実と、回収できなかった損は別の出来事で、[[income_statement|損益計算書]]にも売上と貸倒損失として別々に載ります。一部だけ回収できたときは、受け取れなかった分だけが貸倒損失です。

この単元の貸倒れは、どれも売った年のうちに起きました。去年売った分が今年になって貸倒れになると、売上は去年、損は今年と、年をまたいでずれてしまいます。このずれを防ぐために、決算で貸倒れを見積もっておく方法があります。次の単元「貸倒れを見積もる」で扱います。
