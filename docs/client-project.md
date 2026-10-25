# KEY PHOTO 宮古島 管理台帳

確認日：2026-09-27。秘密値・顧客のアクセス実績はこの公開Repositoryに保存しない。

## 基本情報

|項目|確認済みの内容|
|---|---|
|顧客名|KEY PHOTO 宮古島|
|Project名|space-inada（既存名を継続）|
|GitHub Repository|umigame-kyoudai/space-inada（公開Repository）|
|既存公開Project|Vercel / Umigame Kyoudai / space-inada|
|ドメイン|keyphotomiyakojima.com。旧space-inada.comから恒久転送|
|Supabase|今回のSEO・登録作業では不要・未追加|
|決済|今回の作業では不要・未追加|
|外部サービス|既存GA4・Google Search Console。今回Bing Webmaster Toolsの確認タグを追加|
|将来の引き渡し|コードは顧客別Repositoryに分離。ドメインの登録名義・外部サービスの権限移管条件は未確認|

## 現状と公開方針

- 公開URL：https://keyphotomiyakojima.com/
- 既存Project ID：`prj_5ZWrMVAw7PxwyCWM86RQ2leVhLJO`
- 既存Team ID：`team_AVkVeJGhky3xEi61HxtzJ2IX`、slug：`umigame-kyoudai`
- DNS：`ns1.vercel-dns.com` / `ns2.vercel-dns.com`
- 新規公開・移行時の目標は、顧客別GitHub RepositoryとCloudflareの直接連携。今回の作業はSEO保守と検索登録で、Cloudflareへの移行やDNS切替は行わない。
- ドメインや契約を購入・更新・移管する場合は、対象と料金を提示して別途承認を得る。

## 登録・運用

- Google Search Console：新旧ドメインとも確認済み。2026-07-15から旧→新のアドレス変更が進行中。
- 新ドメインの `sitemap.xml`（59URL）・`feed.xml` は送信・取得成功済み。
- Bing：`src/app/layout.tsx` の `verification.other["msvalidate.01"]` は公開用の所有権確認値。検証後も削除しない。API秘密キーではない。
- 2026-09-27にBingの所有権確認、サイトマップ送信、主要10URLの手動送信を完了。Googleにも未登録7URLの登録をリクエストし、受付を確認。検索結果への反映とは区別する。
- Googleマップには「宮古島星空フォトツアーkey photo」の既存プロフィールがある。電話番号・Instagramで公式サイトとの対応を確認。新規の重複プロフィールは作らない。
- Googleマップのウェブサイトを公式URLに変更する提案は2026-09-27受付済み・審査待ち。プロフィール全体の管理権限は現在のアカウントにない。
- 日時別アクセスの分析資料は非公開Google Driveとローカル `output/` に保存。定期実行は設定していない。

## 2026-09-27のSEO公開記録

- 実装commit：`7d6ccb4`（GitHub mainへ反映済み）
- 本番Deployment：`dpl_2R7mVJovwjNAm6LzkZL5xzc7Xj1f`
- 公開先：既存 `keyphotomiyakojima.com`。Project・DNSの変更なし。
- 検証：lint/build成功、本番8ページのメタデータ、390pxのモバイル表示、予約画面への遷移、GA4タグの読み込み。

## 2026-09-27のLINE予約引き継ぎ

- 公式LINEの友だち追加URL：`https://lin.ee/5z6HX4S`。転送先のID `@066lfrkd` とプロフィール名「key photo」を確認。
- 予約フォームのメインボタンとスマホ固定ボタンは、`https://line.me/R/oaMessage/%40066lfrkd/?{URLエンコードした予約文}` で入力内容を公式トークに引き継ぐ。実際の送信は利用者がLINE上で行う。
- 日本語・英語・繁体字・韓国語に同じ導線を適用。スタッフの管理ツールが読む日本語の予約文・ラベル・紹介コードは維持する。
- 個人情報を含む予約文は解析イベントやリンクの `href` に入れない。クリック時に遷移URLを組み立て、解析には本文なしの宛先のみを記録する。
- LINE URLスキームの対象はスマートフォンのiOS/Android版。パソコンや内容が引き継がれない場合向けに、コピー・公式LINEを開く補助操作を残す。
- 検証：lint/build成功。ブラウザで必須チェック、予約全文と特殊文字の引き継ぎURL、編集・復元後の内容、撮影休止日・人数上限、補助コピー、4言語、320/390/1440px幅を確認。スマートフォンのLINEアプリ内の最終表示・送信は未確認。
- 公開先は既存Projectの更新として扱い、Cloudflareへの移行やDNS切替は行わない。
- 実装commit：`af717e8`（GitHub main反映済み）。本番Deployment：`dpl_GWvhDTVjndpYKwsXnxNY82ZGmjxk`、状態READY。
- 公開後の `https://keyphotomiyakojima.com/booking` はHTTPS 200。本番でも上記フォーム動作と画像読み込みを確認し、ブラウザの実行時エラーは0件。確認時点の当該Deploymentのエラーログは0件。
- 仕様：https://developers.line.biz/ja/docs/line-login/using-line-url-scheme/

## 2026-09-27の予約日カレンダー統合

