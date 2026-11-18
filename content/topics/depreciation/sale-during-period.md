---
id: depreciation/sale-during-period
title: 期中の売却
summary: カフェ2号店が年度の途中でコーヒーマシンとスクーターを売りながら、期首から売った日までの減価償却費を月割りで計上してから帳簿から消す流れを身につける
level: 2
order: 4
introduces: [sale_during_period]
concepts: [sale_of_fixed_assets, gain_or_loss_on_sale, monthly_proration, book_value, accrual_basis]
requires: [depreciation/sale-of-fixed-assets]
scenario:
  company: カフェ「マメノキ」2号店
  opening:
    - { account: cash, amount: 2268000 }
    - { account: equipment, amount: 720000 }
    - { account: accumulated_depreciation_equipment, amount: 240000 }
    - { account: vehicle, amount: 360000 }
    - { account: accumulated_depreciation_vehicle, amount: 108000 }
    - { account: capital_stock, amount: 2000000 }
    - { account: retained_earnings, amount: 700000 }
    - { account: sales, amount: 600000 }
    - { account: rent_expense, amount: 300000 }
---

## 年度の途中でマシンを売る
前の単元から2年半が過ぎました。カフェ「マメノキ」2号店は、あのとき入れ替えた新型のコーヒーマシン(備品、720,000円)を使い続けています。きょうは9月30日。4月1日に始まった年度の、ちょうど半分が過ぎたところです。

お客さんが増えたので、もっと大きなマシンに替えることにしました。いまのマシンは、きょう売ります。

前の単元では年度の最初の日に売ったので、その年の[[depreciation|減価償却]]はありませんでした。今回は4月から9月まで半年使っています。[[accounting_period|会計期間]]の途中で固定資産を売ることを[[sale_during_period|期中売却]]と呼びます。この単元では、売る日までに使った分を先に費用にしてから、帳簿から消します。

## 売る日までに使った分
結果の表の[[accumulated_depreciation_equipment|備品減価償却累計額]] △240,000は、前の決算(3月31日)までの2年分です。4月から9月の分は、まだどこにも記録していません。

決算を待たずに売ってしまうので、この半年分は売るときに計上します。使った期間の分はその期間の費用にする、という[[accrual_basis|発生主義]]の考え方は、売る年でも変わりません。

マシンの1年分の[[depreciation_expense|減価償却費]]は120,000円です(720,000 ÷ 6年)。4月1日から9月30日までの分を、[[monthly_proration|月割り計算]]で出してみましょう。

```figure
type: timeline
alt: マシンの1年分の減価償却費120,000円を12か月に分けると、1か月あたり10,000円になる。4月から9月までの6か月が、売る日までに使った分
total: 120000
periods: 12
unit: か月
label: マシンの1年分の減価償却費
highlight: 6
start_month: 4
```

```task
type: calc
question: 4月1日から9月30日までの、マシンの減価償却費はいくらですか(円)
answer: 60000
wrong_patterns:
  - match: 120000
    misconception: forgot_monthly_proration
    feedback: 120,000は1年分です。今年使ったのは4月から9月までなので、その月数の分だけにしましょう。
  - match: 50000
    no_misconception: 月数の数え違いで、考え方の誤解ではない
    feedback: 5か月分で計算しています。4月と9月の両端を入れて数えると、4月から9月までは6か月です。
  - match: 70000
    no_misconception: 月数の数え違いで、考え方の誤解ではない
    feedback: 7か月分で計算しています。4月と9月の両端を入れて数えると、4月から9月までは6か月です。
  - match: 10000
    no_misconception: 1か月分をそのまま答えた計算の途中で、考え方の誤解ではない
    feedback: それは1か月分です。4月から9月までの月数を掛けましょう。
  - match: 240000
    no_misconception: 累計額をそのまま答えた問いの読み違いで、考え方の誤解ではない
    feedback: それは前の決算までの累計額です。問われているのは、今年の4月から9月までに使った分です。
hint: 120,000 × 6か月 ÷ 12か月。
success: 今年の分は60,000円。期首から売った日までを数えます。
```

## 売る日の帳簿価額
売った金額と比べる相手は[[book_value|帳簿価額]]でした。ただし、結果の表から読める480,000円(720,000 − 240,000)は、期首の4月1日の帳簿価額です。

