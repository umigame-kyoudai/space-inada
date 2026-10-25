# Cloudflare確認用サイト

更新：2026-10-25。独自ドメインの本番は従来の公開先を継続する。

## 公開先

- URL: https://keyphoto-miyakojima-preview.miyako-keyphoto.workers.dev/
- Worker: `keyphoto-miyakojima-preview`
- Account: `wrangler.jsonc` の `account_id` で固定した顧客所有アカウント。
- 更新ブランチ: `codex/cloudflare-handover-preview`。`main` は既存本番用。
- Next.js 16.4.3 / OpenNext Cloudflare 1.20.13 / Wrangler 4.152.0。
- 有料プラン、R2、Images契約は追加していない。静的生成データはWorkerの静的アセットに格納する。

## ビルドと手動公開

```sh
npm ci
npm run lint
npm run build:cloudflare
npm run deploy:cloudflare
```

`build:cloudflare` は `NEXT_PUBLIC_DEPLOYMENT_STAGE=preview` を設定し、全ページをnoindexにしてGA4を無効化する。既存の `npm run build` は従来のNext.jsビルドのまま。

OpenNextはローカル `.env` の値も出力へコピーする。そのためビルドの最終工程で `prepare-cloudflare-env.mjs` を実行し、Worker出力から非公開環境変数を除去する。プレビューではGA4 IDも除去する。サーバー用秘密値が必要になった場合はCloudflareのSecretとして設定し、コード・環境ファイル・資料へ保存しない。

ローカルのWorker確認は `npm run preview:cloudflare`。相手への確認URLには上記HTTPS URLを使用する。

## GitHubの直接連携（受取先の認証が必要）

2026-10-25：コードを専用ブランチへ保存し、`keyphoto-miyakojima` への所有権移管を申請済み。現在は `umigamekyoudai/space-inada` から本人への承認待ち。自動公開はまだ接続されていない。

1. GitHub Repositoryの所有権を `keyphoto-miyakojima` が受け取る。
2. 本人のGitHubでCloudflare Workers and Pagesアプリを認可する。対象Repositoryは `space-inada` だけを選ぶ。
3. 顧客のCloudflareで既存Worker `keyphoto-miyakojima-preview` を開き、設定のBuildsからRepositoryを接続する。新しいWorkerを重複作成しない。
4. リポジトリは `keyphoto-miyakojima/space-inada`、公開ブランチは `codex/cloudflare-handover-preview`、ルートはRepository直下。
5. ビルドコマンド: `npm run build:cloudflare`。デプロイコマンド: `npm run deploy:cloudflare`。Node.jsは24系を使用する。
6. このブランチへのpushが既存Workerへ反映されたことを、CloudflareのBuilds結果と公開ページで確認する。

旧管理側のGitHub Organizationは別のCloudflareアカウントで他サイトにも利用されている。顧客接続のために既存OrganizationのCloudflare連携を付け替えない。

## 確認済み・本番切替前の確認事項

- 公開HTTPSで日本語・英語・繁体字・韓国語、予約ページ、記事、OG画像、写真、動画のHTTP 200を確認。
- 320/390pxのスマホ幅で横はみ出しなし。トップ写真・動画の読込、予約ページへの画面遷移、予約文の生成、noindex、GAタグ未読込を確認。テスト入力は消去済み。
- 正しい紹介コードのみCookieを保存し、既存Cookieがある場合は再設定しないことを確認。
- OpenNextのNode.js Proxy対応は実験的扱い。紹介コードの回帰確認を本番切替時にも行う。
- このプレビューの画像は元画像の配信。Cloudflare Imagesによる有料の画像変換は設定していない。本番切替前にスマホ回線の表示速度を評価する。
- LINE上での実際の送信・予約登録はテストしていない。予約確定・カレンダー操作は既存運用を継続する。
- DNS、独自ドメイン、本番GA4、請求先の切替は別工程。

参考：[Cloudflare OpenNext](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)、[OpenNextの導入手順](https://opennext.js.org/cloudflare/get-started)、[CloudflareとGitHubの連携](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)。
