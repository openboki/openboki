---
id: depreciation/sale-of-fixed-assets
title: 固定資産の売却
summary: カフェ2号店の軽バンとコーヒーマシンを手放しながら、取得原価と累計額を帳簿から消し、売った金額と帳簿価額の差を売却損・売却益として記録する流れを身につける
level: 2
order: 3
introduces: [sale_of_fixed_assets, gain_or_loss_on_sale]
concepts: [book_value, acquisition_cost, contra_account, indirect_method, non_trade_receivable_payable]
requires: [depreciation/straight-line, receivables-and-payables/other-receivables-and-payables]
scenario:
  company: カフェ「マメノキ」2号店
  opening:
    - { account: cash, amount: 950000 }
    - { account: equipment, amount: 600000 }
    - { account: accumulated_depreciation_equipment, amount: 150000 }
    - { account: vehicle, amount: 1200000 }
    - { account: accumulated_depreciation_vehicle, amount: 300000 }
    - { account: capital_stock, amount: 2000000 }
    - { account: retained_earnings, amount: 300000 }
---

## 軽バンとマシンを手放す
カフェ「マメノキ」2号店は、開店から2回の[[closing|決算]]を終えました。きょうは3年目の最初の日、4月1日です。これまでのもうけ300,000円は[[retained_earnings|繰越利益剰余金]]にまとまっています。

配達を宅配業者に任せることにしたので、軽バンを手放します。コーヒーマシンも新型に入れ替えるので、いまのマシンは近所の喫茶店に譲ります。

使ってきた[[tangible_fixed_assets|有形固定資産]]を売ることを[[sale_of_fixed_assets|固定資産の売却]]と呼びます。売った物を帳簿に残しておくと、もう手元に無い財産が[[balance_sheet|貸借対照表]]に載り続けます。この単元では、売った資産を帳簿から消し、売った金額との差を記録します。

## 軽バンはいまいくら
中古車店の査定は850,000円でした。高いか安いかは、買った値段の1,200,000円と比べても分かりません。軽バンはもう1年半使っていて、その分は[[depreciation|減価償却]]で費用にしてきました。

結果の表には、[[vehicle|車両運搬具]]1,200,000と、[[accumulated_depreciation_vehicle|車両運搬具減価償却累計額]] △300,000が並んでいます。[[acquisition_cost|取得原価]]から[[accumulated_depreciation|減価償却累計額]]を引いた[[book_value|帳簿価額]]が、帳簿の上での軽バンのいまの価値です。売った金額は、この帳簿価額と比べます。

```task
type: calc
question: 売る直前の軽バンの帳簿価額はいくらですか(円)
answer: 900000
wrong_patterns:
  - match: 850000
    misconception: book_value_is_market_price
    feedback: それは中古車店の査定額です。帳簿価額は売れる値段ではなく、取得原価から減価償却累計額を引いた金額です。
  - match: 1200000
    no_misconception: 取得原価をそのまま答えた言葉の取り違えで、売却の考え方の誤りではない
    feedback: それは取得原価です。ここから車両運搬具減価償却累計額を引きましょう。
  - match: 300000
    no_misconception: 累計額をそのまま答えた言葉の取り違えで、売却の考え方の誤りではない
    feedback: それは減った分(累計額)です。取得原価から引いて、残っている価値を答えます。
  - match: 1500000
    no_misconception: 引く数字を足した計算の誤りで、考え方の誤解ではない
    feedback: 累計額は資産のマイナスです。取得原価に足すのではなく、引きましょう。
hint: 1,200,000 − 300,000。
success: 帳簿価額は900,000円。査定の850,000円は、これより50,000円安い金額です。
```

## 帳簿から軽バンを消す
軽バンを850,000円で売り、代金は現金で受け取りました。

帳簿の上の軽バンは、車両運搬具1,200,000と車両運搬具減価償却累計額300,000の2つでできています。売ったら両方を消します。左で増えた車両運搬具は右に1,200,000、右に積んできた累計額は左に300,000。増えたときの反対側に同じ金額を書けば、どちらもゼロになります。

受け取った現金850,000は左です。ここまでで左の合計は1,150,000、右は1,200,000で、左が50,000足りません。帳簿価額900,000の軽バンが850,000にしかならなかった差です。この差を[[loss_on_sale_of_fixed_assets|固定資産売却損]]という[[expense|費用]]として左に書きます。左が3行、右が1行の仕訳になります。

