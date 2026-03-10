'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from 'react';
import { motion } from 'framer-motion';
import { activityImages as originalActivityImages } from './Collection';
import { ActivitiesLogo } from '@/public/Icons';
import { scrollTo } from '@/app/lib/scrollTo';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';
import TextReveal from '@/app/utilities/TextReveal';

/* ─────────────────────────────────────────────────────────────────
   TYPE
───────────────────────────────────────────────────────────────── */
type ActivityItem = (typeof originalActivityImages)[number];

/* ─────────────────────────────────────────────────────────────────
   CAROUSEL SPEED CONSTANTS
   NORMAL_SPEED : px per frame at 60 fps  → ~36 px/s
   SLOW_SPEED   : px per frame on hover   → ~7  px/s
───────────────────────────────────────────────────────────────── */
const NORMAL_SPEED = 0.7;
const SLOW_SPEED = 0.2;
const LERP_FACTOR = 0.045; // smoothness of speed transition

/* ─────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* ─────────────────────────────────────────────────────────────────
   SECTION HEADER 
───────────────────────────────────────────────────────────────── */
const SectionHeader = memo(({ vis }: { vis: boolean }) => (
  <div className='flex flex-col items-center text-center px-6 pt-24 xl:pt-32 pb-16 xl:pb-20'>
    <TextReveal>
      <h2
        className='font-bold text-white leading-[1.02] tracking-[-0.03em] mb-6 xl:mb-8'
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.9s ease 0.08s, transform 0.9s ease 0.08s',
        }}
      >
        Her etkinliğimiz
        <br />
        <MainColorToQuatFont>kendi hikâyesini taşır</MainColorToQuatFont>
      </h2>
    </TextReveal>
  </div>
));
SectionHeader.displayName = 'SectionHeader';

