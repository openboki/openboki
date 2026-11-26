---
id: merchandise/cost-of-goods-sold
title: 売れ残りと売上原価
summary: カフェ2年目の決算の日、1年目から持ち越した商品を仕入に入れ、売れ残った豆と菓子を仕入から取り出して繰越商品にしながら、「売れた分だけが費用」という売上原価の考え方を身につける
level: 2
order: 4
introduces: [cost_of_goods_sold, ending_inventory]
concepts: [three_account_method, purchase, asset, expense, net_income]
requires: [merchandise/returns-and-costs]
scenario:
  company: カフェ「マメノキ」
  opening:
    - { account: cash, amount: 500000 }
    - { account: bank_deposit, amount: 300000 }
    - { account: accounts_receivable, amount: 28000 }
    - { account: merchandise_inventory, amount: 15000 }
    - { account: equipment, amount: 600000 }
    - { account: accounts_payable, amount: 40000 }
    - { account: loans_payable, amount: 300000 }
    - { account: capital_stock, amount: 1000000 }
    - { account: retained_earnings, amount: 40000 }
    - { account: sales, amount: 800000 }
    - { account: purchases, amount: 132000 }
    - { account: shipping_expense, amount: 5000 }
    - { account: rent_expense, amount: 600000 }
---

## 棚に残った豆
```illustration
shelf
```
前の単元から時間が進み、カフェ「マメノキ」は2年目の[[closing|決算]]の日を迎えました。1年目のもうけ40,000円は「[[retained_earnings|繰越利益剰余金]]」として[[balance_sheet|貸借対照表]]の[[equity|純資産]]に残っています。

1年目の決算の日、棚には豆15,000円分が売れ残っていました。これを「[[merchandise_inventory|繰越商品]]」という資産にして2年目に持ち越したのが、貸借対照表の繰越商品15,000円です。期の初めにあった商品なので、[[accounting_period|期首]]の商品と呼びます。

結果の[[income_statement|損益計算書]]には、この1年に[[purchase|仕入れ]]た商品の合計132,000円が「仕入」として載っています。

この期に売った商品は、期首の15,000円分と、この期に仕入れた132,000円分の中から出ていきました。でも棚を見ると、豆と焼き菓子が22,000円分(仕入値で数えて)まだ残っています。

残っている商品は「使った」とは言えません。これから売ってお金に変わる財産です。売れた分の仕入値だけを費用にしたい。その金額を[[cost_of_goods_sold|売上原価]]と呼びます。

```figure
type: flow
alt: 期首の商品15,000円とこの期の仕入132,000円を合わせ、売れ残り22,000円を除いた125,000円が売上原価になる
nodes: ["期首の商品15,000 + この期の仕入132,000", "売れ残り22,000を除く", "売上原価125,000"]
highlight: 1
```

## 売れた分はいくら
売れた商品の仕入値は、売れる可能性があった商品の合計から、売れ残りを引けば分かります。売れる可能性があったのは、期首の商品とこの期の仕入です。

式にすると「売上原価 = 期首の商品 + この期の仕入 − 期末の売れ残り」。15,000円、132,000円、22,000円で計算してみましょう。

```task
type: calc
question: この期の売上原価はいくらですか(円)
answer: 125000
wrong_patterns:
  - match: 132000
    misconception: purchases_equal_cogs
    feedback: 仕入の合計がそのまま売れたわけではありません。期首の商品15,000を足し、棚に残っている22,000円分を引きましょう。
  - match: 110000
    misconception: beginning_inventory_forgotten
    feedback: 売れ残りは引けています。でも期首の商品15,000円分も、この期に売った商品の出どころです。足しましょう。
  - match: 147000
    misconception: purchases_equal_cogs
    feedback: 期首の商品と仕入を足したところで止まっています。棚に残っている22,000円分は売れていないので引きます。
  - match: 95000
    misconception: inventory_add_subtract_confused
    feedback: 期首の商品15,000は引くのではなく足します。1年目から持ち越して、この期に売った商品です。
  - match: 169000
    misconception: inventory_add_subtract_confused
    feedback: 売れ残りは引きます。足してはいけません。
  - match: 22000
    no_misconception: 売れ残りの金額を答えた問いの読み違いで、考え方の誤りではない
    feedback: それは売れ残りの金額です。売れた分は、期首の商品とこの期の仕入の合計から売れ残りを引いた金額です。
  - match: 15000
    no_misconception: 期首の商品の金額を答えた問いの読み違いで、考え方の誤りではない
    feedback: それは期首の商品の金額です。この期の仕入132,000を足し、売れ残り22,000を引きましょう。
hint: 15,000 + 132,000 − 22,000。
success: 売上原価は125,000円。期首の商品と仕入のうち、売れた分だけが、この期の費用です。
```

