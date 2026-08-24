# 計測ハンドブック — 数値で次の改善を決める

このサイトの計測は3つの道具で行う。**すべて無料**。

| 道具 | 何がわかるか | 見る場所 |
|---|---|---|
| Google Search Console | 検索での露出（表示回数・クリック・順位・クエリ） | search.google.com/search-console |
| Google Analytics 4 | サイト内の行動（訪問数・遷移・予約CV） | analytics.google.com |
| web_vitals イベント | 実ユーザーの表示速度（LCP/CLS/INP） | GA4 内のイベントとして届く |

> ⚠️ **前提**: GA4 は Vercel に `NEXT_PUBLIC_GA_MEASUREMENT_ID`（G- で始まる測定ID）を設定するまで動かない。
> 作成手順は `docs/ENV.md` 参照。設定済みでも開発ビルド・Vercelプレビュー・localhost では送信しない。

---

## 1. KPIツリー（予約までの流れで見る）

```
検索に表示される（SC: 表示回数）
  → クリックされる（SC: クリック数・CTR）
    → サイトを見る（GA4: セッション）
      → 予約フォームに到達（GA4: /booking の page_view・form_start）
        → LINEを開く（GA4: line_click イベント）＝ 実質CV
```

どこで数字が細るかを見れば、次にやるべき改善が決まる（§4の判断表）。

## 2. 実装済みのGA4イベント一覧

共通の `trackEvent` を使う全カスタムイベントに `page_path` / `page_title` が自動付与される。紹介Cookieがある場合は、個人情報ではない紹介コードを `referral_staff`（例: `sho`）として追加する。氏名・電話番号・メール・フォーム入力内容は送信しない。

| イベント名 | 意味 | 主なパラメータ |
|---|---|---|
| `page_view` | ページ閲覧。初回は gtag、クライアント遷移は GA4 拡張計測（履歴イベント）が自動送信。**拡張計測はONのままにすること** | page_location（?from= や UTM も含まれる） |
| `reservation_click` | 予約ボタンのクリック（/booking への導線すべて） | button_name（下表） / link_url / plan_name |
| `plan_click` | プラン詳細への導線クリック | button_name / link_url / plan_name |
| `form_start` | 予約フォームの入力開始（最初のフィールド操作） | plan_name / from |
| `form_submit` | 予約文のコピー成功＝フォーム完了（CV一歩手前） | plan_name / coupon / from |
| `line_click` | 公式LINEを開いた（**実質CV**） | plan_name / copied / coupon / from / link_url |
| `instagram_click` | Instagramリンクのクリック | button_name / link_url |
| `phone_click` | 電話番号リンクのタップ | button_name / link_url |
| `LCP` `CLS` `INP` `FCP` `TTFB` | 実ユーザーの表示速度 | metric_value / metric_rating |

GA4 で `line_click` と `form_submit` を「キーイベント」に設定すること（管理 → イベント → キーイベントとしてマーク）。

### button_name（どのボタンがクリックされたか）

| button_name | 場所 |
|---|---|
| `hero` / `hero_plans` | トップのファーストビュー（予約 / プラン一覧） |
| `header` | ヘッダー右上の予約ボタン |
| `mobile_menu` | モバイルのハンバーガーメニュー |
| `mobile_nav` | モバイル下部の固定タブ |
| `floating` | 右下のフローティングLINEボタン |
| `cta` | 各ページ末尾のCTAパネル |
| `plan_card` | プラン一覧・関連プランのカード |
| `plan_detail` / `plan_detail_related` | プラン詳細の予約ボタン / 他プランのチップ |
| `plan_comparison` | プラン比較表（詳細 / 予約） |
| `footer` / `not_found` | フッター / 404 |
| `booking_form` / `copy` | 予約フォームのLINEボタン / コピーボタン |

予約ボタン経由の `/booking?from=...` パラメータ（hero / header / footer など）は
`form_start` `form_submit` `line_click` の `from` として引き継がれる。
紹介判定には別の `?ref=...` を使用し、`from` の値や既存計測は変更しない。

### 計測の追加方法

リンク・ボタンなら属性を書くだけでよい（`ClickTracker.tsx` が document で一括計測）:

```tsx
<Link href="..." data-ga-event="reservation_click" data-ga-button="場所名" data-ga-plan="プラン名（任意）">
```

クリック以外は `trackEvent("イベント名", { ... })`（`src/lib/analytics.ts`）。

## 3. 月次チェックルーチン（毎月1日・30分）

1. **SC → 検索パフォーマンス**（過去28日 vs 前期間）
   - 表示回数・クリック数・平均CTR・平均掲載順位をメモ（下の記録表へ）
   - 「クエリ」タブ: 表示回数が多いのにクリックが少ないクエリを3つ拾う
2. **SC → ページ（インデックス作成）**: 登録済みページ数が26前後あるか
3. **GA4 → レポート → エンゲージメント → イベント**:
   - `line_click` の件数と、探索レポートで from 別・plan_name 別の内訳
4. **GA4 → web_vitals**: LCP の metric_rating で poor の割合
5. 結果を下の記録表に1行追記 → §4の判断表と照らして翌月の改善を1つ決める

### 月次記録表（追記していく）

| 年月 | SC表示 | SCクリック | CTR | 平均順位 | セッション | /booking到達 | LINE CV | 備考 |
|---|---|---|---|---|---|---|---|---|
| 2026-07 | (初月・基準値) | | | | | | | sitemap送信月 |

## 4. 判断表 — 数値がこうなったら、これをやる

| 症状 | 原因の仮説 | 打ち手 |
|---|---|---|
| 表示回数が少ない（<1,000/月） | インデックス不足 or コンテンツ不足 | SCのページレポート確認 → 記事追加（月1本） |
| 表示は多いのに CTR < 2% | title/description が刺さっていない | 該当クエリのページの seo.title / description を書き直す |
| 順位11〜20位のクエリがある | あと一歩のページ | そのページに見出し追加・関連記事から内部リンク |
| セッションは多いのに /booking 到達 < 5% | CTA導線が弱い | from 別データを見て弱いCTAを改善・配置変更 |
| /booking 到達は多いのに LINE CV < 30% | フォームの摩擦 | フォーム簡素化・料金の不安解消・クーポン提示 |
| LCP poor が10%超 | 画像・フォントが重い | Hero画像の軽量化・next/image の見直し |
| 特定プランだけ CV が少ない | 価格・訴求のミスマッチ | プランページの写真・説明・料金表記を見直す |

## 5. 目安となる初期目標（3ヶ月後）

- SC: 表示回数 5,000/月・クリック 100/月・CTR 2%以上
- GA4: `line_click` 30件/月
- CWV: LCP「good」が75%以上（モバイル）

数字に届かなくても焦らない。**どの段階で細っているか**を特定して、そこだけ直すのがこのハンドブックの目的。
