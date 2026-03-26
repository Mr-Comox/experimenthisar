'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import AnimatedCounter from '@/app/utilities/AnimatedCounter';
import Timeline from './TimeLine';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { useReveal } from '@/app/utilities/useReveal';
import NavButton from '@/app/utilities/NavButton';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ================================================================
   TYPES & SHARED
   ================================================================ */
type Props = { id: string };
const SECTION_PX = 'px-6 sm:px-10 lg:px-20 xl:px-28';

const GradientText = ({
  children,
  variant = 'brand',
}: {
  children: React.ReactNode;
  variant?: 'brand' | 'gold';
}) => {
  const bg =
    variant === 'gold'
      ? 'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold), var(--color-gold-light))'
      : 'linear-gradient(135deg, var(--color-brand), var(--color-accent-light))';
  return (
    <span
      style={{
        background: bg,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  );
};

const Body = ({
  children,
  center = false,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <p
    className={`leading-relaxed ${center ? 'text-center mx-auto' : ''} ${className}`}
    style={{
      color: 'var(--color-text-secondary)',
      fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)',
      lineHeight: 1.72,
      ...style,
    }}
  >
    {children}
  </p>
);

/* ================================================================
   1 · MANIFESTO — Sticky, scroll-scrubbed text reveal + fade-out
   ================================================================
   CSS position:sticky eliminates pin-spacer issues.
   Phase 1: words reveal left → right.
   Phase 2: words fade out right → left (last word first).
   Progress line draws then retracts. Year watermark drifts.
   ================================================================ */
const ManifestoSection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const text = textRef.current;
      if (!wrapper || !text) return;

      const split = SplitText.create(text, { type: 'words' });
      gsap.set(split.words, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      /* Year watermark drifts upward throughout */
      if (yearRef.current) {
        tl.to(
          yearRef.current,
          { yPercent: -50, ease: 'none', duration: 2.0 },
          0,
        );
      }

      /* Phase 1 — Words reveal left → right */
      tl.to(
        split.words,
        { opacity: 1, stagger: 0.02, ease: 'none', duration: 0.6 },
        0.1,
      );

      /* Progress line draws left → right */
      if (lineRef.current) {
        tl.fromTo(
          lineRef.current,
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', duration: 1.0 },
          0,
        );
      }

      /* Phase 2 — Words fade out right → left (last word first) */
      const reversedWords = [...split.words].reverse();
      tl.to(
        reversedWords,
        { opacity: 0, stagger: 0.015, ease: 'none', duration: 0.5 },
        1.3,
      );

      /* Progress line fades out */
      if (lineRef.current) {
        tl.to(
          lineRef.current,
          { opacity: 0, ease: 'none', duration: 0.8 },
          1.5,
        );
      }

      return () => split.revert();
    },
    { scope: wrapperRef },
  );

  return (
    <div ref={wrapperRef} style={{ height: '300vh' }}>
      <div
        className='sticky top-2 h-dvh flex items-center overflow-hidden'
        style={{ background: 'var(--color-surface-0)' }}
      >
        {/* Year watermark */}
        <div
          ref={yearRef}
          className='absolute inset-0 flex items-center justify-center pointer-events-none select-none'
          aria-hidden
        >
          <span
            className='font-black tracking-[-0.05em]'
            style={{
              fontSize: 'clamp(10rem, 30vw, 42rem)',
              lineHeight: '1',
              color: 'var(--color-text-primary)',
              opacity: 0.03,
            }}
          >
            1964
          </span>
        </div>

        <div className={`relative ${SECTION_PX} w-full`}>
          {/* Manifesto text — words light up then fade out as you scroll */}
          <p
            ref={textRef}
            className='font-black leading-[1.15] tracking-[-0.043em] max-w-fit '
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              color: 'var(--color-text-primary)',
            }}
          >
            Yeni Turistik Hisar Gazinosu, gece hayatının merkezinde konumlanan,
            güçlü geçmişi ve rafine çizgisiyle öne çıkan seçkin bir buluşma
            noktasıdır. 1964&apos;ten bu yana süregelen bu yaklaşım, gazinoyu
            dönemler üstü bir sahne kültürünün temsilcisi hâline getirmiştir.
          </p>

          {/* Scroll-synced progress line */}
          <div
            ref={lineRef}
            className='h-px mt-12 max-w-7xl'
            style={{
              background:
                'linear-gradient(90deg, var(--color-brand), var(--color-accent))',
              transformOrigin: 'left',
              transform: 'scaleX(0)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   2 · PILLARS — Bold feature blocks with animated SVG icons
   ================================================================
   Each pillar has a hand-drawn SVG icon that animates on scroll
   via stroke-dashoffset (draw-on effect). Content alternates
   left/right on desktop with parallax on the number.
   ================================================================ */
const PILLARS = [
  {
    num: '01',
    label: 'Atmosfer & Deneyim',
    text: 'Mekânın mimari dili, dengeli ışık kullanımı ve akıcı atmosferi, misafirlerini ilk andan itibaren gecenin ritmine dahil edecek şekilde kurgulanmıştır.',
    iconPaths: [
      'M20 4L32 18L20 36L8 18Z',
      'M8 18H32',
      'M20 4L14 18L20 36',
      'M20 4L26 18L20 36',
    ],
  },
  {
    num: '02',
    label: 'Işık & Ses',
    text: 'Işık, ses ve sahne yerleşimi; gösterinin değil, atmosferin ön planda olduğu bir dengeyle ele alınır. Müzik doğru dengeyle var olur.',
    iconPaths: [
      'M20 17A3 3 0 1 1 20 23A3 3 0 1 1 20 17Z',
      'M26 14C28.5 16.5 30 19 30 20C30 21 28.5 23.5 26 26',
      'M30 10C34 14 36 17 36 20C36 23 34 26 30 30',
      'M14 14C11.5 16.5 10 19 10 20C10 21 11.5 23.5 14 26',
      'M10 10C6 14 4 17 4 20C4 23 6 26 10 30',
    ],
  },
  {
    num: '03',
    label: 'Güvenlik & Konfor',
    text: 'Profesyonel ekip, akışın doğallığını bozmadan süreci yönetir. Burada özgürlük, güvenle birlikte var olur.',
    iconPaths: [
      'M20 4L6 12V22C6 30 20 36 20 36C20 36 34 30 34 22V12L20 4Z',
      'M14 20L18 24L26 16',
    ],
  },
];

const PillarBlock = ({
  pillar,
  index,
}: {
  pillar: (typeof PILLARS)[0];
  index: number;
}) => {
  const blockRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const block = blockRef.current;
      if (!block) return;

      const num = block.querySelector<HTMLElement>('.pillar-num');
      const line = block.querySelector<HTMLElement>('.pillar-line');

      /* SVG draw-on animation */
      const iconPaths = block.querySelectorAll('.pillar-icon path');
      iconPaths.forEach((p) => {
        const el = p as SVGGeometryElement;
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      });

      /* Number parallax — drifts upward faster than scroll */
      if (num) {
        gsap.to(num, {
          yPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: block,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      /* Entrance animation */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: block,
          start: 'top 82%',
          once: true,
        },
      });

      /* Icon draws on first */
      if (iconPaths.length) {
        tl.to(
          Array.from(iconPaths),
          {
            strokeDashoffset: 0,
            duration: 1.5,
            stagger: 0.12,
            ease: 'expo.out',
          },
          0,
        );
      }

      if (line)
        tl.from(line, { scaleX: 0, duration: 1.2, ease: 'expo.out' }, 0.1);
      if (num)
        tl.from(
          num,
          { opacity: 0, x: -20, duration: 0.9, ease: 'expo.out' },
          0.15,
        );
    },
    { scope: blockRef },
  );

  const isEven = index % 2 === 1;

  return (
    <div ref={blockRef} className={`${SECTION_PX} py-16 lg:py-28`}>
      <div className={`max-w-3xl ${isEven ? 'lg:ml-auto' : ''}`}>
        {/* SVg + gradient line */}
        <div className='flex items-center gap-5 mb-8 lg:mb-10'>
          {/* Animated SVG icon */}
          <svg
            viewBox='0 0 40 40'
            fill='none'
            className='pillar-icon '
            style={{
              width: 'clamp(36px, 4vw, 48px)',
              height: 'clamp(36px, 4vw, 48px)',
              color: 'var(--color-brand)',
            }}
          >
            {pillar.iconPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            ))}
          </svg>
          <div
            className='pillar-line flex-1 h-px'
            style={{
              background: isEven
                ? 'linear-gradient(90deg, var(--color-accent), transparent)'
                : 'linear-gradient(90deg, var(--color-brand), transparent)',
              transformOrigin: 'left',
            }}
          />
        </div>

        {/* Title */}
        <TextReveal>
          <h3
            className='pillar-title font-black leading-[1.05] tracking-[-0.02em] mb-5 lg:mb-7'
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              color: 'var(--color-text-primary)',
            }}
          >
            {pillar.label}
          </h3>
        </TextReveal>

        {/* Description */}
        <TextReveal>
          <p
            className='pillar-desc'
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)',
              lineHeight: 1.72,
              maxWidth: '36rem',
            }}
          >
            {pillar.text}
          </p>
        </TextReveal>
      </div>
    </div>
  );
};

