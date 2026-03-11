'use client';

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gallery } from './Collection';
import { getSmoother } from '@/app/lib/smoother';
import { MainToGoldFont } from '@/app/utilities/LinearFontColors';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';

gsap.registerPlugin(ScrollTrigger);

type Props = { id: string };

const MAIN_TO_GOLD =
  'linear-gradient(135deg,#ff1987 0%,#ff6ec7 50%,#b8860b 100%)';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GAP = 3;
const PAD = 3;
const CELL_ASPECT = 3 / 2;

/*
 * Evaluated once on the client. False during SSR — fine because touch devices
 * re-evaluate correctly on hydration. Used to skip expensive GPU effects.
 */
const IS_TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

/* Fallback accent palette — vivid nightclub hues */
const ACCENT_PALETTE = [
  '#ff1987',
  '#c084fc',
  '#38bdf8',
  '#fb923c',
  '#f472b6',
  '#e879f9',
  '#fbbf24',
  '#34d399',
  '#f87171',
  '#818cf8',
  '#22d3ee',
  '#a78bfa',
  '#ff6ec7',
  '#a3e635',
  '#fb7185',
  '#60a5fa',
  '#4ade80',
  '#facc15',
  '#fb923c',
  '#a78bfa',
];

/* ─── calcLayout ────────────────────────────────────────────── */
function calcLayout(w: number, h: number) {
  const isPortrait = h >= w * 1.1;
  let cols: number, rows: number;
  if (isPortrait && w < 768) {
    cols = 2;
    rows = 4;
  } else if (isPortrait) {
    cols = 3;
    rows = 3;
  } else if (w >= 1100) {
    cols = 4;
    rows = 3;
  } else {
    cols = 3;
    rows = 3;
  }
  return { cols, rows };
}

