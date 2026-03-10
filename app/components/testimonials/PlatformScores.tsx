'use client';

/**
 * PlatformScores — Verified social proof section.
 *
 * Design principle: Apple-style confidence. One big truth, then supporting detail.
 * No fake time-series charts. Shows real, manually-maintained platform ratings
 * plus a rating distribution that's honest and meaningful to visitors.
 *
 * ─── HOW TO UPDATE REAL DATA ──────────────────────────────────────────────
 * 1. Visit each platform page and note the current score.
 * 2. Update the PLATFORMS array and DISTRIBUTION below.
 * 3. Update LAST_UPDATED to today's date.
 * That's it. No API needed, no fake numbers.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   ★  CONFIGURATION — update these with real values  ★
───────────────────────────────────────────────────────────────── */
const OVERALL = {
  score: 4.2,
  max: 5,
  label: 'Mükemmel',
  reviewCount: '3.000+',
};

const PLATFORMS = [
  {
    id: 'google',
    label: 'Google',
    score: 4.4,
    max: 5,
    url: 'https://maps.google.com',
  },
  {
    id: 'yandex',
    label: 'Yandex',
    score: 4.3,
    max: 5,
    url: 'https://yandex.com',
  },
  {
    id: 'foursquare',
    label: 'Foursquare',
    score: 8.2,
    max: 10,
    url: 'https://foursquare.com',
  },
  { id: 'guru', label: 'Guru', score: 4.0, max: 5, url: '#' },
] as const;

const DISTRIBUTION = [
  { stars: 5, pct: 58 },
  { stars: 4, pct: 24 },
  { stars: 3, pct: 11 },
  { stars: 2, pct: 4 },
  { stars: 1, pct: 3 },
];

const LAST_UPDATED = 'Mayıs 2025';

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────── */
const T = {
  accent: '#9d00ff',
  accentBorder: 'rgba(157,0,255,0.3)',
  accentFill: 'rgba(157,0,255,0.08)',
  accentGlow: 'rgba(157,0,255,0.35)',
  accentLight: 'rgba(157,0,255,0.6)',

  w96: 'rgba(255,255,255,0.96)',
  w80: 'rgba(255,255,255,0.80)',
  w55: 'rgba(255,255,255,0.55)',
  w30: 'rgba(255,255,255,0.30)',
  w14: 'rgba(255,255,255,0.14)',
  w07: 'rgba(255,255,255,0.07)',
  w04: 'rgba(255,255,255,0.04)',

  green: '#4ade80',
  greenFill: 'rgba(74,222,128,0.1)',
  greenBorder: 'rgba(74,222,128,0.25)',
};

/* ─────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────── */
function useReveal(threshold: number = 0.35) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useAnimatedNumber(target: number, duration: number = 900) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

/**
 * ROOT CAUSE FIX — replaced useContainerWidth with useWindowWidth.
 */
function useWindowWidth() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return w;
}

/* ─────────────────────────────────────────────────────────────────
   STAR ICONS
───────────────────────────────────────────────────────────────── */