```figure
type: compare
alt: 軽バンは2つの勘定で帳簿に載っている。車両運搬具は左に取得原価1,200,000、車両運搬具減価償却累計額は右に1年目100,000と2年目200,000。売るときは、それぞれ反対側に同じ金額を書いてゼロにする
left:
  title: 車両運搬具(右に書いて消す)
  figure:
    type: taccount
    alt: 車両運搬具のT勘定。左側に軽バンの取得原価1,200,000円がある
    account: vehicle
    debit:
      - { label: 軽バンの取得原価, amount: 1200000 }
right:
  title: 累計額(左に書いて消す)
  figure:
    type: taccount
    alt: 車両運搬具減価償却累計額のT勘定。右側に1年目の100,000円と2年目の200,000円が積まれている
    account: accumulated_depreciation_vehicle
    credit:
      - { label: 1年目の決算, amount: 100000 }
      - { label: 2年目の決算, amount: 200000 }
```

```task
type: post
transaction: 4月1日、軽バン(車両運搬具。取得原価1,200,000円、減価償却累計額300,000円)を850,000円で売却し、代金は現金で受け取った
answer:
  debit:
    - { account: cash, amount: 850000 }
    - { account: accumulated_depreciation_vehicle, amount: 300000 }
    - { account: loss_on_sale_of_fixed_assets, amount: 50000 }
  credit: [{ account: vehicle, amount: 1200000 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: outflow_on_debit
    feedback: 受け取った現金は左、手放した車両運搬具は右です。左右を入れ替えてみましょう。
  - match: { credit: [{ account: sales }] }
    misconception: asset_sale_is_sales
    feedback: 売上は商品を売ったときだけの科目です。軽バンは店で使っていた資産なので、右では車両運搬具そのものを消します。
  - match: { credit: [{ account: gain_on_sale_of_fixed_assets, amount: 850000 }] }
    misconception: sale_proceeds_is_gain
    feedback: 受け取った850,000がまるごともうけではありません。帳簿価額900,000の軽バンを手放しているので、右では車両運搬具1,200,000を消し、左で累計額300,000を消します。
  - match: { credit: [{ account: gain_on_sale_of_fixed_assets }] }
    misconception: sale_gain_loss_confused
    feedback: 帳簿価額900,000の軽バンが850,000にしかなりませんでした。帳簿価額より安く売れたので、売却益ではなく固定資産売却損を左に書きます。
  - match: { credit: [{ account: accumulated_depreciation_vehicle }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。売るときは積んできた300,000を消すので、反対側の左に書きます。
  - match: { credit: [{ account: accumulated_depreciation }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。売るときは積んできた300,000を消すので、反対側の左に書きます。
  - match: { debit: [{ account: accumulated_depreciation }] }
    misconception: accumulated_depreciation_any_asset
    feedback: 減価償却累計額は、資産ごとの累計額をまとめて呼ぶ総称です。帳簿では科目名ごとに別の勘定になるので、総称で消しても車両運搬具減価償却累計額の300,000は残ります。積んであるのと同じ車両運搬具減価償却累計額を左に書きましょう。
  - match: { credit: [{ account: vehicle, amount: 900000 }] }
    misconception: accumulated_depreciation_left_on_sale
    feedback: 車両運搬具は取得原価の1,200,000で帳簿に載っています。右で1,200,000をすべて消し、累計額300,000も左で消しましょう。900,000だけ消すと、売った軽バンの金額と累計額が帳簿に残ります。
  - match: { credit: [{ account: vehicle, amount: 850000 }] }
    misconception: asset_removed_at_sale_price
    feedback: 消すのは売った金額ではなく、帳簿に載っている金額です。車両運搬具は取得原価の1,200,000を右で消し、累計額300,000を左で消します。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets, amount: 350000 }] }
    misconception: sale_gain_loss_vs_cost
    feedback: 850,000を取得原価の1,200,000と比べています。1年半使った分の300,000はもう減価償却費にしました。左で累計額300,000を消すと、損は帳簿価額900,000との差の50,000になります。
  - match: { debit: [{ account: accumulated_depreciation_equipment }] }
    misconception: accumulated_depreciation_any_asset
    feedback: 備品減価償却累計額は、コーヒーマシンの価値の減りを積む科目です。軽バンを売るときに消すのは車両運搬具減価償却累計額です。
  - match: { debit: [{ account: depreciation_expense }] }
    misconception: sale_difference_as_depreciation
    feedback: 減価償却費は、使った期間の分として決算で計上する費用です。帳簿価額と売った金額の差50,000は、固定資産売却損という別の費用で記録します。
  - match: { debit: [{ account: bank_deposit }] }
    misconception: deposit_is_cash
    feedback: 取引文では代金を現金で受け取っています。普通預金は動いていないので、左は現金です。
  - match: { unbalanced: true, debit: [{ account: loss_on_sale_of_fixed_assets }] }
    no_misconception: 売却損の行は書いていて金額の打ち間違いなので、下の書き漏れの案内に流さない(Issue #422)
    feedback: 左の合計と右の合計がそろっていません。どちらも1,200,000にしましょう。
  - match: { unbalanced: true, debit: [{ account: cash, amount: 850000 }, { account: accumulated_depreciation_vehicle, amount: 300000 }], credit: [{ account: vehicle, amount: 1200000 }] }
    no_misconception: 書いた行はすべて合っていて、売却損の行だけを書いていない。差額の扱いの誤解ではなく書き漏れ(Issue #422)
    feedback: 書いた行は合っていますが、左の合計1,150,000と右の車両運搬具1,200,000がそろっていません。帳簿価額より安く売れた分の50,000を、固定資産売却損として左に足しましょう。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも1,200,000にしましょう。
hint: 左に現金850,000、車両運搬具減価償却累計額300,000、固定資産売却損50,000。右に車両運搬具1,200,000です。
success: 結果の表から車両運搬具と累計額が消え、現金が850,000増えました。損益計算書には固定資産売却損50,000が載っています。
```

