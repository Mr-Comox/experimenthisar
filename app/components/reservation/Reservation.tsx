'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useReveal } from '@/app/utilities/useReveal';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import {
  MainColorToQuatFont,
  MainToGoldFont,
} from '@/app/utilities/LinearFontColors';
import { LeftLeafletIcon, RightLeafletIcon } from '@/public/Icons';

type Props = { id: string };

// ─── Filled-circle checkmark (user-supplied) ─────────────────────────────────
const CheckIcon = () => (
  <svg
    width='22'
    height='22'
    viewBox='0 0 24 24'
    fill='none'
    aria-hidden='true'
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21ZM11.768 15.64L16.768 9.64L15.232 8.36L10.932 13.519L8.707 11.293L7.293 12.707L10.293 15.707L11.067 16.481L11.768 15.64Z'
      fill='currentColor'
    />
  </svg>
);

// ─── Benefits ────────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    label: 'Öncelikli Erişim',
    text: 'Özel etkinlik ve davet gecelerinde erken rezervasyon hakkı.',
  },
  {
    label: 'Kişisel Masa Planlaması',
    text: 'Tercihinize göre konumlandırılmış masa ve VIP loca seçeneği.',
  },
  {
    label: 'Hızlı Onay Süreci',
    text: 'Talebiniz kısa sürede değerlendirilerek size bildirim yapılır.',
  },
] as const;

