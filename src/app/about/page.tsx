import type { Metadata } from "next";
import { buildMetadata, siteConfig } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBooking } from "@/components/sections/CtaBooking";
import { JsonLd } from "@/components/seo/JsonLd";
import { personJsonLd } from "@/lib/jsonld";
import { ImageSlot } from "@/components/media/ImageSlot";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import {
  aboutPortrait,
  aboutAccident,
  aboutHospital,
  aboutMilkyway,
  aboutShooting,
  aboutBookCover,
  aboutBookTalk,
  aboutBookSpread,
  shootingVideo,
} from "@/data/images";
import { teamMembers } from "@/data/team";

export const metadata: Metadata = buildMetadata({
  title: "私たちについて｜代表 稲田圭市のストーリー",
  description:
    "17歳で大きな事故に遭い、20歳で宮古島の星空に救われた星空写真家・稲田圭市。書籍掲載やダークスカイ活動への挑戦まで、宮古島で星空フォトを撮り続ける想いとチームをご紹介します。",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Section>
      <JsonLd data={personJsonLd()} />
      <Breadcrumbs items={[{ name: "私たちについて", path: "/about" }]} />

      {/* ───────── リード（代表挨拶） ───────── */}
      <p className="cosmic-kicker mt-6 text-sm font-semibold tracking-[0.2em]">
        代表挨拶
      </p>
      <h1 className="cosmic-title mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
        一度は星になりかけた僕が、
        <br className="hidden sm:block" />
        星空写真家になるまで。
      </h1>

      <div className="mt-10 grid gap-8 sm:grid-cols-[2fr_3fr] sm:items-start">
        <figure className="cosmic-panel relative aspect-[3/4] w-full overflow-hidden rounded-xl">
          <ImageSlot
            asset={aboutPortrait}
            sizes="(max-width: 640px) 100vw, 40vw"
            priority
          />
        </figure>
        <div className="space-y-4 leading-relaxed text-zinc-300">
          {/* JSXの改行は半角スペースとして描画され文中に不自然な空きができるため、
              各段落はひと続きの文字列で書く */}
          <p>
            代表の{siteConfig.author.name}
            です。この度は、私たちのホームページを訪れていただき、本当に光栄です。
          </p>
          <p>
            この下には、僕が星空にかけるほんのちょっとした「想い」と、これまでの「プロセス」を綴っています。17歳の夜に危うく星になりかけた僕が、なぜ宮古島の夜空に導かれ、星空カメラマンになったのか——。
          </p>
          <p>
            ほんの少しだけ時間をとって、僕の人生を変えた星空の物語に、付き合っていただけたら嬉しいです。
          </p>
        </div>
      </div>

      <hr className="cosmic-rule my-16" />

      {/* ───────── 物語 ───────── */}
      <div className="space-y-20">
        {/* 01 17歳、星になりかけた夜 */}
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <p className="cosmic-kicker text-sm font-semibold tracking-[0.2em]">
              01
            </p>
            <h2 className="mt-2 text-2xl font-bold text-teal-100 sm:text-3xl">
              17歳、星になりかけた夜。
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-zinc-300">
              <p>
                今でも忘れない、高校2年生の11月。おうし座流星群が流れる夜でした。寿司屋のバイトで貯めて買ったお気に入りの原付バイクにまたがり、僕はワクワクしながら大阪の星空スポットへと山道を走らせていました。
              </p>
              <p>
                免許取り立ての17歳。時刻は夜の11時前。前オーナーの改造により90キロ近く出るバイクは、トンネルを抜けた先にある峠の急カーブを曲がりきれませんでした。冷たい空気の中、僕は硬いコンクリートの壁に激突しました。
              </p>
              <p>
                「呼吸ができない——」すぐに立ち上がろうとしましたが、上半身が全く動きません。後ろを走っていた仲間に救われ、救急車で病院へ。下された診断は、首の骨、腰の骨、背骨など計6箇所の骨折。「神経の近くなので手術はできない。今後しびれが出て、下半身が動かなくなるかもしれない」。そう告げられたとき、文字通り、危うく自分が「星」になりかけたことを悟りました。
              </p>
            </div>
          </div>
          <div className="order-1 space-y-4 md:order-2">
            <figure className="cosmic-panel relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <ImageSlot
                asset={aboutAccident}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </figure>
            <figure className="cosmic-panel relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <ImageSlot
                asset={aboutHospital}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </figure>
          </div>
        </section>

        {/* 02 ベッドの上の3ヶ月 */}
        <section>
          <p className="cosmic-kicker text-sm font-semibold tracking-[0.2em]">
            02
          </p>
          <h2 className="mt-2 text-2xl font-bold text-teal-100 sm:text-3xl">
            とてつもなく濃かった、ベッドの上の3ヶ月。
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-zinc-300">
            <p>
              それから3ヶ月間、ベッドの上での寝たきり生活が始まりました。今振り返っても、あの入院期間は人生でトップクラスに濃い思い出です。隣のベッドの人が幻覚を見て「あいつが銃を構えてこっちを狙ってる！」と言いがかりをつけられたり、年末年始に見事インフルエンザにかかったり。極めつけは、高校時代に好きだった子に入院中に彼氏ができたという大失恋。
            </p>
            <p>
              あまりの退屈さに耐えかねて、首の骨が折れたままコルセットをつけて病院を抜け出したこともありました。そんな怒涛の3ヶ月を経て、奇跡的に骨は手術なしで元通りにくっつき、後遺症もなく、再び自分の足で歩けるようになったのです。
            </p>
          </div>
        </section>

        {/* 03 宮古島の星空との出会い */}
        <section className="grid gap-8 md:grid-cols-[3fr_2fr] md:items-center">
          <div>
            <p className="cosmic-kicker text-sm font-semibold tracking-[0.2em]">
              03
            </p>
            <h2 className="mt-2 text-2xl font-bold text-teal-100 sm:text-3xl">
              20歳、宮古島の星空との出会い。
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-zinc-300">
              <p>
                時は流れ20歳のとき、「少しの間だけ」という軽い気持ちで、住み込みの仕事を得て宮古島へ短期移住をしました。そのときに見上げた夜空が、僕の人生で一番綺麗な星空でした。あの17歳の夜、見届けることができなかった星たちが、時を越えて僕を温かく迎えてくれているような気がしたのです。
              </p>
              <p>
                それからというもの、取り憑かれたように星空撮影に没頭しました。星空ナビの会社でアルバイトをしながら腕を磨き、今では星空撮影だけで生活ができるプロのカメラマンになりました。
              </p>
            </div>
            <figure className="cosmic-panel relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl">
              <ImageSlot
                asset={aboutShooting}
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-xs text-zinc-300">
                宮古島の夜、三脚を立てて星を追う
              </figcaption>
            </figure>
          </div>
          <figure className="cosmic-panel relative aspect-[2/3] w-full overflow-hidden rounded-xl">
            <ImageSlot
              asset={aboutMilkyway}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </figure>
        </section>

        {/* 04 書籍掲載 */}
        <section>
          <p className="cosmic-kicker text-sm font-semibold tracking-[0.2em]">
            04
          </p>
          <h2 className="mt-2 text-2xl font-bold text-teal-100 sm:text-3xl">
            まさか、自分が書籍に載る人生になるなんて。
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-zinc-300">
            <p>
              星空を追い続けてきた僕ですが、自分の人生にこんな未来が待っているとは夢にも思っていませんでした。2026年5月、新しく出版された星空に関する書籍『LIFE CHANGING — 人生を変える星空体験』に、プロカメラマンとして僕の活動を掲載していただきました。
            </p>
            <p>
              6億円を投じて建設された、最新鋭の天体望遠鏡とプラネタリウムを備える大規模施設。その星空プロジェクトに合わせて作った書籍にクリエイターとして協力させていただく機会をいただき、本当に光栄に思っています。
            </p>
            <p>
              あの夜、病院のベッドの上で絶望していた17歳の自分に、「お前、将来星空プロジェクトに携わって、本に載るぞ」と言っても、きっと信じないでしょう。星空への情熱は、想像もしなかった素晴らしい景色へと僕を連れてきてくれました。
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <figure className="cosmic-panel relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <ImageSlot asset={aboutBookCover} sizes="(max-width: 640px) 100vw, 33vw" />
            </figure>
            <figure className="cosmic-panel relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <ImageSlot asset={aboutBookTalk} sizes="(max-width: 640px) 100vw, 33vw" />
            </figure>
            <figure className="cosmic-panel relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <ImageSlot asset={aboutBookSpread} sizes="(max-width: 640px) 100vw, 33vw" />
            </figure>
          </div>
        </section>

        {/* 05 ダークスカイ活動 */}
        <section className="cosmic-panel overflow-hidden rounded-2xl p-6 sm:p-10">
          <p className="cosmic-kicker text-sm font-semibold tracking-[0.2em]">
            05
          </p>
          <h2 className="mt-2 text-2xl font-bold text-teal-100 sm:text-3xl">
            この先も、ずっとこの星が見えますように。
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-zinc-300">
            <p>
              宮古島は、日本一星がきれいに撮れる場所です。星空の晴れ舞台である「南の空」に光害（街の明かり）が少なく、何よりハブがいない。そして年中あたたかい。これ以上の可能性を秘めた場所はありません。
            </p>
            <p>
              だからこそ今、僕はプロカメラマンとしての活動の先に、新しい挑戦を始めています。宮古島の星空を「国際星空保護区（ダークスカイ・パーク）」に認定してもらうための活動です。街灯の光を少しだけ下に向けるなど、島の生活や発展を邪魔することなく、ただ宮古島の美しい夜空をそのまま未来へ残すための、優しいルールづくり。
            </p>
            <p>
              このプロジェクトの実現には、これから3年ほどかかる予定です。一度は星になりかけた僕が、命を救ってくれた星空のためにできる恩返し。どうか、暖かく見守っていただけると嬉しいです。
            </p>
          </div>
        </section>

        {/* プロフィール */}
        <section>
          <h2 className="text-xl font-bold text-teal-100">プロフィール</h2>
          <dl className="cosmic-panel mt-4 grid gap-x-8 gap-y-3 rounded-xl p-6 text-sm sm:grid-cols-[auto_1fr] sm:p-8">
            <dt className="font-semibold text-amber-200">氏名</dt>
            <dd className="text-zinc-300">
              {siteConfig.author.name}（いなだ・けいいち）
            </dd>
            <dt className="font-semibold text-amber-200">生年月日</dt>
            <dd className="text-zinc-300">1998年3月14日</dd>
            <dt className="font-semibold text-amber-200">出身</dt>
            <dd className="text-zinc-300">大阪府</dd>
            <dt className="font-semibold text-amber-200">学歴</dt>
            <dd className="text-zinc-300">大阪芸術大学 建築学部 中退</dd>
            <dt className="font-semibold text-amber-200">経歴</dt>
            <dd className="leading-relaxed text-zinc-300">
              2018年、20歳で沖縄県宮古島へ移住。リゾートホテルでの勤務を経て、2020年に独立。星空写真家としての活動を軸に、島の自然と人をつなぐ多角的なクリエイティブ事業を展開している。
            </dd>
          </dl>
        </section>

        {/* チームメンバー */}
        <section>
          <h2 className="cosmic-title text-2xl font-bold sm:text-3xl">
            チームメンバー
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            星空の下で一緒にシャッターを切る、頼れる仲間たち。
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="cosmic-panel cosmic-panel-hover flex gap-5 overflow-hidden rounded-xl p-4 sm:p-5"
              >
                <figure className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-lg sm:w-32">
                  <ImageSlot
                    asset={member.image}
                    sizes="(max-width: 640px) 30vw, 160px"
                  />
                </figure>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-teal-100">
                    {member.name}
                    <span className="ml-2 text-xs font-normal text-amber-200">
                      {member.role}
                    </span>
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">{member.origin}</p>
                  <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                    {member.notes.map((note) => (
                      <li key={note}>・{note}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-zinc-400">
                    特技：
                    <span className="text-teal-200">{member.specialty}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 撮影の様子（動画） */}
        {shootingVideo.src && (
          <section>
            <h2 className="text-xl font-bold text-teal-100">撮影の様子</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-zinc-300">
              天候を読み、月齢を計算し、その日その時間にしか撮れない一枚を狙います。緊張せず自然体でいられる空気づくりも、僕たちが大切にしていることのひとつです。
            </p>
            <div className="cosmic-panel mt-6 overflow-hidden rounded-xl bg-black">
              <VideoPlayer video={shootingVideo} autoPlay={false} />
            </div>
          </section>
        )}
      </div>

      <div className="mt-20">
        <CtaBooking />
      </div>
    </Section>
  );
}
