# 星空フォト宮古島

宮古島の星空フォト撮影サービス向けの Next.js サイトです。
SEO、予約導線、プラン詳細、ブログ、FAQ、ギャラリー、お客様の声を App Router で構成しています。

## 技術構成

- Next.js `16.2.7`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- App Router (`src/app`)

このプロジェクトでは Next.js の同梱ドキュメントを前提に実装します。Next.js の API や規約に触れる変更を行う場合は、先に `node_modules/next/dist/docs/` の該当ガイドを確認してください。

## 開発コマンド

```bash
npm run dev
npm run lint
npm run build
npm run start
```

開発サーバーは通常 `http://localhost:3000` で起動します。

## 主要ルート

| URL | 内容 |
|---|---|
| `/` | トップページ |
| `/plans` | プラン一覧 |
| `/plans/[plan]` | プラン詳細 |
| `/booking` | 予約導線 |
| `/gallery` | ギャラリー |
| `/voice` | お客様の声 |
| `/about` | 代表・サービス紹介 |
| `/faq` | よくある質問 |
| `/access` | 対応エリア・集合案内 |
| `/blog` | ブログ一覧 |
| `/blog/[slug]` | ブログ記事 |
| `/privacy` | プライバシーポリシー |
| `/legal` | 特定商取引法に基づく表記 |
| `/sitemap.xml` | サイトマップ |
| `/robots.txt` | robots |

## データ管理

プラン、記事、FAQ、画像スロット、お客様の声は `src/data/` に集約しています。

| 種類 | ファイル |
|---|---|
| プラン | `src/data/plans.ts` |
| ブログ記事 | `src/data/posts.ts` |
| FAQ | `src/data/faqs.ts` |
| お客様の声 | `src/data/testimonials.ts` |
| 画像スロット | `src/data/images.ts` |

データ追加後は `npm run build` を実行してください。`src/lib/data-integrity.ts` の整合性チェックが sitemap 生成時に走り、slug 重複、参照切れ、日付不正、必須項目の欠落などを検出します。

## 画像・動画

画像は `public/images/` に配置し、`src/data/images.ts` の該当スロットに `src` を設定すると反映されます。
詳しい配置ルールは `public/images/README.md` を参照してください。

撮影動画は `public/videos/shooting.mp4` を参照しています。

## 環境変数

`.env*` は Git 管理外です。ローカルでは `.env.local` を作成し、本番では Vercel などの環境変数に設定してください。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical / OG / sitemap / JSON-LD の本番URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 測定ID |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console 確認用トークン |
| `NEXT_PUBLIC_ENABLE_REVIEW_SCHEMA` | `/voice` の Review / AggregateRating 構造化データ出力 |
| `NEXT_PUBLIC_MAP_EMBED_URL` | `/access` の Google Maps 埋め込みURL |

詳細は `docs/ENV.md` を参照してください。

## 公開前チェック

- `NEXT_PUBLIC_SITE_URL` を本番ドメインに設定する
- `src/lib/seo.ts` の残りの NAP 情報（住所、メール、営業時間、SNS）を確定値に更新する
- `src/app/legal/page.tsx` の特商法表記を確定値に更新する
- 実写真を `public/images/` に配置し、`src/data/images.ts` の `src` を有効化する
- `npm run lint` を通す
- `npm run build` を通す
- Search Console に `sitemap.xml` を送信する

## 関連ドキュメント

- `docs/SEO-PLAN.md`: SEO 前提の情報設計・実装計画
- `docs/ENV.md`: 環境変数と計測設定
- `docs/DATA.md`: データ追加・管理ルール
- `public/images/README.md`: 画像配置ルール
