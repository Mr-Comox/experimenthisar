'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { scrollTo } from '@/app/lib/scrollTo';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;

    const tryPlay = () => {
      v.play().catch(() => {});
      setReady(true);
    };

    if (v.readyState >= 1) {
      tryPlay();
    } else {
      v.addEventListener('loadedmetadata', tryPlay, { once: true });
    }

    return () => v.removeEventListener('loadedmetadata', tryPlay);
  }, []);

  const sharedTextClass =
    'font-black tracking-tight leading-[0.88] ' +
    'text-[5rem] xs:text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem] ' +
    'landscape:max-lg:text-[clamp(2rem,6.5vw,3.8rem)]';

  return (
    <section className='relative w-full overflow-hidden bg-secondaryColor h-screen'>
      {/* ── VIDEO ─────────────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src='/yenihisar.mp4'
        muted
        loop
        playsInline
        preload='auto'
        className='absolute inset-0 w-full h-full object-cover'
        style={{ zIndex: 2 }}
      />

      {/* Fade-in mask */}
      <motion.div
        className='absolute inset-0 pointer-events-none bg-secondaryColor'
        initial={{ opacity: 1 }}
        animate={ready ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE_OUT_EXPO }}
        style={{ zIndex: 3 }}
      />

      {/* ── GRAIN ─────────────────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 pointer-events-none opacity-[0.032] mix-blend-overlay'
        style={{
          zIndex: 15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── GRADIENT OVERLAY ──────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          zIndex: 10,
          background: `
            linear-gradient(to bottom,  var(--color-secondaryColor, #000) 0%, transparent 40%, var(--color-secondaryColor, #000) 100%),
            linear-gradient(to right,   var(--color-secondaryColor, #000) 0%, transparent 60%),
            linear-gradient(to left,    var(--color-secondaryColor, #000) 0%, transparent 55%)
          `,
          opacity: 0.85,
        }}
      />

      {/* Radial edge vignette */}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          zIndex: 11,
          background:
            'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* ── CENTERED TITLE ────────────────────────────────────────────────── */}
      <div className='absolute inset-0 z-[20] flex flex-col items-center justify-center text-center pointer-events-none select-none'>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT_EXPO }}
          className='flex items-center gap-3 mb-5 sm:mb-7'
        >
          <div
            className='h-px'
            style={{
              width: 'clamp(28px,4vw,56px)',
              background:
                'linear-gradient(to right, transparent, rgba(255,25,135,0.65))',
            }}
          />
          <span
            className='text-[#FBFBFB]/45 font-medium uppercase'
            style={{ fontSize: '0.575rem', letterSpacing: '0.4em' }}
          >
            Atmosferi Hisset
          </span>
          <div
            className='h-px'
            style={{
              width: 'clamp(28px,4vw,56px)',
              background:
                'linear-gradient(to left, transparent, rgba(255,25,135,0.65))',
            }}
          />
        </motion.div>

        <MaskedLine
          delay={0.36}
          ready={ready}
          className={`text-[#FBFBFB] ${sharedTextClass}`}
        >
          YENI
        </MaskedLine>
        <MaskedLine
          delay={0.52}
          ready={ready}
          className={`text-stroke-white ${sharedTextClass}`}
        >
          HISAR
        </MaskedLine>

        {/* Accent rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={ready ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1.0, delay: 0.76, ease: EASE_OUT_EXPO }}
          className='mt-6 sm:mt-8 mb-5 sm:mb-6'
          style={{
            height: 1,
            width: 'clamp(100px,18vw,220px)',
            transformOrigin: 'center',
            background:
              'linear-gradient(to right, transparent, rgba(255,25,135,0.55), transparent)',
          }}
        />

        {/* International Night Club */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.94, ease: EASE_OUT_EXPO }}
          className='text-[#FBFBFB]/60 text-sm sm:text-base landscape:max-lg:text-[0.6rem]
                     tracking-[0.3em] landscape:max-lg:tracking-[0.2em] uppercase'
        >
          International Night Club
        </motion.p>
      </div>

      {/* ── BOTTOM BAR ────────────────────────────────────────────────────── */}
      <motion.div
        className='absolute bottom-0 left-0 right-0 z-[20]
                   pb-8 sm:pb-10 landscape:max-lg:pb-4
                   px-6 sm:px-10 lg:px-14
                   flex items-end justify-end'
        initial={{ opacity: 0, y: 10 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.8, delay: 1.1, ease: EASE_OUT_EXPO }}
        style={{ willChange: 'transform, opacity' }}
      >
        <motion.button
          onClick={() => scrollTo('reservation')}
          className='cursor-pointer group flex items-center gap-3 border rounded-3xl
                     border-[#FBFBFB]/20 px-4 py-3 lg:px-8 lg:py-4
                     landscape:max-lg:px-3 landscape:max-lg:py-2
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
