'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { testimonies } from './Collection';
import PlatformScores from './PlatformScores';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   USE REVEAL
───────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────────────────────────
   NAV BUTTON
───────────────────────────────────────────────────────────────── */
const NavButton = ({
  dir,
  onClick,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const handle = () => {
    gsap.fromTo(
      btnRef.current,
      { scale: 0.86 },
      { scale: 1, duration: 0.25, ease: 'back.out(2.5)' },
    );
    onClick();
  };
  return (
    <button
      ref={btnRef}
      onClick={handle}
      aria-label={dir === 'left' ? 'Önceki' : 'Sonraki'}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color: 'rgba(251,251,251,0.72)',
        cursor: 'pointer',
        border: '1px solid rgba(251,251,251,0.18)',
        flexShrink: 0,
        transition: 'background 0.2s',
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
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────
   QUOTE BUBBLE
───────────────────────────────────────────────────────────────── */
const QuoteBubbleIcon = () => (
  <svg
    width='48'
    height='56'
    viewBox='0 0 54 62'
    fill='none'
    aria-hidden='true'
  >
    <rect width='54' height='46' rx='5' fill='#ff1987' />
    <polygon points='14,46 14,62 32,46' fill='#ff1987' />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const Testimonials = ({ id }: Props) => {
  const { ref: revealRef, visible } = useReveal(0.12);

  const [index, setIndex] = useState(0);
  const isAnimating = useRef(false);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const ease = 'power3.out';
    gsap.fromTo(
      bubbleRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.65, ease, delay: 0.35 },
    );
    gsap.fromTo(
      ruleRef.current,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        ease,
        delay: 0.28,
        transformOrigin: 'left',
      },
    );
    gsap.fromTo(
      bottomRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.65, ease, delay: 0.5 },
    );
  }, [visible]);

  const animateIn = useCallback((dir: number) => {
    const x = dir > 0 ? 52 : -52;
    gsap.fromTo(
      quoteRef.current,
      { x, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.36, ease: 'power2.out' },
    );
    gsap.fromTo(
      authorRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.08 },
    );
  }, []);

  const paginate = useCallback(
    (dir: number) => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      const xOut = dir > 0 ? -52 : 52;
      gsap
        .timeline({
          onComplete: () => {
            isAnimating.current = false;
          },
        })
        .to(
          quoteRef.current,
          { x: xOut, opacity: 0, duration: 0.2, ease: 'power2.in' },
          0,
        )
        .to(
          authorRef.current,
          { opacity: 0, y: -6, duration: 0.16, ease: 'power2.in' },
          0,
        )
        .add(() => {
          setIndex(
            (prev) => (prev + dir + testimonies.length) % testimonies.length,
          );
          animateIn(dir);
        });
    },
    [animateIn],
  );

  const goTo = useCallback(
    (i: number) => {
      if (isAnimating.current || i === index) return;
      const dir = i > index ? 1 : -1;
      isAnimating.current = true;
      const xOut = dir > 0 ? -52 : 52;
      gsap
        .timeline({
          onComplete: () => {
            isAnimating.current = false;
          },
        })
        .to(
          quoteRef.current,
          { x: xOut, opacity: 0, duration: 0.2, ease: 'power2.in' },
          0,
        )
        .to(
          authorRef.current,
          { opacity: 0, y: -6, duration: 0.16, ease: 'power2.in' },
          0,
        )
        .add(() => {
          setIndex(i);
          animateIn(dir);
        });
    },
    [index, animateIn],
  );

  useEffect(() => {
    gsap.set([quoteRef.current, authorRef.current], { opacity: 1, x: 0, y: 0 });
  }, []);

  const t = testimonies[index];

  /* shared horizontal padding token */
  const px = 'clamp(28px, 6vw, 80px)';
  const pt = 'clamp(48px, 8vh, 88px)';

  return (
    <section
      id={id}
      aria-labelledby='testimonials-heading'
      className='relative bg-secondaryColor overflow-hidden pt-3'
    >
      <div
        ref={revealRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: px,
          paddingRight: px,
          paddingTop: pt,
          paddingBottom: 'clamp(32px, 5vh, 52px)',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* ── Quote bubble — absolute top-right ── */}
        <div
          ref={bubbleRef}
          aria-hidden='true'
          style={{
            position: 'absolute',
            top: pt,
            right: px,
            opacity: 0,
          }}
        >
          <QuoteBubbleIcon />
        </div>

        {/* ══ ROW 1 — HEADING ══ */}
        <div style={{ flexShrink: 0 }}>
          <TextReveal animateOnScroll={true} delay={0}>
            <Headline>Misafirlerimizin</Headline>
          </TextReveal>

          <div style={{ marginTop: 'clamp(-8px, -0.5vw, -2px)' }}>
            <TextReveal animateOnScroll={true} delay={0.05}>
              <Headline>
                <MainColorToQuatFont>Deneyimleri.</MainColorToQuatFont>
              </Headline>
            </TextReveal>
          </div>

          <div
            ref={ruleRef}
            style={{
              height: '1px',
              width: 'clamp(140px, 28%, 360px)',
              marginTop: 'clamp(12px, 1.8vh, 20px)',
              background:
                'linear-gradient(to right, rgba(255,25,135,0.5), rgba(255,25,135,0.06), transparent)',
              opacity: 0,
              transform: 'scaleX(0)',
              transformOrigin: 'left',
            }}
          />
        </div>

        {/* ══ ROW 2 — QUOTE + AUTHOR (grows to fill remaining height) ══ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent:
              'center' /* ← vertically centres quote in the remaining space */,
            paddingTop: 'clamp(32px, 4vh, 56px)',
            paddingBottom: 'clamp(32px, 4vh, 56px)',
          }}
        >
          <blockquote
            ref={quoteRef}
            id='testimonials-heading'
            style={{
              margin: 0,
              fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              color: 'rgba(251,251,251,0.95)',
              lineHeight: 1.28,
              letterSpacing: '-0.022em',
              maxWidth: '68ch',
              willChange: 'transform, opacity',
            }}
          >
            {t.comment}
          </blockquote>

          <div
            ref={authorRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 'clamp(16px, 2.4vh, 28px)',
              willChange: 'transform, opacity',
            }}
          >
            <div
              aria-hidden='true'
              style={{
                width: 40,
                height: 1,
                background: 'rgba(251,251,251,0.28)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 'clamp(0.78rem, 0.9vw, 0.9rem)',
                fontWeight: 500,
                color: 'rgba(251,251,251,0.44)',
                letterSpacing: '0.03em',
              }}
            >
              {t.author}
            </span>
          </div>
        </div>

        {/* ══ ROW 3 — DOTS + NAV ══ */}
        <div
          ref={bottomRef}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: 0,
          }}
        >
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavButton dir='left' onClick={() => paginate(-1)} />
            <NavButton dir='right' onClick={() => paginate(1)} />
          </div>
        </div>
      </div>

      <div className='absolute bottom-0 left-6 right-6 md:left-16 md:right-16 xl:left-24 xl:right-24 h-px bg-linear-to-r from-transparent via-white/6 to-transparent' />
      <div className='w-full h-px bg-white/[0.07]' />
      <PlatformScores />
    </section>
  );
};

export default Testimonials;
