# 星空フォト宮古島 — SEO前提の情報設計・実装計画

> 本書は「設計計画」です。コードは含みません。Next.js **16.2.7 / App Router** を前提に、
> 「後からSEOを足す」のではなく **最初からSEO前提の情報設計** にするための計画をまとめます。
>
> 確認済みの前提（重要）:
> - `next@16.2.7` / `react@19.2.4`。`src/app` 構成。
> - Metadata API: `metadata` オブジェクト / `generateMetadata` / ファイル規約（`sitemap.ts`, `robots.ts`, `opengraph-image`）が利用可能。
> - `themeColor` / `colorScheme` / `viewport` は **metadata では非推奨** → `generateViewport`(`viewport` export) を使う。
> - `metadata` API は **`<script>`（JSON-LD）を直接出力できない** → 構造化データはページ/コンポーネント内で `<script type="application/ld+json">` をレンダリングする。
> - 相対URL（canonical / OG画像）を使うには root layout に **`metadataBase`** が必須。

## 実装状況メモ（2026-06-06）

この計画書は初期設計を含むため、一部に将来候補のページやプランも記載しています。
現在の実装では、プランと記事は `src/data/` の実データを単一の真実として参照します。

現在実装済みのプラン:
- `casual`
- `standard`
- `family`
- `creative`
- `propose`

計画書内に出てくる `location` / `premium` は、現時点では未実装の候補です。追加する場合は `src/data/plans.ts` にデータを足すと、一覧・詳細・sitemap・内部リンクへ反映される設計です。

現在実装済みのブログ記事:
- `miyakojima-stargazing-spots`
- `miyakojima-starry-sky-season`
- `milky-way-miyakojima`
- `propose-photo-miyakojima`
- `night-sightseeing-miyakojima`
- `family-photo-miyakojima`
- `couple-photo-spot-miyakojima`
- `anniversary-photo-miyakojima`
- `rain-weather-policy-miyakojima`
- `what-to-wear-starry-photo`（2026-07-07 追加。カバー画像は `/images/blog/what-to-wear-starry-photo.jpg` を用意したら `src/data/images.ts` の `POST_IMAGE_SRC` に追記）

---

## 1. SEO設計の基本方針

| 原則 | 具体策 |
|---|---|
| **最初からSEO前提のIA** | URL・ディレクトリ・見出し階層を「検索意図（キーワード）」に1:1で対応させる。1枚LPで完結させない。 |
| **拡張可能な階層構造** | `/`（LP）の下に `/plans/*`・`/blog/*` 等の下層ページを後から無限に足せる構造を最初に用意する。 |
| **1ページ=1検索意図** | 各ページは狙うキーワード群を1つに絞り、`title`/`h1`/本文/構造化データを揃える（トピックの薄まりを防ぐ）。 |
| **技術SEOの集中管理** | `title`/`description`/`canonical`/OGを `src/lib/seo.ts` に集約し、ページは“差分”だけ宣言する。 |
| **構造化データ標準装備** | LocalBusiness / Service / FAQPage / Article / BreadcrumbList を JSON-LD で全ページ型に組み込む。 |
| **内部リンク設計** | LP → プラン一覧 → 各プラン、ブログ → 関連プランへと、検索流入を予約導線へ送る内部リンクを設計に含める。 |
| **クロール最適化** | `sitemap.ts`（動的生成）・`robots.ts`・canonical を初期から用意。下層追加時に自動で sitemap に載る設計にする。 |

### 狙うキーワード → ページのマッピング（IAの背骨）

| キーワード | 主担当ページ | 補助ページ |
|---|---|---|
| 宮古島 星空フォト | `/`（LP）/ `/plans` | 各プラン |
| 宮古島 星空ツアー | `/plans/location` | `/blog/night-sightseeing-miyakojima` |
| 宮古島 天の川 写真 | `/blog/milky-way-miyakojima` | `/blog/miyakojima-starry-sky-season` |
| 宮古島 記念日 写真 | `/plans/standard` / `/plans/premium` | `/` |
| 宮古島 プロポーズ 撮影 | `/plans/propose` | `/blog/propose-photo-miyakojima` |
| 宮古島 カップル フォト | `/plans/casual` / `/plans/standard` | `/plans/creative` |
| 宮古島 家族写真 | `/plans/standard` / `/plans/location` | `/` |
| 宮古島 夜 観光 | `/blog/night-sightseeing-miyakojima` | `/access` |

