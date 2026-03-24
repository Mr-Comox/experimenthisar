'use client';

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollTo } from '../lib/scrollTo';
import { getSmoother } from '../lib/smoother';
import { Logo } from '@/public/Icons';

// ─── Brand palette ─────────────────────────────────────────────────────────────
const BRAND = {
  pink: '#ff1987',
  purple: '#9d00ff',
  dark: '#070707',
  panel: '#141414',
  white: '#fbfbfb',
};

// ─── Nav data ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'restoran', label: 'Restoran' },
  { id: 'deneyim', label: 'Deneyim' },
];

const GROUPS: Record<string, { id: string; label: string }[]> = {
  restoran: [
    { id: 'about', label: 'Hakkımızda' },
    { id: 'menu', label: 'Menü' },
    { id: 'testimonials', label: 'Yorumlar' },
  ],
  deneyim: [
    { id: 'activities', label: 'Etkinlikler' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'location', label: 'Konum' },
    { id: 'reservation', label: 'Rezervasyon' },
  ],
};

// ─── Detect touch/hover capability once at module level ───────────────────────
const isTouch =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

// ─── Random gradient — new seed every open() ──────────────────────────────────
function makeBg(): string {
  const r = () => Math.round(Math.random() * 100);
  const s = (lo = 35, hi = 70) => lo + Math.round(Math.random() * (hi - lo));
  return [
    `radial-gradient(ellipse ${s()}% ${s()}% at ${r()}% ${r()}%, ${BRAND.pink}4D 0%, transparent 65%)`,
    `radial-gradient(ellipse ${s()}% ${s()}% at ${r()}% ${r()}%, ${BRAND.purple}40 0%, transparent 65%)`,
    `radial-gradient(ellipse ${s(55, 90)}% ${s(55, 90)}% at ${r()}% ${r()}%, ${BRAND.pink}28 0%, transparent 70%)`,
    `radial-gradient(ellipse ${s(55, 85)}% ${s(55, 85)}% at ${r()}% ${r()}%, ${BRAND.purple}36 0%, transparent 70%)`,
    `linear-gradient(135deg, #0a0005 0%, #070707 50%, #050010 100%)`,
  ].join(', ');
}

// ─── Easing curves ─────────────────────────────────────────────────────────────
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const EXPO_IN = [0.7, 0, 0.84, 0] as const;

// ─── No shared variants needed — animation is driven imperatively in the
//     component via useEffect + direct motion values per item. This avoids
//     ALL AnimatePresence overlap/stacking bugs on tab switch entirely.

