'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollTo } from '@/app/lib/scrollTo';

// ─── Config ───────────────────────────────────────────────────────────────────
const SLIDES = [
  { src: '/photo1.jpeg', alt: 'Yeni Hisar' },
  { src: '/photo2.jpeg', alt: 'Yeni Hisar Sahne' },
  { src: '/photo3.jpeg', alt: 'Yeni Hisar Atmosfer' },
  { src: '/photo4.jpeg', alt: 'Yeni Hisar Atmosfer' },
];

const SLIDE_MS = 6000;

const DRIFT = [
  { x: ['0%', '-1.8%'], y: ['0%', '-0.6%'] },
  { x: ['-1.5%', '0%'], y: ['0%', '0.6%'] },
  { x: ['0%', '1.5%'], y: ['-0.4%', '0.4%'] },
  { x: ['1.2%', '-0.6%'], y: ['0%', '-0.5%'] },
];

// Preload all images at module level (runs once, not per render)
if (typeof window !== 'undefined') {
  SLIDES.forEach(({ src }) => {
    const img = new window.Image();
    img.fetchPriority = 'high';
    img.decoding = 'async';
    img.src = src;
  });
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Hoist static styles outside component to avoid object recreation on every render
const GRAIN_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  backgroundSize: '200px 200px',
} as const;

const GRADIENT_STYLE = {
  background: `
    linear-gradient(to bottom,  var(--color-secondaryColor, #000) 0%, transparent 40%, var(--color-secondaryColor, #000) 100%),
    linear-gradient(to right,   var(--color-secondaryColor, #000) 0%, transparent 60%),
    linear-gradient(to left,    var(--color-secondaryColor, #000) 0%, transparent 55%)
  `,
  opacity: 0.85,
} as const;

// Shared will-change style for promoted GPU layers
const GPU_LAYER_FULL = { willChange: 'transform, opacity' } as const;

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({
  active,
  done,
  animKey,
  onClick,
}: {
  active: boolean;
  done: boolean;
  animKey: number;
  onClick: () => void;
}) {
  return (
    // Tall hit area for easy mobile tap, visual bar centred inside via flex
    <button
      onClick={onClick}
      aria-label='Slayta git'
      className='flex-1 flex items-center py-3 cursor-pointer'
    >
      <div className='relative h-[3px] w-full overflow-hidden rounded-full bg-white/15'>
        {/* Filled state for past slides */}
        {done && <span className='absolute inset-0 bg-[#FF1987]/55' />}

        {/* Pure CSS keyframe animation — runs entirely on the compositor
            thread, zero JS involvement, perfectly smooth regardless of
            main-thread load. Inline <style> avoids needing global CSS. */}
        {active && (
          <>
            <style>{`
              @keyframes bar-fill {
                from { transform: scaleX(0); }
                to   { transform: scaleX(1); }
              }
              .bar-fill {
                animation: bar-fill ${SLIDE_MS}ms linear forwards;
                transform-origin: left;
                will-change: transform;
              }
            `}</style>
            <span
              key={animKey}
              className='bar-fill absolute inset-0 bg-gradient-to-r from-[#FF1987] to-[#c800cc]'
            />
          </>
        )}
      </div>
    </button>
  );
}

