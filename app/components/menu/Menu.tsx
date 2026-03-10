'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { menuData } from '@/app/components/menu/Collection';
import { GoldToAmberFont } from '@/app/utilities/LinearFontColors';

/* ─────────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────────── */
type Props = { id: string };
type Category = keyof typeof menuData;
type Item = { name: string };

const CATS = Object.entries(menuData) as [Category, Item[]][];
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Only kept for framer-motion animated values and SVG strokes
// that cannot be expressed as Tailwind classes
const GOLD_GRADIENT =
  'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #ff8c00 100%)';
const GOLD_GLOW = 'rgba(255,215,0,0.2)';

/* ─────────────────────────────────────────────────────────────────
   CHEVRON
───────────────────────────────────────────────────────────────── */
function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className='shrink-0'
    >
      {open && (
        <defs>
          <linearGradient id='chevron-gold' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#b8860b' />
            <stop offset='50%' stopColor='#ffd700' />
            <stop offset='100%' stopColor='#ff8c00' />
          </linearGradient>
        </defs>
      )}
      <path
        d='M5 7.5L10 12.5L15 7.5'
        stroke={open ? 'url(#chevron-gold)' : 'rgba(255,255,255,0.25)'}
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ACCORDION ROW
───────────────────────────────────────────────────────────────── */
function AccordionRow({
  cat,
  items,
  index,
  isOpen,
  onToggle,
  isLast,
}: {
  cat: Category;
  items: Item[];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const col1 = items.filter((_, i) => i % 2 === 0);
  const col2 = items.filter((_, i) => i % 2 !== 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.07, ease: EASE }}
      className={!isLast ? 'border-b border-white/[0.07]' : ''}
    >
      {/* ── Trigger button ── */}
      <button
        onClick={onToggle}
        className='w-full flex items-center gap-[clamp(16px,3vw,40px)] py-[clamp(28px,4vh,40px)] px-6 md:px-16 xl:px-24 bg-transparent border-0 cursor-pointer text-left'
      >
        {/* Index number */}
        {isOpen ? (
          <GoldToAmberFont>
            <div className='text-[clamp(1.1rem,1.8vw,1.6rem)] font-bold shrink-0 tracking-[-0.03em] leading-none tabular-nums min-w-[2.2ch] select-none'>
              {String(index + 1).padStart(2, '0')}
            </div>
          </GoldToAmberFont>
        ) : (
          <span
            aria-hidden
            className='text-[clamp(1.1rem,1.8vw,1.6rem)] font-bold text-white/8 shrink-0 tracking-[-0.03em] leading-none tabular-nums min-w-[2.2ch] select-none'
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        )}

        {/* Category name */}
        <h3
          className='text-[clamp(2.2rem,4.2vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] flex-1 transition-colors duration-350'
          style={{
            color: isOpen ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.55)',
          }}
        >
          {cat}
        </h3>

        {/* Connector line — animated gold fill */}
        <div
          aria-hidden
          className='flex-auto max-w-[clamp(60px,15vw,240px)] h-px bg-white/8 relative overflow-hidden'
        >
          <motion.div
            animate={{ width: isOpen ? '100%' : '0%' }}
            transition={{ duration: 0.7, ease: EASE }}
            className='absolute inset-y-0 left-0 h-full'
            style={{ background: GOLD_GRADIENT }}
          />
        </div>

        <Chevron open={isOpen} />
      </button>

      {/* ── Expandable content ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key='content'
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.2 },
              },
            }}
            className='overflow-hidden'
          >
            <div className='px-6 md:px-16 xl:px-24 pb-[clamp(40px,6vh,64px)]'>
              {/* Gold accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
                className='h-px opacity-40 mb-[clamp(32px,5vh,52px)] origin-left'
                style={{ background: GOLD_GRADIENT }}
              />

              {/* Two-column item grid */}
              <div
                className='grid gap-x-[clamp(24px,5vw,80px)]'
                style={{
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                }}
              >
                {[col1, col2].map((col, ci) =>
                  col.length === 0 ? null : (
                    <div key={ci}>
                      {col.map(({ name }, ri) => {
                        const gi = ci === 0 ? ri * 2 : ri * 2 + 1;
                        return (
                          <motion.div
                            key={name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.38,
                              delay: gi * 0.028,
                              ease: 'easeOut',
                            }}
                            className='py-4.5 border-b border-white/5.5 flex items-baseline gap-3.5'
                          >
                            <span className='text-white/70 text-[clamp(0.965rem,1.1vw,1.05rem)] leading-[1.44] font-normal tracking-[0.006em]'>
                              {name}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  ),
                )}
              </div>

              {/* Footer count row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + items.length * 0.025,
                }}
                className='mt-7 flex items-center gap-4'
              >
                <span className='text-[0.58rem] tracking-[0.2em] uppercase text-white/20 font-medium shrink-0'>
                  {items.length} ürün
                </span>
                <div className='flex-1 h-px bg-linear-to-r from-white/6 to-transparent' />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PRE-REVEAL
───────────────────────────────────────────────────────────────── */
function PreMenuReveal({ onReveal }: { onReveal: () => void }) {
  return (
    <motion.div
      key='pre-reveal'
      exit={{
        opacity: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
      }}
    >
      <div className='mb-30 mt-10 grid gap-[clamp(40px,6vw,96px)] px-6 md:px-16 xl:px-24 pt-[clamp(48px,8vh,88px)] grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center'>
        {/* ── LEFT — headline + copy + CTA ── */}
        <div className='flex flex-col gap-[clamp(20px,3.5vh,36px)]'>
          {/* Eyebrow placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.04, ease: EASE }}
            className='flex items-center gap-2.5'
          />

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className='font-bold text-white leading-[1.04] tracking-[-0.03em] text-[clamp(3rem,5vw,4.9rem)] m-0'
          >
            Damağınıza özel
            <br />
            <GoldToAmberFont>seçkin tatlar.</GoldToAmberFont>
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
            className='text-white/55 leading-[1.72] text-[clamp(0.9rem,1.2vw,1rem)] max-w-[38ch] m-0'
          >
            Özenle kurgulanan menü seçkisi, sahnedeki ritimle bütünleşen bir
            deneyim sunar.
          </motion.p>

          {/* CTA pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
          >
            <button
              onClick={onReveal}
              className='inline-flex items-center gap-3 py-3.5 pl-6 pr-3.5 bg-white/5.5 border border-white/10 rounded-full cursor-pointer transition-all duration-220 hover:bg-white/9 hover:border-[rgba(255,215,0,0.28)] hover:scale-[1.02]'
            >
              <span className='text-[0.9375rem] font-medium text-white/85 tracking-[-0.01em] whitespace-nowrap'>
                Menüyü Görüntüle
              </span>

              {/* Gold circle arrow */}
              <span
                className='w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0'
                style={{
                  background: GOLD_GRADIENT,
                  boxShadow: `0 0 14px 2px ${GOLD_GLOW}`,
                }}
              >
                <svg width='12' height='12' viewBox='0 0 14 14' fill='none'>
                  <path
                    d='M3 7h8M8 4l3 3-3 3'
                    stroke='#1a0f00'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
            </button>
          </motion.div>
        </div>

        {/* ── RIGHT — category name list, Apple One style ── */}
        <div className='flex flex-col gap-[clamp(0px,0.5vh,6px)]'>
          {CATS.map(([cat], i) => {
            const rowOpacity = i < 3 ? 1 : Math.max(0.18, 1 - (i - 2) * 0.18);
            return (
              <motion.div
                className='text-[clamp(1.9rem,3.8vw,3.2rem)] font-bold leading-[1.18] tracking-[-0.025em] block'
                key={cat}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: rowOpacity, x: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.06 + i * 0.06,
                  ease: EASE,
                }}
              >
                <GoldToAmberFont>{cat}</GoldToAmberFont>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hairline divider */}
      <div className='h-px mx-6 md:mx-16 xl:mx-24 bg-linear-to-r from-transparent via-white/6 to-transparent mb-3' />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
export default function Menu({ id }: Props) {
  const [menuRevealed, setMenuRevealed] = useState(false);
  const [open, setOpen] = useState<Category | null>(null);

  const toggle = (cat: Category) =>
    setOpen((prev) => (prev === cat ? null : cat));

  return (
    <section
      id={id}
      className='relative bg-secondaryColor overflow-hidden pt-14'
    >
      {/* ── PRE-REVEAL / ACCORDION ── */}
      <AnimatePresence mode='wait'>
        {!menuRevealed ? (
          <PreMenuReveal key='pre' onReveal={() => setMenuRevealed(true)} />
        ) : (
          <motion.div
            key='menu'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className='pt-[clamp(16px,3vh,32px)]'>
              {CATS.map(([cat, items], i) => (
                <AccordionRow
                  key={cat}
                  cat={cat}
                  items={items as Item[]}
                  index={i}
                  isOpen={open === cat}
                  onToggle={() => toggle(cat)}
                  isLast={i === CATS.length - 1}
                />
              ))}
            </div>

            {/* Footer */}
            <div className='px-6 md:px-16 xl:px-24 pt-8 pb-14 border-t border-white/6 mt-4'>
              <p className='text-[0.55rem] tracking-[0.16em] uppercase text-white/16 text-right'>
                * Menü içeriği duruma göre değişiklik gösterebilir.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