マシンはそこからさらに半年使いました。売る日の帳簿価額は、[[acquisition_cost|取得原価]]から、前の決算までの累計額と今年の分の両方を引いた金額です。

```task
type: calc
question: 9月30日(売る日)のマシンの帳簿価額はいくらですか(円)
answer: 420000
wrong_patterns:
  - match: 480000
    misconception: sale_ignores_current_depreciation
    feedback: それは期首(4月1日)の帳簿価額です。4月から9月までに使った60,000も引きましょう。
  - match: 660000
    no_misconception: 前の決算までの累計額を引き忘れた計算の誤りで、考え方の誤解ではない
    feedback: 今年の分60,000だけを引いています。前の決算までの累計額240,000も引きましょう。
  - match: 300000
    no_misconception: 引く金額の合計を答えた問いの読み違いで、考え方の誤解ではない
    feedback: それは減った分の合計(240,000 + 60,000)です。取得原価から引いて、残っている価値を答えます。
  - match: 360000
    misconception: forgot_monthly_proration
    feedback: 今年の分を1年分の120,000で引いています。今年使ったのは6か月なので、引くのは60,000です。
hint: 720,000 − 240,000 − 60,000。
success: 売る日の帳簿価額は420,000円。この金額と、売った金額を比べます。
```

## マシンを売る
マシンを400,000円で売り、代金は現金で受け取りました。帳簿価額420,000円より20,000円安いので、[[loss_on_sale_of_fixed_assets|固定資産売却損]]が出ます。

右では備品720,000を消し、左では[[accumulated_depreciation_equipment|備品減価償却累計額]]240,000を消します。ここまでは前の単元と同じです。

今年の分の60,000は、累計額には積まずに、減価償却費としてそのまま左に書きます。積んでもすぐに消すことになるからです。左は現金、累計額、減価償却費、固定資産売却損の4行、右は備品の1行になります。

