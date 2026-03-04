'use client';

import Image from 'next/image';
import { aboutus } from './Collention';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { LeftLeafletIcon, RightLeafletIcon } from '@/public/Icons';
import AnimatedText from '@/app/utilities/AnimatedText';
import Slider from 'react-slick';
import Timeline from '@/app/utilities/TimeLine';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

/* ─── Constants ─── */
const SLIDER_CONFIG = {
  infinite: true,
  dots: false,
  arrows: false,
  fade: true,
  autoplay: true,
  autoplaySpeed: 4500,
  draggable: false,
  pauseOnHover: false,
  speed: 1800,
  slidesToShow: 1,
  slidesToScroll: 1,
  lazyLoad: 'progressive' as const,
};

const STATS = [
  { value: '60+', label: 'Yıllık Deneyim' },
  { value: '5000+', label: 'Mutlu Misafir' },
  { value: '1000+', label: 'Canlı Performans' },
] as const;

/* ─── Optimized Smooth Parallax Hook ─── */
function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const [offset, setOffset] = useState(0);
  const currentOffset = useRef(0);
  const targetOffset = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateTarget = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      targetOffset.current = center * speed;
    };

    const smoothUpdate = () => {
      currentOffset.current = lerp(
        currentOffset.current,
        targetOffset.current,
        0.15,
      );

      // Only update if difference is significant (reduces repaints)
      if (Math.abs(currentOffset.current - offset) > 0.1) {
        setOffset(currentOffset.current);
      }

      // Continue animating only if we haven't reached target
      if (Math.abs(currentOffset.current - targetOffset.current) > 0.5) {
        rafId.current = requestAnimationFrame(smoothUpdate);
      } else {
        rafId.current = 0;
      }
    };

    const onScroll = () => {
      updateTarget();
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(smoothUpdate);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateTarget();
    currentOffset.current = targetOffset.current;
    setOffset(targetOffset.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [speed]);

  return { ref, offset };
}

/* ─── Sub-components ─── */
const SectionLabel = ({ text }: { text: string }) => (
  <span
    className='text-softWhite/20 text-[9px] tracking-[0.35em] uppercase select-none whitespace-nowrap'
    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
  >
    {text}
  </span>
);

const SectionHeader = ({ title }: { title: string }) => (
  <header className='flex items-center gap-2 mb-1'>
    <LeftLeafletIcon widthSize='9' heightSize='18' />
    <h3 className='text-mainColor uppercase tracking-widest text-[0.65rem] sm:text-xs md:text-sm'>
      {title}
    </h3>
    <RightLeafletIcon widthSize='9' heightSize='18' />
  </header>
);

const ContentBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className='flex flex-col gap-4'>
    <SectionHeader title={title} />
    <p className='text-softWhite/60 text-[0.85rem] sm:text-base md:text-[1.05rem] leading-relaxed text-balance'>
      {children}
    </p>
  </div>
);

const CornerMarks = ({ offset }: { offset: number }) => (
  <div
    className='absolute inset-0 z-0 pointer-events-none'
    style={{
      transform: `translateY(${offset * 0.35}px) translate(12px, 12px)`,
    }}
  >
    <span className='absolute top-0 left-0 w-7 h-7 border-t border-l border-mainColor/30' />
    <span className='absolute top-0 right-0 w-7 h-7 border-t border-r border-mainColor/30' />
    <span className='absolute bottom-0 left-0 w-7 h-7 border-b border-l border-mainColor/30' />
    <span className='absolute bottom-0 right-0 w-7 h-7 border-b border-r border-mainColor/30' />
  </div>
);

const EstablishedBadge = ({ offset }: { offset: number }) => (
  <div
    className='absolute -right-5 z-20 hidden lg:flex flex-col items-center'
    style={{
      top: '50%',
      transform: `translateY(calc(-50% + ${offset * -0.1}px))`,
    }}
  >
    <div className='w-px h-10 bg-gradient-to-b from-transparent to-mainColor/40' />

    <div className='w-px h-10 bg-gradient-to-t from-transparent to-mainColor/40' />
  </div>
);

