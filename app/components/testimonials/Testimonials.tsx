'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonies } from './Collection';
import PlatformScores from './PlatformScores';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   LAYOUT CONSTANTS — single source of truth so nothing drifts
───────────────────────────────────────────────────────────────── */
const PX = 'clamp(32px, 6vw, 108px)'; // horizontal padding
const PT = 'clamp(52px, 7vh, 84px)'; // top offset for heading
const PB = 'clamp(44px, 6vh, 72px)'; // bottom offset for nav bar
const NAV_H = 48; // nav-bar row height (px)

/* ─────────────────────────────────────────────────────────────────
   NAV BUTTON — exact copy from Offer.tsx
───────────────────────────────────────────────────────────────── */
const NavButton = ({
  dir,
  onClick,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    aria-label={dir === 'left' ? 'Önceki' : 'Sonraki'}
    whileTap={{ scale: 0.88, backgroundColor: 'rgba(251,251,251,0.14)' }}
    transition={{ duration: 0.12, ease: 'easeOut' }}
    style={{
      width: NAV_H,
      height: NAV_H,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      color: 'rgba(251,251,251,0.72)',
      cursor: 'pointer',
      border: '1px solid rgba(251,251,251,0.18)',
      flexShrink: 0,
      transition: 'background 0.2s, color 0.2s, border-color 0.2s',
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
   QUOTE BUBBLE ICON — #ff1987, GSAP-style shape
───────────────────────────────────────────────────────────────── */
const QuoteBubbleIcon = () => (
  <svg
    width='52'
    height='60'
    viewBox='0 0 54 62'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <rect width='54' height='46' rx='5' fill='#ff1987' />
    <polygon points='14,46 14,62 32,46' fill='#ff1987' />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────────── */
const quoteVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const avatarVariants = {
  enter: { opacity: 0, scale: 0.78, rotate: 45 },
  center: { opacity: 1, scale: 1, rotate: 45 },
  exit: { opacity: 0, scale: 0.78, rotate: 45 },
};

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const Testimonials = ({ id }: Props) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + testimonies.length) % testimonies.length);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index],
  );

  const t = testimonies[index];

  return (
    <section
      id={id}
      className='relative bg-secondaryColor overflow-hidden'
      aria-labelledby='testimonials-heading'
    >
      {/* ═══════════════════════════════════════════════════════════
          SLIDER STAGE — exactly 100vh
          Every child is absolutely anchored so the section height
          is rock-solid regardless of quote text length.
      ═══════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', height: '100vh' }}>
        {/* ── HEADING — top-left, back from original ── */}
        <div
          style={{
            position: 'absolute',
            top: PT,
            left: PX,
            right: PX,
          }}
        >
          <h2
            id='testimonials-heading'
            className='font-bold text-white leading-[1.06] tracking-[-0.025em] '
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
          >
            Misafirlerimizin <br />
            <MainColorToQuatFont>deneyimleri</MainColorToQuatFont>
          </h2>
        </div>

        {/* ── AVATAR (left) + QUOTE BUBBLE (right) ── */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(150px, 23vh, 230px)',
            left: PX,
            right: PX,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          {/* Diamond avatar */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={`avatar-${index}`}
              variants={avatarVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 'clamp(62px, 6.5vw, 82px)',
                height: 'clamp(62px, 6.5vw, 82px)',
                borderRadius: '13px',
                background: 'rgba(255,25,135,0.10)',
                border: '1.5px solid rgba(255,25,135,0.38)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Counter-rotate so the letter stays upright */}
              <span
                style={{
                  display: 'block',
                  transform: 'rotate(-45deg)',
                  fontSize: 'clamp(1.3rem, 2vw, 1.8rem)',
                  fontWeight: 700,
                  color: '#ff1987',
                  userSelect: 'none',
                  lineHeight: 1,
                }}
              >
                {t.author.charAt(0)}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Quote bubble — static, never moves */}
          <QuoteBubbleIcon />
        </div>

        {/* ── QUOTE ZONE — fixed vertical band ──────────────────
            top  = below the avatar row
            bottom = above the nav bar
            Both anchors are fixed → this div NEVER changes height
            → section stays 100vh no matter what.               */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(260px, 37vh, 370px)',
            bottom: `calc(${PB} + ${NAV_H}px + 52px)`,
            left: PX,
            right: PX,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Quote text */}
          <AnimatePresence mode='wait' custom={direction}>
            <motion.blockquote
              key={`quote-${index}`}
              custom={direction}
              variants={quoteVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              style={{
                margin: 0,
                fontSize: 'clamp(1.3rem, 3vw, 2.65rem)',
                fontWeight: 700,
                color: 'rgba(251,251,251,0.95)',
                lineHeight: 1.3,
                letterSpacing: '-0.022em',
                maxWidth: '78ch',
              }}
            >
              {t.comment}
            </motion.blockquote>
          </AnimatePresence>

          {/* Author — line + name */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={`author-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{
                duration: 0.36,
                delay: 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 'clamp(18px, 2.6vh, 30px)',
              }}
            >
              <div
                aria-hidden='true'
                style={{
                  width: 40,
                  height: 1,
                  background: 'rgba(251,251,251,0.30)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 'clamp(0.8rem, 0.95vw, 0.94rem)',
                  fontWeight: 500,
                  color: 'rgba(251,251,251,0.44)',
                  letterSpacing: '0.025em',
                }}
              >
                {t.author}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── BOTTOM BAR — absolutely pinned ──────────────────────
            Dots and nav buttons live here.
            This is position:absolute with a fixed `bottom` value
            so they NEVER move regardless of quote length.        */}
        <div
          style={{
            position: 'absolute',
            bottom: PB,
            left: PX,
            right: PX,
            height: NAV_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Dot indicators */}
          <div
            role='tablist'
            aria-label='Testimonial navigation'
            style={{ display: 'flex', alignItems: 'center', gap: 9 }}
          >
            {testimonies.map((_, i) => (
              <button
                key={i}
                role='tab'
                aria-selected={i === index}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    i === index ? '#ff1987' : 'rgba(251,251,251,0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition:
                    'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s ease',
                }}
              />
            ))}
          </div>

          {/* Nav buttons — exact NavButton from Offer.tsx */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavButton dir='left' onClick={() => paginate(-1)} />
            <NavButton dir='right' onClick={() => paginate(1)} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PLATFORM SCORES
      ══════════════════════════════════════════ */}
      <div className='w-full h-px bg-white/[0.07]' />
      <PlatformScores />
    </section>
  );
};

export default Testimonials;
