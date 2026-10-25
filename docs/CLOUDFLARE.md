# Cloudflare公開・更新

更新：2026-10-25。本人のCloudflareで本番を公開。GitHubの接続は本人が行う。

## 対応表

|用途|Worker / URL|設定|
|---|---|---|
|本番|`keyphoto-miyakojima` / https://keyphotomiyakojima.com/|`wrangler.production.jsonc`|
|確認用|`keyphoto-miyakojima-preview` / https://keyphoto-miyakojima-preview.miyako-keyphoto.workers.dev/|`wrangler.jsonc`|

- Account ID: `c1db2261f1b54c87010621b814be41a6`（顧客所有）。
- 本番Workerに `keyphotomiyakojima.com`、`www.keyphotomiyakojima.com`、`space-inada.com`、`www.space-inada.com` を接続済み。
- www・旧ドメインから正規URLへ308転送し、パス・クエリを保持する。
- 両ドメインのNS: `maxim.ns.cloudflare.com` / `sima.ns.cloudflare.com`。DNS管理は顧客側へ変更済み。登録契約・更新料の移管は本人の決済待ち。
- Next.js 16.4.3 / OpenNext Cloudflare 1.20.13 / Wrangler 4.152.0 / Node.js 24系。
- Freeプラン。有料プラン・R2・Images契約の追加なし。利用増加時は本人が使用量と必要プランを判断する。

## 本人のGitHubを接続

1. 本人の `keyphoto-miyakojima` アカウントに `space-inada` Repositoryを作成する（Private推奨）。元の制作側Repositoryの移管は不要。
2. 受領済みフォルダへ追加分を適用し、`package.json` がRepository直下に来るよう保存する。追加分はファイル単位で上書き・結合し、既存フォルダ丸ごとの置換で写真等を消さない。
3. `.env*`、`.git/`、`node_modules/`、`.next/`、`.open-next/`、`output/`、ドメイン移管コードを登録しない。GitHub Desktop等で `.gitignore` を含めて保存する。
4. Cloudflareで既存本番Worker `keyphoto-miyakojima` →「設定」→「ビルド / Builds」→ Gitリポジトリを接続。GitHubは本人アカウントの対象Repositoryだけを認可する。
5. 次の値を設定する。

|項目|値|
|---|---|
|Repository|`keyphoto-miyakojima/space-inada`|
|Production branch|`main`|
|Root directory|Repository直下（`package.json` のある場所）|
|Build command|`npm run build:production`|
|Deploy command|`npm run deploy:production`|
|Build variable|`NODE_VERSION=24`|
|その他のブランチの自動ビルド|初回は無効。本番用のコマンドを流用しない|

6. 最初のビルドが成功し、既存Workerと公開URLに反映されたら接続完了。以後は本人のGitHub更新で自動公開する。

既存の確認用Workerへ本番コマンドを設定しない。旧管理側OrganizationのCloudflare連携も変更しない。

## ローカルから更新する場合

```sh
npm ci
npx wrangler login
npx wrangler whoami
npm run lint
npm run build:production
npm run deploy:production
```

認証先が上記Account IDと一致することを確認する。本番用ビルド・公開の組合せはスクリプトで検査する。サイトURLと公開用GA測定IDは `config/site-public.json` にある。現在のサイト公開に制作側の秘密キーは不要。

確認用は `npm run build:cloudflare` → `npm run deploy:cloudflare`。確認用はnoindex・GA無効。本番Workerの `workers.dev` URLにもnoindexヘッダーを付け、GAを停止する。本番独自ドメインは検索登録・既存GA測定IDを継続する。

ビルドの最後に `scripts/prepare-cloudflare-env.mjs` がOpenNext出力から非公開環境変数を除去する。将来秘密値が必要になった場合は顧客側のCloudflare Secretsで管理する。

## 確認と復旧

- 本番・4言語・予約ページ・画像・動画・robots・sitemapをHTTPSで確認。旧/www転送はパス・クエリを保持。
- スマホ390pxでトップ・予約画面の横はみ出しなし、写真・動画とGAタグの読込を確認。LINEの実送信・予約登録は行っていない。
- DNS切替直後は旧キャッシュ経由でVercelへ到達する環境が残る。旧公開先は移行中の予備として残している。
- DNSの `vercel-origin-backup` は元の接続先を保存した予備レコード。`*` は旧来の汎用サブドメイン設定を保持。4つの正式ホストはWorkerへ直接接続しており、これら予備レコードには依存しない。
- 更新で不具合が出た場合、Cloudflareの本番Worker「デプロイ」から正常な直前バージョンへ戻す。独自ドメインやDNSを削除する必要はない。

参考：[Workers Builds設定](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[GitHub連携](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)。
