'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { menuData } from '@/app/components/menu/Collection';
import { GoldToAmberFont } from '@/app/utilities/LinearFontColors';

/* ─────────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────────── */
type Props = { id: string };
type Category = keyof typeof menuData;

const CATS = Object.entries(menuData) as [Category, { name: string }[]][];
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const GOLD_GRADIENT =
  'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #ff8c00 100%)';
const GOLD_GLOW = 'rgba(255,215,0,0.2)';

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
export default function Menu({ id }: Props) {
  const router = useRouter();

  return (
    <section
      id={id}
      className='relative bg-secondaryColor overflow-hidden pt-14'
    >
      <div className='mb-30 mt-10 grid gap-[clamp(40px,6vw,96px)] px-6 md:px-16 xl:px-24 pt-[clamp(48px,8vh,88px)] grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center'>
        {/* ── LEFT — headline + copy + CTA ── */}
        <div className='flex flex-col gap-[clamp(20px,3.5vh,36px)]'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.04, ease: EASE }}
            className='flex items-center gap-2.5'
          />

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
              onClick={() => router.push('/menu')}
              className='inline-flex items-center gap-3 py-3.5 pl-6 pr-3.5 bg-white/5.5 border border-white/10 rounded-full cursor-pointer transition-all duration-220 hover:bg-white/9 hover:border-[rgba(255,215,0,0.28)] hover:scale-[1.02]'
            >
              <span className='text-[0.9375rem] font-medium text-white/85 tracking-[-0.01em] whitespace-nowrap'>
                Menüyü Görüntüle
              </span>

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

        {/* ── RIGHT — category name list ── */}
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

      <div className='h-px mx-6 md:mx-16 xl:mx-24 bg-linear-to-r from-transparent via-white/6 to-transparent mb-3' />
    </section>
  );
}
