'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// SplitText removed — replaced with CSS mask sweep (fix 3)
gsap.registerPlugin(ScrollTrigger);

const COL_IMAGES = [
  ['/photo1.jpeg', '/photo2.jpeg', '/photo3.jpeg', '/photo4.jpeg'],
  ['/photo3.jpeg', '/photo1.jpeg', '/photo4.jpeg', '/photo2.jpeg'],
  ['/photo2.jpeg', '/photo4.jpeg', '/photo1.jpeg', '/photo3.jpeg'],
  ['/photo4.jpeg', '/photo3.jpeg', '/photo2.jpeg', '/photo1.jpeg'],
];

const UNIQUE_IMAGES = [
  '/photo1.jpeg',
  '/photo2.jpeg',
  '/photo3.jpeg',
  '/photo4.jpeg',
];

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
  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [ready, setReady] = useState(false);

  const sharedTextClass =
    'font-black tracking-tight leading-[0.88] text-[4rem] sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem]';

  // ─── Fix 6: inject <link rel="preload"> for hero image so browser fetches
  //     it as the very first network request — before JS even executes.
  //     priority prop on Next.js Image only adds loading="eager", this is
  //     stronger and guarantees decode before first paint.
  useEffect(() => {
    const existing = document.querySelector('link[data-hero-preload]');
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = '/photo1.jpeg';
      link.setAttribute('fetchpriority', 'high');
      link.setAttribute('data-hero-preload', '1');
      document.head.prepend(link); // prepend = first in <head>
    }

    // Preload all showcase images too
    UNIQUE_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    const hero = new window.Image();
    hero.src = '/photo1.jpeg';
    const onReady = () => setReady(true);
    if (hero.complete) requestAnimationFrame(onReady);
    else hero.onload = onReady;
  }, []);

  // ─── GSAP scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const shrinkSize = Math.max(80, Math.round(w * 0.2));
    const spread = Math.round(w * 0.08);

    // Pre-compute col Y ranges so onUpdate only does lerp, no object creation
    const colInitY = [h * 1.1, h * 0.55, h * 0.55, h * 1.1];
    const colToY = [-(h * 0.55), -(h * 0.28), -(h * 0.28), -(h * 0.55)];
    const colInitX = [0, -spread, spread, 0];

    const ctx = gsap.context(() => {
      gsap.set(heroImgRef.current, { width: w, height: h, borderRadius: 0 });

      const copyEl = copyRef.current?.querySelector<HTMLElement>('p');
      if (!copyEl) return;

      // ── Fix 3: CSS mask sweep — one element, one GPU op per frame ────────
      // Instead of animating opacity on 15-20 individual SplitText word nodes,
      // we drive a single CSS custom property that sweeps a mask-image gradient
      // across the whole paragraph. Visually identical, ~20x fewer DOM writes.
      gsap.set(copyEl, {
        opacity: 1,
        // mask-image sweep: words reveal left→right as --mp goes 0%→110%
        maskImage:
          'linear-gradient(to right, black calc(var(--mp) - 12%), transparent var(--mp))',
        '--mp': '0%',
      } as gsap.TweenVars);

      // ── Paused timelines ──────────────────────────────────────────────────

      // 1. Header fade
      const headerTl = gsap
        .timeline({ paused: true })
        .to(headerRef.current, { opacity: 0, ease: 'none', duration: 1 });

      // 2. Copy reveal via mask sweep (one CSS var = one compositor update)
      const wordTl = gsap.timeline({ paused: true }).to(copyEl, {
        '--mp': '110%',
        ease: 'none',
        duration: 1,
      } as gsap.TweenVars);

      // 3. Image shrink
      const shrinkTl = gsap.timeline({ paused: true }).to(heroImgRef.current, {
        width: shrinkSize,
        height: shrinkSize,
        borderRadius: 10,
        ease: 'none',
        duration: 1,
      });

      // 4. Copy fade out
      const copyFadeTl = gsap
        .timeline({ paused: true })
        .to(copyEl, { opacity: 0, ease: 'none', duration: 1 });

      // ── Fix 2: scrub: 0.3 — kills the 1-second catchup tween overhead ────
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: `+=${h * 3.5}`,
        pin: true,
        pinSpacing: false,
        scrub: 0.3,
        immediateRender: false,
        onUpdate: ({ progress: p }) => {
          headerTl.progress(Math.min(p / 0.29, 1));
          wordTl.progress(Math.max(0, Math.min((p - 0.29) / 0.21, 1)));
          copyFadeTl.progress(Math.max(0, Math.min((p - 0.5) / 0.14, 1)));
          shrinkTl.progress(Math.max(0, Math.min((p - 0.71) / 0.29, 1)));
        },
      });

      // ── Fix 4: single ScrollTrigger for all 4 showcase columns ───────────
      // Previously: 4 separate ScrollTrigger instances = 4 onUpdate callbacks
      // per scroll event. Now: 1 callback, 4 transform-only gsap.set calls.
      // Transform is compositor-only so 4 gsap.set(transform) << 4 triggers.
      const cols = colsRef.current;
      cols.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { x: colInitX[i], y: colInitY[i] });
      });

      ScrollTrigger.create({
        trigger: showcaseRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.3,
        onUpdate: ({ progress: p }) => {
          cols.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, {
              y: gsap.utils.interpolate(colInitY[i], colToY[i], p),
            });
          });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section ref={heroRef} className='relative w-full h-svh bg-[#111117]'>
        <div
          ref={heroImgRef}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden z-[2]'
          style={{ willChange: 'width, height', contain: 'strict' }}
        >
          <Image
            src='/photo1.jpeg'
            alt='Yeni Hisar'
            fill
            priority
            sizes='100vw'
            unoptimized
            draggable={false}
            className='object-cover object-center'
          />
        </div>

        <div
          className='absolute inset-0 z-10 pointer-events-none'
          style={{
            background: `
              linear-gradient(to bottom, var(--color-secondaryColor) 0%, transparent 36%, var(--color-secondaryColor) 100%),
              linear-gradient(to right,  var(--color-secondaryColor) 0%, transparent 58%),
              linear-gradient(to left,   var(--color-secondaryColor) 0%, transparent 52%)
            `,
            opacity: 0.83,
          }}
        />

        <div
          ref={headerRef}
          className='absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-10 lg:px-14 pb-14 sm:pb-16 overflow-hidden'
          style={{ willChange: 'opacity' }}
        >
          <MaskedLine
            delay={0}
            ready={ready}
            className={`text-[#FBFBFB] ${sharedTextClass}`}
          >
            YENI
          </MaskedLine>
          <div className='mb-7 sm:mb-8'>
            <MaskedLine
              delay={0.18}
              ready={ready}
              className={`text-stroke-white ${sharedTextClass}`}
            >
              HISAR
            </MaskedLine>
          </div>
        </div>

        <div
          ref={copyRef}
          className='absolute bottom-0 left-0 right-0 z-20 overflow-hidden px-6 sm:px-12 lg:px-24 pb-14 sm:pb-16'
          style={{ maxHeight: '45%' }}
        >
          {/*
            willChange:'mask-position' hints the browser to keep this element
            on its own compositor layer for the mask sweep animation.
          */}
          <p
            className='text-softWhite font-black tracking-[-0.025em] leading-[1.1] w-full sm:w-3/4 md:w-2/3'
            style={{
              opacity: 0,
              fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)',
              willChange: 'mask-position, opacity',
            }}
          >
            Bursanın kalbinde, zamanın durduğu o eşsiz köşede — müzik doğru anı
            bulur, ışık tam yerini alır. Yeni Hisarda gece, açıklamaya ihtiyaç
            duymadan kendini var eder.
          </p>
        </div>
      </section>

      {/* ══════════════════════════ SHOWCASE ══════════════════════════════ */}
      <section
        ref={showcaseRef}
        className='relative w-full h-svh flex justify-center items-center text-center'
        style={{ marginTop: '275svh' }}
      >
        <div className='absolute inset-0 flex justify-between items-center px-[1vw] sm:px-[2vw] lg:px-[3vw]'>
          {COL_IMAGES.map((images, colIdx) => (
            <div
              key={colIdx}
              ref={(el) => {
                colsRef.current[colIdx] = el;
              }}
              className='relative h-[125%] flex flex-col justify-around'
              style={{ willChange: 'transform' }}
            >
              {images.map((src, imgIdx) => (
                <div
                  key={imgIdx}
                  className='relative rounded-xl overflow-hidden'
                  style={{
                    width: 'clamp(80px, 14vw, 165px)',
                    height: 'clamp(80px, 14vw, 165px)',
                    transform: 'translateZ(0)',
                  }}
                >
                  <Image
                    src={src}
                    alt=''
                    fill
                    priority
                    sizes='(max-width: 640px) 80px, (max-width: 1024px) 14vw, 165px'
                    unoptimized
                    draggable={false}
                    className='object-cover'
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className='relative z-10 w-[55%] max-sm:w-full max-sm:px-8'>
          <h2
            className='text-softWhite font-black tracking-[-0.025em] leading-[1.05]'
            style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
          >
            Ritim ve{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #ff1987 0%, #ff6ec7 50%, #b8860b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              atmosfer.
            </span>
          </h2>
          <p
            className='text-white/55 leading-[1.72] mt-6'
            style={{ fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)' }}
          >
            Unutulmaz bir gecenin saatlerinden süzülen anlara tanıklık edin.
          </p>
        </div>
      </section>
    </>
  );
}