/* ─── 1. Global keyframes (grain) ──────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      /* Safari iOS dvh fix — 100vh is the fallback before dvh is applied */
      .gallery-section { height: 100vh; height: 100dvh; }
      @supports (height: 100dvh) { .gallery-section { height: 100dvh; } }
      @keyframes g-grain {
        0%,100% { transform:translate(0,0) }
        10%  { transform:translate(-2%,-3%) }
        20%  { transform:translate( 3%, 1%) }
        30%  { transform:translate(-1%, 4%) }
        40%  { transform:translate( 2%,-2%) }
        50%  { transform:translate(-3%, 2%) }
        60%  { transform:translate( 1%,-1%) }
        70%  { transform:translate(-2%, 3%) }
        80%  { transform:translate( 3%,-2%) }
        90%  { transform:translate(-1%, 1%) }
      }
      .g-grain { animation: g-grain 0.45s steps(1) infinite; }
    `}</style>
  );
}

/* ─── Grain overlay layer ─────────────────────────────────── */
function GrainOverlay({ zIndex = 28 }: { zIndex?: number }) {
  return (
    <div
      className={IS_TOUCH ? undefined : 'g-grain'}
      style={{
        position: 'absolute',
        inset: '-15%',
        width: '130%',
        height: '130%',
        pointerEvents: 'none',
        zIndex,
        opacity: 0.044,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

/* ─── 2. Image accent-colour extraction ──────────────────────── */
function useImageAccents(srcs: string[]): string[] {
  const [accents, setAccents] = useState<string[]>(() =>
    srcs.map((_, i) => ACCENT_PALETTE[i % ACCENT_PALETTE.length]),
  );

  useEffect(() => {
    /* Accent extraction is only used by the desktop spotlight — skip on touch */
    if (typeof window === 'undefined' || IS_TOUCH) return;
    const results = srcs.map(
      (_, i) => ACCENT_PALETTE[i % ACCENT_PALETTE.length],
    );
    let pending = srcs.length;
    const done = () => {
      if (--pending === 0) setAccents([...results]);
    };
    srcs.forEach((src, i) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const cvs = document.createElement('canvas');
          cvs.width = 8;
          cvs.height = 8;
          const ctx = cvs.getContext('2d');
          if (!ctx) {
            done();
            return;
          }
          ctx.drawImage(img, 0, 0, 8, 8);
          const d = ctx.getImageData(0, 0, 8, 8).data;
          let r = 0,
            g = 0,
            b = 0;
          for (let j = 0; j < d.length; j += 4) {
            r += d[j];
            g += d[j + 1];
            b += d[j + 2];
          }
          const n = d.length / 4;
          const avg = (r + g + b) / (3 * n);
          const boost = 1.6;
          const c = (v: number) =>
            Math.min(255, Math.max(0, Math.round((v / n - avg) * boost + avg)));
          results[i] = `rgb(${c(r)},${c(g)},${c(b)})`;
        } catch {
          /* CORS / tainted canvas */
        }
        done();
      };
      img.onerror = done;
      img.src = src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return accents;
}

/* ─── NavBtn ─────────────────────────────────────────────────── */
function NavBtn({
  onClick,
  children,
  active,
}: {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false);
        setHov(false);
      }}
      onMouseEnter={() => setHov(true)}
      className='cursor-pointer flex items-center justify-center rounded-full'
      style={{
        width: 48,
        height: 48,
        border: `1px solid ${
          active
            ? 'rgba(255,25,135,0.55)'
            : pressed
              ? 'rgba(255,215,0,0.55)'
              : hov
                ? 'rgba(255,255,255,0.28)'
                : 'rgba(255,255,255,0.14)'
        }`,
        background: active
          ? 'rgba(255,25,135,0.08)'
          : pressed
            ? 'rgba(255,215,0,0.10)'
            : hov
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(255,255,255,0.04)',
        color: active
          ? 'rgba(255,25,135,0.95)'
          : pressed
            ? 'rgba(255,215,0,0.95)'
            : hov
              ? 'rgba(255,255,255,0.85)'
              : 'rgba(255,255,255,0.5)',
        transform: pressed ? 'scale(0.90)' : 'scale(1)',
        transition:
          'transform 0.11s ease, border-color 0.18s, background 0.18s, color 0.18s',
      }}
    >
      {children}
    </button>
  );
}

/* ─── 3 + 4. Modal ───────────────────────────────────────────── */
function GalleryModal({
  index,
  total,
  originRect,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  originRect: DOMRect | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  /*
   * Mobile/tablet detection — checked once on mount.
   * On touch devices we skip zoom-from-origin and use opacity-only
   * transitions to keep the GPU layer count minimal.
   */
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none), (max-width: 1023px)').matches;
  }, []);

  const origin = useMemo(() => {
    if (isMobile || !originRect || typeof window === 'undefined')
      return { x: 0, y: 0, scale: 0.88 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = vw * 0.84;
    const maxH = vh * 0.78;
    let imgW = maxW;
    let imgH = maxW / CELL_ASPECT;
    if (imgH > maxH) {
      imgH = maxH;
      imgW = imgH * CELL_ASPECT;
    }
    return {
      x: originRect.x + originRect.width / 2 - vw / 2,
      y: originRect.y + originRect.height / 2 - vh / 2,
      scale: Math.max(0.06, originRect.width / imgW),
    };
  }, [isMobile, originRect]);

  const swipeX = useRef(0);
  const swipeY = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    swipeX.current = e.clientX;
    swipeY.current = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - swipeX.current;
    const dy = Math.abs(e.clientY - swipeY.current);
    if (Math.abs(dx) > 72 && dy < 80) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };

  /*
   * Desktop: zoom-from-origin on first open, crossfade on navigation.
   * Mobile:  pure opacity — no x/y/scale animated at all.
   */
  const imgInitial = isMobile
    ? { opacity: 0 }
    : originRect !== null
      ? { opacity: 0, x: origin.x, y: origin.y, scale: origin.scale }
      : { opacity: 0, scale: 0.96, y: 10 };

  const imgAnimate = isMobile
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, scale: 1 };
  const imgExit = isMobile
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.94, y: -14 };

  return createPortal(
    <motion.div
      role='dialog'
      aria-modal='true'
      aria-label={`Hisar Nightclub — Fotoğraf ${index + 1} / ${total}`}
      className='fixed inset-0 flex items-center justify-center'
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(4,4,4,0.97)',
        backdropFilter: isMobile ? 'blur(14px)' : 'blur(32px)',
        WebkitBackdropFilter: isMobile ? 'blur(14px)' : 'blur(32px)',
        willChange: 'opacity',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isMobile ? 0.16 : 0.22 }}
      onClick={onClose}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {!isMobile && <GrainOverlay zIndex={6} />}

      {/* Counter */}
      <div
        className='absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3'
        style={{ zIndex: 10 }}
      >
        <div
          className='h-px w-8 opacity-35'
          style={{ background: MAIN_TO_GOLD }}
        />
        <span className='text-[0.65rem] tracking-[0.28em] uppercase text-white/38 font-medium tabular-nums'>
          {String(index + 1).padStart(2, '0')} —{' '}
          {String(total).padStart(2, '0')}
        </span>
        <div
          className='h-px w-8 opacity-35'
          style={{ background: MAIN_TO_GOLD }}
        />
      </div>

      {/* Close */}
      <div
        className='absolute top-4 right-4 sm:top-5 sm:right-5'
        style={{ zIndex: 10 }}
      >
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
            <path
              d='M1 1L13 13M13 1L1 13'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
            />
          </svg>
        </NavBtn>
      </div>

      {/* Prev */}
      <div
        className='absolute left-3 sm:left-5 top-1/2 -translate-y-1/2'
        style={{ zIndex: 10 }}
      >
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
            <path
              d='M10 12L6 8L10 4'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </NavBtn>
      </div>

      {/*
       * mode='sync' on mobile: exit and enter overlap — no black gap between images.
       * mode='wait' on desktop: clean sequential crossfade.
       */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={index}
          initial={imgInitial}
          animate={imgAnimate}
          exit={
            isMobile ? { opacity: 0, transition: { duration: 0 } } : imgExit
          }
          transition={{
            duration: isMobile ? 0.2 : 0.44,
            ease: isMobile ? 'easeOut' : EASE,
          }}
          onClick={(e) => e.stopPropagation()}
          className='relative'
          style={{ touchAction: 'none', zIndex: 4, willChange: 'opacity' }}
        >
          <Image
            src={gallery[index].src}
            alt={`Hisar Nightclub — Sahne fotoğrafı ${index + 1} / ${total}`}
            width={1400}
            height={900}
            className='max-w-[84vw] max-h-[78vh] w-auto h-auto object-contain rounded-lg'
            priority
            unoptimized
          />
          <div
            className='absolute bottom-0 left-0 right-0 h-px rounded-b-lg'
            style={{ background: MAIN_TO_GOLD, opacity: 0.18 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      <div
        className='absolute right-3 sm:right-5 top-1/2 -translate-y-1/2'
        style={{ zIndex: 10 }}
      >
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
            <path
              d='M6 4L10 8L6 12'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </NavBtn>
      </div>

      {/* Hint */}
      <div
        className='absolute bottom-5 left-1/2 -translate-x-1/2'
        style={{ zIndex: 10 }}
      >
        <span className='text-[0.48rem] tracking-[0.22em] uppercase text-white/18 font-medium'>
          {isMobile
            ? 'kaydır · kapatmak için dokun'
            : '← → ok tuşları · kaydır · ESC kapat'}
        </span>
      </div>
    </motion.div>,
    document.body,
  );
}

/* ─── 5 + 6. Gallery Card ─────────────────────────────────── */
/*
 * Entrance animation is now driven entirely by GSAP from SpotlightGrid.
 * motion.button is kept only for the whileTap press feedback on touch.
 * The card starts invisible (opacity: 0 via inline style); GSAP takes
 * control from there and calls clearProps on complete so whileTap can
 * own the transform afterwards without conflict.
 */
function GalleryCard({
  item,
  index,
  cols,
  priority,
  onOpen,
  cardRef,
}: {
  item: (typeof gallery)[number];
  index: number;
  visible: boolean; // kept in signature — SpotlightGrid still passes it
  cols: number;
  rows: number; // kept in signature — SpotlightGrid still passes it
  priority: boolean;
  onOpen: (i: number, rect?: DOMRect) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) =>
    onOpen(index, e.currentTarget.getBoundingClientRect());

  return (
    <motion.button
      ref={cardRef}
      type='button'
      onClick={handleClick}
      /* whileTap is the only FM animation left on this element.
         After GSAP clearProps fires, FM owns the transform cleanly. */
      whileTap={IS_TOUCH ? { opacity: 0.72, scale: 0.97 } : {}}
      style={{
        position: 'relative',
        border: 0,
        padding: 0,
        overflow: 'hidden',
        borderRadius: 4,
        background: '#0d0b09',
        cursor: 'inherit',
        minWidth: 0,
        minHeight: 0,
        /* GSAP sets opacity: 0 on first paint via gsap.set in the entrance
           effect — this inline default just prevents a flash on SSR/hydration. */
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      <Image
        src={item.src}
        alt={`Hisar Nightclub — Sahne fotoğrafı ${item.id}`}
        fill
        unoptimized
        className='object-cover'
        sizes={`${Math.round(100 / cols)}vw`}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
      />
    </motion.button>
  );
}

/* ─── Spotlight cursor — desktop only ───────────────────────── */
function SpotlightCursor({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -999, y: -999 });
  const targetRef = useRef({ x: -999, y: -999 });
  const insideRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      targetRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      insideRef.current = true;
    };
    const onLeave = () => {
      insideRef.current = false;
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    let raf: number;
    const tick = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.14;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.14;
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${posRef.current.x}px,${posRef.current.y}px)`;
        wrapRef.current.style.opacity = insideRef.current ? '1' : '0';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 50,
        opacity: 0,
        transition: 'opacity 0.22s ease',
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.5)',
          translate: '-50% -50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          translate: '-50% -50%',
        }}
      />
    </div>
  );
}

