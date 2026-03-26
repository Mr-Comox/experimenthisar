'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollTo } from '@/app/lib/scrollTo';

/* ================================================================
   CONFIG
   ================================================================ */
const SLIDES = [
  { src: '/photo1.jpeg', alt: 'Yeni Hisar' },
  { src: '/photo2.jpeg', alt: 'Yeni Hisar Sahne' },
  { src: '/photo3.jpeg', alt: 'Yeni Hisar Atmosfer' },
  { src: '/photo4.jpeg', alt: 'Yeni Hisar Gece' },
];

const SLIDE_MS = 6000;

/* Ken Burns — each slide gets drift + scale direction */
const KENBURNS = [
  { x: ['0%', '-2%'], y: ['0%', '-0.8%'], scale: [1.08, 1.0] },
  { x: ['-1.5%', '0.5%'], y: ['0.5%', '-0.5%'], scale: [1.0, 1.06] },
  { x: ['0%', '1.5%'], y: ['-0.5%', '0.5%'], scale: [1.06, 1.0] },
  { x: ['1%', '-1%'], y: ['0%', '-0.6%'], scale: [1.0, 1.08] },
];

/* Preload images at module level */
if (typeof window !== 'undefined') {
  SLIDES.forEach(({ src }) => {
    const img = new window.Image();
    img.fetchPriority = 'high';
    img.decoding = 'async';
    img.src = src;
  });
}

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

const GRAIN_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  backgroundSize: '200px 200px',
} as const;

/* ================================================================
   PROGRESS BAR
   ================================================================ */
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
      className='flex-1 flex items-center py-3 cursor-pointer'
    >
      <div
        className='relative h-0.75 w-full overflow-hidden rounded-full'
        style={{ background: 'rgba(255,255,255,0.12)' }}
      >
        {done && (
          <span
            className='absolute inset-0'
            style={{ background: 'var(--color-brand)', opacity: 0.45 }}
          />
        )}
        {active && (
          <motion.span
            key={animKey}
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(to right, var(--color-brand), var(--color-accent))',
              transformOrigin: 'left',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </button>
  );
}

/* ================================================================
   MASKED LINE — cinematic text reveal
   ================================================================ */
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
        initial={{ y: '115%' }}
        animate={ready ? { y: '0%' } : { y: '115%' }}
        transition={{ duration: 1.3, delay, ease: EXPO_OUT }}
        style={{ willChange: 'transform' }}
      >
        <span className={className}>{children}</span>
      </motion.div>
    </div>
  );
}

/* ================================================================
   HERO
   ================================================================ */
export default function Hero() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [ready, setReady] = useState(false);

  /* Cinematic intro: black curtain lifts after image loads */
  const [curtainOpen, setCurtainOpen] = useState(false);

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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Phase 1: open curtain (image fades in)
          setCurtainOpen(true);
          // Phase 2: reveal text content after curtain is partially open
          setTimeout(() => {
            setReady(true);
            startTimer();
          }, 600);
        });
      });
    };

    if (img.complete) onReady();
    else img.onload = onReady;

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

  const titleClass =
    'font-black tracking-tight leading-[0.88]' +
    ' text-[clamp(3.5rem,13vw,11rem)]';

  return (
    <section
      className='relative w-full overflow-hidden h-dvh'
      style={{ background: 'var(--color-surface-0)' }}
    >
      {/* ── BLACK CURTAIN — cinematic intro ── */}
      <motion.div
        className='absolute inset-0 z-30 pointer-events-none'
        style={{ background: 'var(--color-surface-0)' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: curtainOpen ? 0 : 1 }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* ── GRAIN ── */}
      <div
        className='absolute inset-0 z-15 pointer-events-none opacity-[0.035] mix-blend-overlay'
        style={GRAIN_STYLE}
      />

      {/* ── SLIDESHOW with Ken Burns ── */}
      <AnimatePresence mode='sync'>
        <motion.div
          key={index}
          className='absolute inset-0 z-2'
          initial={{ opacity: ready ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <motion.img
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            draggable={false}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding={index === 0 ? 'sync' : 'async'}
            onContextMenu={(e) => e.preventDefault()}
            className='absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none'
            style={{
              willChange: 'transform',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
            }}
            initial={{
              x: KENBURNS[index].x[0],
              y: KENBURNS[index].y[0],
              scale: KENBURNS[index].scale[0],
            }}
            animate={{
              x: ready ? KENBURNS[index].x[1] : KENBURNS[index].x[0],
              y: ready ? KENBURNS[index].y[1] : KENBURNS[index].y[0],
              scale: ready
                ? KENBURNS[index].scale[1]
                : KENBURNS[index].scale[0],
            }}
            transition={{ duration: SLIDE_MS / 1000 + 2, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── GRADIENT OVERLAYS — cinematic color grading ── */}
      <div
        className='absolute inset-0 z-10 pointer-events-none'
        style={{
          background: `
            linear-gradient(to bottom, var(--color-surface-0) 0%, transparent 30%, transparent 60%, var(--color-surface-0) 100%),
            linear-gradient(to right, var(--color-surface-0) 0%, transparent 50%),
            linear-gradient(to left, var(--color-surface-0) 0%, transparent 45%)
          `,
          opacity: 0.88,
        }}
      />

      {/* ── VIGNETTE ── */}
      <div
        className='absolute inset-0 z-11 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, var(--color-surface-0) 100%)',
          opacity: 0.55,
        }}
      />

      {/* ── AMBIENT BRAND GLOW — subtle atmosphere ── */}
      <motion.div
        className='absolute inset-0 z-12 pointer-events-none'
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 55%, rgba(255,25,135,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 30% 60%, rgba(157,0,255,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── TITLE ── */}
      <div className='absolute inset-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none'>
        <MaskedLine delay={0} ready={ready} className={titleClass}>
          <span style={{ color: 'var(--color-text-primary)' }}>YENI</span>
        </MaskedLine>
        <MaskedLine
          delay={0.2}
          ready={ready}
          className={`text-stroke ${titleClass}`}
        >
          HISAR
        </MaskedLine>

        {/* Subtitle */}
        <motion.p
          className='uppercase font-medium mt-4'
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'clamp(0.55rem, 1.1vw, 0.85rem)',
            letterSpacing: '0.35em',
          }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.55, ease: EXPO_OUT }}
        >
          International Night Club
        </motion.p>
      </div>

      {/* ── BOTTOM BAR — progress + CTA ── */}
      <motion.div
        className='absolute bottom-0 left-0 z-20 w-full flex items-center justify-between gap-6
                   px-6 sm:px-10 lg:px-14 pb-10 sm:pb-12'
        initial={{ opacity: 0, y: 14 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.9, delay: 0.9, ease: EXPO_OUT }}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Progress bars */}
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

        {/* CTA */}
        <motion.button
          onClick={() => scrollTo('reservation')}
          className='cursor-pointer group flex items-center gap-3 rounded-full
                     px-5 py-3 lg:px-7 lg:py-3.5 transition-all duration-300'
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          whileHover={{
            borderColor: 'rgba(255,25,135,0.5)',
            boxShadow: '0 0 28px rgba(255,25,135,0.18)',
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          <span
            className='uppercase font-bold tracking-[0.25em] transition-colors duration-300'
            style={{
              fontSize: '0.6rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            Rezervasyon
          </span>
          <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            className='translate-x-0 group-hover:translate-x-1 transition-transform duration-300'
            style={{ color: 'var(--color-brand)' }}
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