## マシンは高く売れそう
コーヒーマシンは、近所の喫茶店が480,000円で買ってくれることになりました。マシンの取得原価は600,000円、[[accumulated_depreciation_equipment|備品減価償却累計額]]は150,000円です。

帳簿価額は、6年使えるという見積もりで取得原価を減らしてきた計算上の数字です。実際に売れる値段を表してはいないので、売ると差が出ます。この差が[[gain_or_loss_on_sale|固定資産売却損益]]です。

帳簿価額より安く売れたときは固定資産売却損でした。高く売れたときは[[gain_on_sale_of_fixed_assets|固定資産売却益]]という[[revenue|収益]]になります。マシンの帳簿価額を出して、480,000円と比べてみましょう。

```task
type: calc
question: コーヒーマシンを480,000円で売ると、固定資産売却益はいくらですか(円)
answer: 30000
wrong_patterns:
  - match: 480000
    misconception: sale_proceeds_is_gain
    feedback: 480,000は受け取る代金で、もうけではありません。帳簿価額450,000のマシンを手放すので、もうけはその差だけです。
  - match: -120000
    misconception: sale_gain_loss_vs_cost
    feedback: 480,000を取得原価の600,000と比べています。比べる相手は、累計額150,000を引いた帳簿価額です。
  - match: 120000
    misconception: sale_gain_loss_vs_cost
    feedback: 480,000を取得原価の600,000と比べています。比べる相手は、累計額150,000を引いた帳簿価額です。
  - match: -30000
    misconception: sale_gain_loss_confused
    feedback: 金額は合っています。帳簿価額450,000より高い480,000で売れるので、損ではなく益です。マイナスを付けずに答えましょう。
  - match: 450000
    no_misconception: 帳簿価額をそのまま答えた問いの読み違いで、考え方の誤りではない
    feedback: それはマシンの帳簿価額です。売る金額480,000との差を答えましょう。
  - match: 330000
    no_misconception: 帳簿価額ではなく累計額を引いた数字の取り違えで、考え方の誤解ではない
    feedback: 480,000から累計額の150,000を引いています。先に帳簿価額(600,000 − 150,000)を出し、480,000と比べましょう。
hint: 帳簿価額は600,000 − 150,000 = 450,000。480,000 − 450,000を計算します。
success: 帳簿価額450,000より30,000高く売れるので、固定資産売却益は30,000円です。
```

## マシンを売る
マシンを480,000円で喫茶店に売りました。代金は4月30日に受け取る約束です。

商品ではない物を売って、後で受け取る代金は[[accounts_receivable_other|未収入金]]でした。[[sales|売上]]は商品を売ったときだけの科目なので、ここでは使いません。

今度は自分で組み立ててみましょう。消すのはマシンの取得原価と累計額、増えるのは未収入金です。軽バンのときと違って、差は右側に出ます。