const PillarsSection = () => (
  <div>
    {PILLARS.map((p, i) => (
      <PillarBlock key={p.num} pillar={p} index={i} />
    ))}
  </div>
);

/* ================================================================
   3 · TIMELINE
   ================================================================ */
const TimelineSection = () => {
  const { ref, visible } = useReveal(0.08);

  return (
    <div
      ref={ref}
      className={`${SECTION_PX} section-py`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(32px)',
        transition:
          'opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <div className='text-center max-w-4xl mx-auto mb-20'>
        <TextReveal>
          <Headline center className='mb-8'>
            Nesiller boyu bir <br />
            <GradientText>sahne mirası</GradientText>
          </Headline>
        </TextReveal>

        <TextReveal delay={0.15}>
          <Body center className='max-w-2xl'>
            Canlı performanslar ve özenle oluşturulan sahne programları. Yıllar
            boyunca birçok değerli sanatçının sahne aldığı bu mekân, sahneye
            yaklaşımını her zaman seçicilik ve saygı üzerine kurmuştur.
          </Body>
        </TextReveal>
      </div>

      <Timeline />
    </div>
  );
};

/* ================================================================
   4 · STATS — Alternating horizontal rows with massive counters
   ================================================================
   Each stat gets its own full-width row with a massive gradient
   number on one side and text on the other. Rows alternate
   left/right alignment. GSAP slides each row in from the side
   with parallax on the numbers.
   ================================================================ */
const STATS = [
  {
    label: 'Etkinlik',
    sub: 'Kapılarımızdan geçen her gece, ayrı bir hikâye.',
    value: 1600,
    suffix: '+',
    gradient:
      'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold), var(--color-gold-light))',
  },
  {
    label: 'Mutlu Misafir',
    sub: 'Her misafir, hikâyemizin yeni bir parçasıdır.',
    value: 20000,
    suffix: '+',
    gradient:
      'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))',
  },
  {
    label: 'Canlı Performans',
    sub: 'Sahnemizde yankılanan her ses, kalıcı bir iz bıraktı.',
    value: 7000,
    suffix: '+',
    gradient:
      'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold), var(--color-gold-light))',
  },
] as const;

const StatRow = ({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useGSAP(
    () => {
      const row = rowRef.current;
      if (!row) return;

      const isEven = index % 2 === 1;

      /* Slide in from alternating sides */
      gsap.from(row, {
        x: isEven ? 80 : -80,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 85%',
          once: true,
          onEnter: () => setPlay(true),
        },
      });

      /* Number parallax */
      const numEl = row.querySelector('.stat-num');
      if (numEl) {
        gsap.to(numEl, {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      /* Accent line draws in */
      const accent = row.querySelector('.stat-accent');
      if (accent) {
        gsap.from(accent, {
          scaleX: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 82%',
            once: true,
          },
        });
      }
    },
    { scope: rowRef },
  );

  const isEven = index % 2 === 1;

  return (
    <>
      {/* Gradient separator */}
      <div
        className='h-px'
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-border-default), transparent)',
        }}
      />

      <div
        ref={rowRef}
        className={`py-14 lg:py-20 flex flex-col ${
          isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'
        } items-start lg:items-end gap-4 lg:gap-16`}
      >
        {/* Massive number */}
        <div className='stat-num shrink-0'>
          <AnimatedCounter
            value={stat.value}
            suffix={stat.suffix}
            duration={2000}
            delay={300}
            play={play}
            className='font-black leading-none tracking-[-0.05em]'
            style={{
              fontSize: 'clamp(4rem, 10vw, 8rem)',
              background: stat.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              lineHeight: '0.9',
            }}
          />
        </div>

        {/* Label + description + accent */}
        <div>
          <p
            className='font-bold mb-2'
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
            }}
          >
            {stat.label}
          </p>
          <Body style={{ maxWidth: '28rem' }}>{stat.sub}</Body>
          <div
            className='stat-accent h-0.5 mt-5'
            style={{
              background: stat.gradient,
              width: 'clamp(3rem, 6vw, 5rem)',
              transformOrigin: isEven ? 'right' : 'left',
              marginLeft: isEven ? 'auto' : undefined,
            }}
          />
        </div>
      </div>
    </>
  );
};

