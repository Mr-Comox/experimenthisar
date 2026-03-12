'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const COL_IMAGES = [
  ['/photo1.jpeg', '/photo2.jpeg', '/photo3.jpeg', '/photo4.jpeg'],
  ['/photo3.jpeg', '/photo1.jpeg', '/photo4.jpeg', '/photo2.jpeg'],
  ['/photo2.jpeg', '/photo4.jpeg', '/photo1.jpeg', '/photo3.jpeg'],
  ['/photo4.jpeg', '/photo3.jpeg', '/photo2.jpeg', '/photo1.jpeg'],
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

  useEffect(() => {
    const img = new window.Image();
    img.src = '/photo1.jpeg';
    const onReady = () => setReady(true);
    if (img.complete) requestAnimationFrame(onReady);
    else img.onload = onReady;
  }, []);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Shrink target: 20vw, min 80px
    const shrinkSize = Math.max(80, Math.round(w * 0.2));

    // Inner column spread scales with viewport so they stay visible on mobile
    // ~8% of vw → 31px on 393px, 76px on 950px, 154px on 1920px
    const spread = Math.round(w * 0.08);

    const COL_CONFIGS = [
      { initX: 0, initY: h * 1.1, toY: -(h * 0.55) },
      { initX: -spread, initY: h * 0.55, toY: -(h * 0.28) },
      { initX: spread, initY: h * 0.55, toY: -(h * 0.28) },
      { initX: 0, initY: h * 1.1, toY: -(h * 0.55) },
    ];

    const ctx = gsap.context(() => {
      gsap.set(heroImgRef.current, { width: w, height: h, borderRadius: 0 });

      const copyEl = copyRef.current?.querySelector<HTMLElement>('p');
      if (!copyEl) return;

      const split = SplitText.create(copyEl, {
        type: 'words',
        wordsClass: 'word',
      });
      split.words.forEach((word) => gsap.set(word, { opacity: 0 }));
      gsap.set(copyEl, { opacity: 1 });

      let copyHidden = false;

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: `+=${h * 3.5}`,
        pin: true,
        pinSpacing: false,
        scrub: 1,
        immediateRender: false,
        onUpdate: ({ progress: p }) => {
          gsap.set(headerRef.current, {
            yPercent: -Math.min(p / 0.29, 1) * 100,
          });

          const wordsP = Math.max(0, Math.min((p - 0.29) / 0.21, 1));
          const n = split.words.length;
          split.words.forEach((word, i) => {
            gsap.set(word, {
              opacity: Math.max(0, Math.min((wordsP - i / n) / (1 / n), 1)),
            });
          });

          if (p > 0.64 && !copyHidden) {
            copyHidden = true;
            gsap.to(copyEl, { opacity: 0, duration: 0.2 });
          } else if (p <= 0.64 && copyHidden) {
            copyHidden = false;
            gsap.to(copyEl, { opacity: 1, duration: 0.2 });
          }

          const ip = Math.max(0, Math.min((p - 0.71) / 0.29, 1));
          gsap.set(heroImgRef.current, {
            width: gsap.utils.interpolate(w, shrinkSize, ip),
            height: gsap.utils.interpolate(h, shrinkSize, ip),
            borderRadius: gsap.utils.interpolate(0, 10, ip),
          });
        },
      });

      colsRef.current.forEach((el, i) => {
        if (!el) return;
        const { initX, initY, toY } = COL_CONFIGS[i];
        gsap.set(el, { x: initX, y: initY });
        gsap.to(el, {
          y: toY,
          ease: 'none',
          scrollTrigger: {
            trigger: showcaseRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
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
          style={{ willChange: 'width, height, border-radius' }}
        >
          <Image
            src='/photo1.jpeg'
            alt='Yeni Hisar'
            fill
            priority
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
          style={{ willChange: 'transform' }}
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
          <p
            className='text-softWhite font-black tracking-[-0.025em] leading-[1.1] w-full sm:w-3/4 md:w-2/3'
            style={{ opacity: 0, fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)' }}
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
        {/*
          px uses vw-based padding so columns never hug the very edge,
          but still leave room for all 4 to be visible.
        */}
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
                /*
                  clamp(70px, 18vw, 130px):
                  — 393px  →  70px  (hits min)
                  — 600px  →  108px
                  — 720px+ →  130px (hits max)
                */
                <div
                  key={imgIdx}
                  className='relative rounded-xl overflow-hidden'
                  style={{
                    width: 'clamp(80px, 14vw, 165px)',
                    height: 'clamp(80px, 14vw, 165px)',
                  }}
                >
                  <Image
                    src={src}
                    alt=''
                    fill
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