```task
type: post
transaction: 4月1日、コーヒーマシン(備品。取得原価600,000円、減価償却累計額150,000円)を480,000円で売却し、代金は4月30日に受け取ることにした
answer:
  debit:
    - { account: accounts_receivable_other, amount: 480000 }
    - { account: accumulated_depreciation_equipment, amount: 150000 }
  credit:
    - { account: equipment, amount: 600000 }
    - { account: gain_on_sale_of_fixed_assets, amount: 30000 }
wrong_patterns:
  - match: { swapped: true }
    misconception: outflow_on_debit
    feedback: 増えた未収入金は左、手放した備品は右です。左右を入れ替えてみましょう。
  - match: { credit: [{ account: sales }] }
    misconception: asset_sale_is_sales
    feedback: 売上は商品を売ったときだけの科目です。マシンは店で使っていた資産なので、右では備品を消し、差は固定資産売却益にします。
  - match: { debit: [{ account: accounts_receivable }] }
    misconception: nontrade_as_trade
    feedback: 売掛金は商品を売ったときの科目です。マシンのような商品以外の物を売った代金は未収入金を使います。
  - match: { debit: [{ account: accounts_payable_other }] }
    misconception: nontrade_receivable_payable_confused
    feedback: 未払金は「後で払う義務」(負債)です。マシンを売って代金を4月30日に受け取るので、増えるのは「後で受け取る権利」である未収入金です。
  - match: { debit: [{ account: cash }] }
    no_misconception: 代金を受け取る日の読み落としで、考え方の誤解ではない
    feedback: 代金を受け取るのは4月30日です。きょうはまだ現金は増えていないので、後で受け取る権利である未収入金を左に書きます。
  - match: { credit: [{ account: gain_on_sale_of_fixed_assets, amount: 480000 }] }
    misconception: sale_proceeds_is_gain
    feedback: 480,000がまるごともうけではありません。帳簿価額450,000のマシンを手放しているので、右で備品600,000、左で累計額150,000を消すと、売却益は差の30,000になります。
  - match: { credit: [{ account: accumulated_depreciation_equipment }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。売るときは積んできた150,000を消すので、反対側の左に書きます。
  - match: { credit: [{ account: accumulated_depreciation }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。売るときは積んできた150,000を消すので、反対側の左に書きます。
  - match: { debit: [{ account: accumulated_depreciation }] }
    misconception: accumulated_depreciation_any_asset
    feedback: 減価償却累計額は、資産ごとの累計額をまとめて呼ぶ総称です。帳簿では科目名ごとに別の勘定になるので、総称で消しても備品減価償却累計額の150,000は残ります。積んであるのと同じ備品減価償却累計額を左に書きましょう。
  - match: { credit: [{ account: equipment, amount: 450000 }] }
    misconception: accumulated_depreciation_left_on_sale
    feedback: 備品は取得原価の600,000で帳簿に載っています。右で600,000をすべて消し、累計額150,000も左で消しましょう。450,000だけ消すと、売ったマシンの金額と累計額が帳簿に残ります。
  - match: { credit: [{ account: equipment, amount: 480000 }] }
    misconception: asset_removed_at_sale_price
    feedback: 消すのは売った金額ではなく、帳簿に載っている金額です。備品は取得原価の600,000を右で消し、累計額150,000を左で消します。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets, amount: 120000 }] }
    misconception: sale_gain_loss_vs_cost
    feedback: 480,000を取得原価の600,000と比べています。左で累計額150,000を消すと、帳簿価額450,000より30,000高く売れたことが分かります。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets }] }
    misconception: sale_gain_loss_confused
    feedback: 帳簿価額450,000のマシンが480,000で売れました。帳簿価額より高く売れたので、売却損ではなく固定資産売却益を右に書きます。
  - match: { debit: [{ account: accumulated_depreciation_vehicle }] }
    misconception: accumulated_depreciation_any_asset
    feedback: 車両運搬具減価償却累計額は、軽バンの価値の減りを積んでいた科目です。マシンを売るときに消すのは備品減価償却累計額です。
  - match: { credit: [{ account: vehicle }] }
    misconception: vehicle_is_equipment
    feedback: 車両運搬具は軽バンの科目です。コーヒーマシンは備品なので、右では備品600,000を消します。
  - match: { unbalanced: true, credit: [{ account: gain_on_sale_of_fixed_assets }] }
    no_misconception: 売却益の行は書いていて金額の打ち間違いなので、下の書き漏れの案内に流さない(Issue #422)
    feedback: 左の合計と右の合計がそろっていません。どちらも630,000にしましょう。
  - match: { unbalanced: true, debit: [{ account: accounts_receivable_other, amount: 480000 }, { account: accumulated_depreciation_equipment, amount: 150000 }], credit: [{ account: equipment, amount: 600000 }] }
    no_misconception: 書いた行はすべて合っていて、売却益の行だけを書いていない。差額の扱いの誤解ではなく書き漏れ(Issue #422)
    feedback: 書いた行は合っていますが、左の合計630,000と右の備品600,000がそろっていません。帳簿価額より高く売れた分の30,000を、固定資産売却益として右に足しましょう。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも630,000にしましょう。
hint: 左に未収入金480,000と備品減価償却累計額150,000。右に備品600,000と固定資産売却益30,000です。
success: 備品と累計額が消え、未収入金480,000が現れました。損益計算書には固定資産売却益30,000が載り、売却損50,000と差し引きで20,000の当期純損失です。
```