const StatsSection = () => (
  <div className={`${SECTION_PX} section-py`}>
    <div className='mb-16 lg:mb-24'>
      <TextReveal animateOnScroll>
        <Headline>
          Rakamlarla <GradientText variant='gold'>Yeni Hisar</GradientText>
        </Headline>
      </TextReveal>
    </div>

    <div className='flex flex-col'>
      {STATS.map((stat, i) => (
        <StatRow key={stat.label} stat={stat} index={i} />
      ))}
      {/* Bottom separator */}
      <div
        className='h-px'
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-border-default), transparent)',
        }}
      />
    </div>
  </div>
);

/* ================================================================
   5 · SECURITY — Netflix-style horizontal accordion
   ================================================================
   One card is expanded (wide) showing full content. The others
   are collapsed strips showing just an icon + number. Click a
   collapsed card or use the NavButtons to cycle. Desktop uses
   flex-based width transition; mobile shows one card at a time.
   ================================================================ */
const SECURITY_ITEMS = [
  {
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-full h-full'>
        <path
          d='M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinejoin='round'
        />
        <path
          d='M9 12l2 2 4-4'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    label: 'Profesyonel Güvenlik',
    text: 'Uzman ve deneyimli güvenlik personelimiz, kapıdan sahneye kadar mekânın tamamını kesintisiz olarak denetler.',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-full h-full'>
        <circle cx='12' cy='12' r='4' stroke='currentColor' strokeWidth='1.5' />
        <circle
          cx='12'
          cy='12'
          r='9'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeDasharray='2.5 1.5'
        />
        <path
          d='M12 3v2M12 19v2M3 12h2M19 12h2'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
      </svg>
    ),
    label: 'Kamera & Gözetim Sistemi',
    text: '360° kapsama alanına sahip yüksek çözünürlüklü kamera altyapımız, mekânın her noktasını anlık olarak izler.',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-full h-full'>
        <rect
          x='3'
          y='4'
          width='18'
          height='16'
          rx='2'
          stroke='currentColor'
          strokeWidth='1.5'
        />
        <path
          d='M6 9h12M6 13h8'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
        <path
          d='M15 15l3 3'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
      </svg>
    ),
    label: 'Metal Dedektörü & Arama',
    text: 'Tüm misafirler sistematik arama prosedüründen geçer. Güvenlik, konforla birlikte sağlanır.',
  },
  {
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-full h-full'>
        <circle cx='12' cy='12' r='5' stroke='currentColor' strokeWidth='1.5' />
        <path
          d='M12 3v4M12 17v4M3 12h4M17 12h4'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
        <path
          d='M12 10v3l2 1'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    label: 'Acil Durum Prosedürleri',
    text: 'Tahliye planları, ilk yardım ekibi ve doğrudan bağlantılı acil servis koordinasyonu; her senaryoya karşı hazırlıklıyız.',
  },
];

