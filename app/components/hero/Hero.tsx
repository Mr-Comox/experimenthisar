'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollTo } from '@/app/lib/scrollTo';

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

// Fast-out, long-tail easing — feels mechanical and premium
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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

// Theatrical mask reveal — text slides up from behind a clip boundary.
// Uses translateY ONLY (pure GPU composite, zero layout, zero paint = 60fps).
function MaskedWord({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className='overflow-hidden'>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.05, delay, ease: EASE_OUT_EXPO }}
        style={{ willChange: 'transform' }}
      >
        <span className={className}>{children}</span>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
      setAnimKey((k) => k + 1);
    }, SLIDE_MS);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (i: number) => {
    if (i === index) return;
    setIndex(i);
    setAnimKey((k) => k + 1);
    startTimer();
  };

  return (
    <section className='relative w-full h-svh min-h-160 overflow-hidden bg-secondaryColor'>
      {/* ── GRAIN ─────────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-15 pointer-events-none opacity-[0.032] mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── IMAGE LAYER ───────────────────────────────────────────── */}
      <AnimatePresence mode='sync'>
        <motion.div
          key={index}
          className='absolute inset-0 z-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <motion.img
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            draggable={false}
            className='absolute inset-0 w-full h-full object-cover object-center'
            style={{ willChange: 'transform' }}
            initial={{ x: DRIFT[index].x[0], y: DRIFT[index].y[0] }}
            animate={{ x: DRIFT[index].x[1], y: DRIFT[index].y[1] }}
            transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── OVERLAYS ──────────────────────────────────────────────── */}
      <div className='absolute inset-0 z-10 pointer-events-none bg-linear-to-b secondaryColor/55 via-secondaryColor/10 to-secondaryColor/95' />
      <div className='absolute inset-0 z-10 pointer-events-none bg-linear-to-r secondaryColor/70 via-secondaryColor/20 to-transparent' />
      {/* Right vignette so the info panel sits on a clean dark surface */}
      <div className='absolute inset-0 z-10 pointer-events-none bg-linear-to-l from-secondaryColor/60 via-transparent to-transparent' />

      {/* ── BOTTOM CONTENT ────────────────────────────────────────── */}
      <div className='absolute bottom-0 left-0 z-20 pb-8 sm:pb-10 px-6 sm:px-10 lg:px-14 w-full'>
        {/* YENİ */}
        <MaskedWord
          delay={0}
          className='block uppercase text-[#FBFBFB] font-black tracking-tight leading-[0.88]
            text-[5rem] xs:text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem]'
        >
          YENI
        </MaskedWord>

        {/* HİSAR */}
        <div className='mb-7 sm:mb-8'>
          <MaskedWord
            delay={0.1}
            className='text-stroke-white block uppercase font-black tracking-tight leading-[0.88]
              text-[5rem] xs:text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem]'
          >
            HISAR
          </MaskedWord>
        </div>

        {/* Bottom row */}
        <motion.div
          className='flex items-center justify-between gap-6'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ willChange: 'transform, opacity' }}
          transition={{ duration: 0.8, delay: 0.42, ease: EASE_OUT_EXPO }}
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

          {/* Rezervasyon CTA */}
          <motion.button
            onClick={() => scrollTo('reservation')}
            className='cursor-pointer group flex items-center gap-3 border rounded-3xl border-[#FBFBFB]/20 px-4 py-3 lg:px-8 lg:py-4
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
      </div>
    </section>
  );
}
