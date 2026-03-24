'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { Modal } from '@/app/utilities/Modal';
import { useReveal } from '@/app/utilities/useReveal';
import TextReveal from '@/app/utilities/TextReveal';
import { Headline } from '@/app/utilities/Headline';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';

// ─── Config ───────────────────────────────────────────────────────────────────
const ARTISTS = [
  { src: '/ahu.jpg', name: 'Ahu', role: 'Solist' },
  { src: '/didem.jpg', name: 'Didem', role: 'Solist' },
  { src: '/seda.jpg', name: 'Seda', role: 'Solist' },
];

const MODAL_ITEMS = ARTISTS.map((a) => ({ src: a.src, alt: a.name }));

// ─── Artist Card ──────────────────────────────────────────────────────────────
function ArtistCard({
  artist,
  i,
  visible,
  onClick,
}: {
  artist: (typeof ARTISTS)[0];
  i: number;
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className='relative w-full h-full cursor-pointer group'
      onClick={onClick}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0) scale(1)'
          : 'translateY(48px) scale(0.96)',
        transition: `opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${0.2 + i * 0.15}s`,
      }}
    >
      {/* ── Photo ── */}
      <div className='absolute inset-0 rounded-sm overflow-hidden'>
        <Image
          src={artist.src}
          alt={artist.name}
          fill
          unoptimized
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className='object-cover object-top select-none transition-transform duration-700 ease-out group-hover:scale-[1.04]'
          style={{ willChange: 'transform' }}
        />

        {/* Base dark gradient */}
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.22) 50%, transparent 75%)',
          }}
        />

        {/* Hover tint — pink */}
        <div
          className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          style={{
            background:
              'linear-gradient(to top, rgba(255,25,135,0.5) 0%, rgba(200,0,204,0.12) 45%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Name + role (bottom) ── */}
      <div className='absolute bottom-0 left-0 right-0 z-10 p-6 lg:p-7'>
        <p
          className='text-white/40 uppercase tracking-[0.28em] font-medium mb-2 group-hover:text-white/60 transition-colors duration-300'
          style={{ fontSize: 'clamp(0.55rem, 0.8vw, 0.7rem)' }}
        >
          {artist.role}
        </p>

        <h3
          className='font-black tracking-[-0.02em] text-white leading-none'
          style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
        >
          {artist.name}
        </h3>

        {/* Animated underline */}
        <div
          className='mt-3 h-px w-0 group-hover:w-[45%] transition-all duration-500 delay-75'
          style={{ background: 'linear-gradient(90deg, #FF1987, #c800cc)' }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Props = { id?: string };

export default function ArtistWall({ id }: Props) {
  const { ref, visible } = useReveal();
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const prevImage = useCallback(
    () =>
      setModalIndex((i) =>
        i === null ? null : (i - 1 + ARTISTS.length) % ARTISTS.length,
      ),
    [],
  );

  const nextImage = useCallback(
    () => setModalIndex((i) => (i === null ? null : (i + 1) % ARTISTS.length)),
    [],
  );

  return (
    <section
      id={id}
      ref={ref}
      className='relative bg-secondaryColor overflow-hidden'
    >
      {/* ── Grain overlay ── */}
      <div
        className='absolute inset-0 z-1 pointer-events-none opacity-[0.025] mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className='relative z-2 pt-24 lg:pt-36 pb-24 lg:pb-32'>
        {/* ── Section header ── */}
        <div className='px-6 sm:px-12 lg:px-24 xl:px-32 mb-16 lg:mb-20'>
          <TextReveal animateOnScroll>
            <Headline className='mb-8 max-w-3xl'>
              Sahnede iz
              <br />
              <MainColorToQuatFont>bırakan isimler</MainColorToQuatFont>
            </Headline>
          </TextReveal>

          <TextReveal animateOnScroll delay={0.15}>
            <p
              className='text-white/55 leading-[1.72] max-w-xl'
              style={{ fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)' }}
            >
              Yıllar içinde nice değerli sanatçıya ev sahipliği yapmış bu
              sahnede, her gece yeni bir performans, yeni bir anı doğuyor.
            </p>
          </TextReveal>
        </div>

        {/*
          ── Horizontal scroll track ──────────────────────────────────────────
          Card widths are set so the next card always peeks:
            Mobile  (default) : ~82vw  → 1 card + peek of 2nd
            Tablet  (sm/md)   : ~47vw  → 2 cards + peek of 3rd
            Desktop (lg+)     : ~30vw  → 3 cards + peek of 4th

          Left edge aligns with section text; right side intentionally
          has minimal padding so the partially-visible card signals scroll.
        ────────────────────────────────────────────────────────────────────── */}
        <div
          className='
            flex gap-4 lg:gap-5
            overflow-x-auto
            snap-x snap-mandatory
            pl-6 sm:pl-12 lg:pl-24 xl:pl-32
            pr-10
            pb-4
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          '
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {ARTISTS.map((artist, i) => (
            <div
              key={artist.name}
              className='snap-center shrink-0'
              style={{
                width: 'clamp(260px, 72vw, 430px)',
                aspectRatio: '3/4',
              }}
            >
              <ArtistCard
                artist={artist}
                i={i}
                visible={visible}
                onClick={() => setModalIndex(i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {portalReady && modalIndex !== null && (
          <Modal
            items={MODAL_ITEMS}
            index={modalIndex}
            onClose={() => setModalIndex(null)}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
