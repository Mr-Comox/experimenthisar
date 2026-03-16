'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { QuatToLightFont } from '@/app/utilities/LinearFontColors';

/* ─────────────────────────────────────────────────────────────────
   ICONS
   All on viewBox="0 0 24 24", rendered at 34×34.
   1–3 elements each — GSAP MorphSVG ready.
───────────────────────────────────────────────────────────────── */

/* Lounge Bar — goblet glass */
const IconCocktail = () => (
  <svg viewBox='0 0 24 24' fill='none' width='34' height='34'>
    <path
      d='M8 3h8v3a4 4 0 01-8 0V3zm4 10v5m-3 3h6'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

/* VIP Loca — single star */
const IconVIP = () => (
  <svg viewBox='0 0 24 24' fill='none' width='34' height='34'>
    <path
      d='M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

/* Dans Alanı — expressive dancer: arms wide & high, one leg kicked */
const IconDance = () => (
  <svg viewBox='0 0 24 24' fill='none' width='34' height='34'>
    {/* Head */}
    <circle cx='12' cy='3' r='1.8' stroke='currentColor' strokeWidth='1.5' />
    {/* Torso */}
    <path
      d='M12 5v6'
      stroke='currentColor'
      strokeWidth='1.55'
      strokeLinecap='round'
    />
    {/* Left arm — raised high */}
    <path
      d='M12 7l-4-3'
      stroke='currentColor'
      strokeWidth='1.55'
      strokeLinecap='round'
    />
    {/* Right arm — out to side */}
    <path
      d='M12 7l4 2'
      stroke='currentColor'
      strokeWidth='1.55'
      strokeLinecap='round'
    />
    {/* Left leg — grounded, slight bend */}
    <path
      d='M12 11l-2 5'
      stroke='currentColor'
      strokeWidth='1.55'
      strokeLinecap='round'
    />
    {/* Right leg — kicked out high */}
    <path
      d='M12 11l4-2'
      stroke='currentColor'
      strokeWidth='1.55'
      strokeLinecap='round'
    />
  </svg>
);

/* Özel Etkinlikler — calendar with event dashes inside */
const IconEvent = () => (
  <svg viewBox='0 0 24 24' fill='none' width='34' height='34'>
    {/* Calendar shell */}
    <rect
      x='3'
      y='4'
      width='18'
      height='17'
      rx='2'
      stroke='currentColor'
      strokeWidth='1.6'
    />
    {/* Header divider + pin stems */}
    <path
      d='M3 10h18M8 2v4M16 2v4'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
    />
    {/* Event dashes — three rows suggesting a packed schedule */}
    <path
      d='M7 14h4M7 17.5h3'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      opacity='0.9'
    />
    {/* Accent dot — highlights a special date */}
    <circle cx='17' cy='14' r='1.5' stroke='currentColor' strokeWidth='1.4' />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const services = [
  {
    id: 1,
    Icon: IconCocktail,
    title: 'Lounge Bar',
    description:
      'Zamana yayılan sohbetler, imza kokteyller ve rafine bir atmosfer. Her bardak, bir anın başlangıcı.',
  },
  {
    id: 2,
    Icon: IconVIP,
    title: 'VIP Loca',
    description:
      'Size ait bir alan. Sessiz lüks, maksimum konfor ve kişiye özel hizmet anlayışı.',
  },
  {
    id: 3,
    Icon: IconDance,
    title: 'Dans Alanı',
    description:
      'Gece ilerledikçe yükselen tempo ve özgür hareket. Işıklar söndüğünde, müzik konuşur.',
  },
  {
    id: 4,
    Icon: IconEvent,
    title: 'Özel Etkinlikler',
    description:
      'Kutlamalar, davetler ve unutulmaz geceler için kürasyon. Her özel an, titizlikle planlanır.',
  },
];

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   NAV BUTTON — untouched
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
   ROOT — carousel logic untouched
───────────────────────────────────────────────────────────────── */
const TRACK_PADDING = 'clamp(24px, 4.16vw, 96px)';

const Offer = ({ id }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const syncScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, clientWidth, scrollWidth } = track;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);

    const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let closest = 0;
    let minDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const dist = Math.abs(card.offsetLeft - scrollLeft - paddingLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncScrollState();
    el.addEventListener('scroll', syncScrollState, { passive: true });
    window.addEventListener('resize', syncScrollState);
    return () => {
      el.removeEventListener('scroll', syncScrollState);
      window.removeEventListener('resize', syncScrollState);
    };
  }, [syncScrollState]);

  const scrollToCard = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, services.length - 1));
    const card = cardRefs.current[clamped];
    if (!card) return;
    const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({ left: card.offsetLeft - paddingLeft, behavior: 'smooth' });
  }, []);

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  };

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      {/* ─── HEADER — untouched ─── */}
      <div
        style={{ paddingLeft: TRACK_PADDING, paddingRight: TRACK_PADDING }}
        className='pt-24 xl:pt-32 pb-12'
      >
        <TextReveal>
          <Headline>
            Kaliteli hizmet
            <br />
            <QuatToLightFont>özel ambiyans</QuatToLightFont>
          </Headline>
        </TextReveal>
      </div>

      {/* Section divider */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)',
        }}
      />

      {/* ─── CAROUSEL — dimensions & scroll logic untouched ─── */}
      <div
        ref={trackRef}
        className='scrollbar-hide'
        style={
          {
            display: 'flex',
            overflowX: 'auto',
            alignItems: 'stretch',
            gap: 16,
            paddingLeft: TRACK_PADDING,
            paddingRight: TRACK_PADDING,
            paddingTop: 40,
            paddingBottom: 32,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          } as React.CSSProperties
        }
      >
        {services.map(({ id, Icon, title, description }, index) => (
          <div
            key={id}
            ref={setCardRef(index)}
            style={{
              flexShrink: 0,
              width: 'clamp(303px, 30vw, 405px)',
              display: 'flex',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: 18,
                overflow: 'hidden',
                /* ── Card skin — matches security-section pillars ── */
                background: 'rgba(255,255,255,0.001)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Card body */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '36px 32px 36px',
                  flexGrow: 1,
                }}
              >
                {/* Icon tile — purple-tinted, morph target lives here */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(157,0,255,0.09)',
                    border: '1px solid rgba(157,0,255,0.22)',
                    color: 'rgba(180,80,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginBottom: 22,
                  }}
                >
                  <Icon />
                </div>

                {/* Title */}
                <p
                  style={{
                    fontSize: 'clamp(1.2rem, 1.65vw, 1.375rem)',
                    fontWeight: 700,
                    color: 'rgba(251,251,251,0.95)',
                    lineHeight: 1.18,
                    letterSpacing: '-0.018em',
                    marginBottom: 12,
                    flexShrink: 0,
                  }}
                >
                  {title}
                </p>

                <p
                  className='text-white/55 leading-[1.72] mt-2 mb-14'
                  style={{
                    fontSize: 'clamp(0.9375rem, 1.3vw, 1.0625rem)',
                    flexGrow: 1,
                  }}
                >
                  {description}
                </p>
              </div>
            </motion.div>
          </div>
        ))}

        {/* Trailing spacer mirrors leading padding */}
        <div style={{ flexShrink: 0, width: TRACK_PADDING }} />
      </div>

      {/* ─── NAV — untouched ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          paddingRight: TRACK_PADDING,
          paddingBottom: 80,
          paddingTop: 8,
        }}
      >
        <NavButton
          dir='left'
          disabled={!canScrollLeft}
          onClick={() => scrollToCard(activeIndex - 1)}
        />
        <NavButton
          dir='right'
          disabled={!canScrollRight}
          onClick={() => scrollToCard(activeIndex + 1)}
        />
      </div>
    </section>
  );
};

export default Offer;