```task
type: post
transaction: 9月30日、コーヒーマシン(備品。取得原価720,000円、期首の減価償却累計額240,000円、1年分の減価償却費120,000円)を400,000円で売却し、代金は現金で受け取った。当期分の減価償却費は月割りで計上する
answer:
  debit:
    - { account: cash, amount: 400000 }
    - { account: accumulated_depreciation_equipment, amount: 240000 }
    - { account: depreciation_expense, amount: 60000 }
    - { account: loss_on_sale_of_fixed_assets, amount: 20000 }
  credit: [{ account: equipment, amount: 720000 }]
alternatives:
  - debit:
      - { account: cash, amount: 400000 }
      - { account: accumulated_depreciation, amount: 240000 }
      - { account: depreciation_expense, amount: 60000 }
      - { account: loss_on_sale_of_fixed_assets, amount: 20000 }
    credit: [{ account: equipment, amount: 720000 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: outflow_on_debit
    feedback: 受け取った現金は左、手放した備品は右です。左右を入れ替えてみましょう。
  - match: { credit: [{ account: sales }] }
    misconception: asset_sale_is_sales
    feedback: 売上は商品を売ったときだけの科目です。マシンは店で使っていた資産なので、右では備品そのものを消します。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets, amount: 80000 }] }
    misconception: sale_ignores_current_depreciation
    feedback: 400,000を期首の帳簿価額480,000と比べています。4月から9月までに使った60,000は、売却損ではなく減価償却費として左に書きます。売却損は残りの20,000です。
  - match: { debit: [{ account: accumulated_depreciation_equipment, amount: 300000 }] }
    no_misconception: 当期分を累計額に積んでから消す2つの仕訳をまとめた形で、考え方の誤解ではない
    feedback: 考え方は合っています。ただ、この仕訳では今年の分60,000を累計額に積んでいないので、消す累計額は期首の240,000です。60,000は減価償却費として左に書きましょう。
  - match: { debit: [{ account: accumulated_depreciation, amount: 300000 }] }
    no_misconception: 当期分を累計額に積んでから消す2つの仕訳をまとめた形で、考え方の誤解ではない
    feedback: 考え方は合っています。ただ、この仕訳では今年の分60,000を累計額に積んでいないので、消す累計額は期首の240,000です。60,000は減価償却費として左に書きましょう。
  - match: { debit: [{ account: depreciation_expense, amount: 120000 }] }
    misconception: forgot_monthly_proration
    feedback: 120,000は1年分です。今年使ったのは4月から9月までの6か月なので、減価償却費は60,000です。
  - match: { credit: [{ account: accumulated_depreciation_equipment }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。期首までの240,000は消すので左に書き、今年の分60,000は累計額に積まず減価償却費として左に書きます。
  - match: { credit: [{ account: accumulated_depreciation }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。期首までの240,000は消すので左に書き、今年の分60,000は累計額に積まず減価償却費として左に書きます。
  - match: { credit: [{ account: equipment, amount: 420000 }] }
    misconception: accumulated_depreciation_left_on_sale
    feedback: 備品は取得原価の720,000で帳簿に載っています。右で720,000をすべて消し、累計額240,000は左で消しましょう。
  - match: { credit: [{ account: equipment, amount: 400000 }] }
    misconception: asset_removed_at_sale_price
    feedback: 消すのは売った金額ではなく、帳簿に載っている金額です。備品は取得原価の720,000を右で消します。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets, amount: 320000 }] }
    misconception: sale_gain_loss_vs_cost
    feedback: 400,000を取得原価の720,000と比べています。左で累計額240,000を消し、今年の分60,000を減価償却費にすると、売却損は20,000になります。
  - match: { credit: [{ account: gain_on_sale_of_fixed_assets }] }
    misconception: sale_gain_loss_confused
    feedback: 売る日の帳簿価額は420,000で、売った金額は400,000です。帳簿価額より安く売れたので、売却益ではなく固定資産売却損を左に書きます。
  - match: { debit: [{ account: accumulated_depreciation_vehicle }] }
    misconception: accumulated_depreciation_any_asset
    feedback: 車両運搬具減価償却累計額は、スクーターの価値の減りを積む科目です。マシンを売るときに消すのは備品減価償却累計額です。
  - match: { debit: [{ account: bank_deposit }] }
    misconception: deposit_is_cash
    feedback: 取引文では代金を現金で受け取っています。普通預金は動いていないので、左は現金です。
  - match: { unbalanced: true, debit: [{ account: cash, amount: 400000 }, { account: accumulated_depreciation_equipment, amount: 240000 }, { account: depreciation_expense, amount: 60000 }], credit: [{ account: equipment, amount: 720000 }] }
    no_misconception: 書いた行はすべて合っていて、売却損の行だけを書いていない。差額の扱いの誤解ではなく書き漏れ(Issue #422)
    feedback: 書いた行は合っていますが、左の合計700,000と右の備品720,000がそろっていません。帳簿価額より安く売れた分の20,000を、固定資産売却損として左に足しましょう。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも720,000にしましょう。
hint: 左に現金400,000、備品減価償却累計額240,000、減価償却費60,000、固定資産売却損20,000。右に備品720,000です。
success: 備品と累計額が消えました。損益計算書には、半年使った分の減価償却費60,000と、固定資産売却損20,000が別々に載っています。
```

## 今年の分を書かなかったら
もし今年の分の減価償却費を書かずに、現金400,000と累計額240,000だけで仕訳したらどうなるでしょう。右の備品720,000との差は、すべて固定資産売却損になります。

そのときの固定資産売却損の金額を計算してみましょう。

```task
type: calc
question: 今年の分の減価償却費を書かずに仕訳すると、固定資産売却損はいくらになりますか(円)
answer: 80000
wrong_patterns:
  - match: 20000
    no_misconception: 正しい仕訳の売却損を答えた問いの読み違いで、考え方の誤解ではない
    feedback: それは今年の分60,000を減価償却費として書いたときの売却損です。書かなかった場合の差額を計算しましょう。
  - match: 60000
    no_misconception: 減価償却費の金額を答えた問いの読み違いで、考え方の誤解ではない
    feedback: それは今年の分の減価償却費です。書かなかった場合は、この60,000も売却損に含まれてしまいます。
  - match: 320000
    misconception: sale_gain_loss_vs_cost
    feedback: 400,000を取得原価の720,000と比べています。累計額240,000は左で消すので、差は720,000 − 400,000 − 240,000です。
hint: 720,000 − 400,000 − 240,000。
success: 売却損は80,000円になります。費用の合計は、正しい仕訳の60,000 + 20,000と同じです。ただ、半年使った分まで「安く売って損をした」と読めてしまいます。使った分は減価償却費、売った金額と帳簿価額のずれは売却損と分けておくと、損益計算書からそれぞれが読み取れます。
```