// ─── MaskedLine ───────────────────────────────────────────────────────────────
function MaskedLine({
  children,
  delay = 0,
  ready,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  ready: boolean;
  className?: string;
}) {
  return (
    <div
      className='overflow-hidden'
      style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
    >
      <motion.div
        initial={{ y: '105%' }}
        animate={ready ? { y: '0%' } : { y: '105%' }}
        transition={{ duration: 1.05, delay, ease: EASE_OUT_EXPO }}
        style={{ willChange: 'transform' }}
      >
        <span className={className}>{children}</span>
      </motion.div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [ready, setReady] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
      setAnimKey((k) => k + 1);
    }, SLIDE_MS);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = SLIDES[0].src;

    const onReady = () => {
      // Double RAF: first frame commits layout, second frame begins paint.
      // This prevents animations from firing before the browser has had a
      // chance to composite the initial layer — the main cause of first-mount jank.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setReady(true);
          startTimer();
        });
      });
    };

    if (img.complete) {
      onReady();
    } else {
      img.onload = onReady;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const goTo = (i: number) => {
    if (i === index) return;
    setIndex(i);
    setAnimKey((k) => k + 1);
    startTimer();
  };

  const sharedTextClass =
    'font-black tracking-tight leading-[0.88] ' +
    'text-[5rem] xs:text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem] ' +
    'landscape:max-lg:text-[clamp(2rem,6.5vw,3.8rem)]';

  return (
    <section className='relative w-full overflow-hidden bg-secondaryColor h-screen'>
      {/* ── GRAIN ─────────────────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-[15] pointer-events-none opacity-[0.032] mix-blend-overlay'
        style={GRAIN_STYLE}
      />

      {/* ── SLIDESHOW ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode='sync'>
        <motion.div
          key={index}
          className='absolute inset-0 z-[2]'
          initial={{ opacity: ready ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <motion.img
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            draggable={false}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding={index === 0 ? 'sync' : 'async'}
            onContextMenu={(e) => e.preventDefault()}
            className='absolute inset-0 w-full h-full object-cover object-center select-none'
            style={{
              willChange: 'transform',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            initial={{ x: DRIFT[index].x[0], y: DRIFT[index].y[0] }}
            // Keep animate == initial until ready so Framer Motion has
            // nothing to interpolate — image stays locked at x[0].
            // Once ready flips true, animate changes and the drift
            // starts from the correct origin with no instant snap.
            animate={{
              x: ready ? DRIFT[index].x[1] : DRIFT[index].x[0],
              y: ready ? DRIFT[index].y[1] : DRIFT[index].y[0],
            }}
            transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── GRADIENT OVERLAY ──────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-[10] pointer-events-none'
        style={GRADIENT_STYLE}
      />

      {/* ── CENTERED TITLE ────────────────────────────────────────────────── */}
      <div className='absolute inset-0 z-[20] flex flex-col items-center justify-center text-center pointer-events-none'>
        <MaskedLine
          delay={0}
          ready={ready}
          className={`text-[#FBFBFB] ${sharedTextClass}`}
        >
          YENI
        </MaskedLine>
        <MaskedLine
          delay={0.18}
          ready={ready}
          className={`text-stroke-white ${sharedTextClass}`}
        >
          HISAR
        </MaskedLine>
        <motion.p
          className='text-[#FBFBFB]/60 text-sm sm:text-base landscape:max-lg:text-[0.6rem] tracking-[0.3em] landscape:max-lg:tracking-[0.2em] uppercase mt-3 landscape:max-lg:mt-1'
          initial={{ opacity: 0, y: 8 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT_EXPO }}
          style={{ willChange: 'transform' }}
        >
          International Night Club
        </motion.p>
      </div>

      {/* ── PROGRESS BARS + CTA ───────────────────────────────────────────── */}
      <motion.div
        className='absolute bottom-0 left-0 z-[20] pb-8 sm:pb-10 landscape:max-lg:pb-4 px-6 sm:px-10 lg:px-14 w-full
                   flex items-center justify-between gap-6'
        initial={{ opacity: 0, y: 10 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT_EXPO }}
        style={GPU_LAYER_FULL}
      >
        <div className='flex items-center gap-2 flex-1 max-w-40'>
          {SLIDES.map((_, i) => (
            <ProgressBar
              key={i}
              active={i === index}
              done={i < index}
              animKey={animKey}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <motion.button
          onClick={() => scrollTo('reservation')}
          className='cursor-pointer group flex items-center gap-3 border rounded-3xl
                     border-[#FBFBFB]/20 px-4 py-3 lg:px-8 lg:py-4 landscape:max-lg:px-3 landscape:max-lg:py-2
                     hover:border-[#FF1987]/60 transition-colors duration-300'
          whileTap={{ scale: 0.97 }}
        >
          <span
            className='text-[#FBFBFB]/75 group-hover:text-[#FBFBFB] uppercase font-bold
                           tracking-[0.25em] transition-colors duration-300 text-[0.62rem]'
          >
            Rezervasyon
          </span>
          <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            className='text-[#FF1987] translate-x-0 group-hover:translate-x-1 transition-transform duration-300'
          >
            <path
              d='M1 8h14M9 2l6 6-6 6'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
}
