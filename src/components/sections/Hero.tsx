import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/media/ImageSlot";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <p className="eyebrow">MIYAKOJIMA, OKINAWA</p>
        <p className={styles.intro}>宮古島の星空フォト・記念日撮影</p>
        <h1 id="hero-title" className={styles.title}>
          この夜を、
          <br />
          一生の一枚に。
        </h1>
        <p className={styles.description}>
          見上げれば、数えきれない星。
          <br />
          隣には、大切な人。
          <br />
          宮古島で出会う特別な夜を、写真に残しませんか。
        </p>
        <div className={styles.actions}>
          <Button href="/plans">
            撮影プランを見る<span aria-hidden="true">↗</span>
          </Button>
          <Link
            href="/booking?from=hero"
            data-ga-event="reservation_click"
            data-ga-button="hero"
            className={styles.consult}
          >
            予約・相談する<span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className={styles.note}>カップル・ご家族・記念日・プロポーズ</p>
        <a href="#experience" className={styles.scroll}>
          <span aria-hidden="true">↓</span> この夜の体験について
        </a>
      </div>
      <div className={styles.photos}>
        <figure className={styles.mainPhoto}>
          <ImageSlot
            asset={{
              src: "/images/plans/standard-13-couple-deck-milkyway-arch.jpg",
              alt: "宮古島の天の川が広がる夜空の下、デッキで向き合う二人",
            }}
            priority
            sizes="(max-width: 767px) 100vw, 60vw"
          />
          <figcaption className={styles.photoCaption}>
            <span>A night to remember.</span>
            <span>KEY PHOTO / MIYAKOJIMA</span>
          </figcaption>
        </figure>
        <figure className={styles.smallPhoto}>
          <Image
            src="/images/hero/hero-star-mobile.avif"
            alt="宮古島のビーチで天の川に手を伸ばす女性"
            fill
            sizes="(max-width: 767px) 25vw, 14vw"
            className="object-cover"
          />
        </figure>
        <p className={styles.sideNote}>星と、あなたと、宮古島。</p>
      </div>
    </section>
  );
}
