'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { testimonies } from './Collection';
import PlatformScores from './PlatformScores';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   ANIMATION CONSTANTS
───────────────────────────────────────────────────────────────── */
const RUSH_SPEED = 10.6;
const DRIFT_SPEED = 0.52;
const LERP_K = 0.072;

const LINE_DUR_MS = 340;
const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const CARDS_START_MS = LINE_DUR_MS + 30;
const LINE2_START_MS = CARDS_START_MS + 460;
const DRIFT_START_MS = LINE2_START_MS + LINE_DUR_MS;

/* ─────────────────────────────────────────────────────────────────
   SLOTS
───────────────────────────────────────────────────────────────── */
interface Slot {
  xR: number;
  wR: number;
  speedMult: number;
  startOff: number;
  xPool: number[];
}
const SLOTS_DESKTOP: Slot[] = [
  {
    xR: 0.0,
    wR: 0.175,
    speedMult: 1.3,
    startOff: 0,
    xPool: [0.0, 0.008, 0.004],
  },
  {
    xR: 0.195,
    wR: 0.17,
    speedMult: 0.92,
    startOff: 320,
    xPool: [0.195, 0.188, 0.202],
  },
  {
    xR: 0.37,
    wR: 0.178,
    speedMult: 1.48,
    startOff: 75,
    xPool: [0.37, 0.363, 0.377],
  },
  {
    xR: 0.565,
    wR: 0.168,
    speedMult: 0.82,
    startOff: 455,
    xPool: [0.565, 0.558, 0.572],
  },
  {
    xR: 0.705,
    wR: 0.17,
    speedMult: 1.36,
    startOff: 188,
    xPool: [0.705, 0.698, 0.712],
  },
  {
    xR: 0.845,
    wR: 0.152,
    speedMult: 0.88,
    startOff: 530,
    xPool: [0.845, 0.838, 0.852],
  },
  {
    xR: 0.048,
    wR: 0.158,
    speedMult: 1.52,
    startOff: 498,
    xPool: [0.048, 0.042, 0.055],
  },
  {
    xR: 0.415,
    wR: 0.168,
    speedMult: 0.78,
    startOff: 400,
    xPool: [0.415, 0.408, 0.422],
  },
  {
    xR: 0.752,
    wR: 0.152,
    speedMult: 1.2,
    startOff: 565,
    xPool: [0.752, 0.745, 0.759],
  },
];
const SLOTS_TABLET: Slot[] = [
  { xR: 0.01, wR: 0.29, speedMult: 1.3, startOff: 0, xPool: [0.01, 0.016] },
  { xR: 0.35, wR: 0.285, speedMult: 0.88, startOff: 250, xPool: [0.35, 0.344] },
  { xR: 0.675, wR: 0.3, speedMult: 1.46, startOff: 80, xPool: [0.675, 0.669] },
  {
    xR: 0.028,
    wR: 0.275,
    speedMult: 0.82,
    startOff: 450,
    xPool: [0.028, 0.034],
  },
  { xR: 0.368, wR: 0.3, speedMult: 1.38, startOff: 318, xPool: [0.368, 0.362] },
  {
    xR: 0.672,
    wR: 0.285,
    speedMult: 0.9,
    startOff: 520,
    xPool: [0.672, 0.678],
  },
];
const SLOTS_MOBILE: Slot[] = [
  { xR: 0.02, wR: 0.46, speedMult: 1.3, startOff: 0, xPool: [0.02, 0.014] },
  { xR: 0.52, wR: 0.46, speedMult: 0.88, startOff: 260, xPool: [0.52, 0.514] },
  {
    xR: 0.024,
    wR: 0.455,
    speedMult: 1.46,
    startOff: 504,
    xPool: [0.024, 0.03],
  },
  {
    xR: 0.514,
    wR: 0.465,
    speedMult: 0.84,
    startOff: 758,
    xPool: [0.514, 0.52],
  },
];
function getSlotsForWidth(w: number): Slot[] {
  if (w < 640) return SLOTS_MOBILE;
  if (w < 1024) return SLOTS_TABLET;
  return SLOTS_DESKTOP;
}