// ─── Spinning border (matches Timeline conic border) ─────────────────────────
const SPIN_STYLES = `
  @property --resv-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
  @keyframes resv-spin {
    to { --resv-angle: 360deg; }
  }
  .resv-btn-border {
    background:
      linear-gradient(rgb(10 9 8 / 1), rgb(10 9 8 / 1)) padding-box,
      conic-gradient(
        from var(--resv-angle),
        transparent  0%,
        transparent  30%,
        rgba(255, 25,135,0.90) 44%,
        rgba(200,  0,200,0.85) 56%,
        transparent  70%,
        transparent  100%
      ) border-box;
    border: 1px solid transparent;
    animation: resv-spin 4.5s linear infinite;
  }
  @keyframes resv-orb-a {
    0%,100% { transform:translate(0,0) scale(1);           opacity:.38; }
    50%     { transform:translate(22px,-26px) scale(1.10); opacity:.60; }
  }
  @keyframes resv-orb-b {
    0%,100% { transform:translate(0,0) scale(1);           opacity:.24; }
    50%     { transform:translate(-18px,20px) scale(1.08); opacity:.44; }
  }
  @keyframes resv-orb-c {
    0%,100% { transform:translate(0,0) scale(1);           opacity:.16; }
    50%     { transform:translate(14px,12px) scale(1.06);  opacity:.32; }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function Reservation({ id }: Props) {
  const router = useRouter();
  const { ref, visible } = useReveal(0.08);

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      <style>{SPIN_STYLES}</style>

      {/* ── Atmosphere ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className='absolute inset-0 pointer-events-none overflow-hidden'
      >
        {/* Radial glow — warm pink top */}
        <div
          className='absolute top-0 left-0 right-0'
          style={{
            height: '60%',
            background:
              'radial-gradient(ellipse 75% 55% at 50% -5%, rgba(255,25,135,0.09) 0%, transparent 68%)',
          }}
        />

        {/* Floating orbs */}
        {(
          [
            {
              top: '10%',
              left: '1%',
              w: 440,
              color: 'rgba(255,25,135,0.08)',
              anim: 'resv-orb-a 17s ease-in-out infinite',
            },
            {
              top: '6%',
              right: '2%',
              w: 360,
              color: 'rgba(184,134,11,0.06)',
              anim: 'resv-orb-b 21s ease-in-out infinite 3s',
            },
            {
              bottom: '18%',
              left: '38%',
              w: 280,
              color: 'rgba(200,0,200,0.05)',
              anim: 'resv-orb-c 25s ease-in-out infinite 7s',
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
              animation: o.anim,
              willChange: 'transform, opacity',
            }}
          />
        ))}

        {/* Ghost text */}
        <div
          aria-hidden
          className='absolute bottom-[-0.08em] right-[-0.03em] select-none pointer-events-none'
          style={{
            fontSize: 'clamp(5rem, 18vw, 17rem)',
            fontWeight: 900,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,25,135,0.038)',
          }}
        >
          REZERV
        </div>

        {/* Bottom fade */}
        <div
          className='absolute bottom-0 left-0 right-0 h-40'
          style={{
            background:
              'linear-gradient(to top,rgba(0,0,0,0.24) 0%,transparent 100%)',
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div
        ref={ref}
        className='relative px-6 sm:px-12 lg:px-24 xl:px-32 pt-24 lg:pt-36 pb-24 lg:pb-36'
      >
        {/* Two-column: left = headline+perks+CTA, right = decorative rule */}
        <div className='flex flex-col lg:flex-row items-start gap-14 lg:gap-20 xl:gap-28'>
          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className='flex-1 min-w-0'>
            {/* Headline — TextReveal masked slide-up, same as AtmosphereSection */}
            <TextReveal animateOnScroll delay={0}>
              <Headline className='mb-8'>
                Gecenizi önceden <br />
                <MainToGoldFont>planlayın</MainToGoldFont>
              </Headline>
            </TextReveal>

            {/* Body */}
            <TextReveal delay={0.15}>
              <p
                className='text-white/45 leading-[1.78] max-w-lg mb-10'
                style={{ fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)' }}
              >
                Gece boyunca sürecek seçkin deneyim için yerinizi önceden
                belirleyin. Sınırlı kontenjan, kişiye özel hizmet.
              </p>
            </TextReveal>

            {/* Pink rule */}
            <div
              className='mb-10 h-px max-w-xs'
              style={{
                background:
                  'linear-gradient(90deg,rgba(255,25,135,0.45) 0%,rgba(255,25,135,0.06) 55%,transparent 100%)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 1s ease 0.38s',
              }}
            />

            {/* Benefits — Nike checkmarks */}
            <div className='flex flex-col gap-5 mb-12 lg:mb-14'>
              {BENEFITS.map((b, i) => (
                <div
                  key={b.label}
                  className='flex items-start gap-4'
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(16px)',
                    transition: `opacity 0.85s ease ${260 + i * 110}ms, transform 0.85s ease ${260 + i * 110}ms`,
                  }}
                >
                  {/* Filled-circle checkmark with pink container */}
                  <div
                    className='shrink-0 inline-flex items-center justify-center rounded-xl mt-0.5'
                    style={{
                      width: 46,
                      height: 46,
                      background: 'rgba(255,25,135,0.12)',
                      border: '1px solid rgba(255,25,135,0.22)',
                      color: '#FF1987',
                    }}
                  >
                    <CheckIcon />
                  </div>

                  <div className='pt-2'>
                    <p
                      className='text-white/80 font-semibold mb-1'
                      style={{ fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)' }}
                    >
                      {b.label}
                    </p>
                    <p
                      className='text-white/38 leading-[1.65]'
                      style={{ fontSize: 'clamp(0.85rem, 1.1vw, 0.9375rem)' }}
                    >
                      {b.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA — Hero button style */}
            <div
              className='flex flex-col sm:flex-row items-start sm:items-center gap-5'
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(10px)',
                transition:
                  'opacity 0.8s ease 0.60s, transform 0.8s ease 0.60s',
              }}
            >
              <motion.button
                onClick={() => router.push('/reservation')}
                whileTap={{ scale: 0.97 }}
                className='cursor-pointer group flex items-center gap-3 resv-btn-border rounded-3xl
                           px-7 py-4 hover:bg-mainColor/[0.06] transition-colors duration-300'
              >
                <span
                  className='text-white/75 group-hover:text-white uppercase font-bold
                             tracking-[0.22em] transition-colors duration-300 text-[0.66rem]'
                >
                  Rezervasyon Yap
                </span>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 16 16'
                  fill='none'
                  className='text-mainColor translate-x-0 group-hover:translate-x-1 transition-transform duration-300'
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

              <div className='flex items-center gap-2'>
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 24 24'
                  fill='none'
                  className='text-white/20 shrink-0'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.8}
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    stroke='currentColor'
                  />
                </svg>
                <span className='text-white/28 text-[0.68rem] tracking-[0.06em]'>
                  Onay sonrası kesinleşir
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT — thin vertical accent line (desktop only) ──────────── */}
          <div
            className='hidden lg:flex flex-col items-center gap-0 pt-6'
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 1.2s ease 0.4s',
            }}
          >
            <div
              className='w-px flex-1'
              style={{
                minHeight: 280,
                background:
                  'linear-gradient(to bottom, transparent, rgba(255,25,135,0.22) 20%, rgba(255,25,135,0.18) 80%, transparent)',
              }}
            />
            <div
              className='w-1.5 h-1.5 rounded-full my-3'
              style={{
                background: '#FF1987',
                boxShadow: '0 0 10px 3px rgba(255,25,135,0.4)',
              }}
            />
            <div
              className='w-px flex-1'
              style={{
                minHeight: 80,
                background:
                  'linear-gradient(to bottom, rgba(255,25,135,0.18), transparent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Section divider */}
      <div className='w-full h-px bg-white/[0.07]' />
    </section>
  );
}
