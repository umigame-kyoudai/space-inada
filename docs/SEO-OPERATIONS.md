# SEO運用チェックリスト（コード外の施策）

コードに実装済みのSEO（メタ・構造化データ・sitemap・RSS・llms.txt）を最大限効かせるための、
サイト外・管理画面側の作業リスト。上から順に効果が大きい。

## 1. Googleビジネスプロフィール（最重要）

「宮古島 星空フォト」のようなローカル検索・マップ検索ではこれが最も効く。

- [ ] https://business.google.com で「KEY PHOTO 宮古島」を登録（旧称スペース稲田で登録済みなら名称を変更）
- [ ] カテゴリ: 「写真家」または「写真撮影サービス」
- [ ] NAP をサイトと完全一致させる（構造化データと同じ値にすること）
  - 名称: KEY PHOTO 宮古島
  - 電話: 090-9279-9586
  - エリア: 沖縄県宮古島市（非店舗型のため「サービス提供地域」で設定）
  - 営業時間: 18:00〜23:00（完全予約制）
- [ ] ウェブサイト: https://space-inada.com ／ 予約リンク: https://space-inada.com/booking
- [ ] 撮影作品の写真を10枚以上アップロード（`public/images/gallery` と同じ写真でOK）
- [ ] 撮影後のお客様にクチコミ投稿を依頼する運用を作る（LINEでURLを送る等）

## 2. Google Search Console

- [x] プロパティ登録済み（ドメインプロパティ `space-inada.com`・DNS認証済み。
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` の設定は不要）
- [ ] サイトマップ送信: 左メニュー「サイトマップ」から `sitemap.xml` と `feed.xml` を送信
  （2026-07-08 時点でインデックス登録済み1ページのみ＝未送信が最大のボトルネック）
- [ ] URL検査で主要ページのインデックス登録をリクエスト
  （優先: `/` → `/plans` → `/booking` → 各プラン → 新着記事。1日の上限に注意）
- [ ] 月1回の定点観測:
  - 「検索パフォーマンス」で表示回数・クリックの伸びているクエリを確認 → 次の記事テーマに反映
  - 「拡張」でFAQ・パンくず・レビューのリッチリザルトのエラー有無を確認
- [ ] 新記事公開時は「URL検査」→「インデックス登録をリクエスト」で反映を早める

## 3. 構造化データの検証（デプロイ後に1回）

- [ ] https://search.google.com/test/rich-results で以下を確認
  - `/`（LocalBusiness）・`/faq`（FAQPage）・`/blog/任意記事`（Article + HowTo）・`/voice`（Review）
- [ ] エラーが出たら `src/lib/jsonld.ts` を修正

## 4. SNSアカウント

- [ ] X (Twitter) アカウントを作る場合: `src/lib/seo.ts` の `siteConfig.twitter.site` に
  `@ハンドル` を設定し、`siteConfig.sameAs` にプロフィールURLを追加
- [ ] Instagram（設定済み: @_key_photo）のプロフィールに https://space-inada.com を記載
- [ ] 投稿には可能な範囲でサイトのプラン・記事URLへの導線を付ける

## 5. 被リンク・サイテーション（中期）

- [ ] 宮古島の観光ポータル・体験予約サイト（アクティビティジャパン等）に掲載し、サイトURLを記載
- [ ] 掲載書籍『LIFE CHANGING 人生を変える星空体験』関連ページからのリンク獲得を打診
- [ ] 地元メディア・旅行ブログへの撮影事例提供（写真クレジット＋リンク）

## 6. コンテンツ運用

- [ ] 月1本を目安にコラムを追加（`src/data/posts.ts` にデータ追加のみで
  一覧・sitemap・RSS・llms.txt へ自動反映される）
- [ ] テーマは Search Console の「表示はあるがクリックが少ないクエリ」から選ぶ
- [ ] 新記事 `what-to-wear-starry-photo` のカバー画像
  `/images/blog/what-to-wear-starry-photo.jpg`（横長1600×900）を用意し、
  `src/data/images.ts` の `POST_IMAGE_SRC` に追記する