/* ─────────────────────────────────────────────────────────────────
   CARD VARIANTS
───────────────────────────────────────────────────────────────── */
const CARD_VARIANTS = [
  {
    bg: 'linear-gradient(150deg, rgba(22,12,38,0.98) 0%, rgba(11,9,20,0.98) 100%)',
    borderColor: 'rgba(157,0,255,0.38)',
    shadow: '0 2px 0 0 rgba(157,0,255,0.18)',
    lineBg:
      'linear-gradient(90deg,transparent,rgba(157,0,255,0.80),transparent)',
    quoteColor: 'rgba(157,0,255,0.07)',
    starFill: 'rgba(194,0,216,0.85)',
    dotColor: 'rgba(157,0,255,0.65)',
    divider: 'rgba(157,0,255,0.14)',
    authorBg: 'rgba(157,0,255,0.10)',
    authorBorder: 'rgba(157,0,255,0.22)',
  },
  {
    bg: 'linear-gradient(150deg, rgba(26,18,4,0.98) 0%, rgba(14,11,4,0.98) 100%)',
    borderColor: 'rgba(255,200,0,0.34)',
    shadow: '0 2px 0 0 rgba(255,200,0,0.14)',
    lineBg:
      'linear-gradient(90deg,transparent,rgba(255,215,0,0.80),transparent)',
    quoteColor: 'rgba(255,215,0,0.065)',
    starFill: 'rgba(255,215,0,0.90)',
    dotColor: 'rgba(255,215,0,0.60)',
    divider: 'rgba(255,215,0,0.12)',
    authorBg: 'rgba(255,215,0,0.08)',
    authorBorder: 'rgba(255,215,0,0.20)',
  },
  {
    bg: 'linear-gradient(150deg, rgba(28,8,18,0.98) 0%, rgba(14,7,11,0.98) 100%)',
    borderColor: 'rgba(255,25,135,0.36)',
    shadow: '0 2px 0 0 rgba(255,25,135,0.16)',
    lineBg:
      'linear-gradient(90deg,transparent,rgba(255,25,135,0.80),transparent)',
    quoteColor: 'rgba(255,25,135,0.07)',
    starFill: 'rgba(255,80,160,0.85)',
    dotColor: 'rgba(255,25,135,0.65)',
    divider: 'rgba(255,25,135,0.13)',
    authorBg: 'rgba(255,25,135,0.09)',
    authorBorder: 'rgba(255,25,135,0.22)',
  },
  {
    bg: 'linear-gradient(150deg, rgba(18,18,24,0.98) 0%, rgba(10,10,16,0.98) 100%)',
    borderColor: 'rgba(255,255,255,0.12)',
    shadow: '0 2px 0 0 rgba(255,255,255,0.05)',
    lineBg:
      'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
    quoteColor: 'rgba(255,255,255,0.055)',
    starFill: 'rgba(255,215,0,0.75)',
    dotColor: 'rgba(255,255,255,0.38)',
    divider: 'rgba(255,255,255,0.07)',
    authorBg: 'rgba(255,255,255,0.05)',
    authorBorder: 'rgba(255,255,255,0.10)',
  },
] as const;

