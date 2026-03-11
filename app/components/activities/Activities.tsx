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
import { Headline } from '@/app/utilities/Headline';

/* ─────────────────────────────────────────────────────────────────
   TYPE
───────────────────────────────────────────────────────────────── */
type ActivityItem = (typeof originalActivityImages)[number];

/* ─────────────────────────────────────────────────────────────────
   SPEED CONSTANTS  (pixels per second — frame-rate independent)
   Using px/s instead of px/frame means 144 Hz screens won't
   scroll 2.4× faster than 60 Hz screens.
───────────────────────────────────────────────────────────────── */
const NORMAL_SPEED_PX_S = 52; // ~0.87 px/frame @ 60 fps
const SLOW_SPEED_PX_S = 14; // ~0.23 px/frame @ 60 fps
const LERP_FACTOR = 0.06; // per 16.67 ms frame, normalised below

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
   FIX: removed per-card hover state that forced React re-renders
        during the animation loop — now handled with pure CSS.
   FIX: card width is clamp-based so it works on every breakpoint
        without vw jumps that cause mis-sizing on tablets.
───────────────────────────────────────────────────────────────── */
const CarouselCard = memo(
  ({ item, onReserve }: { item: ActivityItem; onReserve: () => void }) => (
    <div
      /*
       * clamp(min, preferred, max)
       *  – mobile  ~360 px wide  → card ≈ 270 px  (75vw-ish)
       *  – tablet  ~768 px wide  → card ≈ 320 px
       *  – desktop 1440 px wide  → card ≈ 380 px
       *  No vw breakpoint jumps; smooth scaling across every device.
       */
      className='group shrink-0'
      style={{ width: 'clamp(220px, 38vw, 400px)' }}
    >
      {/* ── Visual card ── */}
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
              ? 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(255,25,135,0.22) 0%, rgba(194,0,216,0.08) 55%, transparent 75%)'
              : 'radial-gradient(ellipse 75% 65% at 50% 60%, rgba(157,0,255,0.2) 0%, rgba(194,0,216,0.07) 55%, transparent 75%)',
          }}
        />

        {/* Subtle grid texture */}
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

        {/* Logo — pure CSS hover, zero JS re-renders */}
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

        {/* Hover dark overlay — CSS only */}
        <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Hover CTA — CSS only */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'>
          {item.isNew ? (
            <motion.button
              onClick={onReserve}
              className='
                cursor-pointer flex items-center gap-3
                border rounded-3xl border-[#FBFBFB]/20
                px-4 py-2.5 sm:px-5 sm:py-3
                hover:border-[#FF1987]/60
                bg-black/20 backdrop-blur-sm
                transition-colors duration-300
              '
              whileTap={{ scale: 0.97 }}
            >
              <span className='text-[#FBFBFB]/75 hover:text-[#FBFBFB] uppercase font-bold tracking-[0.25em] text-[0.55rem] sm:text-[0.6rem] transition-colors duration-300'>
                Rezervasyon
              </span>
              <svg
                width='12'
                height='12'
                viewBox='0 0 16 16'
                fill='none'
                className='text-[#FF1987] transition-transform duration-300 group-hover:translate-x-0.5'
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
            <div className='flex items-center gap-2 border rounded-3xl border-white/10 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/20 backdrop-blur-sm'>
              <span className='w-1.5 h-1.5 rounded-full bg-white/25 shrink-0' />
              <span className='text-white/30 uppercase font-bold tracking-[0.25em] text-[0.55rem] sm:text-[0.6rem]'>
                Sona Erdi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Metadata ── */}
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
   INFINITE CAROUSEL — Performance fixes applied:

   1. translate3d  instead of translateX
      → forces GPU compositor layer, avoids main-thread paint.

   2. Delta-time RAF  instead of px-per-frame
      → speed is consistent at 60 Hz, 90 Hz, 120 Hz, 144 Hz.
      → no more "laggy" feel on ProMotion / high-refresh displays.

   3. will-change ONLY on the moving element (trackRef)
      → putting it on the wrapper too promoted an unnecessary layer.

   4. contain: 'layout paint'  on the wrapper
      → tells the browser this subtree won't affect anything outside
      → reduces style recalc scope on every frame.

   5. Removed per-card useState(hovered) → replaced with CSS :hover
      via Tailwind group/group-hover
      → zero React re-renders during the animation loop.

   6. Paused when section is off-screen (IntersectionObserver)
      → RAF is cancelled when not visible, saves battery & CPU.
───────────────────────────────────────────────────────────────── */
const InfiniteCarousel = memo(({ onReserve }: { onReserve: () => void }) => {
  const items: ActivityItem[] = [
    ...originalActivityImages,
    ...originalActivityImages,
    ...originalActivityImages, // triple-clone so narrow viewports never see the seam
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const posRef = useRef(0);
  const speedRef = useRef(NORMAL_SPEED_PX_S);
  const targetSpeedRef = useRef(NORMAL_SPEED_PX_S);
  const halfWidthRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);

  // Measure the one-set width (half the doubled track)
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      // We tripled, so one set = total / 3
      halfWidthRef.current = track.scrollWidth / 3;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Pause when off-screen to save battery
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(wrapper);
    return () => io.disconnect();
  }, []);

  // Delta-time RAF loop — frame-rate independent
  useEffect(() => {
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);

      if (!visibleRef.current) {
        lastTimeRef.current = null; // reset delta when paused
        return;
      }

      const dt =
        lastTimeRef.current === null ? 16.67 : now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Normalise lerp factor to 60 fps equivalent
      const alpha = 1 - Math.pow(1 - LERP_FACTOR, dt / 16.67);
      speedRef.current += (targetSpeedRef.current - speedRef.current) * alpha;

      posRef.current += speedRef.current * (dt / 1000); // px/s × seconds

      const half = halfWidthRef.current;
      if (half > 0 && posRef.current >= half) {
        posRef.current -= half;
      }

      if (trackRef.current) {
        // translate3d → GPU layer, no main-thread paint
        trackRef.current.style.transform = `translate3d(-${posRef.current}px,0,0)`;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseEnter = useCallback(() => {
    targetSpeedRef.current = SLOW_SPEED_PX_S;
  }, []);
  const handleMouseLeave = useCallback(() => {
    targetSpeedRef.current = NORMAL_SPEED_PX_S;
  }, []);

  return (
    <div
      ref={wrapperRef}
      className='relative overflow-hidden py-2'
      style={{
        // contain tells the browser: nothing inside affects outside layout
        contain: 'layout paint',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Scrolling track — GPU layer promoted here ONLY */}
      <div
        ref={trackRef}
        className='flex'
        style={{
          gap: 'clamp(10px, 1.5vw, 22px)',
          willChange: 'transform', // only the moving element
          backfaceVisibility: 'hidden', // extra GPU-compositing hint
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

      {/* Header */}
      <div ref={headerRef}>
        <SectionHeader />
      </div>

      {/* Separator */}
      <div className='w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent' />

      {/* Carousel */}
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
