---
id: birth-of-double-entry/venture-profit-and-double-entry
title: 航海の儲けと複式の発見
summary: 1386年、胡椒の航海1口のもうけを知るために商品ごとのページを作り、写し忘れに悩んだ末に、1つの出来事を2つのページへ同じ額で書く複式の記録にたどり着く
level: 1
order: 2
kind: history
introduces: [venture_accounting, double_entry]
concepts: [memorandum_book, personal_account, debit_credit, journal_entry]
requires: [birth-of-double-entry/memorandum-and-personal-accounts]
sources:
  - title: ルカ・パチョーリ『スンマ』(1494年)第9部第11論
    note: 商品ごとの勘定と、左右の合計の一致による検算。『スンマ』はもうけを利益と損失の勘定に集めてから元手へ移す手順を書いており、この単元の直接元手へ移すやり方は次の単元で改める。原典はパブリックドメイン
  - title: John B. Geijsbeek, Ancient Double-Entry Bookkeeping (1914)
    note: 『スンマ』簿記論の英訳と解説。パブリックドメイン
  - title: 渡邉泉『会計の歴史探訪』(同文舘出版)
    note: 口別計算から期間計算への流れ
scenario:
  company: ヴェネツィアの商人バルトロメオの店
  era: 1386年春、ヴェネツィア。アレクサンドリアからの船が戻った
  currency: ドゥカート
  view: ledger
  accounts:
    - { id: giovanni, name: ジョヴァンニ, element: asset, why: 彼がこちらに負う残高を置く人名勘定です。, concepts: [personal_account] }
    - { id: matteo, name: マッテオ, element: asset, why: 彼がこちらに負う残高を置く人名勘定です。, concepts: [personal_account] }
    - { id: pepper_voyage, name: 胡椒(アレクサンドリア航海), reading: [こしょう], element: asset, mixed: true, why: 航海1口にかかった額と売った額を集め、差がもうけになる口別の勘定です。, concepts: [venture_accounting] }
    - { id: wine_voyage, name: ワイン(クレタ航海), element: asset, mixed: true, why: 航海1口にかかった額と売った額を集め、差がもうけになる口別の勘定です。, concepts: [venture_accounting] }
    - { id: owner_capital, name: 元手, reading: [もとで], element: equity, why: 商人が店に入れた財産と、そこに積み上がったもうけです。, concepts: [equity] }
  opening:
    - { account: cash, amount: 300 }
    - { account: giovanni, amount: 70 }
    - { account: matteo, amount: 20 }
    - { account: owner_capital, amount: 390 }
---

## 胡椒の商いでいくらもうかった?
```illustration
merchant-ship
```
前の単元の3月から1年がたち、1386年の春です。この1年の間に、店はニッコロに布の代金の残り20[[ducat]]を払い終えました。マッテオには新しく布を20で売り、代金はまだ受け取っていません。ジョヴァンニの70はそのままです。

そこへ、アレクサンドリアから船が戻りました。バルトロメオは胡椒50袋を120で買い付け、運賃に20、関税に10を払っています。この春、胡椒はジョヴァンニに20袋を60で、さらに10袋を30で、マッテオに20袋を90で売れました。ジョヴァンニへの60と30は前の単元の3月と同じ数字ですが、1年あとの別の売りです。

バルトロメオが聞きます。「で、胡椒の商いはいくらもうかった?」

結果の元帳には、前の商いから続く2人の[[personal_account|人名勘定]]があります。ジョヴァンニは70、マッテオはこの1年の間に売った布の20です。ニッコロには払い終え、こちらが負う分は無くなりました。開いても、ジョヴァンニとマッテオがいくら負っているかしか分かりません。[[memorandum_book|覚え書き]]に戻れば行は拾えますが、胡椒のことだけをまとめたページはどこにもないのです。

## 航海1口のページ
```illustration
pepper-sack
```
商人たちは、人だけでなく商いの1口ごとにもページを作りました。航海1回分の胡椒のページを開き、左にその航海にかかった額を、右に売った額を書きます。左右の差が、その1口のもうけです。この数え方を[[venture_accounting|口別計算]]と呼びます。