/* ─────────────────────────────────────────────────────────────────
   HOOKS & HELPERS
───────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.54) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
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

const Stars = ({ fill, size = 11 }: { fill: string; size?: number }) => (
  <div className='flex items-center gap-0.75'>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width={size}
        height={size}
        viewBox='0 0 20 20'
        aria-hidden='true'
      >
        <path
          d='M10 1l2.5 6.5H19l-5.5 4 2 6.5L10 14l-5.5 4 2-6.5-5.5-4h6.5z'
          fill={fill}
        />
      </svg>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const Testimonials = ({ id }: Props) => {
  const { ref: revealRef, visible: sectionVisible } = useReveal(0.54);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const yPosRef = useRef<number[]>([]);
  const cardHeightsRef = useRef<number[]>([]);
  const speedRef = useRef(RUSH_SPEED);
  const targetSpeedRef = useRef(RUSH_SPEED);
  const cardsActiveRef = useRef(false);
  const seqDoneRef = useRef(false);
  const xCycleRef = useRef<number[]>([]);

  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const [slots, setSlots] = useState<Slot[]>(SLOTS_DESKTOP);
  const [line2Visible, setLine2Visible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setContainerW(el.offsetWidth);
      setContainerH(el.offsetHeight);
      setSlots(getSlotsForWidth(el.offsetWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!containerW) return;
    const t = setTimeout(() => {
      cardHeightsRef.current = cardRefs.current.map(
        (el) => el?.offsetHeight ?? 200,
      );
    }, 150);
    return () => clearTimeout(t);
  }, [containerW, slots]);

  useEffect(() => {
    xCycleRef.current = slots.map(() => 0);
  }, [slots]);

  useEffect(() => {
    if (!sectionVisible) return;
    const t1 = setTimeout(() => {
      cardsActiveRef.current = true;
    }, CARDS_START_MS);
    const t2 = setTimeout(() => {
      setLine2Visible(true);
    }, LINE2_START_MS);
    const t3 = setTimeout(() => {
      targetSpeedRef.current = DRIFT_SPEED;
      seqDoneRef.current = true;
    }, DRIFT_START_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [sectionVisible]);

  useEffect(() => {
    if (!containerW || !containerH || slots.length === 0 || !sectionVisible)
      return;

    yPosRef.current = slots.map((s) => containerH + s.startOff);
    cardRefs.current.forEach((el, i) => {
      if (el) el.style.transform = `translateY(${yPosRef.current[i]}px)`;
    });

    if (seqDoneRef.current) {
      cardsActiveRef.current = true;
      speedRef.current = DRIFT_SPEED;
      targetSpeedRef.current = DRIFT_SPEED;
    } else {
      cardsActiveRef.current = false;
      speedRef.current = RUSH_SPEED;
      targetSpeedRef.current = RUSH_SPEED;
    }

    let raf: number;
    const tick = () => {
      if (cardsActiveRef.current) {
        speedRef.current +=
          (targetSpeedRef.current - speedRef.current) * LERP_K;
        const spd = speedRef.current;
        for (let i = 0; i < slots.length; i++) {
          const card = cardRefs.current[i];
          if (!card) continue;
          yPosRef.current[i] -= spd * slots[i].speedMult;
          if (yPosRef.current[i] < -((cardHeightsRef.current[i] ?? 200) + 40)) {
            xCycleRef.current[i] =
              (xCycleRef.current[i] + 1) % slots[i].xPool.length;
            card.style.left = `${Math.round(slots[i].xPool[xCycleRef.current[i]] * containerW)}px`;
            yPosRef.current[i] = containerH + 24;
          }
          card.style.transform = `translateY(${yPosRef.current[i]}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [containerW, containerH, slots, sectionVisible]);

  return (
    <section
      id={id}
      className='relative bg-secondaryColor overflow-hidden'
      aria-labelledby='testimonials-heading'
    >
      {/* ══════════════════════════════════════════
          PART 1 — FLOATING CARDS STAGE
      ══════════════════════════════════════════ */}
      <div ref={revealRef}>
        <div
          ref={containerRef}
          className='relative w-full overflow-hidden'
          style={{
            height: 'clamp(680px, 100vh, 980px)',
            opacity: containerW > 0 && sectionVisible ? 1 : 0,
            transition: sectionVisible
              ? 'opacity 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
              : 'none',
          }}
        >
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'radial-gradient(ellipse 75% 55% at 50% 58%, rgba(255,25,135,0.036) 0%, transparent 65%)',
            }}
          />

          {containerW > 0 &&
            slots.map((slot, i) => {
              const t = testimonies[i % testimonies.length];
              const v = CARD_VARIANTS[i % CARD_VARIANTS.length];
              const initY = containerH + slot.startOff;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className='absolute top-0'
                  style={{
                    left: Math.round(containerW * slot.xR),
                    width: Math.round(containerW * slot.wR),
                    transform: `translateY(${initY}px)`,
                    willChange: 'transform',
                    zIndex: slot.speedMult >= 1.0 ? 3 : 2,
                    background: v.bg,
                    border: `1px solid ${v.borderColor}`,
                    borderRadius: '16px',
                    boxShadow: `0 16px 48px rgba(0,0,0,0.60), ${v.shadow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '18px 17px 15px',
                    gap: 0,
                  }}
                >
                  <div
                    className='absolute top-0 left-0 right-0 h-px pointer-events-none'
                    style={{ background: v.lineBg }}
                  />
                  <div
                    aria-hidden='true'
                    className='absolute pointer-events-none select-none'
                    style={{
                      top: '-6px',
                      right: '9px',
                      fontSize: '5.2rem',
                      lineHeight: 1,
                      color: v.quoteColor,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}
                  >
                    ❝
                  </div>
                  <div className='relative mb-2.75'>
                    <Stars fill={v.starFill} />
                  </div>
                  <p
                    className='relative text-white/74 font-normal leading-[1.62]'
                    style={{ fontSize: 'clamp(0.875rem, 1.02vw, 0.91rem)' }}
                  >
                    {t.comment}
                  </p>
                  <div
                    className='relative flex items-center gap-1.75 mt-3 pt-2.5'
                    style={{ borderTop: `1px solid ${v.divider}` }}
                  >
                    <div
                      className='shrink-0 flex items-center justify-center select-none rounded-full'
                      style={{
                        width: '20px',
                        height: '20px',
                        background: v.authorBg,
                        border: `1px solid ${v.authorBorder}`,
                      }}
                    >
                      <span
                        className='font-bold uppercase'
                        style={{
                          fontSize: '0.46rem',
                          color: v.dotColor,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {t.author.charAt(0)}
                      </span>
                    </div>
                    <span
                      className='text-white/44 truncate'
                      style={{ fontSize: '0.74rem', letterSpacing: '0.02em' }}
                    >
                      {t.author}
                    </span>
                  </div>
                </div>
              );
            })}

          {/* HEADLINE */}
          <div className='absolute inset-0 flex items-center justify-center z-20 pointer-events-none select-none'>
            <div
              style={{
                padding: 'clamp(24px,4vw,44px) clamp(32px,5vw,60px)',
                backdropFilter: 'blur(1.4px)',
                WebkitBackdropFilter: 'blur(1.4px)',
                borderRadius: '20px',
              }}
            >
              <h2
                id='testimonials-heading'
                className='font-bold text-white leading-[1.04] tracking-[-0.025em] text-center'
                style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}
              >
                <span className='block overflow-hidden'>
                  <motion.span
                    className='block'
                    initial={{ y: '106%' }}
                    animate={sectionVisible ? { y: '0%' } : { y: '106%' }}
                    transition={{
                      duration: LINE_DUR_MS / 1000,
                      ease: SMOOTH_EASE,
                    }}
                  >
                    Misafirlerimizin
                  </motion.span>
                </span>
                <span className='block overflow-hidden'>
                  <motion.span
                    className='block'
                    initial={{ y: '106%' }}
                    animate={line2Visible ? { y: '0%' } : { y: '106%' }}
                    transition={{
                      duration: LINE_DUR_MS / 1000,
                      ease: SMOOTH_EASE,
                    }}
                  >
                    <MainColorToQuatFont>Deneyimleri</MainColorToQuatFont>
                  </motion.span>
                </span>
              </h2>
            </div>
          </div>

          {/* Edge fades */}
          <div
            className='pointer-events-none absolute inset-y-0 left-0 w-20 z-10'
            style={{
              background:
                'linear-gradient(to right, var(--color-secondaryColor,#0a0a0a), transparent)',
            }}
          />
          <div
            className='pointer-events-none absolute inset-y-0 right-0 w-20 z-10'
            style={{
              background:
                'linear-gradient(to left, var(--color-secondaryColor,#0a0a0a), transparent)',
            }}
          />
          <div
            className='pointer-events-none absolute inset-x-0 top-0 h-28 z-10'
            style={{
              background:
                'linear-gradient(to bottom, var(--color-secondaryColor,#0a0a0a), transparent)',
            }}
          />
          <div
            className='pointer-events-none absolute inset-x-0 bottom-0 h-28 z-10'
            style={{
              background:
                'linear-gradient(to top, var(--color-secondaryColor,#0a0a0a), transparent)',
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PART 2 — PLATFORM SCORES (own component)
      ══════════════════════════════════════════ */}
      <div className='w-full h-px bg-white/[0.07]' />
      <PlatformScores />
    </section>
  );
};

export default Testimonials;