- 端末標準の日付入力と折りたたみカレンダーを、常時表示のカレンダー1つに統合。日付欄の左右幅を他の入力欄に揃えた。
- `○ 受付可能`、`× 受付不可（撮影休止日）`、`— 受付終了`を同じ月表示に出す。受付不可・過去日は選択できず、選択日はチェックと年月日で確認できる。
- 対象は既存の2026年休止日データ（`src/data/availability.ts`）。満席などのリアルタイム在庫との連携ではなく、実際の空き状況・撮影可否は引き続きLINEで確定する。
- 選択日を予約文・自動保存・必須チェックに連携。過去日・休止日・不正な日付が端末に保存されていても、LINEへ進む前に選び直す。
- 年間データを更新する際は、`AVAILABILITY_YEAR`と休止日一覧をあわせて更新する。
- 検証：lint/build成功。Chrome・WebKit 26.5で320/375/390/430pxの左右位置、1440px表示、4言語、休止日・過去日の選択防止、未選択時の案内、保存・復元、キーボード操作、LINEに渡す日付を確認。
- 実装commit：`ab6fb3f`（GitHub main反映済み）。本番Deployment：`dpl_2eXr3sKTAGRJ6Txgzm3tjLG6tMcD`、状態READY。
- 公開後も予約ページのHTTPS 200、WebKitでの320/390px表示、休止日の選択防止、選択日入りのLINE引き継ぎURLを確認。ブラウザ実行時エラー・当該Deploymentのエラーログは確認時点で0件。

## 引き渡し手順

1. 顧客とRepository・公開Project・新旧ドメインの対応を再確認する。
2. ドメインの登録名義、Googleビジネスプロフィールの所有者、各検索サービスの所有権を確認する。
3. 引き渡し先への権限付与と環境変数の移設は、移管時の承認の下で行う。秘密値はGitやこの台帳に記録しない。
4. 旧ドメインの転送、canonical、サイトマップ、GA4計測を移管後にも検証する。

## 2026-10-25 全管理の引き継ぎ準備

- ユーザー意向：いなちゃんへサイトと管理全体を引き継ぐ。コード・公開・ドメイン・予約管理・解析・請求を本人が管理できる状態を目標とする。
- 受け取り先：GitHub・Cloudflareは未作成の可能性あり。Googleアカウントは持っているはずとの回答。正確なアカウント・メールアドレスは未確認。
- GitHub APIで公開Repository `umigame-kyoudai/space-inada` と管理権限、既定ブランチ `main` を確認。リモートmainは `b8aeb3b1ddad49b59c26e6900f08d022067e7e41`。
- Vercel APIとHTTPS応答で、現行Projectと本番Deployment `dpl_2eXr3sKTAGRJ6Txgzm3tjLG6tMcD` を再確認。本番トップは200、旧ドメインのトップは現URLへ308。
- 新旧ドメインともVercel管理、DNSはVercelのネームサーバー、自動更新ON。確認時点の期限は新ドメイン2027-07-15、旧ドメイン2027-06-06。登録名義・移管ロック・移管料・更新料は未確認。
- 予約台帳「星空フォト予約管理」の存在と所有権をDriveで確認。個別の所有者・共有情報は公開Repositoryへ追加せず非公開記録に保存する。Apps Script公開版とカレンダーの実稼働状態は未確認。
- 引き継ぎ手順・更新方法・完了条件は [HANDOVER.md](HANDOVER.md) を参照。
- 今回は資料準備まで。所有権・権限・請求・DNS・公開先は変更していない。Cloudflareプレビューも未作成。

## 2026-10-25 受け取り先回答の反映

- 本人からGoogle・GitHub・Cloudflareの準備情報を受領。メールアドレスは非公開台帳に記録。
- GitHub受け取り先は `keyphoto-miyakojima`。公開APIでユーザーの存在を確認。公開リポジトリ一覧は空だが、非公開の同名Repositoryがないことまでは確認していない。
- 本人回答：予約カレンダー「星空予約管理」（本人アカウントのメインカレンダー）、連携Apps Script、公式LINE `@066lfrkd` は本人が管理・運用。既存運用を継続し、移管・再作成を前提にしない。
- Driveで再確認した予約台帳「星空フォト予約管理」は引き継ぎ元所有。本人が現在使う予約台帳・公開アプリのURLと接続先を照合するまで、データのコピーや共有変更は行わない。
- Cloudflareは登録メール受領済みだが、対象Account ID・作業権限・GitHub接続は未確認。
- 本体Repositoryは引き続き `umigame-kyoudai/space-inada` 所有。GitHub移管、招待、DNS切替、請求変更、顧客へのメッセージ送信は未実施。

## 2026-10-25 Cloudflare招待の受け取り確認

- ユーザーから招待受け取りの連絡・画面を受領。Cloudflare管理画面で本人側アカウントにアクセスできることを確認。
- 作業担当はアクティブで、権限ポリシーは `Administrator`、適用先はアカウント全体。新しい権限の追加や変更は実施していない。
- 引き継ぎ先のAccount ID・メンバー情報は非公開台帳に記録。旧管理側アカウントと混同しない。
- 招待・作業権限の準備は完了。GitHub接続・Cloudflareプレビュー・サイト公開先・DNS・ドメイン登録・請求の移行は未実施。

## 2026-10-25 Cloudflare確認用サイトの公開

- 顧客所有CloudflareアカウントにWorker `keyphoto-miyakojima-preview` を作成。
- 確認URL: https://keyphoto-miyakojima-preview.miyako-keyphoto.workers.dev/
- Next.jsを維持し、OpenNext経由でWorkersに公開。86ページの静的生成、動的予約ページ、写真・動画、4言語を確認。プレビューはnoindex・GA4無効。
- 設定・GitHub直接連携の手順・本番切替前の確認事項は [CLOUDFLARE.md](CLOUDFLARE.md)。GitHubの自動公開は未接続。
- 既存本番・独自ドメイン・DNSは変更していない。有料プラン・R2・Images契約は追加していない。