/** Binary star — used only in DistributionRow (unchanged). */
const StarIcon = ({
  filled,
  size = 13,
}: {
  filled: boolean;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox='0 0 20 20' aria-hidden='true'>
    <path
      d='M10 1l2.5 6.5H19l-5.5 4 2 6.5L10 14l-5.5 4 2-6.5-5.5-4h6.5z'
      fill={filled ? T.accent : T.w14}
    />
  </svg>
);

/**
 * PartialStarIcon — renders a star filled from 0.0 (empty) to 1.0 (full).
 * Uses a clipPath to reveal the accent colour proportionally left-to-right,
 * with the unfilled portion showing T.w14 behind it.
 *
 * Used for: hero score stars + platform card stars.
 */
const PartialStarIcon = ({
  fill,
  size = 13,
}: {
  fill: number; // 0.0 → 1.0
  size?: number;
}) => {
  const clampedFill = Math.min(1, Math.max(0, fill));
  // Unique clip-path id per fill value + size to avoid SVG id collisions
  const clipId = `pstar-${size}-${Math.round(clampedFill * 1000)}`;
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' aria-hidden='true'>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={20 * clampedFill} height={20} />
        </clipPath>
      </defs>
      {/* Unfilled background star */}
      <path
        d='M10 1l2.5 6.5H19l-5.5 4 2 6.5L10 14l-5.5 4 2-6.5-5.5-4h6.5z'
        fill={T.w14}
      />
      {/* Filled portion — clipped to fill% */}
      <path
        d='M10 1l2.5 6.5H19l-5.5 4 2 6.5L10 14l-5.5 4 2-6.5-5.5-4h6.5z'
        fill={T.accent}
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
};

/**
 * Helper: given a score on an arbitrary scale (e.g. 8.2/10),
 * return an array of 5 fill values (0–1) for PartialStarIcon.
 *
 * Example: score=4.2, max=5
 *   normalised = 4.2 → fills = [1, 1, 1, 1, 0.2]
 *
 * Example: score=8.2, max=10
 *   normalised = 4.1 → fills = [1, 1, 1, 1, 0.1]
 */
function starFills(score: number, max: number): number[] {
  const normalised = (score / max) * 5; // project onto /5 scale
  return Array.from({ length: 5 }, (_, i) =>
    Math.min(1, Math.max(0, normalised - i)),
  );
}

/* ─────────────────────────────────────────────────────────────────
   DISTRIBUTION ROW
───────────────────────────────────────────────────────────────── */
const DistributionRow = ({
  stars,
  pct,
  delay,
  visible,
}: {
  stars: number;
  pct: number;
  delay: number;
  visible: boolean;
}) => {
  const [barW, setBarW] = useState('0%');
  const pctRef = useRef(pct);
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setBarW(`${pctRef.current}%`), delay);
    return () => clearTimeout(id);
  }, [visible, delay]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateX(-8px)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < stars} size={10} />
        ))}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: 5,
          borderRadius: 99,
          background: T.w07,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 99,
            width: barW,
            background:
              stars >= 4
                ? `linear-gradient(90deg, rgba(90,0,160,0.8), ${T.accent})`
                : stars === 3
                  ? T.w30
                  : T.w14,
            boxShadow: stars >= 4 ? `0 0 10px ${T.accentGlow}` : 'none',
            transition: `width 1.2s cubic-bezier(0.16,1,0.3,1)`,
          }}
        />
      </div>

      <span
        style={{
          fontSize: '0.63rem',
          color: stars >= 4 ? T.w80 : T.w30,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: stars >= 4 ? 600 : 400,
          flexShrink: 0,
          width: 28,
          textAlign: 'right',
        }}
      >
        {pct}%
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   PLATFORM CARD
───────────────────────────────────────────────────────────────── */
const PlatformCard = ({
  platform,
  delay,
  visible,
  isMobile,
}: {
  platform: (typeof PLATFORMS)[number];
  delay: number;
  visible: boolean;
  isMobile: boolean;
}) => {
  const pct = Math.round((platform.score / platform.max) * 100);
  const [barW, setBarW] = useState('0%');
  const pctRef = useRef(pct);

  // Partial fill values for this platform's score on /5 scale
  const fills = starFills(platform.score, platform.max);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setBarW(`${pctRef.current}%`), delay + 200);
    return () => clearTimeout(id);
  }, [visible, delay]);

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        padding: '20px 20px 18px',
        borderRadius: 16,
        border: `1px solid ${T.w07}`,
        background: T.w04,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(14px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top shimmer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${T.w07}, transparent)`,
          pointerEvents: 'none',
        }}
      />
      {/* Platform name */}
      <span
        style={{
          fontSize: '.85rem',
          letterSpacing: '0.02em',
          color: T.w30,
          fontWeight: 400,
        }}
      >
        {platform.label}
      </span>
      {/* Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: T.w96,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {platform.score.toFixed(1)}
        </span>
        <span style={{ fontSize: '0.65rem', color: T.w30, fontWeight: 400 }}>
          /{platform.max}
        </span>
      </div>

      {/* ★ Partial stars — filled proportionally to the platform score ★ */}
      <div style={{ display: 'flex', gap: 3 }}>
        {fills.map((fill, i) => (
          <PartialStarIcon key={i} fill={fill} size={11} />
        ))}
      </div>

      {/* Thin progress bar */}
      <div
        style={{
          height: 2,
          borderRadius: 99,
          background: T.w07,
          overflow: 'hidden',
          marginTop: 3,
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 99,
            width: barW,
            background: `linear-gradient(90deg, rgba(90,0,160,0.7), ${T.accent})`,
            transition: 'width 1.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* Verified badge */}
      <div
        className='absolute top-2 right-2 hidden md:inline-flex '
        style={{
          alignItems: 'center',
          gap: 8,
          marginTop: 7,
          padding: isMobile ? '7px 7px' : '7px 14px 7px 10px',
          borderRadius: 99,
          background: T.greenFill,
          border: `1px solid ${T.greenBorder}`,
          boxShadow: `0 0 16px rgba(74,222,128,0.08)`,
          width: 'fit-content',
        }}
      >
        <svg
          width={17}
          height={17}
          viewBox='0 0 20 20'
          aria-hidden='true'
          style={{ flexShrink: 0 }}
        >
          <circle cx={10} cy={10} r={9.5} fill='rgba(74,222,128,0.15)' />
          <circle
            cx={10}
            cy={10}
            r={9}
            fill='none'
            stroke={T.green}
            strokeWidth={1.5}
          />
          <path
            d='M6.2 10.2l2.5 2.6 5-5.2'
            fill='none'
            stroke={T.green}
            strokeWidth={1.7}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <span
          className='hidden sm:inline'
          style={{
            fontSize: '0.6rem',
            color: T.green,
            fontWeight: 400,
            letterSpacing: '0.025em',
          }}
        >
          Doğrulandı
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const PlatformScores: React.FC = () => {
  const { ref: rootRef, visible } = useReveal(0.35);
  const { ref: distRef, visible: distVisible } = useReveal(0.35);
  const animScore = useAnimatedNumber(visible ? OVERALL.score : 0, 1100);

  const w = useWindowWidth();
  const isMobile = w > 0 && w < 650;
  const isTablet = w >= 650 && w < 960;

  // Partial fill values for the animated hero score
  const heroFills = starFills(animScore, OVERALL.max);

  return (
    <section
      ref={rootRef}
      aria-label='Platform değerlendirmeleri'
      className='px-12 pt-28 lg:pt-36 pb-16 lg:pb-48'
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition:
          'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* ════════════ HEADER ════════════ */}
      <div style={{ marginBottom: isMobile ? 40 : 56 }}>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.08,
          }}
          className='font-bold text-white leading-[1.02] tracking-[-0.03em]'
          style={{ fontSize: 'clamp(2.7rem, 6vw, 4.4rem)' }}
        >
          Platform Puanlamaları
        </motion.h2>
      </div>

      <div>
        {/* ════════════ HERO SCORE BLOCK ════════════ */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 32 : 48,
            marginBottom: 48,
          }}
        >
          {/* Left: score */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: isMobile ? 12 : 18,
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: isMobile
                    ? '5rem'
                    : isTablet
                      ? '6rem'
                      : 'clamp(5rem, 10vw, 8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.055em',
                  color: T.w96,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 0.9,
                }}
              >
                {animScore.toFixed(1)}
              </span>
              <div style={{ paddingBottom: isMobile ? 8 : 14 }}>
                <span
                  style={{ fontSize: '1rem', color: T.w30, fontWeight: 300 }}
                >
                  / {OVERALL.max}
                </span>
              </div>
            </div>

            {/* ★ Partial stars — animate alongside the counting score ★ */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {heroFills.map((fill, i) => (
                <PartialStarIcon
                  key={i}
                  fill={fill}
                  size={isMobile ? 16 : 18}
                />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: 700,
                  color: T.w96,
                }}
              >
                {OVERALL.label}
              </span>
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 99,
                  background: T.w30,
                }}
              />
              <span
                style={{ fontSize: '0.78rem', color: T.w55, fontWeight: 400 }}
              >
                {OVERALL.reviewCount} değerlendirme
              </span>
            </div>
          </div>

          {/* Vertical divider (non-mobile only) */}
          {!isMobile && (
            <div
              style={{
                width: 1,
                alignSelf: 'stretch',
                background: `linear-gradient(to bottom, transparent, ${T.w14} 20%, ${T.w14} 80%, transparent)`,
                flexShrink: 0,
              }}
            />
          )}

          {/* Right: distribution bars */}
          <div
            ref={distRef}
            style={{
              flex: 1,
              width: '100%',
              minWidth: 0,
              maxWidth: isMobile ? '100%' : 480,
            }}
          >
            <p
              style={{
                fontSize: '0.52rem',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: T.w30,
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              Puan Dağılımı
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? 13 : 11,
              }}
            >
              {DISTRIBUTION.map((row, idx) => (
                <DistributionRow
                  key={row.stars}
                  stars={row.stars}
                  pct={row.pct}
                  delay={idx * 90}
                  visible={distVisible}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ PLATFORM CARDS ════════════ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              w > 0 && w < 960 ? '1fr 1fr' : `repeat(${PLATFORMS.length}, 1fr)`,
            gap: isMobile ? 10 : 12,
            marginBottom: 32,
          }}
        >
          {PLATFORMS.map((p, i) => (
            <PlatformCard
              key={p.id}
              platform={p}
              delay={i * 80}
              visible={visible}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* ════════════ FOOTER NOTE ════════════ */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 12,
            paddingTop: 20,
            borderTop: `1px solid ${T.w07}`,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 600ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: T.green,
                boxShadow: `0 0 8px ${T.greenBorder}`,
              }}
            />
            <span style={{ fontSize: '0.6rem', color: T.w30, fontWeight: 400 }}>
              Tüm değerlendirmeler bağımsız platformlardan alınmış ve
              onaylanmıştır.
            </span>
          </div>
          <span
            style={{
              fontSize: '0.58rem',
              color: T.w30,
              fontWeight: 400,
              whiteSpace: 'nowrap',
            }}
          >
            Son güncelleme: {LAST_UPDATED}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PlatformScores;