const ImageSlider = ({
  activeSlide,
  onBeforeChange,
  offset,
}: {
  activeSlide: number;
  onBeforeChange: (_: number, next: number) => void;
  offset: number;
}) => {
  const sliderSettings = useMemo(
    () => ({
      ...SLIDER_CONFIG,
      beforeChange: onBeforeChange,
    }),
    [onBeforeChange],
  );

  return (
    <div className='relative w-full max-w-[480px] lg:max-w-[540px] aspect-[3/4] mx-auto lg:mx-0'>
      <CornerMarks offset={offset} />

      <div
        className='relative w-full h-full overflow-hidden z-10 shadow-2xl shadow-black/70'
        style={{
          transform: `translateY(${offset}px)`,
          willChange: 'transform',
        }}
      >
        <Slider {...sliderSettings}>
          {aboutus.map((item, index) => (
            <figure key={index} className='relative block w-full'>
              <div className='relative w-full aspect-[3/4]'>
                <Image
                  src={item!.img}
                  alt={`Hisar Gazinosu - Slide ${index + 1}`}
                  fill
                  placeholder='blur'
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  quality={index === 0 ? 90 : 75}
                  sizes='(max-width: 768px) 480px, 540px'
                  className='object-cover object-center'
                />
              </div>
              <div className='absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent' />
            </figure>
          ))}
        </Slider>

        <div className='absolute top-5 right-5 z-20'>
          <span className='bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full text-softWhite/70 text-[0.6rem] tracking-[0.25em] uppercase border border-softWhite/10'>
            {aboutus[activeSlide]?.name}
          </span>
        </div>
      </div>

      <EstablishedBadge offset={offset} />
    </div>
  );
};

/* ─── Main Component ─── */
type Props = { id: string };