> このマッピングは後述の `seo.ts` のページ定義に **そのまま** 落とし込む。新キーワードが出たら「新しいページ + マッピング行」を足すだけで拡張できる。

---

## 2. 情報設計（IA）/ ディレクトリ構成

```
src/
├─ app/
│  ├─ layout.tsx                # 全体メタの土台 (metadataBase, title.template, default OG, lang="ja")
│  ├─ page.tsx                  # / トップLP
│  ├─ sitemap.ts               # 全URLを動的生成（plans/blog をデータから自動列挙）
│  ├─ robots.ts                # クロール許可 + sitemap参照
│  ├─ opengraph-image.tsx      # 既定OG画像（ブランド）
│  ├─ (marketing)/             # ルートグループ: URLに出ない論理グループ（任意）
│  │  ├─ about/page.tsx        # /about
│  │  ├─ faq/page.tsx          # /faq
│  │  └─ access/page.tsx       # /access
│  ├─ plans/
│  │  ├─ page.tsx              # /plans 一覧
│  │  └─ [plan]/page.tsx       # /plans/casual ... /plans/propose（動的1本で全プランを賄う）
│  └─ blog/
│     ├─ page.tsx              # /blog 記事一覧
│     └─ [slug]/page.tsx       # /blog/<slug> 記事詳細
├─ lib/
│  ├─ seo.ts                   # SEO設定の単一の真実(SSOT)。helper関数 + サイト定数
│  └─ jsonld.ts                # 構造化データ(JSON-LD)ビルダー
├─ data/
│  ├─ plans.ts                 # プラン定義（料金/特徴/狙うKW/メタ）
│  └─ posts/                   # ブログ記事（MDX or TSデータ）
└─ components/
   ├─ seo/JsonLd.tsx           # <script type="application/ld+json"> 出力
   ├─ layout/Header, Footer, Breadcrumbs
   └─ sections/...             # LP/プラン/記事の表示パーツ
```

### URL設計の方針
- **拡張前提で動的セグメント**を使う:`/plans/[plan]`・`/blog/[slug]`。新プラン/新記事は **データ追加だけ** でページ・sitemap・内部リンクに反映される。
- 末尾スラッシュ・大文字小文字を統一（`next.config.ts` の `trailingSlash` は付けない＝Next既定）。
- 各動的ページは `generateStaticParams` で **静的事前生成（SSG）** → クロール/表示が速い。
- 全ページに **自己参照 canonical**（`alternates.canonical`）を付与し重複を防止。
- 言語は `ja`。将来の多言語化に備え `alternates.languages` を `seo.ts` で拡張可能にしておく（今は ja のみ）。

---

## 3. 技術SEO実装方針

### 3-1. `src/lib/seo.ts`（SEOの単一の真実 / SSOT）
役割: サイト共通定数 + 「ページ用 Metadata を生成する helper」。各ページは差分だけ渡す。

- `siteConfig`: `name`（星空フォト宮古島）, `url`（本番ドメイン）, `defaultTitle`, `titleTemplate`（`"%s | 星空フォト宮古島"`）, `description`, `locale: "ja_JP"`, `ogImage`, `twitter`, `keywordsByPage`。
- `buildMetadata(input)` → `Metadata` を返す helper。受け取るのは `title` / `description` / `path`（canonical算出用）/ `images?` / `noindex?` 程度。
  - 内部で `alternates.canonical = path`、`openGraph`（url/title/description/images/type/locale）、`twitter` を自動補完。
  - これにより **各ページは3〜4行で正しいSEOメタを宣言できる**。書き漏れ・不統一を構造的に防ぐ。
- root `layout.tsx` 側で `metadataBase = new URL(siteConfig.url)` と `title: { default, template }` と既定OGを定義 → 全ページが継承。

### 3-2. ページ別メタの付け方
- 静的ページ（`/about`,`/faq`,`/access`,`/plans`,`/blog`）: `export const metadata = buildMetadata({...})`。
- 動的ページ（`/plans/[plan]`,`/blog/[slug]`）: `export async function generateMetadata({ params })` で `data` から `title/description/canonical/OG` を生成。データ取得は `react` の `cache()` でページ本体と共有しメタ用の二重取得を避ける。

