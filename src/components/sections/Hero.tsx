import Link from "next/link";

// 24px の極小ぼかし（LQIP）。最初の1フレームから星空のぼかしを描画し、
// 「青いグラデーション → 画像がパッと出る」初回ちらつきを防ぐ。インラインなので追加リクエスト不要。
const HERO_LQIP =
  "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAUCAwT/xAAeEAACAgICAwAAAAAAAAAAAAABAgADBBExQSEycf/EABYBAQEBAAAAAAAAAAAAAAAAAAMBAv/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwBWuKQoHJ7OuZB8cD28Rk1oVCFQfe4svsJ3FFWPICjYEJVa24TNWP/Z";

/**
 * トップページのファーストビュー。
 * 宮古島の星空写真を背景に、暗めのグラデーションを重ねて文字を読みやすくする
 * 静的なヒーロー（クライアントJS不要のサーバーコンポーネント）。
 */
export function Hero() {
  return (
    <section className="relative -mt-28 flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#050a1c] pt-28 md:mt-0 md:pt-0">
      {/* LCP（ヒーロー写真）を最優先で先読み。デバイスに合う1枚の AVIF だけを
          取得するよう media で出し分け、HTMLパース前から並行ダウンロードを開始する。
          React がこの <link> を <head> に巻き上げる。 */}
      <link
        rel="preload"
        as="image"
        href="/images/hero/hero-star-mobile.avif"
        type="image/avif"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/hero/hero-star-desktop.avif"
        type="image/avif"
        media="(min-width: 768px)"
        fetchPriority="high"
      />

      {/* 即時表示の LQIP（本画像ロード前のちらつき防止）。bg-cover で全面に敷く。 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO_LQIP}")` }}
      />

      {/* 本画像：PC（md以上）＝横長 / スマホ＝縦長 を picture で出し分け。
          表示される1枚だけをDLし（二重取得を回避）、誤った向きの一瞬表示も起きない。
          fetchPriority=high で LCP を優先読み込み。 */}
      <picture>
        {/* PC（md以上）＝横長。AVIF → WebP → JPEG の順で軽い形式を優先 */}
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet="/images/hero/hero-star-desktop.avif"
        />
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet="/images/hero/hero-star-desktop.webp"
        />
        <source
          media="(min-width: 768px)"
          srcSet="/images/hero/hero-star-desktop.jpg"
        />
        {/* スマホ＝縦長。AVIF → WebP →（img の JPEG フォールバック） */}
        <source type="image/avif" srcSet="/images/hero/hero-star-mobile.avif" />
        <source type="image/webp" srcSet="/images/hero/hero-star-mobile.webp" />
        <img
          src="/images/hero/hero-star-mobile.jpg"
          alt="宮古島の満天の星空と天の川｜KEY PHOTO 宮古島"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* 文字を読みやすくする暗めのグラデーション（上＝ヘッダー、下＝コピー/次セクション接続） */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,20,0.62)_0%,rgba(3,6,20,0.14)_26%,rgba(3,6,20,0.5)_62%,rgba(5,8,20,0.95)_100%)]"
      />
      {/* シネマティックなビネットで高級感を出す */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_38%,transparent_44%,rgba(2,4,14,0.6)_100%)]"
      />

      {/* 星空が旋律のようにつながる、軽量なCSS/SVGアニメーション */}
      <div aria-hidden className="cosmic-aurora-stage">
        <span className="cosmic-aurora cosmic-aurora-one" />
        <span className="cosmic-aurora cosmic-aurora-two" />
      </div>
      <div aria-hidden className="cosmic-orbit-map" />
      <div aria-hidden className="cosmic-viewfinder">
        <span className="cosmic-viewfinder-corner cosmic-viewfinder-tl" />
        <span className="cosmic-viewfinder-corner cosmic-viewfinder-tr" />
        <span className="cosmic-viewfinder-corner cosmic-viewfinder-bl" />
        <span className="cosmic-viewfinder-corner cosmic-viewfinder-br" />
        <span className="cosmic-focus-ring" />
        <span className="cosmic-focus-dot" />
      </div>
      <svg
        aria-hidden
        className="cosmic-score"
        viewBox="0 0 1000 420"
        preserveAspectRatio="none"
      >
        <path
          className="cosmic-score-line cosmic-score-line-one"
          d="M-40 310 C120 250 175 110 330 165 S540 350 710 210 S900 85 1040 145"
          pathLength="1"
        />
        <path
          className="cosmic-score-line cosmic-score-line-two"
          d="M-20 365 C150 335 225 205 390 250 S620 390 785 285 S930 205 1030 245"
          pathLength="1"
        />
        <g className="cosmic-score-notes">
          <circle className="cosmic-score-note note-one" cx="170" cy="205" r="4" />
          <circle className="cosmic-score-note note-two" cx="330" cy="165" r="5" />
          <circle className="cosmic-score-note note-three" cx="535" cy="290" r="4" />
          <circle className="cosmic-score-note note-four" cx="710" cy="210" r="5" />
          <circle className="cosmic-score-note note-five" cx="885" cy="110" r="4" />
        </g>
      </svg>
      <span aria-hidden className="cosmic-meteor cosmic-meteor-one" />
      <span aria-hidden className="cosmic-meteor cosmic-meteor-two" />
      <span aria-hidden className="cosmic-meteor cosmic-meteor-three" />

      {/* コピー＋CTA */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
        <p className="text-sm font-semibold tracking-[0.4em] text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.5)] sm:text-base">
          KEY PHOTO 宮古島
        </p>
        {/* SEO: h1 に主要KW（宮古島の星空フォト）を含める。ブランドコピーは大きく、KW行は小さく上に */}
        <h1 className="mt-6">
          <span className="block text-sm font-semibold tracking-[0.32em] text-teal-100 drop-shadow-[0_1px_16px_rgba(4,8,28,0.8)] sm:text-base">
            宮古島の星空フォト・記念日撮影
          </span>
          <span className="mt-4 block text-4xl font-black leading-tight tracking-wide text-white drop-shadow-[0_2px_36px_rgba(4,8,28,0.7)] sm:text-6xl lg:text-7xl">
            星は、記憶を照らす。
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-200 drop-shadow-[0_1px_18px_rgba(4,8,28,0.75)] sm:text-base">
          宮古島の静かな夜、満天の星、天の川。
          大切な人との時間を、忘れられない一枚に。
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/booking?from=hero"
            data-ga-event="reservation_click"
            data-ga-button="hero"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-amber-200/70 bg-amber-300 px-7 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-300/20 transition-colors hover:bg-teal-200"
          >
            予約・相談する
          </Link>
          <Link
            href="/plans"
            data-ga-event="plan_click"
            data-ga-button="hero_plans"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-teal-200/40 bg-slate-950/45 px-7 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-amber-200/70 hover:text-amber-100"
          >
            撮影プランを見る
          </Link>
        </div>
      </div>

      {/* 次セクション（#050814）へ自然につなぐ最下部のフェード */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,#050814_100%)]"
      />
    </section>
  );
}