const AboutUs = ({ id }: Props) => {
  const { ref: heroRef, offset } = useParallax(0.1);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleBeforeChange = useCallback(
    (_: number, next: number) => setActiveSlide(next),
    [],
  );

  return (
    <section
      id={id}
      className='bg-secondaryColor relative max-w-full overflow-hidden'
      aria-labelledby='aboutus-heading'
    >
      {/* ══════════════════════════════════════════
          CONTENT BAND
          ══════════════════════════════════════════ */}
      <div className='relative flex'>
        <div className='hidden lg:flex items-start justify-center w-14 pt-20 flex-shrink-0'>
          <SectionLabel text='Biz Kimiz' />
        </div>

        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-6 sm:px-10 lg:px-12 py-12 sm:py-16 lg:py-20'>
          <ContentBlock title='Atmosfer & Deneyim'>
            Yeni Turistik Hisar Gazinosu, gece hayatının merkezinde konumlanan,
            güçlü geçmişi ve rafine çizgisiyle öne çıkan seçkin bir buluşma
            noktasıdır. Mekânın mimari dili, dengeli ışık kullanımı ve akıcı
            atmosferi, misafirlerini ilk andan itibaren gecenin ritmine dahil
            edecek şekilde kurgulanmıştır. Burada zaman, acele etmeden akar; her
            alan, deneyimin doğal bir parçası olacak biçimde tasarlanmıştır.
          </ContentBlock>

          <ContentBlock title='Sahne & Ruh'>
            Sahne ve mekân arasındaki ilişki, Yeni Hisar Gazinosu'nun
            karakterini belirleyen temel unsurlardan biridir. Işık, ses ve sahne
            yerleşimi; gösterinin değil, atmosferin ön planda olduğu bir
            dengeyle ele alınır. 1964'ten bu yana süregelen bu yaklaşım,
            gazinoyu dönemler üstü bir sahne kültürünün temsilcisi hâline
            getirmiştir.
          </ContentBlock>
        </div>
      </div>

      <div className='w-full h-px bg-softWhite/10' />

      {/* ══════════════════════════════════════════
          HISTORY BAND
          ══════════════════════════════════════════ */}
      <div className='relative flex'>
        <div className='hidden lg:flex items-start justify-center w-14 pt-16 flex-shrink-0'>
          <SectionLabel text='Tarihçe' />
        </div>

        <div className='flex-1 px-6 sm:px-10 lg:px-12 py-12 sm:py-16'>
          <header className='flex flex-col gap-3 mb-10'>
            <SectionHeader title='Yıllar içinde Yeni Hisar' />
            <p className='text-softWhite/60 text-[0.85rem] sm:text-base md:text-[1.05rem] leading-relaxed w-full'>
              Canlı performanslar ve özenle oluşturulan sahne programları, Yeni
              Hisar Gazinosu'nun yalnızca bugünü değil, geçmişten bugüne uzanan
              duruşunu da tanımlar. Yıllar boyunca birçok değerli sanatçının
              sahne aldığı bu mekân, sahneye yaklaşımını her zaman seçicilik ve
              saygı üzerine kurmuştur.
              <br />
              <br />
              Müzik burada yüksek sesle değil, doğru dengeyle var olur. Akustik
              yapıdan sahne diline kadar her unsur, izleyiciyi yormayan ama
              içine çeken bir bütünlük yaratır. Programlar plansız değil, özenle
              kürate edilmiş bir akışla sunulur; her gece kendi temposunu ve
              atmosferini taşır.
              <br />
              <br />
              Hizmet anlayışı ise görünür olmaktan çok hissedilen bir zarafet
              üzerine kuruludur. Profesyonellik, sakin bir dikkatle birleşir;
              güvenlik ve konfor mekânın doğal düzeni içinde kusursuzca işler.
              Hisar Gazinosu'nda geceler gösterişli olmak zorunda değildir;
              kalitesiyle hatırlanması yeterlidir.
            </p>
          </header>

          <Timeline />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO ROW — REDESIGNED
          ══════════════════════════════════════════ */}
      <div
        ref={heroRef}
        className='relative flex flex-col lg:flex-row min-h-[90vh] overflow-hidden'
      >
        {/* Refined ambient glow */}
        <div
          className='pointer-events-none absolute inset-0 z-0'
          style={{
            background:
              'radial-gradient(ellipse 45% 55% at 25% 50%, rgba(var(--color-main-rgb, 180,140,80), 0.04) 0%, transparent 65%)',
          }}
        />

        {/* ════════════════════════
            LEFT — Refined image
            ════════════════════════ */}
        <div className='relative w-full lg:w-[45%] flex-shrink-0 flex items-center justify-center py-20 lg:py-28 px-6 lg:px-10 z-10'>
          <ImageSlider
            activeSlide={activeSlide}
            onBeforeChange={handleBeforeChange}
            offset={offset}
          />
        </div>

        {/* ════════════════════════
            RIGHT — Elegant content
            ════════════════════════ */}
        <div
          className='relative flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-20 xl:px-24 pb-20 lg:pb-0 z-10'
          style={{
            transform: `translateY(${offset * -0.08}px)`,
          }}
        >
          {/* Elegant eyebrow with refined spacing */}
          <div className='flex items-center gap-2.5 mb-8'>
            <div className='w-12 h-px bg-gradient-to-r from-mainColor/40 to-transparent' />
            <span className='text-mainColor/90 uppercase tracking-[0.35em] text-[0.55rem] sm:text-[0.6rem] font-light'>
              1964'ten bu yana
            </span>
          </div>

          {/* Main heading with refined typography */}
          <h2
            id='aboutus-heading'
            className='text-softWhite font-serif text-[2.2rem] xs:text-[2.6rem] sm:text-[3rem] md:text-[3.6rem] lg:text-[4rem] xl:text-[4.6rem] leading-[1.1] tracking-tight max-w-[580px] mb-6'
          >
            <AnimatedText text='Eğlencenin, müziğin ve gecenin tam ortasında bir sahne.' />
          </h2>

          {/* Refined divider */}
          <div className='mb-12 flex items-center gap-4 max-w-[280px]'>
            <div className='flex-1 h-px bg-gradient-to-r from-mainColor/30 via-mainColor/10 to-transparent' />
            <div className='flex items-center gap-1'>
              <span
                className='block w-1 h-1 rounded-full'
                style={{
                  background: 'var(--color-main, #FF1987)',
                  opacity: 0.5,
                }}
              />
              <span
                className='block w-1.5 h-1.5 rounded-full'
                style={{
                  background: 'var(--color-main, #FF1987)',
                  opacity: 0.7,
                }}
              />
              <span
                className='block w-1 h-1 rounded-full'
                style={{
                  background: 'var(--color-main, #FF1987)',
                  opacity: 0.5,
                }}
              />
            </div>
            <div className='flex-1 h-px bg-gradient-to-l from-mainColor/30 via-mainColor/10 to-transparent' />
          </div>

          {/* Elegant stats grid */}
          <div className='grid grid-cols-3 gap-8 sm:gap-12 max-w-[600px]'>
            {STATS.map((stat) => (
              <div key={stat.label} className='relative group'>
                {/* Stat content */}
                <div className='flex flex-col gap-2'>
                  <span className='text-softWhite font-serif text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] leading-none tracking-tight'>
                    {stat.value}
                  </span>
                  <span className='text-softWhite/40 text-[0.58rem] sm:text-[0.62rem] tracking-[0.25em] uppercase font-light leading-tight'>
                    {stat.label}
                  </span>
                </div>

                {/* Subtle hover accent */}
                <div className='absolute -bottom-3 left-0 w-8 h-px bg-mainColor/0 group-hover:bg-mainColor/40 transition-all duration-500' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