/* ─── Spotlight icon SVG ─────────────────────────────────────── */
function SpotlightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none'>
      {/* Light cone */}
      <path
        d='M6 3L3 13H13L10 3H6Z'
        stroke='currentColor'
        strokeWidth='1.3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {/* Lamp head */}
      <rect
        x='5.5'
        y='1.5'
        width='5'
        height='2'
        rx='0.8'
        stroke='currentColor'
        strokeWidth='1.3'
      />
      {/* Beam lines */}
      <line
        x1='4'
        y1='13'
        x2='12'
        y2='13'
        stroke='currentColor'
        strokeWidth='1.3'
        strokeLinecap='round'
      />
    </svg>
  );
}

/* ─── SpotlightGrid ──────────────────────────────────────────── */
function SpotlightGrid({
  visible,
  onOpen,
  accentColors,
}: {
  visible: boolean;
  onOpen: (i: number, rect?: DOMRect) => void;
  accentColors: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  type IntroPhase = 'idle' | 'cards' | 'covering' | 'spotlight';
  const [introPhase, setIntroPhase] = useState<IntroPhase>('idle');
  const [spotlightEnabled, setSpotlightEnabled] = useState(true);
  /* Ref mirror so phase sequencer timeouts can read current value without stale closure */
  const spotlightEnabledRef = useRef(true);
  useEffect(() => {
    spotlightEnabledRef.current = spotlightEnabled;
  }, [spotlightEnabled]);

  const accentColorsRef = useRef(accentColors);
  useEffect(() => {
    accentColorsRef.current = accentColors;
  }, [accentColors]);

  const posRef = useRef({ x: 50, y: 50 });
  const targetRef = useRef({ x: 50, y: 50 });

  const [layout, setLayout] = useState<{ cols: number; rows: number }>({
    cols: 4,
    rows: 3,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId: number;
    const ro = new ResizeObserver(([entry]) => {
      /* Debounce via rAF — prevents layout thrash on every pixel during resize */
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { width, height } = entry.contentRect;
        setLayout(calcLayout(width, height));
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const { cols, rows } = layout;

  /* Desktop = 4-column layout — spotlight only runs here */
  const isDesktop = cols === 4;

  /* Intro phase sequencer — spotlight phases only on desktop + when user hasn't disabled */
  useEffect(() => {
    const t0 = setTimeout(() => setIntroPhase(visible ? 'cards' : 'idle'), 0);
    if (!visible) return () => clearTimeout(t0);
    /* Non-desktop: stay on 'cards', no cinematic intro */
    if (!isDesktop) return () => clearTimeout(t0);
    /* Read ref at callback time — skips cinematic if user disabled spotlight */
    const t1 = setTimeout(() => {
      if (!spotlightEnabledRef.current) return;
      setIntroPhase('covering');
    }, 1150);
    const t2 = setTimeout(() => {
      if (!spotlightEnabledRef.current) return;
      setIntroPhase('spotlight');
    }, 1850);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible, isDesktop]);

  const visibleItems = gallery.slice(0, Math.min(cols * rows, gallery.length));

  const seedsRef = useRef<
    {
      angle: number;
      travel: number;
      rotation: number;
      delay: number;
      scale: number;
      duration: number;
    }[]
  >([]);

  useEffect(() => {
    /* Regenerate seeds when grid layout changes */
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;

    seedsRef.current = visibleItems.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      /* Direction: radially outward from grid centre with ±6° jitter — tighter
         angle spread keeps motion graceful rather than chaotic */
      const baseAngle =
        dist > 0.01 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.22; /* ~±6° in radians */
      const angle = baseAngle + jitter;

      /* Travel distance — reduced so cards glide in, not cannon-ball.
         Outer cards still travel further for the layered arrival feel. */
      const minTravel = IS_TOUCH ? 28 : 42;
      const extraTravel = IS_TOUCH ? 32 : 58;
      const travel =
        minTravel +
        (dist / maxDist) * extraTravel +
        Math.random() * (IS_TOUCH ? 10 : 16);

      /* Rotation — dialled back to barely perceptible on desktop */
      const rotation = IS_TOUCH ? 0 : (Math.random() - 0.5) * 10;

      /* Starting scale — closer to 1 so the scale-up feels like a breath
         rather than a pop. Outer cards slightly smaller for depth. */
      const scale = IS_TOUCH
        ? 0.88 + Math.random() * 0.05
        : 0.78 + (dist / maxDist) * -0.06 + Math.random() * 0.06;

      /*
       * Stagger delay — slightly wider spread creates a more wave-like,
       * cinematic wash. Total spread: ~0–640ms desktop, ~0–440ms touch.
       */
      const maxSpread = IS_TOUCH ? 0.44 : 0.64;
      const outerBias = (dist / maxDist) * (IS_TOUCH ? -0.05 : -0.08);
      const delay = Math.random() * maxSpread + outerBias;

      /* Duration — longer for that floaty, prestige deceleration */
      const duration = IS_TOUCH
        ? 0.72 + Math.random() * 0.18
        : 0.95 + Math.random() * 0.28;

      return {
        angle,
        travel,
        rotation,
        delay: Math.max(0, delay),
        scale,
        duration,
      };
    });
  }, [cols, rows, visibleItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Active tween refs for cleanup */
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLButtonElement[];

    /* Kill any in-flight animations from a previous visible=true cycle */
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];

    if (!visible || !cards.length) {
      /* Instant hide — scroll back up resets everything cleanly */
      gsap.set(cards, {
        opacity: 0,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        clearProps: 'willChange',
      });
      return;
    }

    /* Promote each card to its own compositor layer for the duration of
       the animation, then demote to avoid unnecessary GPU memory usage */
    gsap.set(cards, { force3D: true });

    tweensRef.current = cards.map((card, i) => {
      const s = seedsRef.current[i];
      if (!s)
        return gsap.to(card, { opacity: 1, duration: 0.4 }); /* fallback */

      const fromX = Math.cos(s.angle) * s.travel;
      const fromY = Math.sin(s.angle) * s.travel;

      /* Snap card to its starting off-position synchronously.
         Opacity is kept at 0 here; the separate opacity tween above owns the fade. */
      gsap.set(card, {
        opacity: 0,
        x: fromX,
        y: fromY,
        rotation: s.rotation,
        scale: s.scale,
      });

      /*
       * Opacity runs on its own slower tween — cards materialise gradually
       * rather than snapping visible mid-flight. This is the key to that
       * "emerging from darkness" Hollywood feel.
       */
      gsap.to(card, {
        opacity: 1,
        duration: s.duration * 0.72,
        delay: s.delay,
        ease: 'power4.out',
        force3D: true,
        overwrite: false,
      });

      return gsap.to(card, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: s.duration,
        delay: s.delay,
        /*
         * expo.out: nearly instantaneous initial velocity → asymptotically
         * approaches rest. This is the easing used in most prestige title
         * sequences — you feel the energy but the landing is imperceptibly soft.
         */
        ease: 'expo.out',
        /* Minimal scale overshoot — just enough physical weight, not bouncy */
        keyframes: [
          {
            scale: 1.018,
            duration: s.duration * 0.78,
            ease: 'expo.out',
          },
          {
            scale: 1,
            duration: s.duration * 0.22,
            ease: 'sine.inOut',
          },
        ],
        force3D: true,
        onComplete() {
          /*
           * Hand transform ownership back to Framer Motion (whileTap).
           * clearProps removes GSAP's inline transform so FM can apply
           * its own scale/opacity on tap without fighting a residual matrix.
           */
          gsap.set(card, { clearProps: 'transform,opacity,willChange' });
        },
      });
    });

    return () => {
      tweensRef.current.forEach((t) => t.kill());
    };
  }, [visible, cols, rows]);

  /* Cinematic spotlight RAF — desktop + enabled only */
  const curtainRef = useRef<HTMLDivElement>(null);
  const lastPaintRef = useRef({ x: -1, y: -1 });

  const cinema = useRef({
    phase: 'fadein' as 'fadein' | 'hold' | 'fadeout',
    elapsed: 0,
    cellIdx: 0,
    curtain: 1,
    manual: false,
  });

  const centresRef = useRef<{ x: number; y: number }[]>([]);
  useEffect(() => {
    centresRef.current = visibleItems.map((_, i) => ({
      x: ((i % cols) / cols) * 100 + (100 / cols) * 0.5,
      y: (Math.floor(i / cols) / rows) * 100 + (100 / rows) * 0.5,
    }));
  }, [visibleItems, cols, rows]);

  /* Clear layers when disabled; re-trigger cinematic sequence when re-enabled */
  useEffect(() => {
    if (!spotlightEnabled) {
      if (veilRef.current) veilRef.current.style.background = 'none';
      if (warmRef.current) warmRef.current.style.background = 'none';
      if (curtainRef.current) curtainRef.current.style.opacity = '0';
      return;
    }
    /* Re-enabled on desktop while cards are visible — restart cinematic */
    if (!isDesktop || introPhase === 'idle') return;
    setIntroPhase('cards');
    const t1 = setTimeout(() => setIntroPhase('covering'), 120);
    const t2 = setTimeout(() => setIntroPhase('spotlight'), 820);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightEnabled]);

  /* Spotlight RAF */
  useEffect(() => {
    if (introPhase !== 'spotlight' || !isDesktop || !spotlightEnabled) return;

    const c = cinema.current;
    c.phase = 'fadein';
    c.elapsed = 0;
    c.cellIdx = 0;
    c.curtain = 1;
    c.manual = false;

    const first = centresRef.current[0];
    if (first) {
      posRef.current = { ...first };
      targetRef.current = { ...first };
    }

    let lastTime = -1;
    let raf: number;

    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const smoothIn = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

    const FADE_IN = 1400;
    const HOLD = 2200;
    const FADE_OUT = 1000;

    const tick = (now: number) => {
      const dt = lastTime >= 0 ? Math.min(now - lastTime, 64) : 0;
      lastTime = now;

      const cm = cinema.current;
      const cells = centresRef.current;
      const el = containerRef.current;

      if (!cm.manual && cells.length > 0) {
        cm.elapsed += dt;
        if (cm.phase === 'fadein') {
          const t = Math.min(cm.elapsed / FADE_IN, 1);
          cm.curtain = 1 - smoothstep(t);
          if (t >= 1) {
            cm.phase = 'hold';
            cm.elapsed = 0;
          }
        } else if (cm.phase === 'hold') {
          cm.curtain = 0;
          if (cm.elapsed >= HOLD) {
            cm.phase = 'fadeout';
            cm.elapsed = 0;
          }
        } else if (cm.phase === 'fadeout') {
          const t = Math.min(cm.elapsed / FADE_OUT, 1);
          cm.curtain = smoothIn(t);
          if (t >= 1) {
            cm.cellIdx = (cm.cellIdx + 1) % cells.length;
            const next = cells[cm.cellIdx];
            if (next) {
              posRef.current = { ...next };
              targetRef.current = { ...next };
            }
            cm.phase = 'fadein';
            cm.elapsed = 0;
          }
        }
      }

      if (curtainRef.current) {
        curtainRef.current.style.opacity = cm.curtain.toFixed(4);
      }

      const p = posRef.current;
      const t = targetRef.current;
      const spd = cm.manual ? 0.12 : 0.055;
      p.x += (t.x - p.x) * spd;
      p.y += (t.y - p.y) * spd;

      const lp = lastPaintRef.current;
      if (Math.abs(p.x - lp.x) < 0.04 && Math.abs(p.y - lp.y) < 0.04) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lp.x = p.x;
      lp.y = p.y;

      if (!el) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const cw = el.clientWidth / cols;
      const ch = el.clientHeight / rows;
      const spotPx = Math.max(
        80,
        Math.round((Math.sqrt(cw * cw + ch * ch) / 2) * 1.08),
      );
      const sx = `${p.x.toFixed(2)}%`;
      const sy = `${p.y.toFixed(2)}%`;

      const ci =
        Math.min(Math.floor((p.x / 100) * cols), cols - 1) +
        Math.min(Math.floor((p.y / 100) * rows), rows - 1) * cols;
      const accent = accentColorsRef.current[Math.max(0, ci)] ?? '#ffbe46';

      if (veilRef.current) {
        veilRef.current.style.background =
          `radial-gradient(circle ${spotPx}px at ${sx} ${sy},` +
          `transparent 0%,transparent 35%,` +
          `rgba(13,11,9,0.58) 55%,rgba(13,11,9,0.93) 70%,rgba(13,11,9,0.99) 100%)`;
      }
      if (warmRef.current) {
        warmRef.current.style.background =
          `radial-gradient(circle ${Math.round(spotPx * 0.55)}px at ${sx} ${sy},` +
          `${accent}1c 0%,transparent 70%)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [introPhase, cols, rows, isDesktop, spotlightEnabled]);

  /* Mouse handlers — only wired on desktop */
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDesktop || !spotlightEnabled) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      targetRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
      const cm = cinema.current;
      if (!cm.manual) {
        cm.manual = true;
        cm.curtain = 0;
      }
      if (manualTimer.current) clearTimeout(manualTimer.current);
      manualTimer.current = setTimeout(() => {
        const cells = centresRef.current;
        const p = posRef.current;
        let best = 0,
          bestD = Infinity;
        cells.forEach((c, i) => {
          const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        cm.cellIdx = best;
        cm.phase = 'fadein';
        cm.elapsed = 0;
        cm.manual = false;
      }, 3000);
    },
    [isDesktop, spotlightEnabled],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop || !spotlightEnabled) return;
    if (manualTimer.current) clearTimeout(manualTimer.current);
    const cm = cinema.current;
    cm.manual = false;
    cm.phase = 'fadeout';
    cm.elapsed = 0;
  }, [isDesktop, spotlightEnabled]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
        /* Hide cursor only when spotlight is on — otherwise show normal browser cursor */
        cursor: isDesktop && spotlightEnabled ? 'none' : 'pointer',
      }}
    >
      {/* ── Grid — rows always 1fr to fill container on all devices ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          alignContent: 'stretch',
          gap: GAP,
          padding: PAD,
        }}
      >
        {visibleItems.map((item, i) => (
          <GalleryCard
            key={item.id}
            item={item}
            index={i}
            visible={visible}
            cols={cols}
            rows={rows}
            priority={i < cols}
            onOpen={onOpen}
            cardRef={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* ── Spotlight layers — desktop only ── */}
      {isDesktop && (
        <>
          {/* Dark veil */}
          <div
            ref={veilRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 10,
              willChange: 'background',
            }}
          />
          {/* Accent warm glow */}
          <div
            ref={warmRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 11,
              willChange: 'background',
            }}
          />
          {/* Cinematic curtain */}
          <div
            ref={curtainRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(13,11,9,0.99)',
              pointerEvents: 'none',
              zIndex: 12,
              opacity: 0,
              willChange: 'opacity',
            }}
          />
          {/* Intro mask */}
          <motion.div
            animate={{ opacity: introPhase === 'covering' ? 1 : 0 }}
            transition={{
              duration: introPhase === 'covering' ? 0.65 : 1.1,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(13,11,9,0.99)',
              pointerEvents: 'none',
              zIndex: 13,
            }}
          />
          {/* Custom cursor — only when spotlight is on */}
          {spotlightEnabled && <SpotlightCursor containerRef={containerRef} />}
        </>
      )}

      {/* Edge vignette — all devices */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 20,
          background:
            'radial-gradient(ellipse 95% 95% at 50% 50%, transparent 55%, rgba(8,6,4,0.88) 100%)',
        }}
      />

      {/* Film grain — all devices */}
      <GrainOverlay zIndex={25} />

      {/* ── Bottom-right controls: spotlight toggle (desktop) + "Tümünü Gör" pill ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={
          introPhase !== 'idle' &&
          introPhase !== 'covering' &&
          (introPhase === 'spotlight' || !isDesktop || !spotlightEnabled)
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 8 }
        }
        transition={{
          delay: isDesktop && spotlightEnabled ? 1.2 : 0.3,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {/* Spotlight toggle — desktop only, sits above the pill */}
        {isDesktop && (
          <NavBtn
            onClick={() => setSpotlightEnabled((v) => !v)}
            active={spotlightEnabled}
          >
            <SpotlightIcon size={15} />
          </NavBtn>
        )}

        {/* "Tümünü Gör" pill */}
        <button
          type='button'
          onClick={() => {
            const r = cardRefs.current[0]?.getBoundingClientRect();
            onOpen(0, r);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(13,11,9,0.75)',
            ...(IS_TOUCH ? {} : { backdropFilter: 'blur(12px)' }),
            cursor: 'pointer',
            transition: 'border-color 0.18s, background 0.18s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(255,25,135,0.5)';
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(30,10,18,0.88)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(255,255,255,0.14)';
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(13,11,9,0.75)';
          }}
        >
          <span
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            Tümünü Gör
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              background: MAIN_TO_GOLD,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ({String(gallery.length).padStart(2, '0')})
          </span>
          <svg width='11' height='11' viewBox='0 0 12 12' fill='none'>
            <path
              d='M2 6h8M7 3l3 3-3 3'
              stroke='rgba(255,255,255,0.45)'
              strokeWidth='1.3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </motion.div>

      {/* Idle hint — desktop only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={
          isDesktop && introPhase === 'spotlight' && spotlightEnabled
            ? { opacity: 1 }
            : { opacity: 0 }
        }
        transition={{ delay: 1.8, duration: 0.7 }}
        style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
        className='hidden md:block'
      >
        <span
          style={{
            fontSize: '0.48rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Spot ışığı hareket ettirmek için fareyi sürükle
        </span>
      </motion.div>
    </div>
  );
}

/* ─── JSON-LD structured data ────────────────────────────────── */
function GallerySchema() {
  const images = gallery.slice(0, 12).map((g, i) => ({
    '@type': 'ImageObject',
    contentUrl:
      typeof g.src === 'string' ? g.src : (g.src as { src: string }).src,
    name: `Hisar Nightclub — Sahne fotoğrafı ${g.id}`,
    description: 'Hisar International Night Club sahne ve atmosfer görüntüsü',
    position: i + 1,
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Hisar Nightclub Fotoğraf Galerisi',
    description:
      'Hisar International Night Club canlı performans, sahne ve atmosfer fotoğrafları',
    image: images,
  };
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ─── Main Gallery component ─────────────────────────────────── */
export default function Gallery({ id }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [modalOriginRect, setModalOriginRect] = useState<DOMRect | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const gallerySrcs = useMemo(
    () =>
      gallery.map((g) =>
        typeof g.src === 'string' ? g.src : (g.src as { src: string }).src,
      ),
    [],
  );
  const accentColors = useImageAccents(gallerySrcs);

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const openModal = useCallback(
    (i: number, rect?: DOMRect) => {
      if (!expanded) return;
      setModalOriginRect(rect ?? null);
      setModalIndex(i);
    },
    [expanded],
  );
  const closeModal = useCallback(() => setModalIndex(null), []);
  const prevImage = useCallback(
    () =>
      setModalIndex((i) =>
        i === null ? null : (i - 1 + gallery.length) % gallery.length,
      ),
    [],
  );
  const nextImage = useCallback(
    () => setModalIndex((i) => (i === null ? null : (i + 1) % gallery.length)),
    [],
  );

  useEffect(() => {
    const lenis = getSmoother();
    if (modalIndex !== null) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalIndex]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (modalIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [modalIndex, nextImage, prevImage, closeModal]);

  useEffect(() => {
    let ctx: gsap.Context;
    const init = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panelRef.current,
            start: 'top top',
            end: '+=1500',
            scrub: 1.0,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setCardsVisible(self.progress >= 0.57);
              setExpanded(self.progress >= 0.57);
            },
          },
        });
        tl.to(
          boxRef.current,
          {
            left: '0%',
            right: '0%',
            top: '0%',
            bottom: '0%',
            borderRadius: 0,
            ease: 'none',
            duration: 0.45,
          },
          0,
        )
          .to(
            headerRef.current,
            { opacity: 0, y: -48, ease: 'none', duration: 0.2 },
            0,
          )
          .to(hintRef.current, { opacity: 0, ease: 'none', duration: 0.12 }, 0)
          .to(
            glowRef.current,
            { opacity: 0.22, ease: 'none', duration: 0.45 },
            0,
          )
          .to({}, { duration: 0.08 })
          .to(boxRef.current, {
            left: '12px',
            right: '12px',
            bottom: '12px',
            borderRadius: 20,
            ease: 'power4.out',
            duration: 0.12,
          });
      }, panelRef);
      ScrollTrigger.refresh();
    };
    let rafId: number;
    const wait = () => {
      if (getSmoother()) init();
      else rafId = requestAnimationFrame(wait);
    };
    wait();
    return () => {
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  return (
    <>
      <GlobalStyles />
      <GallerySchema />

      <section
        ref={panelRef}
        id={id}
        aria-label='Hisar Nightclub Fotoğraf Galerisi'
        className='relative bg-secondaryColor gallery-section'
        style={{ height: '100dvh' }}
      >
        {/* Header */}
        <div
          ref={headerRef}
          className='absolute top-0 left-0 right-0 z-30 flex flex-col items-center text-center pt-14 xl:pt-18 pointer-events-none select-none'
        >
          <TextReveal>
            <Headline>
              Gecenin güzel
              <br />
              <MainToGoldFont>anları burada yaşanır</MainToGoldFont>
            </Headline>
          </TextReveal>
        </div>

        {/* Expanding box */}
        <div
          ref={boxRef}
          className='absolute bg-[#0d0b09] overflow-hidden'
          style={{
            left: '20%',
            right: '20%',
            top: '22%',
            bottom: '12%',
            borderRadius: 24,
          }}
        >
          <div
            className='absolute inset-0 pointer-events-none'
            style={{
              background:
                'radial-gradient(ellipse 90% 70% at 50% 55%, rgba(60,35,8,0.45) 0%, transparent 70%)',
            }}
          />
          <div
            ref={glowRef}
            className='pointer-events-none absolute inset-x-0 bottom-0'
            style={{
              height: '60%',
              opacity: 0.03,
              background:
                'radial-gradient(ellipse 85% 60% at 50% 100%, #ff1987 0%, #ff6ec7 35%, transparent 62%)',
            }}
          />
          <div
            className='absolute top-0 left-0 right-0 h-px pointer-events-none'
            style={{ background: MAIN_TO_GOLD, opacity: 0.1 }}
          />

          <div
            className='absolute inset-0 flex flex-col'
            style={{
              opacity: expanded ? 1 : 0,
              transition: expanded ? 'opacity 0.2s ease' : 'none',
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            <SpotlightGrid
              visible={cardsVisible}
              onOpen={openModal}
              accentColors={accentColors}
            />
          </div>

          {/* Scroll hint */}
          <div
            ref={hintRef}
            className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-none z-20 select-none'
          >
            <span className='text-[0.55rem] tracking-[0.22em] uppercase text-white/28 font-medium whitespace-nowrap'>
              Galeriye girmek için kaydır
            </span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 1.7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg width='13' height='13' viewBox='0 0 16 16' fill='none'>
                <path
                  d='M3 6L8 11L13 6'
                  stroke='rgba(255,255,255,0.24)'
                  strokeWidth='1.4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {portalReady && modalIndex !== null && (
          <GalleryModal
            index={modalIndex}
            total={gallery.length}
            originRect={modalOriginRect}
            onClose={closeModal}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