// ─── Hamburger — static, no X morph ──────────────────────────────────────────
function HamburgerBtn({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={isOpen ? 'Kapat' : 'Menüyü Aç'}
      className='relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer shrink-0'
      style={{
        background: 'rgba(251,251,251,0.07)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(251,251,251,0.13)',
        // FIX: pre-promote to its own compositor layer so backdrop-filter
        //      never triggers a main-thread repaint on tap
        willChange: 'transform',
      }}
      // FIX: skip whileHover on touch — phantom hover fires mid-scroll on iOS
      whileHover={
        isTouch
          ? undefined
          : { scale: 1.08, borderColor: 'rgba(251,251,251,0.3)' }
      }
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.18 }}
    >
      <span
        className='absolute block rounded-full'
        style={{
          height: 2,
          width: 20,
          background: BRAND.white,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, calc(-50% - 5px))',
        }}
      />
      <span
        className='absolute block rounded-full'
        style={{
          height: 2,
          width: 20,
          background: BRAND.white,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, calc(-50% + 5px))',
        }}
      />
    </motion.button>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'restoran' | 'deneyim'>(
    'restoran',
  );
  const [bgStyle, setBgStyle] = useState<string>(() => makeBg());
  // Track a render key that increments on every tab switch — used to force
  // the item list to remount cleanly, giving us a fresh stagger every time
  // without any AnimatePresence overlap bugs.
  const [listKey, setListKey] = useState(0);

  const handleTabClick = useCallback((id: 'restoran' | 'deneyim') => {
    setActiveTab(id);
    setListKey((k) => k + 1);
  }, []);

  const handleOpen = useCallback(() => {
    setBgStyle(makeBg());
    getSmoother()?.stop();
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
    setOpen(true);
  }, []);

  const handleClose = useCallback((skipResume = false) => {
    setOpen(false);
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('nav-open');
      if (!skipResume) getSmoother()?.start();
    }, 200);
  }, []);

  const handleNavClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    getSmoother()?.start();
    scrollTo(id);
    handleClose(true);
  };

  const navItems = GROUPS[activeTab] ?? [];

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key='nav-overlay'
          className='fixed inset-0 z-9999 flex'
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.22, ease: 'easeOut' },
          }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } }}
        >
          {/* ══ LEFT — brand gradient bg ══════════════════════════════════════ */}
          <div
            className='relative hidden md:flex flex-col items-center justify-center w-1/2 h-full overflow-hidden'
            style={{ background: bgStyle }}
          >
            <div
              className='absolute inset-0 pointer-events-none'
              style={{
                opacity: 0.45,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '300px',
              }}
            />
            {[560, 400, 260, 140].map((size, i) => (
              <div
                key={size}
                className='absolute rounded-full pointer-events-none'
                style={{
                  width: size,
                  height: size,
                  border: `1px solid rgba(255,25,135,${0.05 + i * 0.04})`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.55, ease: EXPO_OUT, delay: 0.08 },
              }}
              exit={{
                scale: 0.88,
                opacity: 0,
                transition: { duration: 0.2, ease: EXPO_IN },
              }}
            >
              <Logo className='w-44 h-44 drop-shadow-[0_0_56px_rgba(255,25,135,0.45)]' />
            </motion.div>
            <div
              className='absolute right-0 top-0 h-full w-28 pointer-events-none'
              style={{
                background: `linear-gradient(to right, transparent, ${BRAND.panel})`,
              }}
            />
          </div>

          {/* ══ RIGHT — dark panel ════════════════════════════════════════════ */}
          <div
            className='relative flex flex-col w-full md:w-1/2 h-full'
            style={{ background: BRAND.panel }}
          >
            {/* ── header: tabs + close ── */}
            <div className='flex items-center justify-between px-10 pt-10'>
              <div className='flex items-center gap-2'>
                {TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      // FIX: use memoized handler, avoids inline arrow recreation
                      onClick={() =>
                        handleTabClick(tab.id as 'restoran' | 'deneyim')
                      }
                      className='cursor-pointer select-none transition-all duration-250 font-medium'
                      style={{
                        padding: '0.8rem 1.25rem',
                        borderRadius: 999,
                        fontSize: '1rem',
                        color: active ? BRAND.dark : BRAND.white,
                        background: active ? BRAND.white : '',
                        // FIX: hint compositor so tab bg swap doesn't repaint siblings
                        willChange: 'background-color, color',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <motion.button
                onClick={() => handleClose()}
                aria-label='Kapat'
                className='flex items-center justify-center w-10 h-10 rounded-full cursor-pointer'
                style={{
                  border: '1px solid rgba(251,251,251,0.16)',
                  color: 'rgba(251,251,251,0.55)',
                  willChange: 'transform', // FIX: own layer
                }}
                whileHover={
                  isTouch
                    ? undefined
                    : {
                        scale: 1.1,
                        borderColor: 'rgba(251,251,251,0.5)',
                        color: BRAND.white,
                      }
                }
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <svg width='13' height='13' viewBox='0 0 13 13' fill='none'>
                  <line
                    x1='1'
                    y1='1'
                    x2='12'
                    y2='12'
                    stroke='currentColor'
                    strokeWidth='1.7'
                    strokeLinecap='round'
                  />
                  <line
                    x1='12'
                    y1='1'
                    x2='1'
                    y2='12'
                    stroke='currentColor'
                    strokeWidth='1.7'
                    strokeLinecap='round'
                  />
                </svg>
              </motion.button>
            </div>

            {/* divider */}
            <div
              className='mx-10 mt-7 h-px'
              style={{ background: 'rgba(251,251,251,0.07)' }}
            />

            {/* ── nav items list ── */}
            {/*
              No AnimatePresence at all for the tab switch.
              Instead each item animates independently via CSS custom property
              delay driven by its index. When listKey increments (tab changes),
              React unmounts+remounts the whole list instantly — the old items
              are gone in 0ms, new items stagger in cleanly. Zero overlap,
              zero glitch, works perfectly on mobile.
            */}
            <nav className='flex flex-col justify-center flex-1 px-10 py-6 overflow-hidden'>
              <div key={listKey} className='flex flex-col w-full'>
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={handleNavClick(item.id)}
                    className='group relative flex items-center py-2.5 cursor-pointer select-none overflow-hidden'
                    style={{ textDecoration: 'none' }}
                    // Each item starts hidden and animates in with a staggered delay
                    // based purely on its index — no parent orchestration needed.
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: EXPO_OUT,
                      delay: i * 0.055,
                    }}
                  >
                    {/* hover fill bg — desktop only */}
                    {!isTouch && (
                      <motion.span
                        className='absolute inset-y-0 -left-10 -right-10 pointer-events-none'
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3, ease: EXPO_OUT }}
                        style={{
                          background: `linear-gradient(90deg, ${BRAND.pink}14, transparent)`,
                          transformOrigin: 'left',
                        }}
                      />
                    )}

                    {/* label */}
                    <motion.span
                      className='relative block leading-none uppercase font-black'
                      style={{
                        fontSize: 'clamp(1.9rem, 4vw, 3.1rem)',
                        letterSpacing: '-0.025em',
                        color: 'rgba(251,251,251,0.88)',
                        willChange: isTouch ? 'auto' : 'transform, color',
                      }}
                      whileHover={
                        isTouch ? undefined : { x: 8, color: BRAND.white }
                      }
                      transition={{ duration: 0.28, ease: EXPO_OUT }}
                    >
                      {item.label}
                    </motion.span>

                    {/* arrow — desktop only */}
                    {!isTouch && (
                      <motion.span
                        className='relative ml-auto'
                        style={{ color: BRAND.pink }}
                        initial={{ opacity: 0, x: -12 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, ease: EXPO_OUT }}
                      >
                        <svg
                          width='20'
                          height='14'
                          viewBox='0 0 20 14'
                          fill='none'
                        >
                          <path
                            d='M1 7H19M19 7L13 1M19 7L13 13'
                            stroke='currentColor'
                            strokeWidth='1.7'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </motion.span>
                    )}
                  </motion.a>
                ))}
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <nav className='flex w-full fixed top-5 px-6 py-5 z-9998 items-center justify-between h-20'>
        <div>
          <Logo className='w-15 h-15' />
        </div>
        <HamburgerBtn
          isOpen={open}
          onClick={open ? () => handleClose() : handleOpen}
        />
      </nav>

      {typeof document !== 'undefined' && createPortal(overlay, document.body)}
    </>
  );
}
