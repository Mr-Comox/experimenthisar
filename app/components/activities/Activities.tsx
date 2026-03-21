'use client';

import { useEffect, useLayoutEffect, useRef, memo } from 'react';
import { activityImages as originalActivityImages } from './Collection';
import { Logo } from '@/public/Icons';

import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';
import { useReveal } from '@/app/utilities/useReveal';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';

type ActivityItem = (typeof originalActivityImages)[number];

/* ─────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────── */

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
const CarouselCard = memo(({ item }: { item: ActivityItem }) => (
  <div className='shrink-0' style={{ width: 'clamp(220px, 38vw, 400px)' }}>
    <div
      className='relative rounded-2xl overflow-hidden'
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
        <Logo
          className='
            w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-44 xl:h-44
            opacity-[0.22]
          '
        />
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
));
CarouselCard.displayName = 'CarouselCard';

/* ─────────────────────────────────────────────────────────────────
   INFINITE CAROUSEL
───────────────────────────────────────────────────────────────── */
const InfiniteCarousel = memo(() => {
  const items: ActivityItem[] = [
    ...originalActivityImages,
    ...originalActivityImages,
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const NORMAL_DURATION = '20s';

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

  return (
    <div
      ref={wrapperRef}
      className='relative overflow-hidden py-2'
      style={{ contain: 'layout paint' }}
    >
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-1 * var(--marquee-dist, 50%)), 0, 0); }
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
          <CarouselCard key={i} item={item} />
        ))}
      </div>

      {/* Edge fades */}
      <div className='pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 xl:w-32 bg-linear-to-r from-(--color-secondaryColor,#0a0a0a) to-transparent z-10' />
      <div className='pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 xl:w-32 bg-linear-to-l from-(--color-secondaryColor,#0a0a0a) to-transparent z-10' />
    </div>
  );
});
InfiniteCarousel.displayName = 'InfiniteCarousel';

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
const ActivitiesSlider = ({ id }: { id: string }) => {
  const { ref: headerRef } = useReveal(0.05);
  const { ref: carouselRef, visible: carouselVis } = useReveal(0.04);

  return (
    <section
      id={id}
      className='relative overflow-hidden bg-(--color-secondaryColor,#0a0a0a) pb-14'
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

      <div className='w-full h-px bg-linear-to-r from-transparent via-white/[0.07] to-transparent' />

      <div
        ref={carouselRef}
        className='pt-5 pb-10 lg:pb-32'
        style={{
          opacity: carouselVis ? 1 : 0,
          transform: carouselVis ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        <InfiniteCarousel />
      </div>
    </section>
  );
};

export default ActivitiesSlider;