## 売却益と売却損はどの箱?
2つの売却で、新しい科目が2つ出てきました。右に書いた固定資産売却益と、左に書いた固定資産売却損です。

未収入金と備品減価償却累計額も合わせて、4つの科目を箱に分けてみましょう。左に書いた科目がどれも同じ箱に入るとは限りません。

```task
type: classify
accounts: [gain_on_sale_of_fixed_assets, loss_on_sale_of_fixed_assets, accounts_receivable_other, accumulated_depreciation_equipment]
misconceptions:
  gain_on_sale_of_fixed_assets:
    expense: sale_gain_loss_confused
  loss_on_sale_of_fixed_assets:
    revenue: sale_gain_loss_confused
    liability: expense_as_liability
  accounts_receivable_other:
    liability: nontrade_receivable_payable_confused
  accumulated_depreciation_equipment:
    liability: contra_as_liability
hint: 固定資産売却益は収益、固定資産売却損は費用です。未収入金は資産、備品減価償却累計額は資産のマイナスです。
success: 売却益は収益、売却損は費用として損益計算書に載り、売った年のもうけを増減させます。未収入金と累計額は資産の箱です。
```

## 代金を受け取る
4月30日、喫茶店からマシンの代金480,000円を現金で受け取りました。

記帳の前に、5つの要素がどう動くか予想してみましょう。固定資産売却益30,000円を記録したのがいつだったかを思い出してください。

```task
type: predict
transaction: 4月30日、コーヒーマシンの売却代金(未収入金)480,000円を現金で受け取った
entry:
  debit: [{ account: cash, amount: 480000 }]
  credit: [{ account: accounts_receivable_other, amount: 480000 }]
answer: { asset: none, liability: none, equity: none, revenue: none, expense: none }
wrong_patterns:
  - match: { revenue: increase }
    misconception: revenue_equals_cash_in
    feedback: 固定資産売却益は、マシンを売った4月1日に記録しました。きょうは未収入金が現金に変わっただけで、収益は増えません。
  - match: { asset: increase }
    misconception: asset_transfer_changes_total
    feedback: 現金が480,000増え、未収入金が480,000減ります。どちらも資産なので、資産の合計は変わりません。
  - match: { asset: decrease }
    misconception: asset_transfer_changes_total
    feedback: 未収入金が480,000減りますが、現金が480,000増えます。どちらも資産なので、資産の合計は変わりません。
  - match: { equity: increase }
    misconception: revenue_equals_cash_in
    feedback: 収益も費用も動かないので、純資産は変わりません。売却益の分は4月1日にもう増えています。
hint: 未収入金(資産)が現金(資産)に変わるだけです。
success: 5つとも動きません。もうけが決まったのは売った日で、お金が入った日ではありません。
```

## ふりかえり
固定資産を売ったら、取得原価と減価償却累計額の両方を帳簿から消します。売った金額と帳簿価額の差が固定資産売却損益で、安く売れたら固定資産売却損(費用)、高く売れたら固定資産売却益(収益)です。

比べる相手は取得原価ではなく帳簿価額です。帳簿価額は[[useful_life|耐用年数]]の見積もりから計算した数字なので、売れる値段とは一致しないのがふつうです。そのずれを、売った年の収益か費用としてまとめて記録するのが固定資産売却損益です。

「商品以外の後払いと手付金」の単元では、帳簿に50,000円で載っているショーケースを50,000円で売りました。帳簿価額と同じ金額で売ったので、差が出なかった売却です。

きょうは年度の最初の日に売ったので、今年の分の減価償却はありませんでした。[[accounting_period|期中]]に売るときは、売る日までの[[depreciation_expense|減価償却費]]を[[monthly_proration|月割り計算]]で計上してから帳簿から消します。次の単元「期中の売却」で扱います。
