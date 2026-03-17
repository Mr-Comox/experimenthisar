'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { QuatToLightFont } from '@/app/utilities/LinearFontColors';

gsap.registerPlugin(MorphSVGPlugin);

/* ─────────────────────────────────────────────────────────────────
   ICON PATHS — all normalized to 0–100 viewBox
   Multi-subpath shapes use M...Z M...Z (MorphSVG handles them)
───────────────────────────────────────────────────────────────── */
const PATHS = [
  // 0 — Sparkle (VIP Loca)
  'M50 6 L56 44 L94 50 L56 56 L50 94 L44 56 L6 50 L44 44 Z',

  // 1 — Martini Glass (Lounge Bar)
  'M15 15 L85 15 L54 62 L54 80 L66 80 L66 88 L34 88 L34 80 L46 80 L46 62 Z',

  // 2 — 5-square checker (Dans Alanı) — multi-subpath
  'M8 8 L36 8 L36 36 L8 36 Z M64 8 L92 8 L92 36 L64 36 Z M36 36 L64 36 L64 64 L36 64 Z M8 64 L36 64 L36 92 L8 92 Z M64 64 L92 64 L92 92 L64 92 Z',

  // 3 — Calendar with date cells (Etkinlikler) — multi-subpath
  'M18 30 L18 86 L82 86 L82 30 Z M30 16 L30 34 L42 34 L42 16 Z M58 16 L58 34 L70 34 L70 16 Z M22 48 L34 48 L34 58 L22 58 Z M44 48 L56 48 L56 58 L44 58 Z M66 48 L78 48 L78 58 L66 58 Z M22 66 L34 66 L34 76 L22 76 Z M44 66 L56 66 L56 76 L44 76 Z M66 66 L78 66 L78 76 L66 76 Z',
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

type PathSegment = number[] & { closed?: boolean };
type RawPath = PathSegment[];

/* ─────────────────────────────────────────────────────────────────
   CANVAS MORPH ICON
   — hidden SVG path is animated by MorphSVGPlugin
   — render callback draws rawPath to canvas every tick
   — ResizeObserver keeps canvas pixel-perfect at any DPR
───────────────────────────────────────────────────────────────── */
const MorphCanvas = ({ activeIndex }: { activeIndex: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gradRef = useRef<CanvasGradient | null>(null);
  const readyRef = useRef(false);
  const indexRef = useRef(activeIndex); // always holds latest index

  /* Draw rawPath (bezier segments from MorphSVG) to canvas */
  const draw = useCallback((rawPath: RawPath) => {
    const ctx = ctxRef.current;
    const gradient = gradRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !gradient || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.beginPath();

    for (const segment of rawPath) {
      const l = segment.length;
      ctx.moveTo(segment[0], segment[1]);
      for (let i = 2; i < l; i += 6) {
        ctx.bezierCurveTo(
          segment[i],
          segment[i + 1],
          segment[i + 2],
          segment[i + 3],
          segment[i + 4],
          segment[i + 5],
        );
      }
      if (segment.closed) ctx.closePath();
    }

    // evenodd fill so multi-subpath shapes render all sub-shapes correctly
    ctx.fill('evenodd');
  }, []);

  /* (Re)initialise canvas — called on mount and on every resize */
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const path = pathRef.current;
    if (!canvas || !path) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.getBoundingClientRect().width;
    if (!size) return;

    // Set backing-store dimensions
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    // Reset + scale context so we draw in viewBox (0–100) coordinates
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale((size / 100) * dpr, (size / 100) * dpr);
    ctxRef.current = ctx;

    // Recreate gradient in viewBox coordinate space
    const grad = ctx.createLinearGradient(0, 0, 100, 100);
    grad.addColorStop(0, '#9933ff');
    grad.addColorStop(0.55, '#cc66ff');
    grad.addColorStop(1, '#e099ff');
    gradRef.current = grad;
    readyRef.current = true;

    // Immediately redraw the current shape (no tween, instant)
    gsap.killTweensOf(path);
    gsap.set(path, {
      morphSVG: { shape: PATHS[indexRef.current], render: draw },
    });
  }, [draw]);

  /* Mount: initialise canvas + attach ResizeObserver */
  useEffect(() => {
    const canvas = canvasRef.current;
    const path = pathRef.current;
    if (!canvas || !path) return;

    // Seed the hidden SVG path
    path.setAttribute('d', PATHS[0]);

    // Wait one frame so CSS has laid out the canvas
    const raf = requestAnimationFrame(setup);

    const ro = new ResizeObserver(() => requestAnimationFrame(setup));
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [setup]);

  /* Animate whenever activeIndex changes */
  useEffect(() => {
    indexRef.current = activeIndex;
    const path = pathRef.current;
    if (!path || !readyRef.current) return;

    gsap.killTweensOf(path);
    gsap.to(path, {
      morphSVG: { shape: PATHS[activeIndex], render: draw },
      duration: 0.9,
      ease: 'power2.inOut',
    });
  }, [activeIndex, draw]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        // Promote to GPU layer — reduces composite cost on mobile
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Hidden SVG — MorphSVGPlugin animates this element's `d` attribute */}
      <svg
        aria-hidden='true'
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <path ref={pathRef} d={PATHS[0]} />
      </svg>

      {/* Outer diffuse bloom */}
      <div
        style={{
          position: 'absolute',
          inset: '-25%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 55%, rgba(153,51,255,0.22) 0%, rgba(204,102,255,0.08) 45%, transparent 68%)',
          filter: 'blur(22px)',
          pointerEvents: 'none',
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

      {/* Canvas — fills the container, DPR-corrected internally */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
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
    whileTap={disabled ? {} : { scale: 0.88 }}
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
      transition: 'color 0.2s',
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

      {/* ── FEATURE DISPLAY ──
          align-items: flex-start  → text reflow never pushes icon or buttons
          minHeight is fixed        → nav buttons always sit at the same distance
      */}
      <div
        className='px-6 sm:px-12 lg:px-24 xl:px-32'
        style={{
          paddingTop: 'clamp(64px, 8vw, 112px)',
          paddingBottom: 'clamp(56px, 7vw, 96px)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(48px, 8vw, 128px)',
          flexWrap: 'wrap',
          /* Fixed min-height prevents nav buttons from jumping on mobile
             when text transitions cause small reflows */
          minHeight: 'clamp(340px, 48vw, 500px)',
        }}
      >
        {/* ── LEFT: canvas icon ── */}
        <div
          style={{
            flexShrink: 0,
            width: 'clamp(180px, 20vw, 280px)',
            aspectRatio: '1 / 1',
          }}
        >
          <MorphCanvas activeIndex={activeIndex} />
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

      {/* ── NAV BUTTONS ──
          Sits BELOW the fixed-minHeight content block.
          On mobile the buttons always land at the same vertical position
          because the content area above them never collapses smaller than
          minHeight. paddingBottom gives the section a consistent bottom gap.
      */}
      <div
        className='px-6 sm:px-12 lg:px-24 xl:px-32'
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 'clamp(56px, 7vw, 96px)',
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
