'use client';

import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
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
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

type Props = { id: string };

const MAIN_TO_GOLD =
  'linear-gradient(135deg,#ff1987 0%,#ff6ec7 50%,#b8860b 100%)';
const GAP = 3;
const PAD = 3;

const IS_TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

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

/* ─── Global styles ──────────────────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      /*
       * The section height cascade.
       *
       * 100vh  → broadest fallback
       * 100dvh → actual visible area (changes with URL bar).
       *
       * We intentionally use dvh here, NOT svh. Why:
       *   svh = small viewport (URL bar visible) → shorter than actual screen
       *         → leaves a dead zone at the bottom when URL bar hides.
       *   dvh = real visible area  → fills the screen correctly.
       *
       * GSAP stability is handled by:
       *   1. ignoreMobileResize: true in Home.tsx → GSAP never remeasures
       *      during scroll (URL bar animate events ignored).
       *   2. One-time useLayoutEffect in Gallery → sets exact px height
       *      from window.innerHeight BEFORE GSAP's first measurement,
       *      so the pin spacer is calculated from the correct full-screen
       *      value (window.innerHeight = largest possible = URL bar excluded).
       *
       * The dvh CSS is kept as a visual fallback only. The JS px value
       * set by useLayoutEffect wins and never changes.
       */
      .gallery-section {
        height: 100vh;
        height: 100dvh;
      }

      @keyframes g-grain {
        0%,100%{transform:translate(0,0)}   10%{transform:translate(-2%,-3%)}
        20%{transform:translate(3%,1%)}     30%{transform:translate(-1%,4%)}
        40%{transform:translate(2%,-2%)}    50%{transform:translate(-3%,2%)}
        60%{transform:translate(1%,-1%)}    70%{transform:translate(-2%,3%)}
        80%{transform:translate(3%,-2%)}    90%{transform:translate(-1%,1%)}
      }
      .g-grain { animation: g-grain 0.45s steps(1) infinite; }

      .g-card { -webkit-tap-highlight-color: transparent; }
      .g-card:active { opacity: 0.78 !important; }

      @media (hover: hover) {
        .g-card:hover .g-card-img { transform: scale(1.05); }
        .g-card:hover .g-card-shine { opacity: 1 !important; }
      }
      .g-card-img {
        transition: transform 0.65s cubic-bezier(0.22,1,0.36,1);
        will-change: transform;
      }

      @keyframes g-line-trace {
        from { transform: scaleX(0); opacity: 0.55; }
        60%  { opacity: 0.55; }
        to   { transform: scaleX(1); opacity: 0; }
      }
      .g-finish-line {
        transform-origin: left center;
        animation: g-line-trace 0.9s cubic-bezier(0.16,1,0.3,1) forwards;
      }
    `}</style>
  );
}

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
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

/* ─── Image accent extraction ────────────────────────────────── */
function useImageAccents(srcs: string[]): string[] {
  const [accents, setAccents] = useState<string[]>(() =>
    srcs.map((_, i) => ACCENT_PALETTE[i % ACCENT_PALETTE.length]),
  );
  useEffect(() => {
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
          const n = d.length / 4,
            avg = (r + g + b) / (3 * n),
            boost = 1.6;
          const c = (v: number) =>
            Math.min(255, Math.max(0, Math.round((v / n - avg) * boost + avg)));
          results[i] = `rgb(${c(r)},${c(g)},${c(b)})`;
        } catch {
          /* CORS */
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

/* ─── NavBtn ──────────────────────────────────────────────────── */
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
        border: `1px solid ${active ? 'rgba(255,25,135,0.55)' : pressed ? 'rgba(255,215,0,0.55)' : hov ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)'}`,
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

