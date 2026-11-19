# 0012. mainは直線の履歴にし、統合はPRのsquashだけにする

日付: 2026-11-19
状態: 採用(ユーザー決定2026-11-19)

## 背景
Issueの実装は無人ループ(`scripts/issue-agent.sh`)がworktreeで行い、1日に20〜40件をmainへ統合している。統合は`git merge --no-ff`で、並列のワーカーがmainに追いつくためのマージもブランチ側に作っていた。

2026-11-19時点のmainは1,297コミットで、うち770件がマージコミット、354件が「Merge branch 'main' into worktree-issue-N」だった。`git log --first-parent`で読めば1 Issueが1行に並ぶが、素の`git log`と`git bisect`は読みにくく、revertには`-m 1`が要った。

リポジトリは公開済みだが、star・fork・watcherはどれも0で、デプロイもしていない。履歴を書き換えるなら利用者が付く前がよい。

## 決定
- **mainは直線の履歴にし、1コミット = 1 Issueにする。** 件名は`<Issueの題名> (#N)`。どのコミットも関門(`make check`)を通った状態なので、`git bisect`は途中の壊れたコミットに当たらず、取り消しは`git revert <sha>`で済む。
- **統合はPRのsquashで行う。** issue-agentはブランチをpushしてPRを作り、`gh pr merge --squash`でマージする。レビュー往復ごとのコミットはmainに入らないが、PRのページに残る。経緯はIssueのコメントと`logs/`にもある。
- **マージは統合ロックの中ですぐに行い、auto-mergeは使わない。** ロックの中で「mainを取り込む → 関門 → PRを作る → squash」を続けて行うので、E2Eまで通したツリーがそのままmainになる。auto-mergeはCIを待つ間にmainが進んでもマージするので、この保証が崩れる。`--match-head-commit`で、関門を通したコミット以外がマージされないようにする。
- **CIは必須チェックにしない。** CI(ADR 0005)の検査は関門が同じ内容をローカルで通している。必須にすると統合の直列部分が1件あたり約2分延びる。
- **worktreeがmainに追いつく方法はmergeのままにする。** squashすれば追いつき用のマージはmainに出ない。rebaseは往復のコミットごとに競合が起き、レビューが見たコミットのSHAも変わるので使わない。
- **取り込みで競合したら`agent:needs-human`に落とす。** worktreeは残す。モデルに解消させると、レビューを通っていない変更がmainに入る。同じファイルを触るIssueはblocked-byで直列にして避ける。
- **GitHubのrulesetでmainを守る。** PR必須(承認の必須数は0)、統合方式はsquashだけ、直線の履歴を必須、force pushと削除を禁止。承認が0なのは、ループがリポジトリ管理者の認証で動いていて、自分のPRを自分で承認できないため。PR必須はレビューの強制ではなく、記録と統合方式の強制として働く。
- **管理者はrulesetをバイパスして直接pushできる。** 一人で開発している間は、数分で直せる修正をPRなしでmainにコミットする。直接pushするときもマージコミットは作らない。外部の貢献者が来たらバイパスを外す。
- **`production`はfast-forwardのpushだけで進める(ADR 0006のまま)。** mainが直線なので`production`は常にmainの祖先になり、公開中のイメージのSHAがmainのコミットと一致する。PRにはしない。GitHubのPRマージはfast-forwardができず、`production`にmainにないコミットができるため。rulesetでforce pushと削除を禁止し、直接のコミットはしない。
- **公開の承認はGitHub Environmentsで行う。** 公開のワークフローのデプロイジョブを`environment: production`にし、必須レビュアーを置く。`production`が進んでも、人が承認するまでデプロイは始まらない。設定はADR 0006の成果物(公開のワークフロー)を作るときに入れる。
- **リリースのタグは打たない。** 公開の履歴は`production`のActions実行とGHCRのイメージで追える。リリースノートが必要になった時点で決める。

## 既存の履歴の書き換え
2026-11-19に、それまでのmainを直線に作り直した。

- mainの線に沿った474コミットを、同じツリー・同じ日時のまま親1つのコミットとして作り直した。各時点の内容は変わっていない。最終ツリーが旧mainと一致することを`git diff`で確かめた。
- 追いつき用のマージがfast-forwardでmainになっていた5箇所は、その地点だけmain側の親を辿り、ブランチ側の変更を1コミットにまとめた。
- 件名が「Merge …」だった8コミットは、まとめたコミットの件名かIssueの題名に直した。
- 旧mainは`backup/pre-linear`タグとしてoriginに残す。書き換え前にIssueのコメントへ書かれたSHAは、このタグから辿れる。新しいコミットとの対応は件名の`(#N)`で引く。

## 影響
- レビュー往復の経過を`git log`で追えなくなる。追うときはPRを見る。
- 2026-11-19より前のIssueコメントにあるSHAは、mainではなく`backup/pre-linear`の側にある。
- `scripts/issue-agent.sh`の`ISSUE_PUSH=0`はPRを作らず、ローカルで`git merge --squash`をする。結果のツリーと件名は同じになる。