### 3-3. 構造化データ（JSON-LD）`src/lib/jsonld.ts` + `components/seo/JsonLd.tsx`
Metadata API は `<script>` を出せないため、**コンポーネントで描画**する。型ごとにビルダー関数を用意:
- 全ページ共通: **`LocalBusiness`/`Organization`**（屋号・所在地（宮古島）・連絡先・営業時間・SNS）。
- `/plans/[plan]`: **`Service`/`Product`**（プラン名・提供内容・価格帯・エリア=宮古島）。
- `/faq`: **`FAQPage`**（Q&Aをそのまま構造化 → リッチリザルト狙い）。
- `/blog/[slug]`: **`Article`/`BlogPosting`**（見出し・公開日・更新日・著者=稲田圭市・画像）。
- 全下層: **`BreadcrumbList`**（パンくず。内部リンク強化 + 検索結果のパンくず表示）。

### 3-4. `sitemap.ts` / `robots.ts`
- `app/sitemap.ts`: 固定ページ + `data/plans.ts` + `data/posts` を **map して全URLを自動列挙**（`MetadataRoute.Sitemap`）。`lastModified`/`changeFrequency`/`priority` を種別ごとに設定（LP=1.0、プラン=0.8、記事=0.6など）。→ ページ追加時に手作業ゼロ。
- `app/robots.ts`: `MetadataRoute.Robots`。全許可 + `sitemap: <url>/sitemap.xml` + `host`。
- `/access` のように「予約後に詳細案内」のページでも、集合エリアの概要は index 可（NAP情報を載せローカルSEOを強化）。本当に隠したい個別情報のみ noindex 運用。

### 3-5. OG画像 / ファビコン
- `app/opengraph-image.tsx`（既定・ブランドOG）。プラン/記事は将来 `opengraph-image.tsx` を各セグメントに追加 or `ImageResponse` で動的生成（タイトル差し込み）。
- `favicon.ico` は既にあり。`icon`/`apple-icon` はファイル規約で追加。

### 3-6. パフォーマンス（Core Web Vitals = ランキング要因）
- 画像は `next/image`（星空写真は重いので必須）。LCP対象のみ `priority`。
- フォントは `next/font`（日本語サブセット注意。本文は和文Webフォントを使うなら表示安定化）。
- 動的ページは SSG。クライアントJSは予約フォーム等の必要箇所のみ（`metadata` はServer Component限定なので島=Client化を局所に留める）。

---

## 4. ページ構成（route map と各ページのSEO役割）

| # | URL | 種別 | h1（例） | 主KW | 構造化データ |
|---|---|---|---|---|---|
| 1 | `/` | 静的 | 宮古島の星空フォト | 宮古島 星空フォト | LocalBusiness |
| 2 | `/plans` | 静的 | 撮影プラン一覧 | 宮古島 星空フォト/カップル/家族 | Service(ItemList) + Breadcrumb |
| 3 | `/plans/casual` | 動的 | カジュアルプラン | 宮古島 カップル フォト | Service + Breadcrumb |
| 4 | `/plans/standard` | 動的 | スタンダードプラン | 宮古島 記念日/家族写真 | Service + Breadcrumb |
| 5 | `/plans/creative` | 動的 | クリエイティブプラン | 宮古島 星空フォト（作品性） | Service + Breadcrumb |
| 6 | `/plans/location` | 動的 | ロケーションプラン | 宮古島 星空ツアー | Service + Breadcrumb |
| 7 | `/plans/premium` | 動的 | プレミアムプラン | 宮古島 記念日 写真 | Service + Breadcrumb |
| 8 | `/plans/propose` | 動的 | プロポーズプラン | 宮古島 プロポーズ 撮影 | Service + Breadcrumb |
| 9 | `/about` | 静的 | 代表 稲田圭市の物語 | ブランド/星空保全(E-E-A-T) | Person/Organization + Breadcrumb |
| 10 | `/faq` | 静的 | よくある質問 | 天候/服装/キャンセル等 | FAQPage + Breadcrumb |
| 11 | `/access` | 静的 | 集合場所・送迎 | 宮古島 集合/送迎 | LocalBusiness + Breadcrumb |
| 12 | `/blog` | 静的 | 星空フォトコラム | （ハブ） | Blog + Breadcrumb |
| 13 | `/blog/miyakojima-starry-sky-season` | 動的 | 宮古島で星空が綺麗な時期 | 宮古島 星空 時期 | Article + Breadcrumb |
| 14 | `/blog/milky-way-miyakojima` | 動的 | 宮古島で天の川を見るなら | 宮古島 天の川 写真 | Article + Breadcrumb |
| 15 | `/blog/propose-photo-miyakojima` | 動的 | プロポーズ撮影成功法 | 宮古島 プロポーズ 撮影 | Article + Breadcrumb |
| 16 | `/blog/night-sightseeing-miyakojima` | 動的 | 宮古島の夜観光おすすめ | 宮古島 夜 観光 | Article + Breadcrumb |

