'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { QuatToLightFont } from '@/app/utilities/LinearFontColors';

gsap.registerPlugin(MorphSVGPlugin);

/* ─────────────────────────────────────────────────────────────────
   ICON SHAPES — 100×100 viewBox, single closed path each

   0  VIP Loca      → luxury armchair silhouette (front view)
                      two high armrests, padded back, seat, legs
   1  Lounge Bar    → elegant bar stool silhouette
                      rounded seat, slim stem, wide foot
   2  Dans Alanı    → tiered performance stage (no people)
                      three stepped platform levels from front
   3  Etkinlikler   → classic event ticket
                      rectangle with half-circle notches on sides
───────────────────────────────────────────────────────────────── */
const PATHS = [
  // 0 — VIP Armchair
  'M12 78 L12 42 Q12 24 24 24 Q34 24 34 38 L34 54 L66 54 L66 38 Q66 24 76 24 Q88 24 88 42 L88 78 L78 78 L78 62 L22 62 L22 78 Z',

  // 1 — Bar Stool
  'M34 22 Q34 14 50 14 Q66 14 66 22 L66 30 Q66 38 54 38 L54 68 L64 68 Q72 68 72 74 Q72 80 50 80 Q28 80 28 74 Q28 68 36 68 L46 68 L46 38 Q34 38 34 30 Z',

  // 2 — Tiered Stage / Dance Floor
  'M8 82 L8 72 L24 72 L24 62 L38 62 L38 52 L62 52 L62 62 L76 62 L76 72 L92 72 L92 82 Z',

  // 3 — Event Ticket (notched sides)
  'M8 30 Q8 20 18 20 L82 20 Q92 20 92 30 L92 44 Q86 46 86 50 Q86 54 92 56 L92 70 Q92 80 82 80 L18 80 Q8 80 8 70 L8 56 Q14 54 14 50 Q14 46 8 44 Z',
];

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const services = [
  {
    id: 1,
    title: 'VIP Loca',
    description:
      'Size ait bir alan. Sessiz lüks, maksimum konfor ve kişiye özel hizmet anlayışı.',
  },
  {
    id: 2,
    title: 'Lounge Bar',
    description:
      'Zamana yayılan sohbetler, imza kokteyller ve rafine bir atmosfer. Her bardak, bir anın başlangıcı.',
  },
  {
    id: 3,
    title: 'Dans Alanı',
    description:
      'Gece ilerledikçe yükselen tempo ve özgür hareket. Işıklar söndüğünde, müzik konuşur.',
  },
  {
    id: 4,
    title: 'Özel Etkinlikler',
    description:
      'Kutlamalar, davetler ve unutulmaz geceler için kürasyon. Her özel an, titizlikle planlanır.',
  },
];

