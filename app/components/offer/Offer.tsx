'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';

/* ─────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────── */
const IconCocktail = () => (
  <svg
    viewBox='0 0 40 40'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    width='100%'
    height='100%'
  >
    <path
      d='M8 9h24L22 23v9'
      stroke='rgba(251,251,251,0.88)'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M17 32h6'
      stroke='rgba(251,251,251,0.88)'
      strokeWidth='1.9'
      strokeLinecap='round'
    />
    <circle cx='28.5' cy='12' r='3.2' stroke='#ff1987' strokeWidth='1.7' />
    <path
      d='M28.5 12l3.5-4'
      stroke='#ff1987'
      strokeWidth='1.7'
      strokeLinecap='round'
    />
    <path
      d='M8 9l5 6'
      stroke='rgba(251,251,251,0.2)'
      strokeWidth='1.5'
      strokeLinecap='round'
    />
  </svg>
);

const IconCrown = () => (
  <svg
    viewBox='0 0 40 40'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    width='100%'
    height='100%'
  >
    <path
      d='M6 29l3.5-15 6.5 7.5L20 10l4 11.5 6.5-7.5L34 29H6z'
      stroke='rgba(251,251,251,0.88)'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6 29h28'
      stroke='#ff1987'
      strokeWidth='1.9'
      strokeLinecap='round'
    />
    <circle cx='6' cy='14' r='2.3' fill='rgba(251,251,251,0.5)' />
    <circle cx='20' cy='10' r='2.3' fill='rgba(251,251,251,0.5)' />
    <circle cx='34' cy='14' r='2.3' fill='rgba(251,251,251,0.5)' />
  </svg>
);

const IconWave = () => (
  <svg
    viewBox='0 0 40 40'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    width='100%'
    height='100%'
  >
    <path
      d='M3 13c2.5-5 5-5 7.5 0s5 5 7.5 0 5-5 7.5 0 5 5 7.5 0'
      stroke='rgba(251,251,251,0.25)'
      strokeWidth='1.6'
      strokeLinecap='round'
    />
    <path
      d='M3 20c2.5-5 5-5 7.5 0s5 5 7.5 0 5-5 7.5 0 5 5 7.5 0'
      stroke='rgba(251,251,251,0.88)'
      strokeWidth='1.9'
      strokeLinecap='round'
    />
    <path
      d='M3 27c2.5-5 5-5 7.5 0s5 5 7.5 0 5-5 7.5 0 5 5 7.5 0'
      stroke='#ff1987'
      strokeWidth='1.7'
      strokeLinecap='round'
    />
  </svg>
);

const IconStar = () => (
  <svg
    viewBox='0 0 40 40'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    width='100%'
    height='100%'
  >
    <path
      d='M20 6l3.8 9.2H33l-7.5 5.5 2.8 9.2L20 24.5l-8.3 5.4 2.8-9.2L7 15.2h9.2L20 6z'
      stroke='rgba(251,251,251,0.88)'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='rgba(255,25,135,0.07)'
    />
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
    Icon: IconCrown,
    title: 'VIP Loca',
    description:
      'Size ait bir alan. Sessiz lüks, maksimum konfor ve kişiye özel hizmet anlayışı.',
  },
  {
    id: 3,
    Icon: IconWave,
    title: 'Dans Alanı',
    description:
      'Gece ilerledikçe yükselen tempo ve özgür hareket. Işıklar söndüğünde, müzik konuşur.',
  },
  {
    id: 4,
    Icon: IconStar,
    title: 'Özel Etkinlikler',
    description:
      'Kutlamalar, davetler ve unutulmaz geceler için kürasyon. Her özel an, titizlikle planlanır.',
  },
];

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   NAV BUTTON — with press animation via motion.button
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
    /* Press animation: scale down + slight bg flash, only when enabled */
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
      background: disabled ? 'rgba(251,251,251,0.04)' : '',
      color: disabled ? 'rgba(251,251,251,0.18)' : 'rgba(251,251,251,0.72)',
      cursor: disabled ? 'default' : 'pointer',
      border: '1px solid rgba(251,251,251,0.18)',
      flexShrink: 0,
      /* Smooth background transition for enable/disable state changes */
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

    // Button states — pure pixel truth, no index dependency
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);

    // Active index — used only to know which card to jump to on next/prev click
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

  /* Scroll exactly to a card's left edge */
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
      {/* ─── HEADER ─── */}
      <div
        style={{ paddingLeft: TRACK_PADDING, paddingRight: TRACK_PADDING }}
        className='pt-24 xl:pt-32 pb-12'
      >
        <TextReveal>
          <Headline>
            Kaliteli hizmet
            <br />
            özel ambiyans
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

      {/* ─── CAROUSEL ─── */}
      <div
        ref={trackRef}
        className='scrollbar-hide'
        style={
          {
            display: 'flex',
            overflowX: 'auto',
            alignItems: 'stretch', // all wrapper divs reach the tallest card's height
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
              display: 'flex', // lets motion.div inside use height:100%
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
                height: '100%', // fills wrapper → all cards equal height
                borderRadius: 18,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Hairline top edge */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'rgba(255,255,255,0.09)',
                }}
              />

              {/* Card body */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '28px 28px 24px',
                  flexGrow: 1,
                }}
              >
                {/* Icon tile */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.065)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginBottom: 22,
                  }}
                >
                  <div style={{ width: 34, height: 34 }}>
                    <Icon />
                  </div>
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
                  className='text-white/55 leading-[1.72] mt-2 mb-10 '
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

      {/* ─── NAV — always bottom right ─── */}
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