> **内部リンク導線**: 記事(13–16) → 関連プラン(3–8) → 予約。プラン → `/faq`・`/access` で不安解消 → 予約。`/about` で E-E-A-T 補強。

---

## 5. ブログ記事案（初期4本 + 将来の拡張テーマ）

初期4本（要件どおり）:
1. `miyakojima-starry-sky-season` — 宮古島で星空が綺麗に見える時期（月齢・季節・天候）
2. `milky-way-miyakojima` — 宮古島で天の川を見るならいつ？（時期・時間帯・方角・撮影地）
3. `propose-photo-miyakojima` — 宮古島でプロポーズ撮影を成功させる方法（段取り・サプライズ・当日の流れ）
4. `night-sightseeing-miyakojima` — 宮古島の夜観光でおすすめの体験（星空+α）

将来拡張（キーワード網羅を広げる候補・URL案）:
- `family-photo-miyakojima` 宮古島で家族写真を撮るなら（KW: 宮古島 家族写真）
- `couple-photo-spot-miyakojima` 宮古島カップルフォトおすすめスポット（KW: 宮古島 カップル フォト）
- `anniversary-photo-miyakojima` 記念日に残す宮古島フォト（KW: 宮古島 記念日 写真）
- `what-to-wear-starry-photo` 星空撮影の服装ガイド（FAQ深掘り→ロングテール）
- `weather-rain-policy-miyakojima` 雨天・曇天時の判断（FAQ→予約不安の解消）

> 記事は「KW1つ + 関連プランへの内部リンク + FAQ補完」をテンプレ化。記事の量産で **ロングテール検索を面で取り**、ハブ(`/blog`)→記事→プランの導線で予約に変換する。

---

## 6. コンポーネント設計

| 層 | コンポーネント | 役割 |
|---|---|---|
| SEO | `components/seo/JsonLd.tsx` | JSON-LDを安全に出力（`dangerouslySetInnerHTML`でstringify） |
| レイアウト | `Header` / `Footer` / `Breadcrumbs` | 全ページ共通。Footerに NAP情報（ローカルSEO）。Breadcrumbsは表示+JSON-LD両対応 |
| セクション | `Hero` / `PlanList` / `PlanCard` / `PlanDetail` / `FaqAccordion` / `AboutStory` / `AccessInfo` | ページを構成する表示パーツ。**見出し(h1/h2)を内包しSEO構造を担保** |
| ブログ | `PostList` / `PostCard` / `PostBody` / `PostMeta` / `RelatedPlans` | 記事一覧/本文/関連プラン導線 |
| 変換 | `CtaBooking`（予約CTA） / `ContactSection` | 全ページから予約への導線。LP以外にも常設 |
| UI | `Button` / `Section` / `Container` | Tailwind v4ベースの汎用UI |

設計原則:
- **Server Component が既定**。インタラクティブ箇所（FAQアコーディオン、予約フォーム）のみ `"use client"` の小さな島に分離（`metadata`/`generateMetadata` はServer限定のため）。
- 見出し階層はコンポーネント側で固定（各ページ h1 は1つ）。SEOの構造をデザイン都合で崩さない。

---

## 7. データ管理設計

CMSは初期不要。**ローカルの型付きデータ**で開始し、将来CMS（Marketplace/ヘッドレス）へ差し替え可能なインターフェースにする。

### `src/data/plans.ts`
```
type Plan = {
  slug: 'casual'|'standard'|'creative'|'location'|'premium'|'propose'
  name: string            // h1/title
  tagline: string         // description素材
  priceFrom: number
  features: string[]
  forWhom: string[]       // カップル/家族/記念日 など → KWと一致させる
  keywords: string[]      // このプランで狙うKW
  seo: { title: string; description: string }
  ogImage?: string
  updatedAt: string       // sitemap lastModified用
}
```
`/plans/[plan]` の `generateStaticParams` はこの配列から生成。`/plans` 一覧も同配列を map。sitemap も同配列を参照。**=データが単一の真実**。

