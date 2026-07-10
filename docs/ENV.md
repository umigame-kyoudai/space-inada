# 環境変数

`.env*` は `.gitignore` で除外されています。ローカルでは `.env.local` を作成し、
本番では Vercel のプロジェクト設定（Environment Variables）に登録してください。

| 変数名 | 用途 | 例 | 必須 |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 本番ドメイン。canonical / OG / sitemap / JSON-LD の絶対URLに使用 | `https://example.com` | 公開時必須 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 の測定ID。未設定ならGAは読み込まれない。設定済みでも開発ビルド・Vercelプレビュー・localhost では送信しない | `G-XXXXXXXXXX` | 計測時 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console「HTMLタグ」確認用トークン（`content` の値のみ） | `abcd1234...` | 登録時 |
| `NEXT_PUBLIC_ENABLE_REVIEW_SCHEMA` | `/voice` のレビュー構造化データ（Review/AggregateRating）を出力するか。**本物の評価に差し替えるまでは未設定（OFF）のまま** | `true` | 任意 |
| `NEXT_PUBLIC_MAP_EMBED_URL` | `/access` のGoogleマップ埋め込みURL。未設定なら対応エリア（宮古島市）を自動表示。確定住所のピンに変えたい場合に設定 | `https://www.google.com/maps/embed?pb=...` | 任意 |

## `.env.local` のテンプレート

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=（Search Consoleで発行されるmetaタグのcontent値）
```

> `NEXT_PUBLIC_` 接頭辞の変数はビルド時にクライアントへ埋め込まれます。秘密情報は入れないこと。

---

## 計測（GA4 / Search Console）導入手順

### Google Analytics 4
1. [GA4](https://analytics.google.com/) でプロパティを作成し、**測定ID**（`G-` から始まる）を取得。
2. `NEXT_PUBLIC_GA_MEASUREMENT_ID` に設定して再ビルド／再デプロイ。
3. 実装済みの計測（イベントの全一覧は `docs/MEASUREMENT.md`）:
   - **ページビュー**: 初回は gtag、App Router のクライアント遷移は GA4 拡張計測（履歴イベント）が自動送信。UTM付きURLの流入情報も保持される。拡張計測はONのままにすること。
   - **CVイベント**: `reservation_click` / `line_click` / `form_start` / `form_submit` / `plan_click` / `instagram_click` / `phone_click`
   - リンク・ボタンへの追加は `data-ga-event` / `data-ga-button` / `data-ga-plan` 属性を書くだけ（`ClickTracker.tsx` が拾う）。それ以外は `trackEvent("name", { ... })`（`src/lib/analytics.ts`）。
4. GA4 で `line_click` / `form_submit` を「キーイベント（コンバージョン）」に設定すると、予約導線の成果を計測できる。

### Search Console
1. [Search Console](https://search.google.com/search-console) でプロパティを追加。
2. 確認方法「**HTMLタグ**」を選び、`content="..."` の値を `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` に設定して再デプロイ。
   - `<meta name="google-site-verification" ...>` が全ページ `<head>` に出力される。
3. 確認完了後、**サイトマップ**に `https://<ドメイン>/sitemap.xml` を送信。
