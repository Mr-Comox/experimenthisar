'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { scrollTo } from '../lib/scrollTo';
import { getSmoother } from '../lib/smoother';
import { Logo } from '@/public/Icons';

/* ================================================================
   NAV DATA
   ================================================================ */

const MENU_LINKS = [
  { id: 'about', label: 'Hakkımızda' },
  { id: 'menu', label: 'Menü' },
  { id: 'activities', label: 'Etkinlikler' },
  { id: 'gallery', label: 'Galeri' },
  { id: 'testimonials', label: 'Yorumlar' },
  { id: 'location', label: 'Konum' },
  { id: 'reservation', label: 'Rezervasyon' },
];

/* ================================================================
   EASING
   ================================================================ */
const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ================================================================
   HOOKS
   ================================================================ */

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

function useHydrated() {
  return useSyncExternalStore(subscribeNoop, getTrue, getFalse);
}

function useScrolled(threshold = 32) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return scrolled;
}

const touchQuery = '(hover: none), (pointer: coarse)';
const subscribeTouchChange = (cb: () => void) => {
  const mql = window.matchMedia(touchQuery);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getTouchSnapshot = () => window.matchMedia(touchQuery).matches;
const getTouchServer = () => false;

function useIsTouch() {
  return useSyncExternalStore(
    subscribeTouchChange,
    getTouchSnapshot,
    getTouchServer,
  );
}

/* ================================================================
   FULLSCREEN MENU OVERLAY
   ================================================================ */
function FullscreenMenu({
  open,
  onNavClick,
  onClose,
  isTouch,
}: {
  open: boolean;
  onNavClick: (id: string) => (e: React.MouseEvent) => void;
  onClose: () => void;
  isTouch: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key='nav-overlay'
          className='fixed inset-0 z-9999 flex flex-col items-center justify-center'
          style={{ background: 'var(--color-surface-2)' }}
          initial={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.25rem)' }}
          animate={{
            clipPath: 'circle(150% at calc(100% - 3rem) 2.25rem)',
            transition: { duration: 0.65, ease: EXPO_OUT },
          }}
          exit={{
            clipPath: 'circle(0% at calc(100% - 3rem) 2.25rem)',
            transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
          }}
        >
          {/* Close button — top right */}
          <motion.button
            onClick={onClose}
            aria-label='Kapat'
            className='absolute top-6 right-6 md:top-8 md:right-10 flex items-center justify-center w-12 h-12 cursor-pointer'
            initial={{ opacity: 0, rotate: -90 }}
            animate={{
              opacity: 1,
              rotate: 0,
              transition: { duration: 0.4, ease: EXPO_OUT, delay: 0.2 },
            }}
            whileHover={isTouch ? undefined : { scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
              <line
                x1='4'
                y1='4'
                x2='24'
                y2='24'
                stroke='white'
                strokeWidth='2.5'
                strokeLinecap='round'
              />
              <line
                x1='24'
                y1='4'
                x2='4'
                y2='24'
                stroke='white'
                strokeWidth='2.5'
                strokeLinecap='round'
              />
            </svg>
          </motion.button>

          {/* Nav links */}
          <nav className='w-full max-w-2xl px-8 md:px-16'>
            {MENU_LINKS.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={onNavClick(item.id)}
                className='group relative flex items-center cursor-pointer select-none'
                style={{
                  textDecoration: 'none',
                  padding: 'clamp(0.7rem, 1.5vw, 1rem) 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    duration: 0.5,
                    ease: EXPO_OUT,
                    delay: 0.15 + i * 0.05,
                  },
                }}
              >
                {/* Index */}
                <span
                  className='mr-5 font-medium tabular-nums shrink-0'
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-brand)',
                    letterSpacing: '0.05em',
                    minWidth: '1.5rem',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Label */}
                <span
                  className='uppercase font-black transition-all duration-300 ease-out group-hover:translate-x-3 group-hover:text-(--color-brand)'
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  {item.label}
                </span>

                {/* Arrow on hover — desktop */}
                {!isTouch && (
                  <svg
                    width='20'
                    height='14'
                    viewBox='0 0 20 14'
                    fill='none'
                    className='ml-auto opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300'
                    style={{ color: 'var(--color-brand)' }}
                  >
                    <path
                      d='M1 7H19M19 7L13 1M19 7L13 13'
                      stroke='currentColor'
                      strokeWidth='1.7'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================
   MAIN NAVBAR
   ================================================================ */
export default function Navbar() {
  const hydrated = useHydrated();
  const scrolled = useScrolled(32);
  const isTouch = useIsTouch();

  const [open, setOpen] = useState(false);
  const [menuRevealed, setMenuRevealed] = useState(false);
  const [initialDone, setInitialDone] = useState(false);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Mark initial entrance animation as complete
  useEffect(() => {
    const t = setTimeout(() => setInitialDone(true), 2600);
    return () => clearTimeout(t);
  }, []);

  /* ── nav width ── */
  const [fullWidth, setFullWidth] = useState('0px');
  useEffect(() => {
    const update = () => setFullWidth(`${window.innerWidth - 40}px`);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Pill: logo-only 120px, logo+hamburger 160px, full bar uses fullWidth
  const navWidth = !scrolled ? fullWidth : menuRevealed ? '200px' : '180px';

  /* ── reveal / hide helpers ── */
  const clearTouchTimer = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  const revealMenu = useCallback(() => {
    clearTouchTimer();
    setMenuRevealed(true);
  }, [clearTouchTimer]);

  const hideMenu = useCallback(() => {
    clearTouchTimer();
    setMenuRevealed(false);
  }, [clearTouchTimer]);

  // Reset menuRevealed when user scrolls back to top (leaves pill mode)
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY <= 32) {
        setMenuRevealed(false);
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  /* ── Desktop: hover to reveal ── */
  const handleMouseEnter = useCallback(() => {
    if (scrolled && !isTouch) revealMenu();
  }, [scrolled, isTouch, revealMenu]);

  const handleMouseLeave = useCallback(() => {
    if (scrolled && !isTouch && !openRef.current) hideMenu();
  }, [scrolled, isTouch, hideMenu]);

  /* ── Mobile: touch to reveal, 3s auto-hide ── */
  const handlePillTouch = useCallback(() => {
    if (!scrolled || !isTouch) return;
    revealMenu();
    touchTimerRef.current = setTimeout(() => {
      if (!openRef.current) hideMenu();
    }, 3000);
  }, [scrolled, isTouch, revealMenu, hideMenu]);

  /* ── handlers ── */
  const handleOpen = useCallback(() => {
    clearTouchTimer();
    setMenuRevealed(false); // collapse pill as it fades out
    getSmoother()?.stop();
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarW}px`;
    document.body.style.overflow = 'hidden';
    setOpen(true);
  }, [clearTouchTimer]);

  const handleClose = useCallback((skipResume = false) => {
    setOpen(false);
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (!skipResume) getSmoother()?.start();
    }, 200);
  }, []);

  const handleNavClick = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      getSmoother()?.start();
      scrollTo(id);
      handleClose(true);
    },
    [handleClose],
  );

  // Hamburger visible when: full bar OR pill with menu revealed (NOT when overlay open)
  const showHamburger = !scrolled || menuRevealed;

  return (
    <>
      {/* ── TOP BAR / PILL ── */}
      <motion.nav
        className={`fixed top-3 z-9998 flex items-center ${scrolled && !menuRevealed ? 'justify-center' : 'justify-between'} rounded-full `}
        style={{
          height: 60,
          left: '50%',
          translateX: '-50%',
          pointerEvents: open ? 'none' : 'auto',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handlePillTouch}
        initial={{ opacity: 0, y: -20, width: navWidth }}
        animate={{
          opacity: open ? 0 : 1,
          y: 0,
          width: navWidth,
          paddingLeft: scrolled ? '1rem' : 'clamp(1.25rem, 4vw, 2.5rem)',
          paddingRight: scrolled ? '1rem' : 'clamp(1.25rem, 4vw, 2.5rem)',
          backgroundColor: scrolled ? 'rgba(28, 28, 30, 0.95)' : '',
          border: scrolled
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(255,255,255,0)',
        }}
        transition={{
          opacity: initialDone
            ? {
                duration: open ? 0.2 : 0.4,
                ease: EXPO_OUT,
                delay: open ? 0 : 0.35,
              }
            : { duration: 0.8, delay: 1.6, ease: EXPO_OUT },
          y: initialDone
            ? { duration: 0 }
            : { duration: 0.8, delay: 1.6, ease: EXPO_OUT },
          width: { duration: 0.75, ease: EXPO_OUT },
          paddingLeft: { duration: 0.75, ease: EXPO_OUT },
          paddingRight: { duration: 0.75, ease: EXPO_OUT },
          backgroundColor: { duration: 0.4, ease: EXPO_OUT },
          border: { duration: 0.4, ease: EXPO_OUT },
        }}
      >
        {/* Logo */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.75, ease: EXPO_OUT } }}
          className='relative flex items-center shrink-0'
        >
          <Link href='/' aria-label='Ana Sayfa'>
            <Logo className='w-12 h-12' />
          </Link>
        </motion.div>

        {/* Hamburger — no X animation, hidden when overlay open */}
        <div
          className='shrink-0 overflow-hidden flex items-center justify-center'
          style={{
            width: showHamburger ? 44 : 0,
            opacity: showHamburger ? 1 : 0,
            pointerEvents: showHamburger ? 'auto' : 'none',
            transition: showHamburger
              ? 'width 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s cubic-bezier(0.16,1,0.3,1)'
              : 'none',
          }}
        >
          <motion.button
            onClick={handleOpen}
            aria-label='Menüyü Aç'
            className='relative flex flex-col items-center justify-center w-11 h-11 cursor-pointer shrink-0 gap-1.75'
            whileHover={isTouch ? undefined : { scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.18 }}
          >
            <span
              className='block rounded-full'
              style={{
                height: 2,
                width: 22,
                background: 'var(--color-text-primary)',
              }}
            />
            <span
              className='block rounded-full'
              style={{
                height: 2,
                width: 22,
                background: 'var(--color-text-primary)',
              }}
            />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── FULLSCREEN MENU ── */}
      {hydrated &&
        createPortal(
          <FullscreenMenu
            open={open}
            onNavClick={handleNavClick}
            onClose={() => handleClose()}
            isTouch={isTouch}
          />,
          document.body,
        )}
    </>
  );
}