### `src/data/posts/`
- 方式A: **MDX**（`@next/mdx`）。本文をMarkdownで書け、frontmatterに `title/description/slug/publishedAt/updatedAt/keywords/relatedPlans` を持たせる。
- 方式B: **TSデータ + 本文コンポーネント**（依存を増やさず最小構成）。
- どちらでも「記事メタの型」を `Post` として固定し、一覧/詳細/sitemap/関連リンクが同じ型を参照する。

> 将来CMS化する場合も、`data/` を「取得関数（`getPlans()/getPosts()/getPost(slug)`）」の裏側に隠しておけば、呼び出し側（ページ）を変えずに差し替えできる。**最初から取得関数経由でアクセスする**設計にしておく。

---

## 8. 実装ステップ（フェーズ分け）

**Phase 0 — 基盤（SEOの土台）**
1. `src/lib/seo.ts`（siteConfig + buildMetadata）
2. root `layout.tsx` を `lang="ja"` + `metadataBase` + `title.template` + 既定OG + `generateViewport` に更新
3. `app/robots.ts` / `app/sitemap.ts`（固定ページのみで動く最小版）
4. `components/seo/JsonLd.tsx` + `lib/jsonld.ts`（LocalBusiness/Breadcrumb）
5. `Header`/`Footer`（NAP）/`Breadcrumbs`/`Container`/`Section`/`Button`

**Phase 1 — トップLP `/`**
6. `Hero`/プラン抜粋/CTA/会社情報。LocalBusiness JSON-LD。`buildMetadata` 適用。

**Phase 2 — プラン群**
7. `data/plans.ts` → `/plans` 一覧 → `/plans/[plan]` 詳細（`generateStaticParams`+`generateMetadata`+Service JSON-LD）。sitemap にプランを自動追加。

**Phase 3 — 信頼/補助ページ**
8. `/about`（E-E-A-T）・`/faq`（FAQPage）・`/access`（LocalBusiness/NAP）。

**Phase 4 — ブログ基盤**
9. `data/posts` 方式決定 → `/blog` 一覧 → `/blog/[slug]`（Article JSON-LD + RelatedPlans）。sitemap に記事を自動追加。

**Phase 5 — 仕上げ**
10. 動的OG画像、画像最適化(LCP)、内部リンク網の最終調整、Search Console 登録・sitemap送信、構造化データのリッチリザルトテスト。

> 各フェーズ完了時点で **常にSEO的に正しい状態**（メタ/canonical/sitemap/構造化データが揃う）を保つ。後追いSEO作業を発生させない。

---

## 9. まず Step 1 で作るべきもの（最優先の最小単位）

**「`src/lib/seo.ts` + root `layout.tsx` の置き換え」** が Step 1。理由:
- これが全ページのメタ・canonical・OG・titleテンプレ・言語(`ja`)・`metadataBase` の **土台**。
- ここを先に固めると、以降の全ページは `buildMetadata({...})` を3〜4行書くだけで自動的にSEO適合になる（=「最初からSEO前提」を仕組みで担保）。

Step 1 の具体的成果物:
1. `src/lib/seo.ts` … `siteConfig`（本番ドメイン・屋号・説明・OG・locale）と `buildMetadata()`。
2. `src/app/layout.tsx` … `lang="ja"`、`metadataBase`、`title:{ default, template }`、既定 `openGraph`/`twitter`、`generateViewport`（旧 `themeColor` の置き換え）。
3. `src/app/robots.ts` と `src/app/sitemap.ts`（固定ページのみの最小版。以降データ追加で自動拡張）。

> ※Step 1 着手前に決めておくべき入力: **本番ドメイン名**、**正式な屋号/サイト名**、**NAP（住所・電話・営業時間）**、**代表者名（稲田圭市）表記**。これらは `seo.ts`/JSON-LD のハードな前提値になる。
>
> **確定値（2026-06）**: 屋号/サイト名 = **KEY PHOTO 宮古島**（`siteConfig.name`）。title 末尾の短縮表記 = **KEY PHOTO**（`siteConfig.shortName`）。代表者 = 稲田圭市。旧称「スペースイナダ／スペース稲田」からの屋号変更。
>
> **更新（2026-07-15）**: ドメインを `space-inada.com` から **`keyphotomiyakojima.com`** へ正式移行。サイトURLは `NEXT_PUBLIC_SITE_URL`（フォールバックは `src/lib/seo.ts`）で一元管理。旧ドメインは301リダイレクト用に維持する。
</content>
</invoke>