## 期首の商品を仕入へ
この計算を帳簿でやるのが、決算の日の2本の仕訳です。1本目で期首の商品を仕入に入れて、仕入の列に「売れる可能性があった商品」を全部集めます。

繰越商品15,000を仕入へ移すので、左に仕入、右に繰越商品です。このように帳簿の中で科目の金額を別の科目へ移すことを「振り替える」と言います。帳簿の中で移すだけなので、お金は動きません。

```task
type: post
transaction: 決算にあたり、期首の商品15,000円分を繰越商品から仕入に振り替えた
answer:
  debit: [{ account: purchases, amount: 15000 }]
  credit: [{ account: merchandise_inventory, amount: 15000 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: outflow_on_debit
    feedback: それは売れ残りを取り出すときの向きです。期首の商品は繰越商品から仕入へ移すので、左に仕入、右に繰越商品です。
  - match: { debit: [{ account: purchases, amount: 22000 }] }
    misconception: beginning_inventory_forgotten
    feedback: 22,000は期末の売れ残りです。仕入へ移すのは、1年目から持ち越した期首の商品15,000です。
  - match: { credit: [{ account: sales }] }
    misconception: inventory_transfer_as_transaction
    feedback: 売ったわけではありません。期首の商品を仕入の列に入れるだけです。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも15,000にしましょう。
  - match: { credit: [{ account: cash }] }
    misconception: inventory_transfer_as_transaction
    feedback: 1年目から持ち越した商品を、帳簿の中で別の科目へ移すだけです。お金は払っていないので、右に現金は書きません。
  - match: { debit: [{ account: cash }] }
    misconception: inventory_transfer_as_transaction
    feedback: 帳簿の中で別の科目へ移すだけなので、お金は入ってきていません。左に現金は書きません。
  - match: { debit: [{ account: sales }] }
    misconception: inventory_transfer_as_transaction
    feedback: 売った分を取り消すわけではありません。売上は動かさず、期首の商品の金額を帳簿の中で移します。
hint: 左に仕入15,000、右に繰越商品15,000です。
success: 繰越商品が消え、仕入が147,000(期首の商品15,000 + この期の仕入132,000)になりました。売れる可能性があった商品が、仕入の列にそろいました。
```

## 売れ残りを取り出す
```illustration
coffee-beans
```
2本目で、売れ残りの22,000円分を仕入(費用)から取り出して資産に移します。決算の日に残っている商品を[[ending_inventory|期末商品]]と呼び、繰越商品という資産の科目で次の期に持ち越します。

1本目は、期首の商品を資産から費用へ移しました。2本目はその逆向きです。記帳の前に、5つの箱がどう動くか予想してみましょう。費用から資産へ移すと、利益はどうなるでしょうか。

```figure
type: taccount
alt: 仕入のT勘定。左側に期首の商品15,000円とこの期の仕入132,000円、右側に売れ残り22,000円を移すと、残りの125,000円が売上原価
account: purchases
debit:
  - { label: 期首の商品(繰越商品から), amount: 15000 }
  - { label: この期の仕入, amount: 132000 }
credit:
  - { label: 売れ残り(繰越商品へ), amount: 22000 }
```

```task
type: predict
transaction: 決算にあたり、売れ残っている商品22,000円分を仕入から繰越商品に振り替えた
entry:
  debit: [{ account: merchandise_inventory, amount: 22000 }]
  credit: [{ account: purchases, amount: 22000 }]
answer: { asset: increase, liability: none, equity: increase, revenue: none, expense: decrease }
wrong_patterns:
  - match: { expense: none }
    misconception: purchases_equal_cogs
    feedback: 売れ残りの分は、まだ費用ではありません。仕入(費用)がその分減ります。
  - match: { asset: none }
    no_misconception: 資産が増えることの見落としで、売れ残りを費用のままと見た回答は費用の予想で捕まえる
    feedback: 売れ残った商品は財産です。繰越商品という資産が増えます。
  - match: { equity: none }
    no_misconception: 費用と純資産のつながりの見落としで、売上原価の考え方の誤りではない
    feedback: 費用が減ると当期純利益が増え、そのぶん純資産も増えます。
  - match: { revenue: increase }
    misconception: inventory_transfer_as_transaction
    feedback: 売ったわけではないので、売上は動きません。費用が減るだけです。
  - match: { expense: increase }
    misconception: purchases_equal_cogs
    feedback: 売れ残りの分は、まだ費用ではありません。費用から取り出すので、仕入(費用)は増えずに減ります。
  - match: { asset: decrease }
    misconception: purchases_equal_cogs
    feedback: 売れ残った商品は、これから売れる財産です。費用から資産へ移すので、資産は減らずに増えます。
  - match: { equity: decrease }
    no_misconception: 費用と純資産のつながりの向きの取り違えで、売上原価の考え方の誤りではない
    feedback: 費用が減ると当期純利益が増えるので、純資産は減らずに増えます。
hint: 資産(繰越商品)が増え、費用(仕入)が減ります。費用が減れば利益も純資産も増えます。
success: 左に繰越商品22,000、右に仕入22,000。1本目の「仕入 / 繰越商品」と左右が入れ替わった形で、決算の日にこの2本を続けて書くので、科目の頭の音を並べて「しーくり、くりしー」と呼ばれています。仕入が125,000に減り、繰越商品が22,000になりました。損益計算書の仕入が、ちょうど売上原価になっています。
```

