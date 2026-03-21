'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { StaticImageData } from 'next/image';

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
export interface ModalItem {
  src: string | StaticImageData;
  alt?: string;
}

export interface ModalProps {
  items: ModalItem[];
  index: number;
  originRect?: DOMRect | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Optional gradient for the counter decorators. Defaults to pink → gold. */
  accentGradient?: string;
  /** Label shown at the bottom on desktop. Defaults to '← → ok tuşları' */
  hintDesktop?: string;
  /** Label shown at the bottom on mobile. Defaults to 'kapatmak için dokun' */
  hintMobile?: string;
}

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const DEFAULT_GRADIENT =
  'linear-gradient(135deg,#ff1987 0%,#ff6ec7 50%,#b8860b 100%)';

/**
 * True only on real pointer devices (laptop / desktop).
 * Mobile and tablet navigate via swipe — no nav buttons shown for them.
 */
const IS_DESKTOP =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ─────────────────────────────────────────────────────────────────
   ICON BUTTON
   Used for close (all devices) and prev/next (desktop only).
───────────────────────────────────────────────────────────────── */
export interface IconButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  active?: boolean;
  size?: number;
  'aria-label'?: string;
}

export function IconButton({
  onClick,
  children,
  active = false,
  size = 48,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [hov, setHov] = useState(false);

  const border = active
    ? 'rgba(255,25,135,0.55)'
    : pressed
      ? 'rgba(255,215,0,0.55)'
      : hov
        ? 'rgba(255,255,255,0.28)'
        : 'rgba(255,255,255,0.14)';

  const bg = active
    ? 'rgba(255,25,135,0.08)'
    : pressed
      ? 'rgba(255,215,0,0.10)'
      : hov
        ? 'rgba(255,255,255,0.07)'
        : 'rgba(255,255,255,0.04)';

  const color = active
    ? 'rgba(255,25,135,0.95)'
    : pressed
      ? 'rgba(255,215,0,0.95)'
      : hov
        ? 'rgba(255,255,255,0.85)'
        : 'rgba(255,255,255,0.5)';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false);
        setHov(false);
      }}
      onMouseEnter={() => setHov(true)}
      className='cursor-pointer flex items-center justify-center rounded-full'
      style={{
        width: size,
        height: size,
        border: `1px solid ${border}`,
        background: bg,
        color,
        transform: pressed ? 'scale(0.90)' : 'scale(1)',
        transition:
          'transform 0.11s ease, border-color 0.18s, background 0.18s, color 0.18s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────────────── */
export function Modal({
  items,
  index,
  onClose,
  onPrev,
  onNext,
  accentGradient = DEFAULT_GRADIENT,
  hintDesktop = '← → ok tuşları',
  hintMobile = 'kapatmak için dokun',
}: ModalProps) {
  const isMobile = !IS_DESKTOP;

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

  /* ── Keyboard navigation — desktop only ────────────────────────── */
  useEffect(() => {
    if (!IS_DESKTOP) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onNext, onPrev, onClose]);

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
    el.style.transform = `translate(${currentTrans.current.x}px,${currentTrans.current.y}px) scale(${currentScale.current})`;
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

  /* ── Touch gestures ─────────────────────────────────────────────── */
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

  /* Reset zoom on slide change */
  useEffect(() => {
    resetZoom(false);
  }, [index, resetZoom]);

  /* Pointer swipe (works for both desktop drag and mobile pointer events) */
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

  const item = items[index];
  const imgSrc =
    typeof item.src === 'string' ? item.src : (item.src as StaticImageData).src;
  const imgAlt = item.alt ?? `Fotoğraf ${index + 1} / ${items.length}`;

  const imgInitial = isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97 };
  const imgAnimate = isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const imgExit = isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97 };

  return createPortal(
    <motion.div
      role='dialog'
      aria-modal='true'
      aria-label={imgAlt}
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
      {/* ── Counter ── */}
      <div
        className='absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3'
        style={{ zIndex: 10 }}
      >
        <div
          className='h-px w-8 opacity-35'
          style={{ background: accentGradient }}
        />
        <span className='text-[0.65rem] tracking-[0.28em] uppercase text-white/38 font-medium tabular-nums'>
          {String(index + 1).padStart(2, '0')} —{' '}
          {String(items.length).padStart(2, '0')}
        </span>
        <div
          className='h-px w-8 opacity-35'
          style={{ background: accentGradient }}
        />
      </div>

      {/* ── Close — always visible on all devices ── */}
      <div
        className='absolute top-4 right-4 sm:top-5 sm:right-5'
        style={{ zIndex: 10 }}
      >
        <IconButton
          aria-label='Kapat'
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
        </IconButton>
      </div>

      {/* ── Prev — desktop/laptop only ── */}
      {IS_DESKTOP && (
        <div
          className='absolute left-3 sm:left-5 top-1/2 -translate-y-1/2'
          style={{ zIndex: 10 }}
        >
          <IconButton
            aria-label='Önceki'
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
          </IconButton>
        </div>
      )}

      {/* ── Image ── */}
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
              src={imgSrc}
              alt={imgAlt}
              width={1400}
              height={900}
              className='max-w-[84vw] max-h-[78vh] w-auto h-auto object-contain rounded-lg'
              priority
              unoptimized
              crossOrigin='anonymous'
            />
            <div
              className='absolute bottom-0 left-0 right-0 h-px rounded-b-lg'
              style={{ background: accentGradient, opacity: 0.18 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Next — desktop/laptop only ── */}
      {IS_DESKTOP && (
        <div
          className='absolute right-3 sm:right-5 top-1/2 -translate-y-1/2'
          style={{ zIndex: 10 }}
        >
          <IconButton
            aria-label='Sonraki'
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
          </IconButton>
        </div>
      )}

      {/* ── Hint ── */}
      <div
        className='absolute bottom-5 left-1/2 -translate-x-1/2'
        style={{ zIndex: 10 }}
      >
        <span className='text-[0.48rem] tracking-[0.22em] uppercase text-white/18 font-medium'>
          {isMobile ? hintMobile : hintDesktop}
        </span>
      </div>
    </motion.div>,
    document.body,
  );
}

export default Modal;