| 胡椒(アレクサンドリア航海)にかかった | ドゥカート | 売った | ドゥカート |
|---|---|---|---|
| 胡椒50袋を買った | 120 | ジョヴァンニに20袋 | 60 |
| 運賃 | 20 | ジョヴァンニに10袋 | 30 |
| 関税 | 10 | マッテオに20袋 | 90 |

```task
type: calc
question: この航海の胡椒で、いくらもうかったか(ドゥカート)
answer: 30
wrong_patterns:
  - match: 180
    misconception: venture_sales_as_profit
    feedback: 180は売った額の合計です。胡椒を買い、運び、関税を払った分を引かないと、もうけにはなりません。
  - match: 60
    misconception: venture_costs_only_price
    feedback: 胡椒の代金120だけを引いています。運賃20と関税10も、この航海の胡椒を売るためにかかった額なので、左に入れて引きます。
  - match: 150
    feedback: 150はかかった額の合計です。売った額180から引きましょう。
hint: 右の合計(売った額)から左の合計(かかった額)を引きます。運賃と関税も左です。
success: 30ドゥカートです。航海1口が終わるたびに、その口のもうけが1つの数字で出ます。
```

## 写し忘れ
ところで、このページはあなたが覚え書きから写したものです。もし「マッテオに20袋 90」をマッテオのページには写したのに、胡椒のページに写し忘れていたら、どうなるでしょう。胡椒のページの右はジョヴァンニへの60と30、合計90だけになり、左の150に届かないので、この航海は60の損に見えます。ページは何も教えてくれません。

商人たちが見つけた工夫はこうです。1つの出来事を、必ず2つのページに、同じ額で、片方は左、片方は右に書く。「マッテオに胡椒20袋を90で売った」なら、マッテオのページの左に90(彼がこちらに負う)、胡椒のページの右に90(売った)。

すべての出来事をこう書けば、帳簿中のページの左の合計と右の合計は必ず同じになります。合わなければ、どこかに写し忘れか写し間違いがあると分かるのです。

これが[[double_entry|複式簿記]]です。前の単元で見たとおり、どのページも左側が[[debit_credit|借方]]、右側が貸方です。マッテオへの売りなら、マッテオのページの借方(左)に90、胡椒のページの貸方(右)に90。1つの出来事をこのように借方と貸方の組で書いた記録が[[journal_entry|仕訳]]です。

まず、航海の初めの3件をこの形で写しました。胡椒を買った120、運賃20、関税10は、どれも胡椒のページの左と現金のページの右です。前の単元で「この店にはまだない」と言った左右2列の記録が、ワークスペースの[[journal|仕訳帳]]と結果の元帳に現れました。

```figure
type: flow
alt: 覚え書きの1行が、人名勘定の左と商品のページの右という2つのページに同じ額で写され、全ページの左右の合計が一致する
nodes: [覚え書きの1行, 2つのページに同じ額(左と右), 全ページの左の合計 = 右の合計]
highlight: 1
```

```task
type: observe
entries:
  - { memo: 胡椒50袋を120ドゥカートで買った, debit: [{ account: pepper_voyage, amount: 120 }], credit: [{ account: cash, amount: 120 }] }
  - { memo: 運賃20ドゥカートを払った, debit: [{ account: pepper_voyage, amount: 20 }], credit: [{ account: cash, amount: 20 }] }
  - { memo: 関税10ドゥカートを払った, debit: [{ account: pepper_voyage, amount: 10 }], credit: [{ account: cash, amount: 10 }] }
```

## 2つのページに書く
```illustration
quill
```
ジョヴァンニに胡椒20袋を60ドゥカートで売り、代金は後で受け取ります。[[journal|仕訳帳]]で、左に「ジョヴァンニ60」、右に「胡椒(アレクサンドリア航海)60」と入れて記帳してみましょう。

