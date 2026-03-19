'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { QuatToLightFont } from '@/app/utilities/LinearFontColors';

/* ─────────────────────────────────────────────────────────────────
   ICONS
   All rendered at 40×40 for consistent sizing across devices.
   IconCocktail & IconVIP use viewBox="0 0 24 24" (stroke-based).
   IconDance uses viewBox="0 0 15 15" (fill-based, provided SVG).
   IconEvent uses viewBox="0 0 24 24" (stroke-based).
───────────────────────────────────────────────────────────────── */

/* Lounge Bar — goblet glass */
const IconCocktail = () => (
  <svg viewBox='0 0 24 24' fill='none' width='40' height='40'>
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
  <svg viewBox='0 0 24 24' fill='none' width='40' height='40'>
    <path
      d='M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

/* Dans Alanı — globe with sparkles (provided SVG) */
const IconDance = () => (
  <svg viewBox='0 0 15 15' fill='none' width='40' height='40'>
    <path
      d='M6.00001 3.52313V0.5C6.00001 0.367392 5.94733 0.240215 5.85356 0.146447C5.75979 0.0526784 5.63261 0 5.50001 0C5.3674 0 5.24022 0.0526784 5.14645 0.146447C5.05268 0.240215 5.00001 0.367392 5.00001 0.5V3.52313C3.5905 3.65179 2.28486 4.31889 1.35465 5.38565C0.424451 6.45241 -0.0586998 7.83671 0.00570164 9.25061C0.0701031 10.6645 0.677098 11.9992 1.70043 12.9769C2.72376 13.9547 4.08464 14.5004 5.50001 14.5004C6.91537 14.5004 8.27625 13.9547 9.29958 12.9769C10.3229 11.9992 10.9299 10.6645 10.9943 9.25061C11.0587 7.83671 10.5756 6.45241 9.64536 5.38565C8.71515 4.31889 7.40951 3.65179 6.00001 3.52313ZM9.97125 8.5H7.98563C7.89126 6.7275 7.31126 5.4775 6.77063 4.68375C7.61992 4.93527 8.37635 5.43131 8.94554 6.10997C9.51472 6.78864 9.87146 7.61988 9.97125 8.5ZM4.01501 9.5H6.985C6.86 11.595 5.97688 12.8094 5.50001 13.3175C5.02251 12.8081 4.13938 11.5944 4.01501 9.5ZM4.01501 8.5C4.14001 6.405 5.02313 5.19062 5.50001 4.6825C5.97751 5.19187 6.86063 6.40563 6.985 8.5H4.01501ZM4.22938 4.68375C3.68751 5.4775 3.10876 6.7275 3.01438 8.5H1.02876C1.12854 7.61988 1.48529 6.78864 2.05447 6.10997C2.62366 5.43131 3.38009 4.93527 4.22938 4.68375ZM1.02876 9.5H3.01438C3.10876 11.2725 3.68876 12.5225 4.22938 13.3162C3.38009 13.0647 2.62366 12.5687 2.05447 11.89C1.48529 11.2114 1.12854 10.3801 1.02876 9.5ZM6.77063 13.3162C7.31126 12.5225 7.89126 11.2725 7.98563 9.5H9.97125C9.87146 10.3801 9.51472 11.2114 8.94554 11.89C8.37635 12.5687 7.61992 13.0647 6.77063 13.3162ZM14.5 5C14.5 5.13261 14.4473 5.25979 14.3536 5.35355C14.2598 5.44732 14.1326 5.5 14 5.5H13.5V6C13.5 6.13261 13.4473 6.25979 13.3536 6.35355C13.2598 6.44732 13.1326 6.5 13 6.5C12.8674 6.5 12.7402 6.44732 12.6465 6.35355C12.5527 6.25979 12.5 6.13261 12.5 6V5.5H12C11.8674 5.5 11.7402 5.44732 11.6465 5.35355C11.5527 5.25979 11.5 5.13261 11.5 5C11.5 4.86739 11.5527 4.74021 11.6465 4.64645C11.7402 4.55268 11.8674 4.5 12 4.5H12.5V4C12.5 3.86739 12.5527 3.74021 12.6465 3.64645C12.7402 3.55268 12.8674 3.5 13 3.5C13.1326 3.5 13.2598 3.55268 13.3536 3.64645C13.4473 3.74021 13.5 3.86739 13.5 4V4.5H14C14.1326 4.5 14.2598 4.55268 14.3536 4.64645C14.4473 4.74021 14.5 4.86739 14.5 5ZM8 2C8 1.86739 8.05268 1.74021 8.14645 1.64645C8.24022 1.55268 8.3674 1.5 8.5 1.5H9.5V0.5C9.5 0.367392 9.55268 0.240215 9.64645 0.146447C9.74022 0.0526784 9.8674 0 10 0C10.1326 0 10.2598 0.0526784 10.3536 0.146447C10.4473 0.240215 10.5 0.367392 10.5 0.5V1.5H11.5C11.6326 1.5 11.7598 1.55268 11.8536 1.64645C11.9473 1.74021 12 1.86739 12 2C12 2.13261 11.9473 2.25979 11.8536 2.35355C11.7598 2.44732 11.6326 2.5 11.5 2.5H10.5V3.5C10.5 3.63261 10.4473 3.75979 10.3536 3.85355C10.2598 3.94732 10.1326 4 10 4C9.8674 4 9.74022 3.94732 9.64645 3.85355C9.55268 3.75979 9.5 3.63261 9.5 3.5V2.5H8.5C8.3674 2.5 8.24022 2.44732 8.14645 2.35355C8.05268 2.25979 8 2.13261 8 2Z'
      fill='currentColor'
    />
  </svg>
);

/* Canlı Performans — microphone with stand arc */
const IconMic = () => (
  <svg viewBox='0 0 24 24' fill='none' width='40' height='40'>
    {/* Capsule body */}
    <rect
      x='9'
      y='2'
      width='6'
      height='11'
      rx='3'
      stroke='currentColor'
      strokeWidth='1.6'
    />
    {/* Pick-up arc */}
    <path
      d='M5 11a7 7 0 0014 0'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
    />
    {/* Stand stem + base */}
    <path
      d='M12 18v3M9 21h6'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
    />
  </svg>
);

/* Özel Etkinlikler — calendar with event dashes inside */
const IconEvent = () => (
  <svg viewBox='0 0 24 24' fill='none' width='40' height='40'>
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
    {/* Event dashes */}
    <path
      d='M7 14h4M7 17.5h3'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      opacity='0.9'
    />
    {/* Accent dot */}
    <circle cx='17' cy='14' r='1.5' stroke='currentColor' strokeWidth='1.4' />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const services = [
  {
    id: 1,
    Icon: IconVIP,
    title: 'VIP Loca',
    description:
      'Size ait bir alan. Sessiz lüks, maksimum konfor ve kişiye özel hizmet anlayışı.',
  },
  {
    id: 2,
    Icon: IconCocktail,
    title: 'Lounge Bar',
    description:
      'Zamana yayılan sohbetler, imza kokteyller ve rafine bir atmosfer. Her bardak, bir anın başlangıcı.',
  },
  {
    id: 3,
    Icon: IconMic,
    title: 'Canlı Performans',
    description:
      'Sahnedeki enerji yükselir, müzik gece boyunca kesintisiz akmaya devam eder.',
  },
  {
    id: 4,
    Icon: IconDance,
    title: 'Dans Alanı',
    description:
      'Gece ilerledikçe yükselen tempo ve özgür hareket. Işıklar söndüğünde, müzik konuşur.',
  },
  {
    id: 5,
    Icon: IconEvent,
    title: 'Özel Etkinlikler',
    description:
      'Kutlamalar, davetler ve unutulmaz geceler için kürasyon. Her özel an, titizlikle planlanır.',
  },
];

type Props = { id: string };

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
    <section id={id} className='relative bg-secondaryColor overflow-hidden '>
      {/* ─── HEADER ─── */}
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

      {/* ─── CAROUSEL ─── */}
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
                {/* Icon tile — slightly larger to give the bigger icons room */}
                <div
                  style={{
                    width: 'clamp(60px, 5vw, 68px)',
                    height: 'clamp(60px, 5vw, 68px)',
                    borderRadius: 16,
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

      {/* ─── NAV ─── */}
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