const SecuritySection = () => {
  const [active, setActive] = useState(0);
  const { ref, visible } = useReveal(0.08);

  const isFirst = active === 0;
  const isLast = active === SECURITY_ITEMS.length - 1;
  const goPrev = () => {
    if (!isFirst) setActive((p) => p - 1);
  };
  const goNext = () => {
    if (!isLast) setActive((p) => p + 1);
  };

  return (
    <div
      ref={ref}
      className='px-4 sm:px-8 lg:px-12 xl:px-20 section-py-lg'
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(32px)',
        transition:
          'opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)',
        background:
          'radial-gradient(ellipse at 70% 20%, rgba(157, 0, 255, 0.03), transparent 60%), var(--color-surface-0)',
      }}
    >
      {/* Header */}
      <div className='max-w-fit mb-10 lg:mb-14'>
        <TextReveal animateOnScroll>
          <Headline className='mb-6'>
            Eğlenceniz için <br />
            <GradientText>maksimum güvenlik</GradientText>
          </Headline>
        </TextReveal>
        <TextReveal delay={0.15}>
          <Body className='max-w-2xl'>
            Yeni Turistik Hisar Gazinosu, misafirlerinin gece boyunca kendini
            özgür ve güvende hissetmesi için endüstri standartlarının ötesinde
            bir güvenlik altyapısı işletmektedir.
          </Body>
        </TextReveal>
      </div>

      {/* Separator */}
      <div
        className='h-px mb-10 lg:mb-14'
        style={{
          background:
            'linear-gradient(90deg, var(--color-brand), var(--color-accent), transparent)',
        }}
      />

      {/* ---- Mobile / Tablet: horizontal sliding carousel ---- */}
      <div className='lg:hidden overflow-hidden'>
        <div
          className='flex'
          style={{
            transform: `translateX(-${active * 100}%)`,
            transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {SECURITY_ITEMS.map((item) => (
            <div
              key={item.label}
              className='w-full shrink-0'
              style={{ padding: '0 2px' }}
            >
              <div
                className='rounded-2xl p-7 sm:p-9'
                style={{
                  background:
                    'linear-gradient(160deg, var(--color-surface-3), var(--color-surface-1))',
                  border: '1px solid var(--color-border-default)',
                  minHeight: 'clamp(260px, 42vw, 340px)',
                }}
              >
                <div
                  style={{
                    color: 'var(--color-brand)',
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <h4
                  className='font-bold mt-5 mb-3'
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: 'clamp(1.25rem, 3vw, 1.65rem)',
                  }}
                >
                  {item.label}
                </h4>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                    lineHeight: 1.7,
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Desktop: horizontal accordion ---- */}
      <div
        className='hidden lg:flex gap-3'
        style={{ height: 'clamp(340px, 30vw, 440px)' }}
      >
        {SECURITY_ITEMS.map((item, i) => {
          const isActive = i === active;
          return (
            <div
              key={item.label}
              onClick={() => !isActive && setActive(i)}
              className='rounded-3xl overflow-hidden relative'
              style={{
                flex: isActive ? 4 : 1,
                minWidth: isActive ? '240px' : '70px',
                background:
                  'linear-gradient(160deg, var(--color-surface-3), var(--color-surface-1))',
                border: `1px solid ${isActive ? 'var(--color-border-default)' : 'var(--color-border-subtle)'}`,
                cursor: isActive ? 'default' : 'pointer',
                transition:
                  'flex 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
              }}
            >
              {/* ---------- Expanded view ---------- */}
              <div
                className='absolute inset-0 p-10 xl:p-14 flex flex-col justify-center'
                style={{
                  opacity: isActive ? 1 : 0,
                  visibility: isActive ? 'visible' : 'hidden',
                  transition: isActive
                    ? 'opacity 0.45s ease 0.3s, visibility 0s'
                    : 'opacity 0s, visibility 0s',
                }}
              >
                <div className='max-w-lg'>
                  <div
                    style={{
                      color: 'var(--color-brand)',
                      width: 'clamp(36px, 3.5vw, 48px)',
                      height: 'clamp(36px, 3.5vw, 48px)',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h4
                    className='font-bold mt-6 mb-4'
                    style={{
                      color: 'var(--color-text-primary)',
                      fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                    }}
                  >
                    {item.label}
                  </h4>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'clamp(0.9375rem, 1.15vw, 1.125rem)',
                      lineHeight: 1.75,
                    }}
                  >
                    {item.text}
                  </p>
                  {/* accent line */}
                  <div
                    className='h-px mt-8'
                    style={{
                      background:
                        i % 2 === 0
                          ? 'linear-gradient(90deg, var(--color-brand), transparent)'
                          : 'linear-gradient(90deg, var(--color-accent), transparent)',
                      opacity: 0.35,
                      width: 'clamp(3rem, 8vw, 6rem)',
                    }}
                  />
                </div>
              </div>

              {/* ---------- Collapsed view ---------- */}
              <div
                className='h-full flex flex-col items-center justify-center gap-4'
                style={{
                  opacity: isActive ? 0 : 1,
                  visibility: isActive ? 'hidden' : 'visible',
                  transition: isActive
                    ? 'opacity 0s, visibility 0s'
                    : 'opacity 0.4s ease 0.35s, visibility 0s',
                }}
              >
                <div
                  style={{
                    color: 'var(--color-text-tertiary)',
                    width: 22,
                    height: 22,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  className='font-black tracking-[-0.04em]'
                  style={{
                    fontSize: '1.5rem',
                    lineHeight: 1,
                    background:
                      'linear-gradient(135deg, var(--color-brand), var(--color-accent-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.2,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom row — trust stat (left) + nav controls (right) */}
      <div className='flex items-center justify-between mt-6 lg:mt-8'>
        {/* Trust stat card */}
        <div
          className='flex items-center gap-4 rounded-xl px-5 py-3 sm:px-6 sm:py-4'
          style={{
            background:
              'linear-gradient(135deg, rgba(212, 168, 83, 0.06), rgba(212, 168, 83, 0.02))',
            border: '1px solid rgba(212, 168, 83, 0.12)',
          }}
        >
          <span
            className='font-black leading-none tracking-tight text-gradient-gold'
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            60+
          </span>
          <div>
            <p
              className='font-semibold'
              style={{
                color: 'var(--color-text-primary)',
                fontSize: 'clamp(0.8125rem, 1vw, 0.9375rem)',
              }}
            >
              Yıllık Güven
            </p>
            <p
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'clamp(0.6875rem, 0.85vw, 0.8125rem)',
              }}
            >
              1964&apos;ten bu yana
            </p>
          </div>
        </div>

        {/* NavButtons + counter */}
        <div className='flex items-center gap-4'>
          <span
            className='font-medium tracking-wide'
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: '0.8125rem',
            }}
          >
            {String(active + 1).padStart(2, '0')}{' '}
            <span style={{ opacity: 0.4 }}>/</span>{' '}
            {String(SECURITY_ITEMS.length).padStart(2, '0')}
          </span>
          <NavButton dir='left' onClick={goPrev} disabled={isFirst} />
          <NavButton dir='right' onClick={goNext} disabled={isLast} />
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   ROOT
   ================================================================ */
const AboutUs = ({ id }: Props) => (
  <section
    id={id}
    className='relative'
    style={{ background: 'var(--color-surface-0)' }}
    aria-labelledby='aboutus-heading'
  >
    <ManifestoSection />
    <PillarsSection />
    <div
      className='h-px w-full'
      style={{ background: 'var(--color-border-subtle)' }}
    />
    <TimelineSection />
    <div
      className='h-px w-full'
      style={{ background: 'var(--color-border-subtle)' }}
    />
    <StatsSection />
    <SecuritySection />
  </section>
);

export default AboutUs;
