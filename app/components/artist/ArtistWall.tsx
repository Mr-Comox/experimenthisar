'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Modal } from '@/app/utilities/Modal';

// ─── Config ───────────────────────────────────────────────────────────────────
const ARTISTS = [
  {
    src: '/ahu.jpg',
    name: 'Ahu',
    index: '01',
  },
  {
    src: '/didem.jpg',
    name: 'Didem',
    index: '02',
  },
  {
    src: '/seda.jpg',
    name: 'Seda',
    index: '03',
  },
];

const MODAL_ITEMS = ARTISTS.map((a) => ({ src: a.src, alt: a.name }));

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Artist Card ──────────────────────────────────────────────────────────────
function ArtistCard({
  artist,
  i,
  sectionVisible,
  onClick,
}: {
  artist: (typeof ARTISTS)[0];
  i: number;
  sectionVisible: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={
        sectionVisible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 60, scale: 0.96 }
      }
      transition={{
        duration: 1.1,
        delay: 0.15 + i * 0.13,
        ease: EASE_OUT_EXPO,
      }}
      className='relative w-full h-full cursor-pointer'
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Photo ──────────────────────────────────────────────────────── */}
      <div className='absolute inset-0 rounded-2xl overflow-hidden'>
        <motion.img
          src={artist.src}
          alt={artist.name}
          draggable={false}
          fetchPriority='high'
          loading='eager'
          decoding='sync'
          onContextMenu={(e) => e.preventDefault()}
          className='w-full h-full object-cover object-top select-none'
          animate={{ scale: hovered ? 1.06 : 1.0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          style={{ willChange: 'transform' }}
        />

        {/* Base dark gradient */}
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 45%, transparent 75%)',
          }}
        />

        {/* Hover gradient — pink tint */}
        <motion.div
          className='absolute inset-0'
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              'linear-gradient(to top, rgba(255,25,135,0.55) 0%, rgba(200,0,204,0.15) 40%, transparent 70%)',
          }}
        />

        {/* Scanline texture */}
        <div
          className='absolute inset-0 pointer-events-none opacity-[0.018]'
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)',
            backgroundSize: '100% 3px',
          }}
        />
      </div>

      {/* ── "SAHNE" pill (top-right) ────────────────────────────────────── */}
      <motion.div
        className='absolute top-5 right-5 z-[3] rounded-full px-3 py-1'
        animate={{
          opacity: hovered ? 1 : 0,
          y: hovered ? 0 : -6,
        }}
        transition={{ duration: 0.35, delay: hovered ? 0.05 : 0 }}
        style={{
          border: '1px solid rgba(255,25,135,0.35)',
          background: 'rgba(255,25,135,0.15)',
        }}
      >
        <span className='text-[0.6rem] font-bold tracking-[0.25em] text-[#FF1987] uppercase'>
          Sahne
        </span>
      </motion.div>

      {/* ── Artist name + role (bottom) ────────────────────────────────── */}
      <div className='absolute bottom-0 left-0 right-0 z-[3] p-6 lg:p-7'>
        <div className='overflow-hidden'>
          <motion.h3
            className='font-black tracking-[-0.02em] text-white'
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            {artist.name}
          </motion.h3>
        </div>

        {/* Animated underline */}
        <motion.div
          className='mt-3 h-px'
          animate={{ width: hovered ? '40%' : '0%' }}
          transition={{
            duration: 0.5,
            delay: hovered ? 0.1 : 0,
            ease: EASE_OUT_EXPO,
          }}
          style={{ background: 'linear-gradient(90deg, #FF1987, #c800cc)' }}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Props = { id?: string };

export default function ArtistWall({ id }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });

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
      ref={sectionRef}
      className='relative bg-secondaryColor overflow-hidden pt-20'
    >
      {/* ── Grain overlay ────────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-[1] pointer-events-none opacity-[0.025] mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className='relative z-[2] px-6 sm:px-12 lg:px-24 xl:px-32'>
        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className='flex items-center justify-between mb-12 lg:mb-16'>
          <div className='flex items-center gap-5'>
            <motion.div
              className='h-px bg-[#FF1987]'
              initial={{ width: 0 }}
              animate={isInView ? { width: 32 } : { width: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_EXPO }}
            />
            <motion.p
              className='text-[0.65rem] tracking-[0.4em] uppercase text-white/55'
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              Sanatçılarımız
            </motion.p>
          </div>
        </div>

        {/* ── Cards ───────────────────────────────────────────────────────── */}
        <div
          className='flex gap-4 lg:gap-5
                     overflow-x-auto
                     snap-x snap-mandatory
                     pb-4
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {ARTISTS.map((artist, i) => (
            <div
              key={artist.name}
              className='snap-center flex-shrink-0'
              style={{
                width: 'clamp(260px, 72vw, 430px)',
                aspectRatio: '3/4',
              }}
            >
              <ArtistCard
                artist={artist}
                i={i}
                sectionVisible={isInView}
                onClick={() => setModalIndex(i)}
              />
            </div>
          ))}
        </div>

        {/* ── Bottom label strip ──────────────────────────────────────────── */}
        <motion.div
          className='flex items-center gap-3 mt-10 lg:mt-12'
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className='h-px flex-1 bg-white/[0.06]' />
          <p className='text-[0.6rem] tracking-[0.35em] uppercase text-white/20 font-medium'>
            Yeni Hisar · 1964
          </p>
          <div className='h-px flex-1 bg-white/[0.06]' />
        </motion.div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
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
