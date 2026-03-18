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

if (typeof window !== 'undefined') {
  SLIDES.forEach(({ src }) => {
    const img = new window.Image();
    img.src = src;
  });
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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
    <button
      onClick={onClick}
      aria-label='Slayta git'
      className='h-0.5 flex-1 relative overflow-hidden cursor-pointer bg-white/15'
    >
      {done && <span className='absolute inset-0 bg-[#FF1987]/55' />}
      {active && (
        <span
          key={animKey}
          className='absolute inset-0 animate-progress bg-linear-to-r from-[#FF1987] to-[#c800cc]'
        />
      )}
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
      setReady(true);
      startTimer();
    };

    if (img.complete) {
      requestAnimationFrame(onReady);
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
    <section
      className='relative w-full overflow-hidden bg-secondaryColor'
      style={{ height: '100svh' }}
    >
      {/* ── GRAIN ─────────────────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-[15] pointer-events-none opacity-[0.032] mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
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
            onContextMenu={(e) => e.preventDefault()}
            className='absolute inset-0 w-full h-full object-cover object-center select-none'
            style={{
              willChange: 'transform',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            initial={{
              x: DRIFT[index % DRIFT.length].x[0],
              y: DRIFT[index % DRIFT.length].y[0],
            }}
            animate={{
              x: DRIFT[index % DRIFT.length].x[1],
              y: DRIFT[index % DRIFT.length].y[1],
            }}
            transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── GRADIENT OVERLAY ──────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-[10] pointer-events-none'
        style={{
          background: `
            linear-gradient(to bottom,  var(--color-secondaryColor, #000) 0%, transparent 40%, var(--color-secondaryColor, #000) 100%),
            linear-gradient(to right,   var(--color-secondaryColor, #000) 0%, transparent 60%),
            linear-gradient(to left,    var(--color-secondaryColor, #000) 0%, transparent 55%)
          `,
          opacity: 0.85,
        }}
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
        style={{ willChange: 'transform, opacity' }}
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