## スクーターはいくらの益?
3か月後の12月31日、豆を問屋へ取りに行くのに使っていたスクーター([[vehicle|車両運搬具]])も売ることにしました。問屋が店まで届けてくれるようになったからです。

スクーターの取得原価は360,000円、期首の[[accumulated_depreciation_vehicle|車両運搬具減価償却累計額]]は108,000円、1年分の減価償却費は72,000円です。知り合いの店が210,000円で買ってくれます。

今度は自分で、今年の分、売る日の帳簿価額、売った金額との差の順に計算してみましょう。帳簿価額より高く売れるなら[[gain_on_sale_of_fixed_assets|固定資産売却益]]です。

```task
type: calc
question: 12月31日にスクーターを210,000円で売ると、固定資産売却益はいくらですか(円)
answer: 12000
wrong_patterns:
  - match: -42000
    misconception: sale_ignores_current_depreciation
    feedback: 210,000を期首の帳簿価額252,000と比べています。4月から12月までの9か月分の減価償却費を先に引くと、売る日の帳簿価額は210,000より小さくなります。
  - match: 42000
    misconception: sale_ignores_current_depreciation
    feedback: 210,000を期首の帳簿価額252,000と比べています。4月から12月までの9か月分の減価償却費を先に引くと、売る日の帳簿価額は210,000より小さくなります。
  - match: 30000
    misconception: forgot_monthly_proration
    feedback: 今年の分を1年分の72,000で計算しています。使ったのは4月から12月までの9か月です。
  - match: -24000
    misconception: proration_counts_remaining_months
    feedback: 今年の分を、売った後の1月から3月の3か月分で計算しています。費用にするのは、期首の4月から売った12月までの9か月分です。
  - match: 24000
    misconception: proration_counts_remaining_months
    feedback: 今年の分を、売った後の1月から3月の3か月分で計算しています。費用にするのは、期首の4月から売った12月までの9か月分です。
  - match: 210000
    misconception: sale_proceeds_is_gain
    feedback: 210,000は受け取る代金で、もうけではありません。売る日の帳簿価額との差だけが売却益です。
  - match: -150000
    misconception: sale_gain_loss_vs_cost
    feedback: 210,000を取得原価の360,000と比べています。比べる相手は、累計額と今年の分を引いた売る日の帳簿価額です。
  - match: 150000
    misconception: sale_gain_loss_vs_cost
    feedback: 210,000を取得原価の360,000と比べています。比べる相手は、累計額と今年の分を引いた売る日の帳簿価額です。
  - match: -12000
    misconception: sale_gain_loss_confused
    feedback: 金額は合っています。売る日の帳簿価額198,000より高い210,000で売れるので、損ではなく益です。マイナスを付けずに答えましょう。
  - match: 198000
    no_misconception: 売る日の帳簿価額をそのまま答えた問いの読み違いで、考え方の誤解ではない
    feedback: それは売る日の帳簿価額です。売る金額210,000との差を答えましょう。
  - match: 54000
    no_misconception: 今年の分の減価償却費を答えた問いの読み違いで、考え方の誤解ではない
    feedback: それは今年の分の減価償却費です。ここから売る日の帳簿価額を出し、210,000と比べましょう。
  - match: 6000
    no_misconception: 月数の数え違いで、考え方の誤解ではない
    feedback: 今年の分を8か月で計算しています。4月と12月の両端を入れて数えると、4月から12月までは9か月です。
  - match: 18000
    no_misconception: 月数の数え違いで、考え方の誤解ではない
    feedback: 今年の分を10か月で計算しています。4月と12月の両端を入れて数えると、4月から12月までは9か月です。
hint: 今年の分は72,000 × 9 ÷ 12 = 54,000。売る日の帳簿価額は360,000 − 108,000 − 54,000 = 198,000。210,000 − 198,000を計算します。
success: 今年の分は54,000円、売る日の帳簿価額は198,000円、固定資産売却益は12,000円です。今年の分を引き忘れると、期首の帳簿価額252,000円と比べて42,000円の損に見えてしまうところでした。
```

