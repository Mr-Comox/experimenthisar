'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

const DESKTOP_BREAKPOINT = 1024;

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
  const showcaseRef = useRef<HTMLElement>(null);
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);

  const gsapCleanup = useRef<(() => void) | null>(null);
  const lastSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const [ready, setReady] = useState(false);

  const sharedTextClass =
    'font-black tracking-tight leading-[0.88]' +
    ' text-[4.8rem]' +
    ' sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem]' +
    ' [@media(orientation:landscape)_and_(max-height:500px)]:text-[2.8rem]';

  // ─── Preload ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const existing = document.querySelector('link[data-hero-preload]');
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = '/photo1.jpeg';
      link.setAttribute('fetchpriority', 'high');
      link.setAttribute('data-hero-preload', '1');
      document.head.prepend(link);
    }
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

  // ─── GSAP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initGsap = () => {
      const heroEl = heroRef.current;
      if (!heroEl) return;

      const w = heroEl.offsetWidth;
      const h = heroEl.offsetHeight;

      if (w === lastSize.current.w && h === lastSize.current.h) return;
      lastSize.current = { w, h };

      gsapCleanup.current?.();

      const isDesktop = w >= DESKTOP_BREAKPOINT;
      const spread = Math.round(w * 0.08);

      const colInitY = [h * 1.1, h * 0.55, h * 0.55, h * 1.1];
      const colToY = [-(h * 0.55), -(h * 0.28), -(h * 0.28), -(h * 0.55)];
      const colInitX = [0, -spread, spread, 0];

      const ctx = gsap.context(() => {
        // ── Hero image initial state ────────────────────────────────────
        if (isDesktop) {
          gsap.set(heroImgRef.current, {
            width: w,
            height: h,
            borderRadius: 0,
            willChange: 'width, height',
          });
        } else {
          gsap.set(heroImgRef.current, {
            width: w,
            height: h,
            borderRadius: 0,
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            willChange: 'clip-path',
          });
        }

        // 1. Header fade
        const headerTl = gsap
          .timeline({ paused: true })
          .to(headerRef.current, { opacity: 0, ease: 'none', duration: 1 });

        // 2. Shrink
        let shrinkTl: gsap.core.Timeline;
        if (isDesktop) {
          const shrinkSize = Math.max(80, Math.round(w * 0.2));
          shrinkTl = gsap.timeline({ paused: true }).to(heroImgRef.current, {
            width: shrinkSize,
            height: shrinkSize,
            borderRadius: 10,
            ease: 'none',
            duration: 1,
          });
        } else {
          const targetW = Math.max(80, Math.round(w * 0.28));
          const insetX = ((w - targetW) / 2 / w) * 100;
          const targetH = targetW;
          const insetY = ((h - targetH) / 2 / h) * 100;
          shrinkTl = gsap.timeline({ paused: true }).to(heroImgRef.current, {
            clipPath: `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round 12px)`,
            ease: 'none',
            duration: 1,
          });
        }

        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: `+=${Math.max(h * 3.5, 2000)}`,
          pin: true,
          pinSpacing: false,
          scrub: isDesktop ? 0.05 : 0.35,
          immediateRender: false,
          onUpdate: ({ progress: p }) => {
            headerTl.progress(Math.min(p / 0.45, 1));
            shrinkTl.progress(Math.max(0, Math.min((p - 0.45) / 0.55, 1)));
          },
        });

        // ── Showcase columns ─────────────────────────────────────────────
        // Desktop only: animate columns via parallax
        // Mobile/tablet: columns rendered normally in JSX with no transforms
        if (isDesktop) {
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
                const y = gsap.utils.interpolate(colInitY[i], colToY[i], p);
                el.style.transform = `translateX(${colInitX[i]}px) translateY(${y}px)`;
              });
            },
          });
        }
      });

      gsapCleanup.current = () => {
        ctx.revert();
        ScrollTrigger.refresh();
      };
    };

    initGsap();

    const ro = new ResizeObserver(() => initGsap());
    if (heroRef.current) ro.observe(heroRef.current);

    return () => {
      ro.disconnect();
      gsapCleanup.current?.();
    };
  }, []);

  return (
    <>
      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section ref={heroRef} className='relative w-full h-svh bg-[#111117]'>
        <div
          ref={heroImgRef}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden z-[2]'
          style={{ contain: 'paint' }}
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
          className='absolute inset-0 z-20 flex flex-col justify-center items-center text-center overflow-hidden'
          style={{ willChange: 'opacity' }}
        >
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
        </div>
      </section>

      {/* ══════════════════════════ SHOWCASE ══════════════════════════════ */}
      <section
        ref={showcaseRef}
        className='relative w-full h-svh flex justify-center items-center text-center'
        style={{ marginTop: 'max(275svh, 1600px)' }}
      >
        {/*
          ONE column layout — same markup for all screen sizes.
          On desktop:  GSAP animates these via colsRef (parallax scroll)
          On mobile/tablet: no GSAP touches them — they just sit in place
        */}
        <div className='absolute inset-0 flex justify-between items-center px-[1vw] sm:px-[2vw] lg:px-[3vw]'>
          {COL_IMAGES.map((images, colIdx) => (
            <div
              key={colIdx}
              ref={(el) => {
                colsRef.current[colIdx] = el;
              }}
              className='relative h-[125%] flex flex-col justify-around'
            >
              {images.map((src, imgIdx) => (
                <div
                  key={imgIdx}
                  className='relative rounded-xl overflow-hidden'
                  style={{
                    width: 'clamp(70px, 14vw, 165px)',
                    height: 'clamp(70px, 14vw, 165px)',
                    transform: 'translateZ(0)',
                  }}
                >
                  <Image
                    src={src}
                    alt=''
                    fill
                    priority={colIdx < 2 && imgIdx < 2}
                    loading={colIdx < 2 && imgIdx < 2 ? 'eager' : 'lazy'}
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

        {/* Center text */}
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