/* ─── Modal ───────────────────────────────────────────────────── */
function GalleryModal({
  index,
  total,
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
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none), (max-width: 1023px)').matches;

  const swipeX = useRef(0);
  const swipeY = useRef(0);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const currentScale = useRef(1);
  const currentTrans = useRef({ x: 0, y: 0 });
  const pinchData = useRef<{ startDist: number; startScale: number } | null>(
    null,
  );
  const panData = useRef<{
    sx: number;
    sy: number;
    tx: number;
    ty: number;
  } | null>(null);
  const lastTap = useRef(0);
  const isZoomed = useRef(false);
  const isPinching = useRef(false);

  const getPinchDist = useCallback((t: TouchList) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const clampTrans = useCallback((x: number, y: number, scale: number) => {
    const el = imageWrapRef.current;
    if (!el) return { x, y };
    const maxX = (el.offsetWidth * (scale - 1)) / 2;
    const maxY = (el.offsetHeight * (scale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }, []);

  const applyTransform = useCallback((animated = false) => {
    const el = imageWrapRef.current;
    if (!el) return;
    if (animated) el.style.transition = 'transform 0.22s ease';
    el.style.transform = `translate(${currentTrans.current.x}px, ${currentTrans.current.y}px) scale(${currentScale.current})`;
    if (animated)
      setTimeout(() => {
        if (imageWrapRef.current) imageWrapRef.current.style.transition = '';
      }, 220);
  }, []);

  const resetZoom = useCallback(
    (animated = true) => {
      currentScale.current = 1;
      currentTrans.current = { x: 0, y: 0 };
      isZoomed.current = false;
      isPinching.current = false;
      applyTransform(animated);
    },
    [applyTransform],
  );

  useEffect(() => {
    const el = imageWrapRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isPinching.current = true;
        panData.current = null;
        pinchData.current = {
          startDist: getPinchDist(e.touches),
          startScale: currentScale.current,
        };
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap.current < 280) {
          if (isZoomed.current) {
            resetZoom(true);
          } else {
            currentScale.current = 2.5;
            currentTrans.current = { x: 0, y: 0 };
            isZoomed.current = true;
            applyTransform(true);
          }
          lastTap.current = 0;
          return;
        }
        lastTap.current = now;
        if (isZoomed.current) {
          panData.current = {
            sx: e.touches[0].clientX,
            sy: e.touches[0].clientY,
            tx: currentTrans.current.x,
            ty: currentTrans.current.y,
          };
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchData.current) {
        e.preventDefault();
        const newScale = Math.min(
          4,
          Math.max(
            1,
            pinchData.current.startScale *
              (getPinchDist(e.touches) / pinchData.current.startDist),
          ),
        );
        currentScale.current = newScale;
        isZoomed.current = newScale > 1;
        if (newScale === 1) currentTrans.current = { x: 0, y: 0 };
        applyTransform();
        return;
      }
      if (e.touches.length === 1 && panData.current && isZoomed.current) {
        e.preventDefault();
        const rawX =
          panData.current.tx + (e.touches[0].clientX - panData.current.sx);
        const rawY =
          panData.current.ty + (e.touches[0].clientY - panData.current.sy);
        currentTrans.current = clampTrans(rawX, rawY, currentScale.current);
        applyTransform();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchData.current = null;
        setTimeout(() => {
          isPinching.current = false;
        }, 120);
      }
      if (e.touches.length === 0) panData.current = null;
      if (currentScale.current < 1.08) resetZoom(true);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resetZoom(false);
  }, [index, resetZoom]);

  const onPointerDown = (e: React.PointerEvent) => {
    swipeX.current = e.clientX;
    swipeY.current = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (isZoomed.current || isPinching.current) return;
    const dx = e.clientX - swipeX.current;
    const dy = Math.abs(e.clientY - swipeY.current);
    if (Math.abs(dx) > 72 && dy < 80) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };

  const imgInitial = isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97 };
  const imgAnimate = isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const imgExit = isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97 };

  return createPortal(
    <motion.div
      role='dialog'
      aria-modal='true'
      aria-label={`Hisar Nightclub — Fotoğraf ${index + 1} / ${total}`}
      className='fixed inset-0 flex items-center justify-center'
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(4,4,4,0.97)',
        backdropFilter: isMobile ? 'blur(8px)' : 'blur(4px)',
        WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(4px)',
        willChange: 'opacity',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
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
      <div
        ref={imageWrapRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 4,
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={index}
            initial={imgInitial}
            animate={imgAnimate}
            exit={imgExit}
            transition={{ duration: isMobile ? 0.2 : 0.22, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity', display: 'block' }}
          >
            <Image
              src={gallery[index].src}
              alt={`Hisar Nightclub — Sahne fotoğrafı ${index + 1} / ${total}`}
              width={1400}
              height={900}
              className='max-w-[84vw] max-h-[78vh] w-auto h-auto object-contain rounded-lg'
              priority
              unoptimized
              crossOrigin='anonymous'
            />
            <div
              className='absolute bottom-0 left-0 right-0 h-px rounded-b-lg'
              style={{ background: MAIN_TO_GOLD, opacity: 0.18 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
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
      <div
        className='absolute bottom-5 left-1/2 -translate-x-1/2'
        style={{ zIndex: 10 }}
      >
        <span className='text-[0.48rem] tracking-[0.22em] uppercase text-white/18 font-medium'>
          {isMobile ? 'kapatmak için dokun' : '← → ok tuşları'}
        </span>
      </div>
    </motion.div>,
    document.body,
  );
}

/* ─── Gallery Card ────────────────────────────────────────────── */
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
  visible: boolean;
  cols: number;
  rows: number;
  priority: boolean;
  onOpen: (i: number, rect?: DOMRect) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={cardRef}
      type='button'
      className='g-card'
      onClick={(e) => onOpen(index, e.currentTarget.getBoundingClientRect())}
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
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      <div className='g-card-img' style={{ position: 'absolute', inset: 0 }}>
        <Image
          src={item.src}
          alt={`Hisar Nightclub — Sahne fotoğrafı ${item.id}`}
          fill
          unoptimized
          className='object-cover'
          sizes={`${Math.round(100 / cols)}vw`}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          crossOrigin='anonymous'
        />
      </div>
      <div
        className='g-card-shine'
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0,
          background:
            'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 45%)',
          transition: 'opacity 0.4s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 48%)',
        }}
      />
    </button>
  );
}

/* ─── Spotlight cursor ────────────────────────────────────────── */
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
    if (!el || window.matchMedia('(hover: none)').matches) return;
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

function SpotlightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none'>
      <path
        d='M6 3L3 13H13L10 3H6Z'
        stroke='currentColor'
        strokeWidth='1.3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect
        x='5.5'
        y='1.5'
        width='5'
        height='2'
        rx='0.8'
        stroke='currentColor'
        strokeWidth='1.3'
      />
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

/* ─── SpotlightGrid ───────────────────────────────────────────── */
function SpotlightGrid({
  visible,
  onOpen,
  accentColors,
  paused = false,
}: {
  visible: boolean;
  onOpen: (i: number, rect?: DOMRect) => void;
  accentColors: string[];
  paused?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  type IntroPhase = 'idle' | 'cards' | 'covering' | 'spotlight';
  const [introPhase, setIntroPhase] = useState<IntroPhase>('idle');
  const [spotlightEnabled, setSpotlightEnabled] = useState(true);

  const spotlightEnabledRef = useRef(true);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
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
  const isDesktop = cols === 4;

  useEffect(() => {
    const t0 = setTimeout(() => setIntroPhase(visible ? 'cards' : 'idle'), 0);
    if (!visible) return () => clearTimeout(t0);
    if (!isDesktop) return () => clearTimeout(t0);
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
  const diagBand = useMemo(
    () => visibleItems.map((_, i) => (i % cols) + Math.floor(i / cols)),
    [cols, rows, visibleItems.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const masterTLRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLButtonElement[];
    masterTLRef.current?.kill();
    masterTLRef.current = null;

    if (!visible || !cards.length) {
      gsap.set(cards, { opacity: 0, scale: 1, y: 0, clearProps: 'willChange' });
      if (lineRef.current) {
        lineRef.current.style.animation = 'none';
        lineRef.current.style.opacity = '0';
      }
      return;
    }

    const CARD_DUR = IS_TOUCH ? 0.78 : 1.1;
    const BAND_MS = IS_TOUCH ? 0.036 : 0.052;
    const SCALE_FROM = IS_TOUCH ? 0.97 : 0.965;
    const Y_FROM = IS_TOUCH ? 8 : 10;
    const INITIAL_WAIT = IS_TOUCH ? 0.03 : 0.05;
    const maxBand = Math.max(...diagBand);
    const LAST_CARD_END = INITIAL_WAIT + maxBand * BAND_MS + CARD_DUR;
    const LINE_DELAY = LAST_CARD_END + 0.12;

    gsap.set(cards, { force3D: true });
    const tl = gsap.timeline();
    masterTLRef.current = tl;

    cards.forEach((card, i) => {
      const delay = INITIAL_WAIT + diagBand[i] * BAND_MS;
      gsap.set(card, {
        opacity: 0,
        scale: SCALE_FROM,
        y: Y_FROM,
        transformOrigin: '50% 50%',
      });
      tl.to(
        card,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: CARD_DUR,
          delay,
          ease: 'power3.out',
          force3D: true,
          onComplete() {
            gsap.set(card, { clearProps: 'transform,scale,y,willChange' });
          },
        },
        0,
      );
    });

    if (!IS_TOUCH && lineRef.current) {
      const line = lineRef.current;
      const trigger = setTimeout(() => {
        line.style.opacity = '1';
        line.style.animation = 'none';
        void line.offsetWidth;
        line.style.animation =
          'g-line-trace 0.9s cubic-bezier(0.16,1,0.3,1) forwards';
      }, LINE_DELAY * 1000);
      return () => {
        masterTLRef.current?.kill();
        clearTimeout(trigger);
      };
    }

    return () => {
      masterTLRef.current?.kill();
    };
  }, [visible, cols, rows, diagBand]);

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

  useEffect(() => {
    if (!spotlightEnabled) {
      if (veilRef.current) veilRef.current.style.background = 'none';
      if (warmRef.current) warmRef.current.style.background = 'none';
      if (curtainRef.current) curtainRef.current.style.opacity = '0';
      return;
    }
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

    let lastTime = -1,
      raf: number;
    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const smoothIn = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const FADE_IN = 1400,
      HOLD = 2200,
      FADE_OUT = 1000;

    const tick = (now: number) => {
      if (pausedRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = lastTime >= 0 ? Math.min(now - lastTime, 64) : 0;
      lastTime = now;
      const cm = cinema.current,
        cells = centresRef.current,
        el = containerRef.current;

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
        } else {
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

      if (curtainRef.current)
        curtainRef.current.style.opacity = cm.curtain.toFixed(4);
      const p = posRef.current,
        t = targetRef.current,
        spd = cm.manual ? 0.12 : 0.055;
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

      const cw = el.clientWidth / cols,
        ch = el.clientHeight / rows;
      const spotPx = Math.max(
        80,
        Math.round((Math.sqrt(cw * cw + ch * ch) / 2) * 1.08),
      );
      const sx = `${p.x.toFixed(2)}%`,
        sy = `${p.y.toFixed(2)}%`;
      const ci =
        Math.min(Math.floor((p.x / 100) * cols), cols - 1) +
        Math.min(Math.floor((p.y / 100) * rows), rows - 1) * cols;
      const accent = accentColorsRef.current[Math.max(0, ci)] ?? '#ffbe46';

      if (veilRef.current) {
        veilRef.current.style.background = `radial-gradient(circle ${spotPx}px at ${sx} ${sy},transparent 0%,transparent 35%,rgba(13,11,9,0.58) 55%,rgba(13,11,9,0.93) 70%,rgba(13,11,9,0.99) 100%)`;
      }
      if (warmRef.current) {
        warmRef.current.style.background = `radial-gradient(circle ${Math.round(spotPx * 0.55)}px at ${sx} ${sy},${accent}1c 0%,transparent 70%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [introPhase, cols, rows, isDesktop, spotlightEnabled]);

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
        const cells = centresRef.current,
          p = posRef.current;
        let best = 0,
          bestD = Infinity;
        cells.forEach((c, i) => {
          const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        cinema.current.cellIdx = best;
        cinema.current.phase = 'fadein';
        cinema.current.elapsed = 0;
        cinema.current.manual = false;
      }, 3000);
    },
    [isDesktop, spotlightEnabled],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop || !spotlightEnabled) return;
    if (manualTimer.current) clearTimeout(manualTimer.current);
    cinema.current.manual = false;
    cinema.current.phase = 'fadeout';
    cinema.current.elapsed = 0;
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
        cursor: isDesktop && spotlightEnabled ? 'none' : 'pointer',
      }}
    >
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

      <div
        ref={lineRef}
        style={{
          position: 'absolute',
          bottom: PAD,
          left: PAD,
          right: PAD,
          height: 1,
          pointerEvents: 'none',
          zIndex: 30,
          opacity: 0,
          background: MAIN_TO_GOLD,
          transformOrigin: 'left center',
        }}
      />

      {isDesktop && (
        <>
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
          {spotlightEnabled && <SpotlightCursor containerRef={containerRef} />}
        </>
      )}

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
      <GrainOverlay zIndex={25} />

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
        {isDesktop && (
          <NavBtn
            onClick={() => setSpotlightEnabled((v) => !v)}
            active={spotlightEnabled}
          >
            <SpotlightIcon size={15} />
          </NavBtn>
        )}
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

/* ─── JSON-LD ─────────────────────────────────────────────────── */
function GallerySchema() {
  const images = gallery.slice(0, 12).map((g, i) => ({
    '@type': 'ImageObject',
    contentUrl:
      typeof g.src === 'string' ? g.src : (g.src as { src: string }).src,
    name: `Hisar Nightclub — Sahne fotoğrafı ${g.id}`,
    description: 'Hisar International Night Club sahne ve atmosfer görüntüsü',
    position: i + 1,
  }));
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: 'Hisar Nightclub Fotoğraf Galerisi',
          description:
            'Hisar International Night Club canlı performans, sahne ve atmosfer fotoğrafları',
          image: images,
        }),
      }}
    />
  );
}

/* ─── Main Gallery component ──────────────────────────────────── */
export default function Gallery({ id }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [modalOriginRect, setModalOriginRect] = useState<DOMRect | null>(null);
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

  /*
   * ── FIX FOR BUG 1: One-time height sync — runs BEFORE useGSAP ──────
   *
   * useLayoutEffect runs before useGSAP's internal useLayoutEffect, so
   * GSAP measures the section AFTER this height is applied. This
   * guarantees the pin spacer is calculated from the correct value.
   *
   * WHY window.innerHeight (not visualViewport, not dvh):
   *   • window.innerHeight on iOS Safari = full screen height, URL bar
   *     excluded. It's the LARGEST possible viewport value.
   *   • This means the section fills the screen when URL bar is gone
   *     (the common state during mid-page scrolling).
   *   • When URL bar is visible, the section extends ~60-80px below the
   *     visible area — but since it's position:fixed during the pin,
   *     the browser simply clips it. No gap, no dead zone.
   *   • We never update this value again. ignoreMobileResize:true in
   *     Home.tsx ensures GSAP never remeasures mid-scroll. Stable.
   *
   * WHY NOT visualViewport.height:
   *   • If URL bar is visible at mount, vv.height is SMALLER (excludes
   *     URL bar area), leaving a dead zone when bar hides later.
   *   • window.innerHeight always gives the largest (bar-excluded) value,
   *     which is what we want.
   */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.height = `${window.innerHeight}px`;
  }, []); // Empty deps: run exactly once, never update

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
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top top',
          end: '+=1500',
          /*
           * FIX FOR BUG 2: scrub reduced from 1.0 → 0.3
           *
           * scrub: 1.0 = GSAP animation lags 1 full second behind scroll.
           * When the user changes scroll direction quickly, the animation
           * is still easing toward the OLD position for up to 1 second,
           * causing the perceived "opposite direction shift".
           *
           * scrub: 0.3 = 300ms lag. Tight enough to feel instant on mobile,
           * loose enough to stay smooth. Combined with touchMultiplier: 1
           * in Home.tsx (no velocity amplification), direction changes
           * now feel immediate with no overshoot.
           */
          scrub: 0.3,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setExpanded(self.progress >= 0.57);
          },
        },
      });

      tl.to(
        boxRef.current,
        {
          // Functional values: recomputed on every invalidateOnRefresh cycle.
          left: () => 0,
          right: () => 0,
          top: () => 0,
          bottom: () => 0,
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
        .to(glowRef.current, { opacity: 0.22, ease: 'none', duration: 0.45 }, 0)
        .to({}, { duration: 0.08 })
        .to(boxRef.current, {
          left: '12px',
          right: '12px',
          bottom: '12px',
          borderRadius: 20,
          ease: 'power4.out',
          duration: 0.12,
        });
    },
    { scope: panelRef, dependencies: [] },
  );

  return (
    <>
      <GlobalStyles />
      <GallerySchema />

      {/*
       * No inline style height here.
       * Height is set by the useLayoutEffect above (window.innerHeight px)
       * which runs before GSAP measures. The CSS class is a visual
       * fallback only for the brief server-render / pre-hydration frame.
       */}
      <section
        ref={panelRef}
        id={id}
        aria-label='Hisar Nightclub Fotoğraf Galerisi'
        className='relative bg-secondaryColor gallery-section'
      >
        <div
          ref={headerRef}
          className='absolute top-0 left-0 right-0 z-30 flex flex-col items-center text-center pt-14 xl:pt-18 pointer-events-none select-none'
        >
          <TextReveal>
            <Headline>
              Gecenin en iyi
              <br />
              <MainToGoldFont>anları seni bekliyor</MainToGoldFont>
            </Headline>
          </TextReveal>
        </div>

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
              visible={expanded}
              onOpen={openModal}
              accentColors={accentColors}
              paused={modalIndex !== null}
            />
          </div>

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
