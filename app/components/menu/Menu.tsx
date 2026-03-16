'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { GoldToAmberFont } from '@/app/utilities/LinearFontColors';

type Props = { id: string };

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

export default function Menu({ id }: Props) {
  const router = useRouter();
  const { ref, visible } = useReveal(0.12);

  return (
    <section
      id={id}
      className='relative bg-secondaryColor overflow-hidden flex flex-col justify-center '
      style={{ minHeight: '100vh' }}
    >
      <style>{`
        @keyframes menu-glow-pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes menu-orb-a { 0%,100%{transform:translate(0,0) scale(1);opacity:.5}  50%{transform:translate(18px,-22px) scale(1.09);opacity:.78} }
        @keyframes menu-orb-b { 0%,100%{transform:translate(0,0) scale(1);opacity:.38} 50%{transform:translate(-14px,16px) scale(1.07);opacity:.62} }
        @keyframes menu-orb-c { 0%,100%{transform:translate(0,0) scale(1);opacity:.3}  50%{transform:translate(10px,12px) scale(1.06);opacity:.52} }
        @keyframes menu-orb-d { 0%,100%{transform:translate(0,0) scale(1);opacity:.28} 50%{transform:translate(-8px,-14px) scale(1.08);opacity:.48} }
        @keyframes menu-orb-e { 0%,100%{transform:translate(0,0) scale(1);opacity:.22} 50%{transform:translate(6px,10px) scale(1.05);opacity:.4} }
      `}</style>

      {/* ── ATMOSPHERE ── */}
      <div
        aria-hidden
        className='absolute inset-0 pointer-events-none overflow-hidden'
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-18%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '140%',
            height: '75%',
            background:
              'radial-gradient(ellipse 65% 55% at 50% 100%, rgba(184,110,0,0.30) 0%, rgba(140,70,0,0.1) 45%, transparent 68%)',
            willChange: 'opacity',
            animation: 'menu-glow-pulse 7s ease-in-out infinite',
          }}
        />
        {(
          [
            {
              bottom: '10%',
              left: '5%',
              w: 360,
              color: 'rgba(212,140,0,0.16)',
              a: 'menu-orb-a 14s ease-in-out infinite',
            },
            {
              top: '6%',
              right: '4%',
              w: 400,
              color: 'rgba(200,130,0,0.12)',
              a: 'menu-orb-b 18s ease-in-out infinite 2.5s',
            },
            {
              top: '38%',
              right: '12%',
              w: 260,
              color: 'rgba(255,190,40,0.09)',
              a: 'menu-orb-c 15s ease-in-out infinite 5s',
            },
            {
              top: '12%',
              left: '18%',
              w: 240,
              color: 'rgba(190,120,0,0.10)',
              a: 'menu-orb-d 20s ease-in-out infinite 3.5s',
            },
            {
              bottom: '22%',
              left: '40%',
              w: 300,
              color: 'rgba(220,160,20,0.07)',
              a: 'menu-orb-e 23s ease-in-out infinite 9s',
            },
          ] as const
        ).map((o, i) => (
          <div
            key={i}
            className='absolute rounded-full'
            style={{
              ...o,
              width: o.w,
              height: o.w,
              background: `radial-gradient(circle, ${o.color} 0%, transparent 72%)`,
              willChange: 'transform, opacity',
              animation: o.a,
            }}
          />
        ))}
        <div
          className='absolute top-0 left-0 right-0 h-[40%]'
          style={{
            background:
              'linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,transparent 100%)',
          }}
        />
        <div
          className='absolute bottom-0 left-0 right-0 h-[180px]'
          style={{
            background:
              'linear-gradient(to top,rgba(8,7,5,0.78) 0%,transparent 100%)',
          }}
        />
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='3' height='3'><circle cx='1' cy='1' r='0.5' fill='rgba(255,255,255,0.02)'/></svg>")`,
          }}
        />
      </div>

      {/* ── GHOST TEXT ── */}
      <div
        aria-hidden
        className='absolute bottom-[-0.07em] left-[-0.03em] select-none pointer-events-none whitespace-nowrap overflow-hidden pb-8'
        style={{
          fontSize: 'clamp(8rem,24vw,20rem)',
          fontWeight: 900,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(212,160,23,0.065)',
        }}
      >
        MENÜ
      </div>

      {/* ── CONTENT ── */}
      <div ref={ref} className='relative z-10 px-[clamp(28px,6vw,80px)]'>
        {/* Ornament — IntersectionObserver, same as AboutUs non-text elements */}
        <div
          className='flex items-center gap-3 mb-[clamp(26px,4vh,44px)]'
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition:
              'opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.05s, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.05s',
          }}
        >
          <div
            className='h-px'
            style={{
              width: 'clamp(36px,5vw,64px)',
              background:
                'linear-gradient(to right,transparent,rgba(212,160,23,0.52))',
            }}
          />
          <div
            className='w-1 h-1 rounded-full shrink-0'
            style={{
              background: 'rgba(212,160,23,0.72)',
              boxShadow: '0 0 8px 2px rgba(212,160,23,0.38)',
            }}
          />
          <div
            className='h-px'
            style={{
              width: 'clamp(36px,5vw,64px)',
              background:
                'linear-gradient(to left,transparent,rgba(212,160,23,0.52))',
            }}
          />
        </div>

        {/* Headline — scroll-triggered TextReveal */}
        <TextReveal animateOnScroll={true} delay={0}>
          <Headline>
            Damak zevkinize <br />{' '}
            <GoldToAmberFont>özel lezzetler</GoldToAmberFont>
          </Headline>
        </TextReveal>

        {/* Rule */}
        <div
          className='my-[clamp(20px,3vh,32px)]'
          style={{
            height: '1px',
            width: 'clamp(180px,35%,400px)',
            background:
              'linear-gradient(to right,rgba(212,160,23,0.5),rgba(212,160,23,0.06),transparent)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition:
              'opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s, transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s',
          }}
        />

        {/* Subtitle — scroll-triggered TextReveal */}
        <TextReveal animateOnScroll={true} delay={0.06}>
          <p
            className='m-0 leading-[1.8]'
            style={{
              fontSize: 'clamp(0.86rem,1.05vw,0.97rem)',
              maxWidth: '36ch',
              letterSpacing: '0.01em',
              color: 'rgba(255,255,255,0.32)',
            }}
          >
            Özenle kurgulanan menü seçkisi, damak zevkinizi memnun edecek eşsiz
            deneyim sunar.
          </p>
        </TextReveal>

        {/* CTA */}
        <div
          className='mt-[clamp(24px,3.5vh,36px)]'
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition:
              'opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.55s, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.55s',
          }}
        >
          <button
            onClick={() => router.push('/menu')}
            className='inline-flex items-center gap-3.5 py-3.5 pl-6 pr-3.5 rounded-full cursor-pointer border transition-[background,border-color,transform] duration-[220ms] hover:scale-[1.025] hover:bg-white/9 hover:border-[rgba(212,160,23,0.36)]'
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <span className='text-[0.9375rem] font-medium text-white/80 tracking-[-0.01em] whitespace-nowrap'>
              Menüyü Görüntüle
            </span>
            <span
              className='w-8 h-8 rounded-full flex items-center justify-center shrink-0'
              style={{
                background: 'linear-gradient(135deg,#b8860b,#ffd700,#e07b00)',
                boxShadow:
                  '0 0 20px 4px rgba(255,215,0,0.18),inset 0 1px 0 rgba(255,255,255,0.22)',
              }}
            >
              <svg width='13' height='13' viewBox='0 0 14 14' fill='none'>
                <path
                  d='M3 7h8M8 4l3 3-3 3'
                  stroke='#1a0f00'
                  strokeWidth='1.9'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <div className='absolute bottom-0 left-6 right-6 md:left-16 md:right-16 xl:left-24 xl:right-24 h-px bg-linear-to-r from-transparent via-white/6 to-transparent' />
    </section>
  );
}