/* ─────────────────────────────────────────────────────────────────
   MORPH ICON — single persistent path, never unmounts, never moves
───────────────────────────────────────────────────────────────── */
const MorphIcon = ({ activeIndex }: { activeIndex: number }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    if (!initialized.current) {
      el.setAttribute('d', PATHS[0]);
      initialized.current = true;
      return;
    }

    gsap.killTweensOf(el);
    gsap.to(el, {
      morphSVG: PATHS[activeIndex],
      duration: 0.9,
      ease: 'power2.inOut',
    });
  }, [activeIndex]);

  return (
    <svg
      viewBox='0 0 100 100'
      fill='none'
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <linearGradient
          id='icon-grad'
          x1='0'
          y1='0'
          x2='100'
          y2='100'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0%' stopColor='#9933ff' />
          <stop offset='55%' stopColor='#cc66ff' />
          <stop offset='100%' stopColor='#e099ff' />
        </linearGradient>
      </defs>
      <path ref={pathRef} d={PATHS[0]} fill='url(#icon-grad)' />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────
   NAV BUTTON
───────────────────────────────────────────────────────────────── */
const NavButton = ({
  dir,
  disabled,
  onClick,
}: {
  dir: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    aria-label={dir === 'left' ? 'Önceki' : 'Sonraki'}
    whileTap={
      disabled ? {} : { scale: 0.88, backgroundColor: 'rgba(251,251,251,0.14)' }
    }
    transition={{ duration: 0.12, ease: 'easeOut' }}
    style={{
      width: 48,
      height: 48,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: disabled ? 'rgba(251,251,251,0.18)' : 'rgba(251,251,251,0.72)',
      cursor: disabled ? 'default' : 'pointer',
      border: '1px solid rgba(251,251,251,0.18)',
      background: 'none',
      flexShrink: 0,
      transition: 'background 0.2s, color 0.2s',
    }}
  >
    {dir === 'left' ? (
      <svg width='15' height='15' viewBox='0 0 16 16' fill='none'>
        <path
          d='M10 12L6 8L10 4'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ) : (
      <svg width='15' height='15' viewBox='0 0 16 16' fill='none'>
        <path
          d='M6 4L10 8L6 12'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )}
  </motion.button>
);

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
type Props = { id: string };

const Offer = ({ id }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const navigate = (step: 1 | -1) => {
    const next = activeIndex + step;
    if (next < 0 || next >= services.length) return;
    setDir(step);
    setActiveIndex(next);
  };

  const current = services[activeIndex];

  const textVariants = {
    enter: (d: number) => ({ opacity: 0, y: d * 22 }),
    center: { opacity: 1, y: 0 },
    exit: (d: number) => ({ opacity: 0, y: d * -14 }),
  };

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      {/* ── HEADER ── */}
      <div className='px-6 sm:px-12 lg:px-24 xl:px-32 pt-24 lg:pt-32 pb-12'>
        <TextReveal>
          <Headline>
            Kaliteli hizmet
            <br />
            <QuatToLightFont>özel ambiyans</QuatToLightFont>
          </Headline>
        </TextReveal>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)',
        }}
      />

      {/* ── FEATURE DISPLAY ── */}
      <div
        className='px-6 sm:px-12 lg:px-24 xl:px-32'
        style={{
          paddingTop: 'clamp(64px, 8vw, 112px)',
          paddingBottom: 'clamp(56px, 7vw, 96px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(48px, 8vw, 128px)',
          flexWrap: 'wrap',
          minHeight: '52vh',
        }}
      >
        {/* ── LEFT: morphing icon with glow ── */}
        <div
          style={{
            flexShrink: 0,
            position: 'relative',
            width: 'clamp(180px, 20vw, 280px)',
            aspectRatio: '1 / 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer diffuse bloom */}
          <div
            style={{
              position: 'absolute',
              inset: '-25%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 55%, rgba(153,51,255,0.22) 0%, rgba(204,102,255,0.08) 45%, transparent 68%)',
              pointerEvents: 'none',
              filter: 'blur(22px)',
            }}
          />
          {/* Inner tight glow */}
          <div
            style={{
              position: 'absolute',
              inset: '5%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 60%, rgba(153,51,255,0.14) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* Icon — static, never moves */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
            }}
          >
            <MorphIcon activeIndex={activeIndex} />
          </div>
        </div>

        {/* ── RIGHT: text ── */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.28)',
              marginBottom: 28,
              textTransform: 'uppercase',
            }}
          >
            {String(activeIndex + 1).padStart(2, '0')}&nbsp;/&nbsp;
            {String(services.length).padStart(2, '0')}
          </p>

          <AnimatePresence mode='wait' custom={dir}>
            <motion.h3
              key={`title-${activeIndex}`}
              custom={dir}
              variants={textVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                fontWeight: 700,
                color: 'rgba(251,251,251,0.95)',
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                marginBottom: 24,
              }}
            >
              {current.title}
            </motion.h3>
          </AnimatePresence>

          <motion.div
            key={`rule-${activeIndex}`}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 36,
              height: 2,
              borderRadius: 2,
              background: 'rgba(153,51,255,0.85)',
              marginBottom: 24,
            }}
          />

          <AnimatePresence mode='wait' custom={dir}>
            <motion.p
              key={`desc-${activeIndex}`}
              custom={dir}
              variants={textVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{
                duration: 0.42,
                delay: 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                fontSize: 'clamp(1rem, 1.35vw, 1.175rem)',
                color: 'rgba(251,251,251,0.48)',
                lineHeight: 1.78,
                maxWidth: 460,
              }}
            >
              {current.description}
            </motion.p>
          </AnimatePresence>

          {/* Progress pills */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 48,
              alignItems: 'center',
            }}
            role='tablist'
            aria-label='Hizmetler'
          >
            {services.map((s, i) => (
              <motion.button
                key={s.id}
                role='tab'
                aria-selected={i === activeIndex}
                aria-label={s.title}
                onClick={() => {
                  setDir(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                animate={{
                  width: i === activeIndex ? 36 : 8,
                  opacity: i === activeIndex ? 1 : 0.28,
                  backgroundColor:
                    i === activeIndex
                      ? 'rgba(153,51,255,0.9)'
                      : 'rgba(255,255,255,0.6)',
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: 4,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV BUTTONS ── */}
      <div
        className='px-6 sm:px-12 lg:px-24 xl:px-32'
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 80,
          paddingTop: 8,
        }}
      >
        <NavButton
          dir='left'
          disabled={activeIndex === 0}
          onClick={() => navigate(-1)}
        />
        <NavButton
          dir='right'
          disabled={activeIndex === services.length - 1}
          onClick={() => navigate(1)}
        />
      </div>
    </section>
  );
};

export default Offer;
