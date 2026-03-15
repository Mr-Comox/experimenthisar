'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  memo,
  useCallback,
  useState,
} from 'react';
import { activityImages as originalActivityImages } from './Collection';
import { ActivitiesLogo } from '@/public/Icons';
import { scrollTo } from '@/app/lib/scrollTo';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';

type ActivityItem = (typeof originalActivityImages)[number];

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
const SectionHeader = memo(() => (
  <div className='flex flex-col items-center text-center px-4 sm:px-6 pt-16 sm:pt-20 xl:pt-32 pb-10 sm:pb-14 xl:pb-20'>
    <TextReveal>
      <Headline>
        Her etkinlik ayrı
        <br />
        <MainColorToQuatFont> bir hikâye</MainColorToQuatFont>
      </Headline>
    </TextReveal>
  </div>
));
SectionHeader.displayName = 'SectionHeader';

/* ─────────────────────────────────────────────────────────────────
   CAROUSEL CARD
───────────────────────────────────────────────────────────────── */
const CarouselCard = memo(
  ({ item, onReserve }: { item: ActivityItem; onReserve: () => void }) => (
    <div
      className='group shrink-0'
      style={{ width: 'clamp(220px, 38vw, 400px)' }}
    >
      <div
        className='relative rounded-2xl overflow-hidden cursor-pointer'
        style={{ aspectRatio: '4/3' }}
      >
        {/* Dark base */}
        <div className='absolute inset-0 bg-[#0f0f12]' />

        {/* Glow */}
        <div
          className='absolute inset-0'
          style={{
            background: item.isNew
              ? 'radial-gradient(ellipse 70% 60% at 50% 65%, rgba(255,25,135,0.18) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 70% 60% at 50% 65%, rgba(157,0,255,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Border ring */}
        <div className='absolute inset-0 rounded-2xl ring-1 ring-white/6 pointer-events-none' />

        {/* Logo */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <ActivitiesLogo
            className='
              w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-44 xl:h-44
              opacity-[0.22] scale-100
              group-hover:opacity-10 group-hover:scale-95
              transition-all duration-500
            '
          />
        </div>

        {/* Hover overlay — carousel-overlay for touch media query */}
        <div className='carousel-overlay absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Hover CTA — carousel-cta for touch media query */}
        <div className='carousel-cta absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'>
          {item.isNew ? (
            <button
              onClick={onReserve}
              className='
                cursor-pointer flex items-center gap-3
                border rounded-3xl border-[#FBFBFB]/20
                px-4 py-2.5 sm:px-5 sm:py-3
                hover:border-[#FF1987]/60
                bg-black/50
                transition-colors duration-300
                active:scale-95
              '
            >
              <span className='text-[#FBFBFB]/75 uppercase font-bold tracking-[0.25em] text-[0.55rem] sm:text-[0.6rem]'>
                Rezervasyon
              </span>
              <svg
                width='12'
                height='12'
                viewBox='0 0 16 16'
                fill='none'
                className='text-[#FF1987]'
              >
                <path
                  d='M1 8h14M9 2l6 6-6 6'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          ) : (
            <div className='flex items-center gap-2 border rounded-3xl border-white/10 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50'>
              <span className='w-1.5 h-1.5 rounded-full bg-white/25 shrink-0' />
              <span className='text-white/30 uppercase font-bold tracking-[0.25em] text-[0.55rem] sm:text-[0.6rem]'>
                Sona Erdi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className='mt-3 px-0.5'>
        <div className='flex items-start justify-between gap-2'>
          <p className='text-white/80 font-semibold text-xs sm:text-sm md:text-[0.95rem] leading-snug tracking-[-0.01em] line-clamp-1 flex-1'>
            {item.bannerDescription}
          </p>
          <div className='flex items-center gap-1.5 shrink-0 mt-0.5'>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                item.isNew ? 'bg-mainColor animate-pulse' : 'bg-white/20'
              }`}
            />
            <span
              className={`text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.18em] font-semibold ${
                item.isNew ? 'text-mainColor' : 'text-white/25'
              }`}
            >
              {item.isNew ? 'Yaklaşan' : 'Sona Erdi'}
            </span>
          </div>
        </div>
        <p className='text-white/35 text-[0.68rem] sm:text-xs md:text-[0.82rem] tracking-[0.08em] mt-1 font-medium'>
          {item.activityDate}
        </p>
      </div>
    </div>
  ),
);
CarouselCard.displayName = 'CarouselCard';

/* ─────────────────────────────────────────────────────────────────
   INFINITE CAROUSEL
───────────────────────────────────────────────────────────────── */
const InfiniteCarousel = memo(({ onReserve }: { onReserve: () => void }) => {
  const items: ActivityItem[] = [
    ...originalActivityImages,
    ...originalActivityImages,
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const NORMAL_DURATION = '50s';

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const setWidth = track.scrollWidth / 2;
      track.style.setProperty('--marquee-dist', `${setWidth}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Pause when off-screen
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;
    const io = new IntersectionObserver(
      ([e]) => {
        track.style.animationPlayState = e.isIntersecting
          ? 'running'
          : 'paused';
      },
      { threshold: 0 },
    );
    io.observe(wrapper);
    return () => io.disconnect();
  }, []);

  // Pause on hover — card stays under cursor, no drift
  const handleMouseEnter = useCallback(() => {
    if (trackRef.current) trackRef.current.style.animationPlayState = 'paused';
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (trackRef.current) trackRef.current.style.animationPlayState = 'running';
  }, []);

  return (
    <div
      ref={wrapperRef}
      className='relative overflow-hidden py-2'
      style={{ contain: 'layout paint' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-1 * var(--marquee-dist, 50%)), 0, 0); }
        }

        /* Touch devices: CTA always visible, no hover needed */
        @media (hover: none) {
          .carousel-overlay {
            opacity: 1 !important;
          }
          .carousel-cta {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        }
      `}</style>

      <div
        ref={trackRef}
        className='flex'
        style={{
          gap: 'clamp(10px, 1.5vw, 22px)',
          animation: `marquee-scroll ${NORMAL_DURATION} linear infinite`,
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => (
          <CarouselCard key={i} item={item} onReserve={onReserve} />
        ))}
      </div>

      {/* Edge fades */}
      <div className='pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 xl:w-32 bg-gradient-to-r from-[var(--color-secondaryColor,#0a0a0a)] to-transparent z-10' />
      <div className='pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 xl:w-32 bg-gradient-to-l from-[var(--color-secondaryColor,#0a0a0a)] to-transparent z-10' />
    </div>
  );
});
InfiniteCarousel.displayName = 'InfiniteCarousel';

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const ActivitiesSlider = ({ id }: { id: string }) => {
  const { ref: headerRef } = useReveal(0.05);
  const { ref: carouselRef, vis: carouselVis } = useReveal(0.04);

  const handleReserve = useCallback(() => {
    scrollTo('reservation');
  }, []);

  return (
    <section
      id={id}
      className='relative overflow-hidden bg-[var(--color-secondaryColor,#0a0a0a)]'
    >
      {/* Top glow */}
      <div
        className='pointer-events-none absolute top-0 left-0 right-0 h-[50vh]'
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,25,135,0.025) 0%, transparent 70%)',
        }}
      />

      <div ref={headerRef}>
        <SectionHeader />
      </div>

      <div className='w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent' />

      <div
        ref={carouselRef}
        className='pt-5 pb-16 sm:pb-24 xl:pb-32'
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