## 決算後のもうけ
2本の仕訳で、損益計算書の費用が変わりました。改めて[[net_income|当期純利益]]を読んでみましょう。

売上800,000から、売上原価125,000、[[shipping_expense|発送費]]5,000、[[rent_expense|支払家賃]]600,000を引きます。家賃は毎月末に50,000円を払ってきたので、この期の12か月分です。

1年目のもうけ40,000円(繰越利益剰余金)は前の期のもうけなので、この期の当期純利益には入れません。

```task
type: calc
question: 決算の2本の仕訳のあとの当期純利益はいくらですか(円)
answer: 70000
wrong_patterns:
  - match: 63000
    misconception: purchases_equal_cogs
    feedback: それはこの期の仕入132,000を、そのまま売上原価にした金額です。期首の商品15,000を足し、売れ残り22,000を引いた125,000が売上原価です。
  - match: 85000
    misconception: beginning_inventory_forgotten
    feedback: 売上原価を110,000で計算しています。期首の商品15,000もこの期に売った商品なので、売上原価は125,000です。
  - match: 48000
    misconception: purchases_equal_cogs
    feedback: 売れ残り22,000まで費用にしています。売れ残りは繰越商品(資産)に移したので、費用ではありません。
  - match: 110000
    misconception: prior_profit_in_net_income
    feedback: 1年目のもうけ40,000を足しています。繰越利益剰余金は前の期のもうけなので、この期の当期純利益には入れません。
  - match: 675000
    no_misconception: 発送費と支払家賃の引き忘れで、売上原価の考え方の誤りではない
    feedback: 売上原価だけでなく、発送費5,000と支払家賃600,000も費用です。
  - match: 620000
    no_misconception: 家賃を1か月分で計算した問題文の読み違いで、考え方の誤りではない
    feedback: 支払家賃を1か月分しか引いていません。家賃は毎月末に払ってきたので、12か月分600,000が費用です。
  - match: 40000
    misconception: prior_profit_in_net_income
    feedback: それは1年目のもうけ(繰越利益剰余金)です。この期の当期純利益は、この期の売上800,000から費用を引いて求めます。
  - match: 125000
    no_misconception: 売上原価の金額を答えた問いの読み違いで、考え方の誤りではない
    feedback: それは売上原価です。当期純利益は、売上800,000から売上原価125,000、発送費5,000、支払家賃600,000を引いた残りです。
hint: 800,000 − 125,000 − 5,000 − 600,000 = 70,000。
success: 当期純利益は70,000円。売れた分の仕入値だけが費用になり、売れ残りの22,000円は費用ではなく、資産として次の期に持ち越されます。1年目のもうけ40,000円(繰越利益剰余金)とは別に、この期のもうけとして載ります。
```

## 商品の3つの科目
[[three_account_method|三分法]]の3つの科目がそろいました。仕入、売上、繰越商品です。それぞれどの箱に入るか、分けてみましょう。

繰越商品だけが資産です。残りは、日々の売り買いを記録する費用と収益です。

```task
type: classify
accounts: [merchandise_inventory, purchases, sales, accounts_receivable]
misconceptions:
  merchandise_inventory:
    expense: purchases_equal_cogs
  purchases:
    asset: purchase_is_asset
  accounts_receivable:
    revenue: receivable_is_cash
hint: 繰越商品と売掛金は資産、仕入は費用、売上は収益です。
success: 仕入(費用)、売上(収益)、繰越商品(資産)。三分法という名前は、この3つの科目で商品を記録することから来ています。
```

## ふりかえり
三分法では、日々は「買ったら仕入、売ったら売上」だけを記録し、決算の日に2本の仕訳を続けて書きます。期首の商品を繰越商品から仕入へ入れ(仕入 / 繰越商品)、売れ残りを仕入から取り出して繰越商品(資産)にします(繰越商品 / 仕入)。残った仕入が売上原価です。

売上原価は「売れた商品の仕入値」で、期首の商品 + この期の仕入 − 期末の売れ残り。仕入の合計そのものではありません。売れ残った分は財産として次の期に持ち越し、次の期の決算では期首の商品として仕入に入れます。

これで商品売買の流れは、仕入から決算までつながりました。「お金を払った年に全部費用にしない」という考え方は、後の固定資産のテーマ(減価償却)でもう一度出てきます。
