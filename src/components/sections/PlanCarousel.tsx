"use client";

import {
  Children,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./PlanCarousel.module.css";

const labels = {
  ja: {
    carousel: "カルーセル",
    swipe: "横にスワイプして比較",
    previous: "前のプラン",
    next: "次のプラン",
    pause: "自動スライドを停止",
    play: "自動スライドを再開",
  },
  en: {
    carousel: "carousel",
    swipe: "Swipe to compare",
    previous: "Previous plans",
    next: "Next plans",
    pause: "Pause automatic slides",
    play: "Resume automatic slides",
  },
  ko: {
    carousel: "캐러셀",
    swipe: "옆으로 넘겨 비교해 보세요",
    previous: "이전 플랜",
    next: "다음 플랜",
    pause: "자동 슬라이드 정지",
    play: "자동 슬라이드 재개",
  },
  zh: {
    carousel: "輪播",
    swipe: "左右滑動比較方案",
    previous: "上一個方案",
    next: "下一個方案",
    pause: "暫停自動輪播",
    play: "繼續自動輪播",
  },
};

function subscribeToMotionPreference(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollStops(track: HTMLUListElement) {
  const max = track.scrollWidth - track.clientWidth;
  const gutter = parseFloat(getComputedStyle(track).paddingLeft);
  return [...track.children]
    .map((slide) =>
      Math.max(0, Math.min((slide as HTMLElement).offsetLeft - gutter, max)),
    )
    .filter(
      (position, index, positions) =>
        index === 0 || position - positions[index - 1] > 2,
    );
}

function nearestStop(track: HTMLUListElement, stops: number[]) {
  return stops.reduce(
    (nearest, position, index) =>
      Math.abs(position - track.scrollLeft) <
      Math.abs(stops[nearest] - track.scrollLeft)
        ? index
        : nearest,
    0,
  );
}

/** Native swipe scrolling; automatic movement stops as soon as someone interacts. */
export function PlanCarousel({
  children,
  label,
  locale = "ja",
}: {
  children: ReactNode;
  label: string;
  locale?: Locale | "ja";
}) {
  const slides = Children.toArray(children);
  const text = labels[locale];
  const trackId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const stopsRef = useRef<number[]>([0]);
  const [position, setPosition] = useState({ active: 0, count: 1 });
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getReducedMotion,
    () => false,
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      const stops = getScrollStops(track);
      stopsRef.current = stops;
      setPosition({ active: nearestStop(track, stops), count: stops.length });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = nearestStop(track, stopsRef.current);
        setPosition((previous) =>
          previous.active === active ? previous : { ...previous, active },
        );
      });
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || paused || reducedMotion || position.count < 2) return;
    let visible = false;
    let hovered = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      },
      { threshold: 0.6 },
    );
    observer.observe(track);
    const enter = (event: PointerEvent) => {
      hovered = event.pointerType === "mouse";
    };
    const leave = () => {
      hovered = false;
    };
    track.addEventListener("pointerenter", enter);
    track.addEventListener("pointerleave", leave);
    const timer = window.setInterval(() => {
      if (!visible || hovered || document.hidden) return;
      const stops = stopsRef.current;
      const next = (nearestStop(track, stops) + 1) % stops.length;
      track.scrollTo({ left: stops[next], behavior: "smooth" });
    }, 5000);
    return () => {
      observer.disconnect();
      clearInterval(timer);
      track.removeEventListener("pointerenter", enter);
      track.removeEventListener("pointerleave", leave);
    };
  }, [paused, reducedMotion, position.count]);

  function move(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    setPaused(true);
    const stops = stopsRef.current;
    const next =
      (nearestStop(track, stops) + direction + stops.length) % stops.length;
    track.scrollTo({
      left: stops[next],
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription={text.carousel}
      aria-label={label}
    >
      <ul
        ref={trackRef}
        id={trackId}
        className={styles.track}
        onPointerDown={() => setPaused(true)}
        onWheel={() => setPaused(true)}
        onFocusCapture={() => setPaused(true)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          const links = [
            ...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[href]"),
          ];
          const current = links.indexOf(event.target as HTMLAnchorElement);
          if (current < 0) return;
          event.preventDefault();
          setPaused(true);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          links[(current + direction + links.length) % links.length].focus();
        }}
      >
        {slides.map((slide, index) => (
          <li key={index} className={styles.slide}>
            {slide}
          </li>
        ))}
      </ul>
      {position.count > 1 && (
        <div className={styles.controls}>
          <div className={styles.status}>
            <span
              className={styles.counter}
              aria-live={paused || reducedMotion ? "polite" : "off"}
            >
              {String(position.active + 1).padStart(2, "0")}
              <span> / {String(position.count).padStart(2, "0")}</span>
            </span>
            <span className={styles.hint}>{text.swipe}</span>
          </div>
          <div className={styles.buttons}>
            {!reducedMotion && (
              <button
                type="button"
                aria-label={paused ? text.play : text.pause}
                aria-controls={trackId}
                onClick={() => setPaused((value) => !value)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {paused ? (
                    <path d="m6 3 11 7-11 7V3Z" />
                  ) : (
                    <path d="M5 3h3v14H5zm7 0h3v14h-3z" />
                  )}
                </svg>
              </button>
            )}
            <button
              type="button"
              aria-label={text.previous}
              aria-controls={trackId}
              onClick={() => move(-1)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m13 6-6 6 6 6M7 12h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label={text.next}
              aria-controls={trackId}
              onClick={() => move(1)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m11 6 6 6-6 6M5 12h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