```task
type: post
transaction: ジョヴァンニに胡椒20袋を60ドゥカートで売った。代金は後で受け取る
answer:
  debit: [{ account: giovanni, amount: 60 }]
  credit: [{ account: pepper_voyage, amount: 60 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: personal_account_by_cash_direction
    feedback: 胡椒がジョヴァンニの手に渡ったからといって、彼のページが右にはなりません。売ったので彼がこちらに負い、彼のページは左、胡椒のページは売った側の右です。
  - match: { debit: [{ account: cash }] }
    feedback: 代金はまだ受け取っていません。いま増えたのは、ジョヴァンニがこちらに負う分です。
  - match: { unbalanced: true }
    feedback: 2つのページには同じ額を書きます。どちらも60にしましょう。
hint: 人名勘定の左は「彼がこちらに負う」、商品のページの右は「売った」です。
success: 記帳できました。結果の元帳で、ジョヴァンニのページの左と胡椒のページの右に、同じ60が入っています。
```

## 航海の残りを写す
```illustration
ledger
```
航海の残りの2件、ジョヴァンニへの10袋とマッテオへの20袋も、同じ形で写しました。人名勘定の左と胡椒の右です。

結果の元帳で胡椒のページを開いてください。左にかかった120、20、10、右に売った60、30、90が並び、2つ目のステップで作った表がそのまま帳簿になっています。試算の欄では、すべてのページの左の合計と右の合計が同じ数になっています。これが複式の検算です。

```task
type: observe
entries:
  - { memo: ジョヴァンニに胡椒10袋を30ドゥカートで売った, debit: [{ account: giovanni, amount: 30 }], credit: [{ account: pepper_voyage, amount: 30 }] }
  - { memo: マッテオに胡椒20袋を90ドゥカートで売った, debit: [{ account: matteo, amount: 90 }], credit: [{ account: pepper_voyage, amount: 90 }] }
```

## 写し忘れを見つける
```illustration
wine-barrel
```
次はクレタ島からのワインの航海です。10樽を仕入れ、ジョヴァンニに5樽、マッテオに3樽が売れたところです。見習いのあなたが写した5件のうち、1件を片方のページにしか写していません。試算の左右が合わないので、どこかにあるはずです。写し忘れた行を見つけて、足りない側を書き足しましょう。

```task
type: debug
entries:
  - { memo: ワイン10樽を80ドゥカートで買った, debit: [{ account: wine_voyage, amount: 80 }], credit: [{ account: cash, amount: 80 }] }
  - { memo: 運賃10ドゥカートを払った, debit: [{ account: wine_voyage, amount: 10 }], credit: [{ account: cash, amount: 10 }] }
  - { memo: ジョヴァンニにワイン5樽を50ドゥカートで売った, debit: [{ account: giovanni, amount: 50 }], credit: [] }
  - { memo: マッテオにワイン3樽を30ドゥカートで売った, debit: [{ account: matteo, amount: 30 }], credit: [{ account: wine_voyage, amount: 30 }] }
  - { memo: マッテオから30ドゥカートを受け取った, debit: [{ account: cash, amount: 30 }], credit: [{ account: matteo, amount: 30 }] }
answer:
  index: 2
  entry:
    debit: [{ account: giovanni, amount: 50 }]
    credit: [{ account: wine_voyage, amount: 50 }]
wrong_patterns:
  - match: { index: 4 }
    feedback: この行は現金の左とマッテオの右に同じ30があり、両側そろっています。
  - match: { index: 0 }
    feedback: この行はワインの左と現金の右に同じ80があり、両側そろっています。
  - match: { credit: [{ account: pepper_voyage }] }
    misconception: venture_account_mixed
    feedback: 売ったのはワインです。売った額はその商品の口の右に書くので、右は胡椒ではなくワイン(クレタ航海)のページです。
  - match: { credit: [{ account: cash }] }
    feedback: 代金はまだ受け取っていません。ジョヴァンニの左の50は、彼がこちらに負う分です。右に書くのは、売ったワインのページです。
hint: 左右の差はいくつでしょう。その額が片側にしか無い行を探します。
success: 見つけました。ジョヴァンニの左に50を書いたのに、ワインのページの右が空でした。右に50を足すと、試算の左右がそろいます。
```

## もうけを元手に移す
```illustration
coin-pouch
```
胡椒の航海は終わりました。胡椒のページは左150、右180で、右に30残っています。これがこの口のもうけです。航海が終わった口のページは閉じて、もうけを元手のページへ移します。左に「胡椒(アレクサンドリア航海)30」、右に「元手30」です。

