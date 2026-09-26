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

## 引き渡し手順

1. 顧客とRepository・公開Project・新旧ドメインの対応を再確認する。
2. ドメインの登録名義、Googleビジネスプロフィールの所有者、各検索サービスの所有権を確認する。
3. 引き渡し先への権限付与と環境変数の移設は、移管時の承認の下で行う。秘密値はGitやこの台帳に記録しない。
4. 旧ドメインの転送、canonical、サイトマップ、GA4計測を移管後にも検証する。
