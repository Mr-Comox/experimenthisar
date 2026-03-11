'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { menuData } from '@/app/components/menu/Collection';
import { GoldToAmberFont } from '@/app/utilities/LinearFontColors';

type Category = keyof typeof menuData;
type Item = { name: string };

const CATS = Object.entries(menuData) as [Category, Item[]][];
const E: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const GOLD_GRAD =
  'linear-gradient(135deg, #b8860b 0%, #e8b84b 50%, #c17f24 100%)';
const GOLD = '#c9960c';

/* ─── SIDEBAR ─────────────────────────────────────────────────── */
function Sidebar({
  active,
  onSelect,
}: {
  active: Category;
  onSelect: (c: Category) => void;
}) {
  return (
    <aside
      className='hidden md:flex flex-col shrink-0 overflow-y-auto border-r'
      style={{
        width: 'clamp(200px,22vw,260px)',
        borderColor: 'rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.15)',
      }}
    >
      <p
        className='px-7 pt-10 pb-5 text-[0.58rem] tracking-[0.24em] uppercase font-semibold'
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        Kategoriler
      </p>

      <nav className='px-4 flex flex-col gap-0.5'>
        {CATS.map(([cat, items], i) => {
          const on = active === cat;
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.038, ease: E }}
              onClick={() => onSelect(cat)}
              className='relative flex items-center justify-between gap-2 px-3 py-[11px] rounded-xl border-0 cursor-pointer w-full text-left transition-all duration-200'
              style={{
                background: on ? 'rgba(212,160,23,0.1)' : 'transparent',
              }}
            >
              {on && (
                <motion.div
                  layoutId='pip'
                  className='absolute left-0 top-2 bottom-2 w-[3px] rounded-full'
                  style={{ background: GOLD_GRAD }}
                  transition={{ duration: 0.28, ease: E }}
                />
              )}
              <span
                className='pl-1 text-[0.9rem] font-medium tracking-[-0.015em] leading-none transition-colors duration-200'
                style={{
                  color: on
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(255,255,255,0.35)',
                }}
              >
                {on ? <GoldToAmberFont>{cat}</GoldToAmberFont> : cat}
              </span>
              <span
                className='text-[0.63rem] tabular-nums font-semibold shrink-0 transition-colors duration-200'
                style={{ color: on ? GOLD : 'rgba(255,255,255,0.18)' }}
              >
                {(items as Item[]).length}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className='mt-auto px-7 py-8'>
        <div
          className='h-px mb-5'
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
        <p
          className='text-[0.52rem] tracking-[0.1em] uppercase leading-relaxed'
          style={{ color: 'rgba(255,255,255,0.13)' }}
        >
          * Menü değişiklik gösterebilir.
        </p>
      </div>
    </aside>
  );
}

/* ─── MOBILE STRIP ─────────────────────────────────────────────── */
function MobileStrip({
  active,
  onSelect,
}: {
  active: Category;
  onSelect: (c: Category) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (
      ref.current?.querySelector(`[data-cat="${active}"]`) as HTMLElement
    )?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [active]);

  return (
    <div
      ref={ref}
      className='flex gap-1.5 overflow-x-auto px-5 py-3.5'
      style={{ scrollbarWidth: 'none' }}
    >
      {CATS.map(([cat]) => {
        const on = active === cat;
        return (
          <button
            key={cat}
            data-cat={cat}
            onClick={() => onSelect(cat)}
            className='shrink-0 px-4 py-2 rounded-xl text-[0.76rem] font-medium cursor-pointer border transition-all duration-200 whitespace-nowrap'
            style={{
              background: on ? GOLD_GRAD : 'rgba(255,255,255,0.05)',
              borderColor: on ? 'transparent' : 'rgba(255,255,255,0.09)',
              color: on ? '#1a0e00' : 'rgba(255,255,255,0.44)',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

/* ─── ITEM ROW — only text brightens on hover, nothing else ────── */
function ItemRow({ name, index }: { name: string; index: number }) {
  return (
    <div
      className='group flex items-center gap-4 py-[15px] border-b cursor-default select-none'
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <span
        className='text-[0.58rem] tabular-nums w-[2ch] text-right shrink-0 font-medium'
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className='text-[clamp(0.88rem,1vw,0.97rem)] font-normal tracking-[-0.01em] leading-snug transition-colors duration-150 group-hover:text-white/85'
        style={{ color: 'rgba(255,255,255,0.58)' }}
      >
        {name}
      </span>
    </div>
  );
}

/* ─── ITEMS PANEL ──────────────────────────────────────────────── */
function ItemsPanel({ cat, items }: { cat: Category; items: Item[] }) {
  return (
    <motion.div
      key={cat}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: E }}
    >
      {/* Header — just the title + rule */}
      <div className='mb-10'>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: E }}
          className='font-bold tracking-[-0.04em] leading-[0.95] m-0'
          style={{ fontSize: 'clamp(2.5rem,6vw,5.5rem)' }}
        >
          <GoldToAmberFont>{cat}</GoldToAmberFont>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: E }}
          className='mt-5 h-px origin-left'
          style={{
            background:
              'linear-gradient(to right, rgba(212,160,23,0.45), rgba(212,160,23,0.06) 55%, transparent)',
          }}
        />
      </div>

      {/* Items — 2 col sm+, 1 col mobile */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-10 xl:gap-x-16'>
        {items.map(({ name }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, delay: 0.06 + i * 0.013 }}
          >
            <ItemRow name={name} index={i} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────────── */
export default function MenuPage() {
  const router = useRouter();
  const [active, setActive] = useState<Category>(CATS[0][0]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSelect = useCallback((cat: Category) => {
    if (window.innerWidth < 768) {
      // Instantly jump to top BEFORE the content swaps so the old list
      // is never visible at the wrong scroll position during the transition.
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      panelRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
    setActive(cat);
  }, []);

  return (
    <div className='bg-secondaryColor min-h-screen flex flex-col'>
      {/* TOPBAR */}
      <header
        className='relative flex items-center justify-between shrink-0 h-[52px] px-5 md:px-8 border-b'
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => router.back()}
          className='flex items-center gap-1.5 bg-transparent border-0 cursor-pointer text-[0.78rem] font-medium group'
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <svg
            className='transition-transform duration-200 group-hover:-translate-x-0.5'
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
          >
            <path
              d='M9 2.5L4.5 7L9 11.5'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span className='group-hover:text-white/60 transition-colors duration-150'>
            Geri
          </span>
        </button>

        <div className='absolute left-1/2 -translate-x-1/2 pointer-events-none'>
          <GoldToAmberFont>
            <span className='text-[0.70rem] tracking-[0.3em] uppercase font-bold'>
              Menü
            </span>
          </GoldToAmberFont>
        </div>

        <span
          style={{ color: 'rgba(255,255,255,0.18)' }}
          className='text-[0.62rem] tracking-[0.04em]'
        >
          {CATS.length} kategori
        </span>
      </header>

      {/* MOBILE STRIP */}
      <div
        className='md:hidden shrink-0 border-b'
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <MobileStrip active={active} onSelect={handleSelect} />
      </div>

      {/* BODY */}
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar active={active} onSelect={handleSelect} />

        <main
          ref={panelRef}
          className='flex-1 overflow-y-auto overflow-x-hidden px-8 md:px-12 xl:px-16 pt-11 pb-24'
          style={{ scrollbarGutter: 'stable' }}
        >
          <AnimatePresence mode='wait'>
            <ItemsPanel
              key={active}
              cat={active}
              items={(menuData[active] as Item[]) ?? []}
            />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