ワインの航海はまだ終わっていません。10樽のうち2樽が売れ残っていて、ページは左90、右80です。左に残った10は損ではなく、売れ残った2樽の分を含んだ途中の数字です。口のもうけは売り切って初めて出るので、ワインのページは開いたままにします。

```task
type: post
transaction: 胡椒の航海のもうけ30ドゥカートを元手に移した
answer:
  debit: [{ account: pepper_voyage, amount: 30 }]
  credit: [{ account: owner_capital, amount: 30 }]
wrong_patterns:
  - match: { swapped: true }
    misconception: closing_side_confused
    feedback: 胡椒のページは右に30残っています。それを消すには反対の左に30を書き、相手の元手は右です。
  - match: { credit: [{ account: cash }] }
    misconception: profit_is_cash
    feedback: もうけは現金のページには書きません。胡椒の代金180はジョヴァンニとマッテオがこちらに負う分のままで、現金はまだ受け取っていません。もうけは現金が増えたことではなく、元手が増えたことなので、積み上がるのは元手です。
  - match: { debit: [{ amount: 180 }] }
    misconception: venture_sales_as_profit
    feedback: 180は売った額です。もうけは、かかった150を引いた30です。
  - match: { debit: [{ amount: 150 }] }
    feedback: 150はかかった額の合計です。元手へ移すのはもうけで、売った180から150を引いた30です。
  - match: { debit: [{ amount: 60 }] }
    misconception: venture_costs_only_price
    feedback: 60は胡椒の代金120だけを引いた額です。運賃20と関税10もこの航海にかかった額なので、180から150を引いた30を移します。
  - match: { debit: [{ account: wine_voyage }] }
    misconception: venture_account_mixed
    feedback: 元手に移すのは胡椒の航海のもうけです。もうけ30が右に残っているのは胡椒(アレクサンドリア航海)のページなので、左に30を書くのはワインではなく胡椒のページです。
  - match: { credit: [{ account: wine_voyage }] }
    misconception: venture_closed_before_end
    feedback: ワインの航海はまだ終わっていません。2樽が売れ残っているので、ワインのページの左に残った10は損ではなく途中の数字です。閉じるのは終わった胡椒の口だけで、ワインのページには書きません。
  - match: { unbalanced: true }
    feedback: 2つのページには同じ額を書きます。どちらも30にしましょう。
hint: 右に残った30を左に書いて消し、同じ30を元手の右に書きます。
success: 胡椒のページが0になり、元手が390から420に増えました。航海1口のもうけが、初めて元手に積み上がりました。ワインのページは2樽が売れ残っているので、開いたままです。
```

## まだ無いもの
複式の記録で、写し忘れは見つかるようになり、1口のもうけは元手に積み上がるようになりました。それでも、答えられない問いが残ります。

「今年はいくらもうかった?」 ワインのページがまだ開いているように、口別計算では航海が終わるまでもうけは出ません。2年がかりの航海なら、1年目のもうけは無いことになります。船そのものを買って10年使うなら、その代金はどの口にかかった額でしょうか。

この問いに答えるには、商いの1口ではなく「期間」で区切る考え方が要ります。それは200年あまり先、ネーデルラントの商人たちの間で形になります。船のように何年も使うものの代金を、使う年に割り振る考え方が広まるのは、さらに先の19世紀、鉄道会社の時代です。

## ふりかえり
商品のページで航海1口のもうけを数えるのが口別計算、1つの出来事を2つのページへ同じ額で書くのが複式簿記でした。複式の記録では全ページの左右の合計が一致し、合わなければ写し忘れがあると分かります。前の単元で「左と右の呼び名」と言った借方・貸方は、ページの左側・右側の名前のまま、1つの出来事をどのページの借方(左)とどのページの貸方(右)に書くかを言い表す言葉になりました。

いまの簿記の仕訳は、この「2つのページに同じ額」をそのまま受け継いでいます。いまの簿記で商品のもうけを1年ごとに数える仕方は、単元[「売れ残りと売上原価」](/units/merchandise/cost-of-goods-sold)で学べます。口別と期間、同じもうけを別の区切りで数えています。

次の単元では、100年あとの1494年に飛び、この方法が印刷された本になって広まる場面を見ます。