const CarouselCard = memo(
  ({ item, onReserve }: { item: ActivityItem; onReserve: () => void }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <div
        className='shrink-0 w-[72vw] sm:w-[44vw] lg:w-[34vw] xl:w-[28vw] 2xl:w-[24vw] max-w-120'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Visual card ── */}
        <div className='relative rounded-2xl overflow-hidden aspect-4/3 cursor-pointer'>
          {/* Dark base */}
          <div className='absolute inset-0 bg-[#0f0f12]' />

          {/* Glow — pink for upcoming, purple for past */}
          <div
            className={`
              absolute inset-0 transition-opacity duration-700
              ${item.isNew ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255,25,135,0.22) 0%, rgba(194,0,216,0.08) 55%, transparent 75%)',
            }}
          />
          <div
            className={`
              absolute inset-0 transition-opacity duration-700
              ${item.isNew ? 'opacity-0' : 'opacity-100'}
            `}
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(157,0,255,0.2) 0%, rgba(194,0,216,0.07) 55%, transparent 75%)',
            }}
          />

          {/* Subtle grid texture overlay */}
          <div
            className='absolute inset-0 opacity-[0.03]'
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Border ring */}
          <div className='absolute inset-0 rounded-2xl ring-1 ring-white/6 pointer-events-none' />

          {/* ActivitiesLogo — centered */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <ActivitiesLogo
              className={`
                w-32 h-32  md:w-36 md:h-36 xl:w-40 xl:h-40
                transition-all duration-500
                ${hovered ? 'opacity-10 scale-95' : 'opacity-[0.22] scale-100'}
              `}
            />
          </div>

          {/* Hover overlay — darkens card slightly */}
          <div
            className={`
              absolute inset-0 bg-black/30
              transition-opacity duration-400
              ${hovered ? 'opacity-100' : 'opacity-0'}
            `}
          />

          {/* Hover overlay — centered content, conditional on isNew */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-300
              ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
          >
            {item.isNew ? (
              /* ── Upcoming: show Rezervasyon button ── */
              <motion.button
                onClick={onReserve}
                className='
                  cursor-pointer group flex items-center gap-3
                  border rounded-3xl border-[#FBFBFB]/20
                  px-5 py-3 sm:px-6 sm:py-3.5
                  hover:border-[#FF1987]/60
                  bg-black/20 backdrop-blur-sm
                  transition-colors duration-300
                '
                whileTap={{ scale: 0.97 }}
              >
                <span className='text-[#FBFBFB]/75 group-hover:text-[#FBFBFB] uppercase font-bold tracking-[0.25em] transition-colors duration-300 text-[0.6rem]'>
                  Rezervasyon
                </span>
                <svg
                  width='13'
                  height='13'
                  viewBox='0 0 16 16'
                  fill='none'
                  className='text-[#FF1987] translate-x-0 group-hover:translate-x-1 transition-transform duration-300'
                >
                  <path
                    d='M1 8h14M9 2l6 6-6 6'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </motion.button>
            ) : (
              /* ── Past: show "Sona Erdi" pill ── */
              <div
                className='
                  flex items-center gap-2.5
                  border rounded-3xl border-white/10
                  px-5 py-3 sm:px-6 sm:py-3.5
                  bg-black/20 backdrop-blur-sm
                '
              >
                <span className='w-1.5 h-1.5 rounded-full bg-white/25 shrink-0' />
                <span className='text-white/30 uppercase font-bold tracking-[0.25em] text-[0.6rem]'>
                  Sona Erdi
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Metadata below card ── */}
        <div className='mt-3.5 px-0.5'>
          {/* Row 1: description + status */}
          <div className='flex items-start justify-between gap-3'>
            <p className='text-white/80 font-semibold text-sm md:text-[0.95rem] lg:text-[1rem] xl:text-[1.05rem] leading-snug tracking-[-0.01em] line-clamp-1 flex-1'>
              {item.bannerDescription}
            </p>
            {/* Status */}
            <div className='flex items-center gap-1.5 shrink-0 mt-0.5'>
              <span
                className={`w-1.25 h-1.25 rounded-full shrink-0 ${
                  item.isNew ? 'bg-mainColor animate-pulse' : 'bg-white/20'
                }`}
              />
              <span
                className={`text-[0.58rem] md:text-[0.62rem] lg:text-[0.65rem] uppercase tracking-[0.2em] font-semibold ${
                  item.isNew ? 'text-mainColor' : 'text-white/25'
                }`}
              >
                {item.isNew ? 'Yaklaşan' : 'Sona Erdi'}
              </span>
            </div>
          </div>

          {/* Row 2: date */}
          <p className='text-white/35 text-[0.72rem] sm:text-xs md:text-[0.82rem] lg:text-sm tracking-[0.08em] mt-1 font-medium'>
            {item.activityDate}
          </p>
        </div>
      </div>
    );
  },
);
CarouselCard.displayName = 'CarouselCard';

/* ─────────────────────────────────────────────────────────────────
   INFINITE CAROUSEL
   RAF-driven translateX loop.
   • Duplicates items for seamless wrap.
   • Measures actual rendered strip width via ResizeObserver.
   • Lerps speed → silky slow-down on hover.
   • Edge fade masks on both sides.
───────────────────────────────────────────────────────────────── */
const InfiniteCarousel = memo(({ onReserve }: { onReserve: () => void }) => {
  // Duplicate for seamless infinite loop
  const items: ActivityItem[] = [
    ...originalActivityImages,
    ...originalActivityImages,
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mutable refs — no re-renders needed for animation state
  const posRef = useRef(0);
  const speedRef = useRef(NORMAL_SPEED);
  const targetSpeedRef = useRef(NORMAL_SPEED);
  const halfWidthRef = useRef(0);

  // Measure the half-width (= one full set of cards) after mount & on resize
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // RAF animation loop — entirely self-contained so there's no
  // "accessed before declaration" issue and no stale-closure risk.
  // All state is in refs so empty deps array is safe.
  useEffect(() => {
    let raf: number;

    const tick = () => {
      speedRef.current +=
        (targetSpeedRef.current - speedRef.current) * LERP_FACTOR;

      posRef.current += speedRef.current;

      const half = halfWidthRef.current;
      if (half > 0 && posRef.current >= half) {
        posRef.current -= half;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseEnter = useCallback(() => {
    targetSpeedRef.current = SLOW_SPEED;
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetSpeedRef.current = NORMAL_SPEED;
  }, []);

  return (
    <div
      ref={wrapperRef}
      className='relative overflow-hidden py-2'
      style={{ willChange: 'transform', isolation: 'isolate' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Scrolling track */}
      <div
        ref={trackRef}
        className='flex will-change-transform'
        style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}
      >
        {items.map((item, i) => (
          <CarouselCard key={i} item={item} onReserve={onReserve} />
        ))}
      </div>

      {/* ── Left edge fade ── */}
      <div className='pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 xl:w-36 bg-linear-to-r from-(--color-secondaryColor,#0a0a0a) to-transparent z-10' />

      {/* ── Right edge fade ── */}
      <div className='pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 xl:w-36 bg-linear-to-l from-(--color-secondaryColor,#0a0a0a) to-transparent z-10' />
    </div>
  );
});
InfiniteCarousel.displayName = 'InfiniteCarousel';

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const ActivitiesSlider = ({ id }: { id: string }) => {
  const { ref: headerRef, vis: headerVis } = useReveal(0.05);
  const { ref: carouselRef, vis: carouselVis } = useReveal(0.04);

  const handleReserve = useCallback(() => {
    scrollTo('reservation');
  }, []);

  return (
    <section
      id={id}
      className='relative overflow-hidden bg-(--color-secondaryColor,#0a0a0a)'
    >
      {/* Top glow */}
      <div
        className='pointer-events-none absolute top-0 left-0 right-0 h-[60vh]'
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,25,135,0.025) 0%, transparent 70%)',
        }}
      />

      {/* ── HEADER — UNTOUCHED ── */}
      <div ref={headerRef}>
        <SectionHeader vis={headerVis} />
      </div>

      {/* Separator */}
      <div className='w-full h-px bg-linear-to-r from-transparent via-white/[0.07] to-transparent' />

      {/* ── CAROUSEL ── */}
      <div
        ref={carouselRef}
        className='pt-5 pb-24 sm:pb-32'
        style={{
          opacity: carouselVis ? 1 : 0,
          transform: carouselVis ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        <InfiniteCarousel onReserve={handleReserve} />
      </div>
    </section>
  );
};

export default ActivitiesSlider;
