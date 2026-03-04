'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftLeafletIcon, RightLeafletIcon } from '@/public/Icons';
import ActivitiesLogo from '@/public/Icons/ActivitiesLogo';
import AnimatedText from '@/app/utilities/AnimatedText';
import { activityImages as originalActivityImages } from './Collection';

const activityImages = originalActivityImages;

const ActivitiesSlider = ({ id }: { id: string }) => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLButtonElement | null>(null);
  const prevActiveRef = useRef(active);

  const go = (index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  const next = () => go((active + 1) % activityImages.length);
  const prev = () =>
    go((active - 1 + activityImages.length) % activityImages.length);

  // AUTOPLAY
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActive((prev) => {
        setDirection(1);
        return (prev + 1) % activityImages.length;
      });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  useEffect(() => {
    if (!activeRowRef.current || !listRef.current) {
      prevActiveRef.current = active;
      return;
    }

    const container = listRef.current;
    const el = activeRowRef.current;
    const prevActive = prevActiveRef.current;

    const isLoopReset =
      prevActive === activityImages.length - 1 && active === 0;

    if (isLoopReset) {
      container.style.scrollBehavior = 'smooth';
      container.scrollTop = 0;

      requestAnimationFrame(() => {
        container.style.scrollBehavior = 'smooth';
      });

      prevActiveRef.current = active;
      return;
    }

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;

    if (elTop < containerTop) {
      container.scrollTo({
        top: elTop,
        behavior: 'smooth',
      });
    } else if (elBottom > containerBottom) {
      container.scrollTo({
        top: elBottom - container.clientHeight,
        behavior: 'smooth',
      });
    }

    prevActiveRef.current = active;
  }, [active]);

  const current = activityImages[active];
  const total = activityImages.length;

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, y: d > 0 ? 24 : -24 }),
    center: { opacity: 1, y: 0 },
    exit: (d: number) => ({ opacity: 0, y: d > 0 ? -24 : 24 }),
  };

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      {/* ── HEADER ── */}
      <div className='relative flex'>
        <div className='hidden lg:flex items-start justify-center w-14 pt-20 flex-shrink-0'>
          <span
            className='text-softWhite/20 text-[9px] tracking-[0.35em] uppercase select-none whitespace-nowrap'
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Etkinlikler
          </span>
        </div>

        <div className='flex-1 px-6 sm:px-10 lg:px-12 pt-20 pb-14 flex flex-col gap-6'>
          <header className='flex items-center gap-3 relative z-10'>
            <LeftLeafletIcon widthSize='9' heightSize='18' />
            <span className='text-mainColor uppercase tracking-[0.35em] text-[0.65rem]'>
              Etkinliklerimiz
            </span>
            <RightLeafletIcon widthSize='9' heightSize='18' />
          </header>

          <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5'>
            <h2 className='text-softWhite font-serif text-[2rem] sm:text-[2.8rem] md:text-[3.4rem] lg:text-[4rem] xl:text-[4.8rem] leading-[1.1] max-w-3xl'>
              <AnimatedText text='Önümüzdeki Aktiviteler' />
            </h2>
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className='w-full h-px bg-softWhite/10' />

      {/* ══════════════════════════════════════════════════════════
          MOBILE / TABLET  (< xl)
          Featured card on top ─── compact pill-list below
      ══════════════════════════════════════════════════════════ */}
      <div className='xl:hidden flex flex-col'>
        {/* Featured card */}
        <div className='relative overflow-hidden min-h-[300px] sm:min-h-[360px] '>
          <AnimatePresence mode='wait' custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={slideVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className='relative z-10 flex flex-col justify-between px-6 sm:px-10 py-10 sm:py-12 h-full min-h-[300px] sm:min-h-[360px]'
            >
              {/* Top meta */}
              <div className='flex items-start justify-between gap-4'>
                <div className='flex flex-col gap-2'>
                  <span
                    className={`
                    inline-flex self-start text-[0.62rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm
                    ${
                      current.isNew
                        ? 'bg-mainColor/15 text-mainColor border border-mainColor/20'
                        : 'bg-softWhite/5 text-softWhite/25 border border-softWhite/10'
                    }
                  `}
                  >
                    {current.isNew ? '● Yaklaşan' : '○ Sona Erdi'}
                  </span>
                </div>
                <ActivitiesLogo className='w-20 h-20 sm:w-24 sm:h-24 opacity-15' />
              </div>

              {/* Event title + date */}
              <div className='flex flex-col gap-3 mt-8'>
                <h3 className='text-softWhite font-serif text-[1.7rem] sm:text-[2.2rem] leading-[1.1]'>
                  {current.bannerDescription}
                </h3>
                <div className='w-10 h-px bg-mainColor opacity-60' />
                <span className='text-softWhite/40 font-mono text-sm sm:text-base tracking-widest'>
                  {current.activityDate}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Divider ── */}
        <div className='w-full h-px bg-softWhite/10' />

        {/* Navigation bar */}
        <div className='flex items-center justify-between px-6 sm:px-10 py-4 border-b border-softWhite/10 '>
          <span className='text-softWhite/25 font-mono text-xs tabular-nums'>
            {String(active + 1).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </span>
          <div className='flex items-center gap-3'>
            <button
              onClick={prev}
              className='group w-9 h-9 border border-softWhite/10 hover:border-softWhite/30 hover:bg-softWhite/[0.04] transition-all duration-200 flex items-center justify-center rounded-sm'
            >
              <span className='text-softWhite/40 group-hover:text-softWhite text-base select-none transition-colors'>
                ‹
              </span>
            </button>
            <button
              onClick={next}
              className='group w-9 h-9 border border-softWhite/10 hover:border-mainColor/40 hover:bg-mainColor/[0.05] transition-all duration-200 flex items-center justify-center rounded-sm'
            >
              <span className='text-softWhite/40 group-hover:text-mainColor text-base select-none transition-colors'>
                ›
              </span>
            </button>
          </div>
        </div>

        {/* Compact scrollable event list */}
        <div className='flex flex-col max-h-[320px] overflow-y-auto custom-scrollbar'>
          {activityImages.map((item, i) => {
            const isActive = active === i;
            return (
              <button
                key={i}
                ref={
                  isActive
                    ? (el) => {
                        activeRowRef.current = el;
                      }
                    : undefined
                }
                onClick={() => go(i)}
                className={`
                  group relative flex items-center gap-4 px-6 sm:px-10 py-4
                  border-b border-softWhite/[0.06] text-left
                  transition-colors duration-200
                  ${isActive ? 'bg-softWhite/[0.05]' : 'hover:bg-softWhite/[0.02]'}
                `}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-[2px] bg-mainColor transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                />

                <span
                  className={`font-mono text-[0.65rem] tabular-nums w-6 text-right flex-shrink-0 select-none transition-colors ${isActive ? 'text-mainColor' : 'text-softWhite/20'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span
                  className={`flex-1 text-sm leading-snug transition-colors duration-200 truncate ${isActive ? 'text-softWhite' : 'text-softWhite/50 group-hover:text-softWhite/75'}`}
                >
                  {item.bannerDescription}
                </span>

                <span
                  className={`text-[0.55rem] tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm flex-shrink-0 ${item.isNew ? 'bg-mainColor/15 text-mainColor' : 'bg-softWhite/8 text-softWhite/25'}`}
                >
                  {item.isNew ? 'Yeni' : 'Geçti'}
                </span>

                <span className='text-softWhite/20 font-mono text-[0.6rem] flex-shrink-0 hidden sm:block'>
                  {item.activityDate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP  (xl+)
          Fixed-height scrollable sidebar LEFT + Feature RIGHT
      ══════════════════════════════════════════════════════════ */}
      <div className='hidden xl:flex'>
        <div className='w-14 flex-shrink-0' />

        <div className='flex-1 flex min-h-[580px]'>
          {/* ── LEFT: Scrollable event list ── */}
          <div
            ref={listRef}
            className='w-[300px] 2xl:w-[340px] flex-shrink-0 border-r border-softWhite/10 overflow-y-auto custom-scrollbar'
            style={{ maxHeight: '580px' }}
          >
            {activityImages.map((item, i) => {
              const isActive = active === i;
              return (
                <button
                  key={i}
                  ref={
                    isActive
                      ? (el) => {
                          activeRowRef.current = el;
                        }
                      : undefined
                  }
                  onClick={() => go(i)}
                  className={`
                    group relative w-full flex flex-col gap-2
                    px-8 2xl:px-10 py-7
                    text-left border-b border-softWhite/10
                    transition-colors duration-250
                    ${isActive ? 'bg-softWhite/[0.05]' : 'hover:bg-softWhite/[0.025]'}
                  `}
                >
                  {/* Active left bar */}
                  <span
                    className={`absolute left-0 top-0 bottom-0 w-[2px] bg-mainColor transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />

                  {/* Number + badge */}
                  <div className='flex items-center justify-between gap-3'>
                    <span
                      className={`font-serif leading-none select-none text-[2rem] 2xl:text-[2.4rem] transition-colors duration-300 ${isActive ? 'text-softWhite' : 'text-softWhite/10 group-hover:text-softWhite/28'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[0.52rem] tracking-[0.22em] uppercase px-2 py-0.5 rounded-sm select-none ${item.isNew ? 'bg-mainColor/20 text-mainColor' : 'bg-softWhite/10 text-softWhite/25'}`}
                    >
                      {item.isNew ? 'Yeni' : 'Geçti'}
                    </span>
                  </div>

                  {/* Title */}
                  <span
                    className={`text-[0.7rem] tracking-[0.15em] uppercase leading-snug transition-colors duration-300 ${isActive ? 'text-softWhite/90' : 'text-softWhite/35 group-hover:text-softWhite/65'}`}
                  >
                    {item.bannerDescription}
                  </span>

                  {/* Date */}
                  <span
                    className={`font-mono text-[0.58rem] tracking-widest transition-colors duration-300 ${isActive ? 'text-mainColor/70' : 'text-softWhite/10'}`}
                  >
                    {item.activityDate}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── RIGHT: Featured event ── */}
          <div className='flex-1 flex flex-col relative overflow-hidden'>
            <AnimatePresence mode='wait' custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                variants={slideVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className='flex-1 flex flex-col justify-between px-14 2xl:px-20 py-12 2xl:py-16 relative z-10'
              >
                {/* Top meta row */}
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex flex-col gap-2'>
                    <span
                      className={`
                      inline-flex self-start text-[0.62rem] tracking-[0.22em] uppercase px-3 py-1 rounded-sm
                      ${
                        current.isNew
                          ? 'bg-mainColor/15 text-mainColor border border-mainColor/20'
                          : 'bg-softWhite/5 text-softWhite/25 border border-softWhite/10'
                      }
                    `}
                    >
                      {current.isNew ? '● Yaklaşan' : '○ Sona Erdi'}
                    </span>
                  </div>
                  <ActivitiesLogo className='w-28 h-28 2xl:w-32 2xl:h-32 opacity-15' />
                </div>

                {/* Main title + date */}
                <div className='flex flex-col gap-5 flex-1 justify-center py-8'>
                  <h3 className='text-softWhite font-serif text-[2.2rem] 2xl:text-[3rem] leading-[1.1] max-w-lg'>
                    {current.bannerDescription}
                  </h3>
                  <div className='w-16 h-px bg-mainColor opacity-60' />
                  <span className='text-softWhite/40 font-mono text-lg 2xl:text-xl tracking-widest'>
                    {current.activityDate}
                  </span>
                </div>

                {/* Bottom nav */}
                <div className='flex items-center justify-between pt-6 border-t border-softWhite/[0.07]'>
                  <span className='text-softWhite/20 font-mono text-xs tabular-nums'>
                    {String(active + 1).padStart(2, '0')} /{' '}
                    {String(total).padStart(2, '0')}
                  </span>

                  <div className='flex items-center gap-3'>
                    <button
                      onClick={prev}
                      className='group w-10 h-10 border border-softWhite/10 hover:border-softWhite/30 hover:bg-softWhite/[0.04] transition-all duration-200 flex items-center justify-center rounded-sm'
                    >
                      <span className='text-softWhite/40 group-hover:text-softWhite text-lg select-none transition-colors leading-none'>
                        ‹
                      </span>
                    </button>
                    <button
                      onClick={next}
                      className='group w-10 h-10 border border-softWhite/10 hover:border-mainColor/40 hover:bg-mainColor/[0.05] transition-all duration-200 flex items-center justify-center rounded-sm'
                    >
                      <span className='text-softWhite/40 group-hover:text-mainColor text-lg select-none transition-colors leading-none'>
                        ›
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STRIP ── */}
      <div className='w-full h-px bg-softWhite/10' />
      <div className='flex'>
        <div className='hidden lg:block w-14 flex-shrink-0' />
        <div className='flex-1 px-6 sm:px-10 lg:px-12 py-7 flex items-center justify-end'></div>
      </div>
    </section>
  );
};

export default ActivitiesSlider;
