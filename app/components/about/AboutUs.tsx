'use client';

import React, { useRef, useEffect, useState } from 'react';
import AnimatedCounter from '@/app/utilities/AnimatedCounter';
import Timeline from './TimeLine';
import TextReveal from '@/app/utilities/TextReveal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  GoldToAmberFont,
  MainColorToQuatFont,
} from '@/app/utilities/LinearFontColors';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
type Props = { id: string };

const STATS = [
  { value: '800+', label: 'Etkinlik' },
  { value: '20000+', label: 'Mutlu Misafir' },
  { value: '7000+', label: 'Canlı Performans' },
] as const;

const PILLARS = [
  {
    icon: (
      <svg viewBox='0 0 32 32' fill='none' width='28' height='28'>
        <path
          d='M16 3L4 8v8c0 7.18 5.16 13.9 12 15.5C22.84 29.9 28 23.18 28 16V8L16 3z'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinejoin='round'
        />
        <path
          d='M11 16l3.5 3.5L21 12'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    label: 'Profesyonel Güvenlik Ekibi',
    text: 'Uzman ve deneyimli güvenlik personelimiz, kapıdan sahneye kadar mekânın tamamını kesintisiz olarak denetler. Her ekip üyesi kriz yönetimi ve kalabalık kontrolü konusunda özel eğitim almıştır.',
  },
  {
    icon: (
      <svg viewBox='0 0 32 32' fill='none' width='28' height='28'>
        <circle cx='16' cy='16' r='5' stroke='currentColor' strokeWidth='1.6' />
        <circle
          cx='16'
          cy='16'
          r='12'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeDasharray='3 2'
        />
        <path
          d='M16 4v4M16 24v4M4 16h4M24 16h4'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
        />
      </svg>
    ),
    label: 'Kamera & Gözetim Sistemi',
    text: '360° kapsama alanına sahip yüksek çözünürlüklü kamera altyapımız, mekânın her noktasını anlık olarak izler. Kayıtlar güvenli sunucularda saklanır; yalnızca yetkili personel erişebilir.',
  },
  {
    icon: (
      <svg viewBox='0 0 32 32' fill='none' width='28' height='28'>
        <path
          d='M8 12h16M8 16h10'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
        />
        <rect
          x='4'
          y='6'
          width='24'
          height='20'
          rx='3'
          stroke='currentColor'
          strokeWidth='1.6'
        />
        <path
          d='M20 20l4 4'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
        />
      </svg>
    ),
    label: 'Metal Dedektörü & Arama',
    text: 'Tüm misafirler sistematik arama prosedüründen geçer. El dedektörleri ve kapı tipi sistemlerimiz, yasaklı madde ya da nesne girişini engeller. Güvenlik, konforla birlikte sağlanır.',
  },
  {
    icon: (
      <svg viewBox='0 0 32 32' fill='none' width='28' height='28'>
        <path
          d='M16 4v6M16 22v6M4 16h6M22 16h6'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
        />
        <circle cx='16' cy='16' r='6' stroke='currentColor' strokeWidth='1.6' />
        <path
          d='M16 13v4l2.5 2.5'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    label: 'Acil Durum Prosedürleri',
    text: 'Tahliye planları, ilk yardım ekibi ve doğrudan bağlantılı acil servis koordinasyonu; olası her senaryoya karşı her zaman tam teşekküllü hazırlıklı olmamızı sağlar.',
  },
];

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const Headline = ({
  children,
  center = false,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <h2
    className={`text-white font-bold leading-[1.05] tracking-[-0.025em] ${center ? 'text-center mx-auto' : ''} ${className}`}
    style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', ...style }}
  >
    {children}
  </h2>
);

const Body = ({
  children,
  center = false,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <p
    className={`text-white/55 leading-[1.72] ${center ? 'text-center mx-auto' : ''} ${className}`}
    style={{ fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)', ...style }}
  >
    {children}
  </p>
);

/* ─────────────────────────────────────────────────────────────────
   ATMOSPHERE SECTION
   TextReveal on: Headline, Body
───────────────────────────────────────────────────────────────── */
const AtmosphereSection = () => {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className='px-6 sm:px-12 lg:px-24 xl:px-32 py-24 lg:py-36'
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(40px)',
        transition:
          'opacity 1s cubic-bezier(0.25,0.46,0.45,0.94), transform 1s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      <div className='max-w-5xl mb-20'>
        {/* ── TextReveal: Headline ── */}
        <TextReveal delay={0}>
          <Headline className='mb-8 max-w-[14ch]'>
            Sözler yankılanır{'\n'}
            <MainColorToQuatFont>gecede iz bırakır</MainColorToQuatFont>
          </Headline>
        </TextReveal>

        {/* ── TextReveal: Body ── */}
        <TextReveal delay={0.15}>
          <Body className='max-w-2xl'>
            Yeni Turistik Hisar Gazinosu, gece hayatının merkezinde konumlanan,
            güçlü geçmişi ve rafine çizgisiyle öne çıkan seçkin bir buluşma
            noktasıdır. 1964&apos;ten bu yana süregelen bu yaklaşım, gazinoyu
            dönemler üstü bir sahne kültürünün temsilcisi hâline getirmiştir.
          </Body>
        </TextReveal>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-x-20 md:gap-x-12 xl:gap-x-24 gap-y-0'>
        {[
          {
            label: 'Atmosfer & Deneyim',
            text: 'Mekânın mimari dili, dengeli ışık kullanımı ve akıcı atmosferi, misafirlerini ilk andan itibaren gecenin ritmine dahil edecek şekilde kurgulanmıştır. Burada zaman, acele etmeden akar; her alan, deneyimin doğal bir parçası olacak biçimde tasarlanmıştır.',
          },
          {
            label: 'Işık & Ruh',
            text: 'Işık, ses ve sahne yerleşimi; gösterinin değil, atmosferin ön planda olduğu bir dengeyle ele alınır. Müzik burada yüksek sesle değil, doğru dengeyle var olur. Programlar plansız değil, özenle kürate edilmiş bir akışla sunulur.',
          },
          {
            label: 'Güvenlik & Konfor',
            text: 'Profesyonel ekip, akışın doğallığını bozmadan süreci yönetir; Alan yerleşimi, yoğunluk dengesi ve operasyonel disiplin; gecenin keyfini kesintiye uğratmadan koruyan bir sistem içinde ilerler. Burada özgürlük, güvenle birlikte var olur.',
          },
        ].map((block, i) => (
          <div
            key={block.label}
            className='py-10 md:py-12 border-t border-white/10'
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(24px)',
              transition: `opacity 1s cubic-bezier(0.25,0.46,0.45,0.94) ${200 + i * 150}ms, transform 1s cubic-bezier(0.25,0.46,0.45,0.94) ${200 + i * 150}ms`,
            }}
          >
            <TextReveal>
              <p
                className='text-white font-semibold mb-4'
                style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.3125rem)' }}
              >
                {block.label}
              </p>
            </TextReveal>
            <TextReveal delay={0.14}>
              <Body>{block.text}</Body>
            </TextReveal>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   HISTORY SECTION
   TextReveal on: Headline, Body
───────────────────────────────────────────────────────────────── */
const HistorySection = () => {
  const { ref, visible } = useReveal(0.08);
  return (
    <div className='relative overflow-hidden'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,25,135,0.08) 0%, transparent 65%)',
        }}
      />
      <div
        ref={ref}
        className='relative px-6 sm:px-12 lg:px-24 xl:px-32 pt-24 lg:pt-36 pb-16 lg:pb-24'
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(40px)',
          transition:
            'opacity 1s cubic-bezier(0.25,0.46,0.45,0.94), transform 1s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        <div className='text-center max-w-4xl mx-auto mb-24'>
          {/* ── TextReveal: Headline ── */}
          <TextReveal delay={0}>
            <Headline center className='mb-8 max-w-3xl'>
              Nesiller boyu bir{' '}
              <MainColorToQuatFont> sahne mirası.</MainColorToQuatFont>
            </Headline>
          </TextReveal>

          {/* ── TextReveal: Body ── */}
          <TextReveal delay={0.15}>
            <Body center className='max-w-2xl'>
              Canlı performanslar ve özenle oluşturulan sahne programları, Yeni
              Hisar Gazinosu&apos;nun yalnızca bugünü değil, geçmişten bugüne
              uzanan duruşunu da tanımlar. Yıllar boyunca birçok değerli
              sanatçının sahne aldığı bu mekân, sahneye yaklaşımını her zaman
              seçicilik ve saygı üzerine kurmuştur.
            </Body>
          </TextReveal>
        </div>
        <Timeline />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   STATS SECTION
   TextReveal on: Headline, Body
   Note: removed opacity/transform from Headline & Body styles
         since TextReveal owns the entrance animation for them.
───────────────────────────────────────────────────────────────── */
const StatsSection = () => {
  const { ref, visible } = useReveal(0.24);
  return (
    <div className='px-6 sm:px-12 lg:px-24 xl:px-32 py-24 lg:py-32 border-t border-white/[0.07]'>
      <div ref={ref}>
        <div className='max-w-3xl mb-10 mt-20'>
          {/* ── TextReveal: Headline ── */}
          <TextReveal delay={0}>
            <Headline
              className='mb-6'
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
            >
              Rakamlarla <GoldToAmberFont> Yeni Hisar.</GoldToAmberFont>
            </Headline>
          </TextReveal>

          {/* ── TextReveal: Body ── */}
          <TextReveal delay={0.15}>
            <Body style={{ fontSize: 'clamp(1rem, 1.6vw, 1.0625rem)' }}>
              60 yılı aşan geçmişimiz, binlerce misafirimiz ve yüzlerce sahne
              gecesiyle şekillenen bir deneyim birikimi.
            </Body>
          </TextReveal>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 lg:gap-x-14 xl:gap-x-16 lg:text-center gap-y-20 py-16'>
          {STATS.map((stat, i) => {
            const numericValue = parseInt(stat.value.replace(/\D/g, ''), 10);
            const suffix = stat.value.replace(/[0-9]/g, '');
            return (
              <div
                key={stat.label}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(24px)',
                  transition: `opacity 0.9s ease ${200 + i * 100}ms, transform 0.9s ease ${200 + i * 100}ms`,
                }}
              >
                <AnimatedCounter
                  value={numericValue}
                  suffix={suffix}
                  duration={1800}
                  play={visible}
                  className='font-bold leading-none mb-3 tracking-[-0.03em]'
                  style={{
                    fontSize: 'clamp(3.5rem, 5.5vw, 5.1rem)',
                    background:
                      'linear-gradient(135deg, #b8860b 0%, #ffd700 30%, #ff8c00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                  }}
                />
                <p
                  className='text-white/70'
                  style={{ fontSize: 'clamp(1rem, 1.4vw, 1.3rem)' }}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ShieldVisual = ({ visible }: { visible: boolean }) => (
  <div
    className='relative flex items-center justify-center mx-auto'
    style={{
      width: 'clamp(180px, 22vw, 280px)',
      height: 'clamp(180px, 22vw, 280px)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.82)',
      transition:
        'opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s, transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s',
    }}
  >
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className='absolute rounded-full border border-white/6'
        style={{
          width: `${60 + i * 22}%`,
          height: `${60 + i * 22}%`,
          animation: `pulse-ring 3.5s ease-in-out ${i * 0.6}s infinite`,
        }}
      />
    ))}
    <div
      className='absolute inset-0 rounded-full'
      style={{
        background:
          'radial-gradient(circle at 50% 45%, rgba(255,25,135,0.18) 0%, transparent 70%)',
      }}
    />
    <svg
      viewBox='0 0 120 140'
      fill='none'
      style={{
        width: '52%',
        filter:
          'drop-shadow(0 0 18px rgba(255,25,135,0.55)) drop-shadow(0 0 40px rgba(255,25,135,0.2))',
      }}
    >
      <path
        d='M60 6L12 26v38c0 28.6 20.5 55.4 48 62 27.5-6.6 48-33.4 48-62V26L60 6z'
        stroke='url(#sg1)'
        strokeWidth='2.5'
        fill='url(#sf1)'
        strokeLinejoin='round'
      />
      <path
        d='M60 20L26 36v28c0 21 15 40.7 34 45.6C79 104.7 94 85 94 64V36L60 20z'
        stroke='rgba(255,255,255,0.12)'
        strokeWidth='1'
        fill='rgba(255,255,255,0.03)'
        strokeLinejoin='round'
      />
      <path
        d='M42 68l12 13 24-22'
        stroke='white'
        strokeWidth='4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <defs>
        <linearGradient
          id='sg1'
          x1='12'
          y1='6'
          x2='108'
          y2='134'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#ff1987' />
          <stop offset='0.5' stopColor='#ff6ec7' />
          <stop offset='1' stopColor='#b8860b' />
        </linearGradient>
        <linearGradient
          id='sf1'
          x1='12'
          y1='6'
          x2='108'
          y2='134'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#ff1987' stopOpacity='0.12' />
          <stop offset='1' stopColor='#b8860b' stopOpacity='0.06' />
        </linearGradient>
      </defs>
    </svg>
    <style>{`@keyframes pulse-ring { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:0.15; transform:scale(1.06); } }`}</style>
  </div>
);

const HEADLINE_LINE1 = 'Eğlenceniz için';
const HEADLINE_LINE2 = 'maksimum güvenlik.';

/* ─────────────────────────────────────────────────────────────────
   SECURITY SECTION
   TextReveal on: Body only
   The h2 has its own custom decode animation — left untouched.
───────────────────────────────────────────────────────────────── */
const SecuritySection = () => {
  const { ref, visible } = useReveal(0.08);

  const l1BaseRef = useRef<HTMLDivElement>(null);
  const l1AnimRef = useRef<HTMLDivElement>(null);
  const l2BaseRef = useRef<HTMLDivElement>(null);
  const l2AnimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const l1Base = l1BaseRef.current;
    const l1Anim = l1AnimRef.current;
    const l2Base = l2BaseRef.current;
    const l2Anim = l2AnimRef.current;
    if (!l1Base || !l1Anim || !l2Base || !l2Anim) return;

    const chars1 = HEADLINE_LINE1.split('');
    const dots1 = chars1.map((c) => (c === ' ' ? '\u00a0' : '·'));
    const chars2 = HEADLINE_LINE2.split('');
    const dots2 = chars2.map((c) => (c === ' ' ? '\u00a0' : '·'));
    const total = chars1.length + chars2.length;

    l1Anim.textContent = dots1.join('');
    l2Anim.innerHTML = dots2.join('');

    const st = ScrollTrigger.create({
      trigger: l1Base,
      start: 'top 80%',
      end: 'top 30%',
      onUpdate: (self) => {
        const offset = Math.round(self.progress * total);

        const o1 = Math.min(offset, chars1.length);
        l1Anim.textContent =
          chars1.slice(0, o1).join('') + dots1.slice(o1).join('');

        const o2 = Math.max(0, offset - chars1.length);
        const revealed = chars2.slice(0, o2).join('');
        const remain = dots2.slice(o2).join('');
        l2Anim.innerHTML = revealed
          ? `<span style="background:linear-gradient(135deg,#ff1987 0%,#ff6ec7 50%,#b8860b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${revealed}</span>${remain}`
          : remain;
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div className='relative overflow-hidden'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(255,25,135,0.09) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(184,134,11,0.06) 0%, transparent 55%)',
        }}
      />
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.025]'
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        ref={ref}
        className='relative px-6 sm:px-12 lg:px-24 xl:px-32 pt-24 lg:pt-36 pb-24 lg:pb-32'
      >
        <div
          className='flex flex-col lg:flex-row items-center lg:items-start gap-14 lg:gap-20 mb-24'
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(40px)',
            transition:
              'opacity 1s cubic-bezier(0.25,0.46,0.45,0.94), transform 1s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          <ShieldVisual visible={visible} />
          <div className='flex-1 lg:pt-6'>
            {/* ── Custom decode headline — untouched ── */}
            <h2
              className='text-white font-bold leading-[1.05] tracking-[-0.025em] mb-8'
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
            >
              <div style={{ position: 'relative', display: 'block' }}>
                <div
                  ref={l1BaseRef}
                  style={{ opacity: 0, whiteSpace: 'nowrap' }}
                >
                  {HEADLINE_LINE1}
                </div>
                <div
                  ref={l1AnimRef}
                  aria-hidden='true'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    whiteSpace: 'nowrap',
                  }}
                />
              </div>
              <div style={{ position: 'relative', display: 'block' }}>
                <div
                  ref={l2BaseRef}
                  style={{ opacity: 0, whiteSpace: 'nowrap' }}
                >
                  {HEADLINE_LINE2}
                </div>
                <div
                  ref={l2AnimRef}
                  aria-hidden='true'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    whiteSpace: 'nowrap',
                  }}
                />
              </div>
            </h2>

            {/* ── TextReveal: Body (opacity/transform removed from style) ── */}
            <TextReveal delay={0.2}>
              <Body className='max-w-xl'>
                Yeni Turistik Hisar Gazinosu, misafirlerinin gece boyunca
                kendini özgür ve güvende hissetmesi için endüstri
                standartlarının ötesinde bir güvenlik altyapısı işletmektedir.
                Kapıdan sahneye, sahneden çıkışa her adım denetim altındadır.
              </Body>
            </TextReveal>

            <div
              className='mt-10 h-px max-w-md'
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,25,135,0.5) 0%, rgba(255,25,135,0.08) 60%, transparent 100%)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 1s ease 0.5s',
              }}
            />
            <div
              className='flex flex-wrap gap-6 mt-8'
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 1s ease 0.55s',
              }}
            >
              {['7/24 Aktif', 'Uzman Personel', 'Kayıtlı Gözetim'].map(
                (badge) => (
                  <span
                    key={badge}
                    className='flex items-center gap-2 text-white/60'
                    style={{ fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}
                  >
                    <span
                      className='inline-block w-1.5 h-1.5 rounded-full'
                      style={{
                        background: '#ff1987',
                        boxShadow: '0 0 6px rgba(255,25,135,0.8)',
                      }}
                    />
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Four-pillar 2x2 grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5'>
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.label}
              className='rounded-2xl p-8 lg:p-10'
              style={{
                background: 'rgba(255,255,255,0.001)',
                border: '1px solid rgba(255,255,255,0.07)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(28px)',
                transition: `opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${250 + i * 110}ms, transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${250 + i * 110}ms`,
              }}
            >
              <div
                className='mb-6 inline-flex items-center justify-center rounded-xl'
                style={{
                  width: 56,
                  height: 56,
                  background: 'rgba(255,25,135,0.08)',
                  border: '1px solid rgba(255,25,135,0.18)',
                  color: 'rgba(255,100,160,0.9)',
                }}
              >
                {pillar.icon}
              </div>
              <TextReveal>
                <p
                  className='text-white font-semibold mb-4'
                  style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.375rem)' }}
                >
                  {pillar.label}
                </p>
                <Body
                  style={{ fontSize: 'clamp(0.9375rem, 1.3vw, 1.0625rem)' }}
                >
                  {pillar.text}
                </Body>
              </TextReveal>
            </div>
          ))}
        </div>

        {/* Bottom statement bar */}
        <div
          className='mt-20 rounded-2xl px-8 py-8 sm:px-12 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12'
          style={{
            background:
              'linear-gradient(135deg, rgba(255,25,135,0.07) 0%, rgba(255,25,135,0.03) 50%, rgba(184,134,11,0.04) 100%)',
            border: '1px solid rgba(255,25,135,0.12)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 1s ease 0.85s, transform 1s ease 0.85s',
          }}
        >
          <div className='shrink-0'>
            <p
              className='font-bold leading-none tracking-[-0.03em]'
              style={{
                fontSize: 'clamp(3rem, 5vw, 4rem)',
                background:
                  'linear-gradient(135deg,#b8860b 0%,#ffd700 30%,#ff8c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              60+
            </p>
            <p className='text-white/40 mt-1' style={{ fontSize: '0.875rem' }}>
              Yıllık güven
            </p>
          </div>
          <div className='hidden sm:block w-px self-stretch bg-white/10' />
          <Body
            className='max-w-2xl'
            style={{ fontSize: 'clamp(0.9375rem, 1.3vw, 1rem)' }}
          >
            Altmış yılı aşan deneyimimiz, yalnızca sahne kültürünü değil,
            güvenlik kültürünü de şekillendirdi. Misafirlerimiz kapıdan içeri
            adım attığı andan itibaren{' '}
            <span className='text-white/85'>
              profesyonel bir sistemin koruması altındadır.
            </span>
          </Body>
        </div>
      </div>
    </div>
  );
};

const AboutUs = ({ id }: Props) => (
  <section
    id={id}
    className='bg-secondaryColor relative max-w-full overflow-hidden'
    aria-labelledby='aboutus-heading'
  >
    <AtmosphereSection />
    <div className='w-full h-px bg-white/[0.07]' />
    <HistorySection />
    <div className='w-full h-px bg-white/[0.07]' />
    <StatsSection />
    <div className='w-full h-px bg-white/[0.07]' />
    <SecuritySection />
    <div className='w-full h-px bg-white/[0.07]' />
  </section>
);

export default AboutUs;
