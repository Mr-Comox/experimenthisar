'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { testimonies } from './Collection';
import PlatformScores from './PlatformScores';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';

gsap.registerPlugin(MorphSVGPlugin);

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   USE REVEAL
───────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.4) {
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
      { scale: 0.86, force3D: true },
      { scale: 1, duration: 0.25, ease: 'back.out(2.5)', force3D: true },
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
   MORPH QUOTE ICON
   Diamond → speech-bubble, fully in --color-mainColor (#ff1987)
───────────────────────────────────────────────────────────────── */
const DIAMOND_PATH = 'M39 0 L78 59.5 L39 119 L0 59.5 Z';
const QUOTE_PATH = 'M78 74.631V0H0v74.631h33.526V119L78 74.631Z';
const MAIN_COLOR = '#ff1987';

const MorphQuoteIcon = ({ trigger }: { trigger: boolean }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const hasRun = useRef(false);

  // Start as a pink diamond immediately
  useEffect(() => {
    if (pathRef.current) {
      gsap.set(pathRef.current, {
        attr: { d: DIAMOND_PATH, fill: MAIN_COLOR },
      });
    }
  }, []);
  useEffect(() => {
    if (!trigger || hasRun.current || !pathRef.current) return;
    hasRun.current = true;

    gsap
      .timeline({ delay: 0.35 })
      // 1 — scale in only, NO opacity (parent wrapper already fades in)
      .fromTo(
        pathRef.current,
        { scale: 0.72, transformOrigin: '50% 50%' },
        {
          scale: 1,
          transformOrigin: '50% 50%',
          duration: 0.45,
          ease: 'back.out(2.2)',
        },
      )
      // 2 — morph diamond → quote bubble
      .to(
        pathRef.current,
        {
          morphSVG: QUOTE_PATH,
          duration: 0.78,
          ease: 'power3.inOut',
          fill: MAIN_COLOR,
        },
        '-=0.1',
      );
  }, [trigger]);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='78'
      height='119'
      viewBox='0 0 78 119'
      fill='none'
      aria-hidden='true'
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* fill set inline too as a hard fallback before useEffect fires */}
      <path ref={pathRef} fill={MAIN_COLOR} d={DIAMOND_PATH} />
    </svg>
  );
};
/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const Testimonials = ({ id }: Props) => {
  const { ref: revealRef, visible } = useReveal(0.4);
  const [index, setIndex] = useState(0);
  const isAnimating = useRef(false);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const slideX =
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 24 : 52;
  const slideY =
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 6 : 14;

  useEffect(() => {
    if (!visible) return;
    const ease = 'power3.out';

    gsap.fromTo(
      bubbleRef.current,
      { opacity: 0, y: -10, force3D: true },
      { opacity: 1, y: 0, duration: 0.55, ease, delay: 0.3, force3D: true },
    );
    gsap.fromTo(
      ruleRef.current,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.7,
        ease,
        delay: 0.22,
        transformOrigin: 'left',
        force3D: true,
      },
    );
    gsap.fromTo(
      bottomRef.current,
      { opacity: 0, y: slideY, force3D: true },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease,
        delay: 0.44,
        force3D: true,
        onComplete: () => {
          if (bottomRef.current) bottomRef.current.style.willChange = 'auto';
        },
      },
    );
  }, [visible, slideY]);

  const animateIn = useCallback(
    (dir: number) => {
      const x = dir > 0 ? slideX : -slideX;
      gsap.fromTo(
        quoteRef.current,
        { x, opacity: 0, force3D: true },
        {
          x: 0,
          opacity: 1,
          duration: 0.28,
          ease: 'power2.out',
          force3D: true,
          onComplete: () => {
            if (quoteRef.current) quoteRef.current.style.willChange = 'auto';
          },
        },
      );
      gsap.fromTo(
        authorRef.current,
        { opacity: 0, y: 6, force3D: true },
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
          delay: 0.06,
          force3D: true,
          onComplete: () => {
            if (authorRef.current) authorRef.current.style.willChange = 'auto';
          },
        },
      );
    },
    [slideX],
  );

  const paginate = useCallback(
    (dir: number) => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      const xOut = dir > 0 ? -slideX : slideX;

      if (quoteRef.current)
        quoteRef.current.style.willChange = 'transform, opacity';
      if (authorRef.current)
        authorRef.current.style.willChange = 'transform, opacity';

      gsap
        .timeline({
          onComplete: () => {
            isAnimating.current = false;
          },
        })
        .to(
          quoteRef.current,
          {
            x: xOut,
            opacity: 0,
            duration: 0.16,
            ease: 'power2.in',
            force3D: true,
          },
          0,
        )
        .to(
          authorRef.current,
          {
            opacity: 0,
            y: -5,
            duration: 0.14,
            ease: 'power2.in',
            force3D: true,
          },
          0,
        )
        .add(() => {
          setIndex(
            (prev) => (prev + dir + testimonies.length) % testimonies.length,
          );
          animateIn(dir);
        });
    },
    [animateIn, slideX],
  );

  const goTo = useCallback(
    (i: number) => {
      if (isAnimating.current || i === index) return;
      const dir = i > index ? 1 : -1;
      isAnimating.current = true;
      const xOut = dir > 0 ? -slideX : slideX;

      if (quoteRef.current)
        quoteRef.current.style.willChange = 'transform, opacity';
      if (authorRef.current)
        authorRef.current.style.willChange = 'transform, opacity';

      gsap
        .timeline({
          onComplete: () => {
            isAnimating.current = false;
          },
        })
        .to(
          quoteRef.current,
          {
            x: xOut,
            opacity: 0,
            duration: 0.16,
            ease: 'power2.in',
            force3D: true,
          },
          0,
        )
        .to(
          authorRef.current,
          {
            opacity: 0,
            y: -5,
            duration: 0.14,
            ease: 'power2.in',
            force3D: true,
          },
          0,
        )
        .add(() => {
          setIndex(i);
          animateIn(dir);
        });
    },
    [index, animateIn, slideX],
  );

  useEffect(() => {
    gsap.set([quoteRef.current, authorRef.current], {
      opacity: 1,
      x: 0,
      y: 0,
      force3D: true,
    });
  }, []);

  const t = testimonies[index];
  const px = 'clamp(28px, 6vw, 80px)';
  const pt = 'clamp(48px, 8vh, 88px)';

  return (
    <section
      id={id}
      aria-labelledby='testimonials-heading'
      className='relative bg-secondaryColor overflow-hidden pt-5'
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
        {/* ── Morph Quote Icon — absolute top-right, desktop only ── */}
        <div
          className='hidden lg:block'
          ref={bubbleRef}
          aria-hidden='true'
          style={{
            position: 'absolute',
            top: pt,
            right: px,
            opacity: 0, // faded in by the entry animation
          }}
        >
          {/* trigger={visible} kicks off diamond → quote morph */}
          <MorphQuoteIcon trigger={visible} />
        </div>

        {/* ══ ROW 1 — HEADING ══ */}
        <div style={{ flexShrink: 0, textAlign: 'left' }}>
          <TextReveal animateOnScroll>
            <Headline>Misafirlerimizin</Headline>
          </TextReveal>
          <div style={{ marginTop: 'clamp(-8px, -0.5vw, -2px)' }}>
            <TextReveal animateOnScroll delay={0.1}>
              <Headline>
                <MainColorToQuatFont>deneyimleri</MainColorToQuatFont>
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

        {/* ══ ROW 2 — QUOTE + AUTHOR ══ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: 'clamp(32px, 4vh, 56px)',
            paddingBottom: 'clamp(32px, 4vh, 56px)',
          }}
        >
          <blockquote
            ref={quoteRef}
            id='testimonials-heading'
            style={{
              margin: 0,
              fontSize: 'clamp(1.65rem, 3vw, 2.6rem)',
              fontWeight: 700,
              color: 'rgba(251,251,251,0.95)',
              lineHeight: 1.28,
              letterSpacing: '-0.022em',
              maxWidth: '68ch',
              textAlign: 'left',
              textWrap: 'pretty',
              willChange: 'auto',
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
              willChange: 'auto',
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
            willChange: 'auto',
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