## スクーターを売る
スクーターを210,000円で売りました。代金は来月受け取る約束なので、[[accounts_receivable_other|未収入金]]です。

消すもの、今年の分、受け取る権利、差額。マシンのときと同じ部品を、自分で組み立ててみましょう。今度の差額は右側に出ます。

```task
type: post
transaction: 12月31日、スクーター(車両運搬具。取得原価360,000円、期首の減価償却累計額108,000円、1年分の減価償却費72,000円)を210,000円で売却し、代金は来月受け取ることにした。当期分の減価償却費は月割りで計上する
answer:
  debit:
    - { account: accounts_receivable_other, amount: 210000 }
    - { account: accumulated_depreciation_vehicle, amount: 108000 }
    - { account: depreciation_expense, amount: 54000 }
  credit:
    - { account: vehicle, amount: 360000 }
    - { account: gain_on_sale_of_fixed_assets, amount: 12000 }
alternatives:
  - debit:
      - { account: accounts_receivable_other, amount: 210000 }
      - { account: accumulated_depreciation, amount: 108000 }
      - { account: depreciation_expense, amount: 54000 }
    credit:
      - { account: vehicle, amount: 360000 }
      - { account: gain_on_sale_of_fixed_assets, amount: 12000 }
wrong_patterns:
  - match: { swapped: true }
    misconception: outflow_on_debit
    feedback: 増えた未収入金は左、手放した車両運搬具は右です。左右を入れ替えてみましょう。
  - match: { credit: [{ account: sales }] }
    misconception: asset_sale_is_sales
    feedback: 売上は商品を売ったときだけの科目です。スクーターは店で使っていた資産なので、右では車両運搬具を消し、差は固定資産売却益にします。
  - match: { debit: [{ account: accounts_receivable }] }
    misconception: nontrade_as_trade
    feedback: 売掛金は商品を売ったときの科目です。スクーターのような商品以外の物を売った代金は未収入金を使います。
  - match: { debit: [{ account: cash }] }
    no_misconception: 代金を受け取る日の読み落としで、考え方の誤解ではない
    feedback: 代金を受け取るのは来月です。きょうはまだ現金は増えていないので、後で受け取る権利である未収入金を左に書きます。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets, amount: 42000 }] }
    misconception: sale_ignores_current_depreciation
    feedback: 210,000を期首の帳簿価額252,000と比べています。4月から12月までの54,000を減価償却費として左に書くと、差は右側に12,000出ます。
  - match: { debit: [{ account: depreciation_expense, amount: 72000 }] }
    misconception: forgot_monthly_proration
    feedback: 72,000は1年分です。今年使ったのは4月から12月までの9か月なので、減価償却費は54,000です。
  - match: { debit: [{ account: depreciation_expense, amount: 18000 }, { account: loss_on_sale_of_fixed_assets }] }
    misconception: proration_counts_remaining_months
    feedback: 18,000は、売った後の1月から3月の3か月分です。費用にするのは、期首の4月から売った12月までの9か月分の54,000です。そうすると差は損ではなく、右側に益として出ます。
  - match: { debit: [{ account: depreciation_expense, amount: 18000 }] }
    misconception: proration_counts_remaining_months
    feedback: 18,000は、売った後の1月から3月の3か月分です。費用にするのは、期首の4月から売った12月までの9か月分の54,000です。
  - match: { debit: [{ account: accumulated_depreciation_vehicle, amount: 162000 }] }
    no_misconception: 当期分を累計額に積んでから消す2つの仕訳をまとめた形で、考え方の誤解ではない
    feedback: 考え方は合っています。ただ、この仕訳では今年の分54,000を累計額に積んでいないので、消す累計額は期首の108,000です。54,000は減価償却費として左に書きましょう。
  - match: { debit: [{ account: accumulated_depreciation, amount: 162000 }] }
    no_misconception: 当期分を累計額に積んでから消す2つの仕訳をまとめた形で、考え方の誤解ではない
    feedback: 考え方は合っています。ただ、この仕訳では今年の分54,000を累計額に積んでいないので、消す累計額は期首の108,000です。54,000は減価償却費として左に書きましょう。
  - match: { credit: [{ account: accumulated_depreciation_vehicle }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。期首までの108,000は消すので左に書き、今年の分54,000は累計額に積まず減価償却費として左に書きます。
  - match: { credit: [{ account: accumulated_depreciation }] }
    misconception: contra_always_credit
    feedback: 累計額を右に書くと、さらに積み増すことになります。期首までの108,000は消すので左に書き、今年の分54,000は累計額に積まず減価償却費として左に書きます。
  - match: { credit: [{ account: gain_on_sale_of_fixed_assets, amount: 210000 }] }
    misconception: sale_proceeds_is_gain
    feedback: 210,000がまるごともうけではありません。売る日の帳簿価額198,000のスクーターを手放しているので、売却益は差の12,000です。
  - match: { credit: [{ account: vehicle, amount: 198000 }] }
    misconception: accumulated_depreciation_left_on_sale
    feedback: 車両運搬具は取得原価の360,000で帳簿に載っています。右で360,000をすべて消し、累計額108,000は左で消しましょう。
  - match: { credit: [{ account: vehicle, amount: 210000 }] }
    misconception: asset_removed_at_sale_price
    feedback: 消すのは売った金額ではなく、帳簿に載っている金額です。車両運搬具は取得原価の360,000を右で消します。
  - match: { debit: [{ account: loss_on_sale_of_fixed_assets }] }
    misconception: sale_gain_loss_confused
    feedback: 売る日の帳簿価額は198,000で、売った金額は210,000です。帳簿価額より高く売れたので、売却損ではなく固定資産売却益を右に書きます。
  - match: { debit: [{ account: accumulated_depreciation_equipment }] }
    misconception: accumulated_depreciation_any_asset
    feedback: 備品減価償却累計額は、マシンの価値の減りを積んでいた科目です。スクーターを売るときに消すのは車両運搬具減価償却累計額です。
  - match: { credit: [{ account: equipment }] }
    misconception: vehicle_is_equipment
    feedback: 備品はマシンのような機器の科目です。スクーターは車両運搬具なので、右では車両運搬具360,000を消します。
  - match: { unbalanced: true, debit: [{ account: accounts_receivable_other, amount: 210000 }, { account: accumulated_depreciation_vehicle, amount: 108000 }, { account: depreciation_expense, amount: 54000 }], credit: [{ account: vehicle, amount: 360000 }] }
    no_misconception: 書いた行はすべて合っていて、売却益の行だけを書いていない。差額の扱いの誤解ではなく書き漏れ(Issue #422)
    feedback: 書いた行は合っていますが、左の合計372,000と右の車両運搬具360,000がそろっていません。帳簿価額より高く売れた分の12,000を、固定資産売却益として右に足しましょう。
  - match: { unbalanced: true }
    feedback: 左の合計と右の合計がそろっていません。どちらも372,000にしましょう。
hint: 左に未収入金210,000、車両運搬具減価償却累計額108,000、減価償却費54,000。右に車両運搬具360,000と固定資産売却益12,000です。
success: 車両運搬具と累計額が消え、未収入金210,000が現れました。損益計算書の減価償却費は、マシンの60,000とスクーターの54,000で114,000になっています。
```

## ふりかえり
期中に固定資産を売るときは、期首から売った日までの減価償却費を月割りで計上してから、取得原価と累計額を帳簿から消します。今年の分は累計額に積まず、減価償却費としてそのまま左に書きます。

売った金額と比べるのは、期首の帳簿価額ではなく、今年の分まで引いた売る日の帳簿価額です。今年の分を書き忘れても費用の合計は変わりませんが、使った分と、売った金額とのずれの区別がつかなくなります。

月割り計算は[[straight_line_method|定額法]]の単元にも出てきました。買った年は買った月から決算まで、売る年は期首から売った月まで。どちらも、その年に使った月数を数えています。

年度の最初の日に売れば今年の分はゼロで、前の単元の仕訳になります。期首の売却は、期中売却のうち使った月数がゼロの場合だと言えます。

固定資産のテーマはここまでです。次のテーマ「貸倒れ」では、掛けで売った代金を回収できなくなったときの記帳を学びます。
