'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gallery } from './Collection';
import { getSmoother } from '@/app/lib/smoother';
import { GoldToAmberFont } from '@/app/utilities/LinearFontColors';

gsap.registerPlugin(ScrollTrigger);

type Props = { id: string };
type GalleryItem = (typeof gallery)[number];

const GOLD = 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #ff8c00 100%)';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const outerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.0 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.0 },
  },
};

function BentoCard({
  item,
  gridArea,
  onClick,
}: {
  item: GalleryItem;
  gridArea?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <motion.button
      type='button'
      variants={cardVariants}
      style={{
        gridArea: gridArea || undefined,
        display: 'block',
        width: '100%',
        height: '100%',
      }}
      className='relative overflow-hidden cursor-pointer rounded-xl border-0 p-0 bg-transparent'
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <Image
        src={item.src}
        alt={`Galeri ${item.id}`}
        fill
        unoptimized
        className='object-cover'
        style={{
          transition: 'transform 0.18s ease',
          transform: pressed
            ? 'scale(0.975)'
            : hovered
              ? 'scale(1.05)'
              : 'scale(1)',
        }}
        sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
      />
      <div className='absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/50' />
      <div className='absolute inset-0 bg-linear-to-tr from-black/20 to-transparent' />
      <div
        className='absolute inset-0 rounded-xl pointer-events-none'
        style={{
          transition: 'box-shadow 0.28s ease',
          boxShadow: hovered
            ? 'inset 0 0 0 1.5px rgba(255,215,0,0.38)'
            : 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        }}
      />
      <div
        className='absolute inset-0 flex items-center justify-center'
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.22s ease' }}
      >
        <div
          className='w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm'
          style={{
            background: 'rgba(0,0,0,0.52)',
            border: '1px solid rgba(255,255,255,0.15)',
            transform: pressed ? 'scale(0.88)' : 'scale(1)',
            transition: 'transform 0.12s ease',
          }}
        >
          <svg width='13' height='13' viewBox='0 0 16 16' fill='none'>
            <path
              d='M6 1H1v5M15 6V1h-5M10 15h5v-5M1 10v5h5'
              stroke='rgba(255,255,255,0.82)'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

function NavBtn({
  onClick,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onMouseEnter={() => setHovered(true)}
      className='cursor-pointer flex items-center justify-center rounded-full'
      style={{
        width: 48,
        height: 48,
        border: `1px solid ${pressed ? 'rgba(255,215,0,0.55)' : hovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)'}`,
        background: pressed
          ? 'rgba(255,215,0,0.10)'
          : hovered
            ? 'rgba(255,255,255,0.07)'
            : 'rgba(255,255,255,0.04)',
        color: pressed
          ? 'rgba(255,215,0,0.95)'
          : hovered
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(255,255,255,0.5)',
        transform: pressed ? 'scale(0.90)' : 'scale(1)',
        transition:
          'transform 0.11s ease, border-color 0.18s, background 0.18s, color 0.18s',
      }}
    >
      {children}
    </button>
  );
}

function GalleryModal({
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const modal = (
    <motion.div
      className='fixed inset-0 flex items-center justify-center'
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(4,4,4,0.97)',
        backdropFilter: 'blur(32px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <div className='absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3'>
        <div className='h-px w-8 opacity-35' style={{ background: GOLD }} />
        <span className='text-[0.65rem] tracking-[0.28em] uppercase text-white/38 font-medium tabular-nums'>
          {String(index + 1).padStart(2, '0')} —{' '}
          {String(total).padStart(2, '0')}
        </span>
        <div className='h-px w-8 opacity-35' style={{ background: GOLD }} />
      </div>

      <div
        className='absolute top-4 right-4 sm:top-5 sm:right-5'
        style={{ zIndex: 10 }}
      >
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
            <path
              d='M1 1L13 13M13 1L1 13'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
            />
          </svg>
        </NavBtn>
      </div>

      <div
        className='absolute left-3 sm:left-5 top-1/2 -translate-y-1/2'
        style={{ zIndex: 10 }}
      >
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
            <path
              d='M10 12L6 8L10 4'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </NavBtn>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.26, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
          className='relative'
        >
          <Image
            src={gallery[index].src}
            alt={`Hisar Galeri ${index + 1}`}
            width={1400}
            height={900}
            className='max-w-[84vw] max-h-[78vh] w-auto h-auto object-contain rounded-lg'
            unoptimized
          />
          <div
            className='absolute bottom-0 left-0 right-0 h-px rounded-b-lg'
            style={{ background: GOLD, opacity: 0.18 }}
          />
        </motion.div>
      </AnimatePresence>

      <div
        className='absolute right-3 sm:right-5 top-1/2 -translate-y-1/2'
        style={{ zIndex: 10 }}
      >
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
            <path
              d='M6 4L10 8L6 12'
              stroke='currentColor'
              strokeWidth='1.7'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </NavBtn>
      </div>

      <div className='absolute bottom-5 left-1/2 -translate-x-1/2'>
        <span className='text-[0.48rem] tracking-[0.22em] uppercase text-white/18 font-medium'>
          ← → ok tuşları ile gezin · ESC kapat
        </span>
      </div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

export default function Gallery({ id }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const openModal = useCallback(
    (i: number) => {
      if (expanded) setModalIndex(i);
    },
    [expanded],
  );
  const closeModal = useCallback(() => setModalIndex(null), []);
  const prevImage = useCallback(
    () =>
      setModalIndex((i) =>
        i === null ? null : (i - 1 + gallery.length) % gallery.length,
      ),
    [],
  );
  const nextImage = useCallback(
    () => setModalIndex((i) => (i === null ? null : (i + 1) % gallery.length)),
    [],
  );

  useEffect(() => {
    const lenis = getSmoother();
    if (modalIndex !== null) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalIndex]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (modalIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  });

  useEffect(() => {
    let ctx: gsap.Context;

    const init = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panelRef.current,
            start: 'top top',
            end: '+=1500',
            scrub: 1.0,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setCardsVisible(self.progress >= 0.57);
              setExpanded(self.progress >= 0.57);
            },
          },
        });

        tl.to(
          boxRef.current,
          {
            left: '0%',
            right: '0%',
            top: '0%',
            bottom: '0%',
            borderRadius: 0,
            ease: 'none',
            duration: 0.45,
          },
          0,
        )
          .to(
            headerRef.current,
            { opacity: 0, y: -48, ease: 'none', duration: 0.2 },
            0,
          )
          .to(hintRef.current, { opacity: 0, ease: 'none', duration: 0.12 }, 0)
          .to(
            glowRef.current,
            { opacity: 0.22, ease: 'none', duration: 0.45 },
            0,
          )
          .to({}, { duration: 0.08 })
          .to(boxRef.current, {
            left: '12px',
            right: '12px',
            bottom: '12px',
            borderRadius: 20,
            ease: 'power2.inOut',
            duration: 0.12,
          });
      }, panelRef);

      // After creating the context, force ScrollTrigger to remeasure
      // so pin spacers are calculated with the live ScrollSmoother.
      ScrollTrigger.refresh();
    };

    // FIX: Poll until ScrollSmoother is registered in our singleton.
    // On first load it's instant. On back-navigation ScrollSmoother
    // initializes in app.tsx's useEffect which runs AFTER child effects —
    // so Gallery's useEffect fires first and measures against nothing.
    // Polling with rAF costs nothing and self-cancels immediately on
    // first load (smoother is already there), only retries on back-nav.
    let rafId: number;
    const waitForSmoother = () => {
      if (getSmoother()) {
        init();
      } else {
        rafId = requestAnimationFrame(waitForSmoother);
      }
    };

    waitForSmoother();

    return () => {
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  const DESKTOP_BENTO = [
    { area: 'a', idx: 0 },
    { area: 'b', idx: 1 },
    { area: 'c', idx: 2 },
    { area: 'd', idx: 3 },
    { area: 'e', idx: 4 },
    { area: 'f', idx: 5 },
  ];

  const TABLET_BENTO = [
    { area: 'a', idx: 0 },
    { area: 'b', idx: 1 },
    { area: 'c', idx: 2 },
    { area: 'd', idx: 3 },
    { area: 'e', idx: 4 },
    { area: 'f', idx: 5 },
  ];

  return (
    <>
      <section
        ref={panelRef}
        id={id}
        className='relative bg-secondaryColor'
        style={{ height: '100dvh' }}
      >
        <div
          ref={headerRef}
          className='absolute top-0 left-0 right-0 z-30 flex flex-col items-center text-center pt-14 xl:pt-18 pointer-events-none select-none'
        >
          <h2
            className='font-bold text-white leading-[1.02] tracking-[-0.03em]'
            style={{ fontSize: 'clamp(3rem,6vw,5.5rem)' }}
          >
            Gecenin en güzel
            <br />
            <GoldToAmberFont>anları burada yaşanır.</GoldToAmberFont>
          </h2>
        </div>

        <div
          ref={boxRef}
          className='absolute bg-[#0a0a0a] overflow-hidden'
          style={{
            left: '20%',
            right: '20%',
            top: '22%',
            bottom: '12%',
            borderRadius: 24,
          }}
        >
          <div
            ref={glowRef}
            className='pointer-events-none absolute inset-x-0 bottom-0'
            style={{
              height: '60%',
              opacity: 0.03,
              background:
                'radial-gradient(ellipse 85% 60% at 50% 100%, rgba(184,134,11,0.95) 0%, rgba(255,145,0,0.42) 35%, transparent 62%)',
            }}
          />
          <div
            className='pointer-events-none absolute right-0 top-0 bottom-0 w-1/3'
            style={{
              background:
                'radial-gradient(ellipse 65% 75% at 100% 50%, rgba(255,165,0,0.055) 0%, transparent 60%)',
            }}
          />
          <div
            className='absolute top-0 left-0 right-0 h-px pointer-events-none'
            style={{ background: GOLD, opacity: 0.1 }}
          />

          <div
            ref={contentRef}
            className='absolute inset-0'
            style={{
              opacity: expanded ? 1 : 0,
              transition: expanded ? 'opacity 0.2s ease' : 'none',
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            {/* ── DESKTOP ≥1024px ── */}
            <div className='hidden lg:flex flex-col absolute inset-0 p-5 xl:p-6 gap-3.5'>
              <motion.div
                className='contents'
                variants={outerVariants}
                animate={cardsVisible ? 'visible' : 'hidden'}
              >
                <motion.div
                  variants={cardVariants}
                  className='flex items-center justify-between shrink-0'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-px w-7 opacity-50'
                      style={{ background: GOLD }}
                    />
                    <span className='text-[0.72rem] tracking-[0.18em] uppercase font-semibold text-white/55'>
                      Galeri
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => openModal(0)}
                    className='flex items-center gap-2 border-0 bg-transparent p-0 cursor-pointer group'
                  >
                    <span className='text-[0.72rem] tracking-[0.14em] uppercase font-semibold text-white/45 group-hover:text-white/75 transition-colors duration-200'>
                      Tümünü Gör
                    </span>
                    <span
                      className='text-[0.72rem] font-bold tabular-nums'
                      style={{
                        background: GOLD,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ({String(gallery.length).padStart(2, '0')})
                    </span>
                    <svg
                      width='11'
                      height='11'
                      viewBox='0 0 12 12'
                      fill='none'
                      className='text-white/35 group-hover:text-white/60 transition-colors'
                    >
                      <path
                        d='M2 6h8M7 3l3 3-3 3'
                        stroke='currentColor'
                        strokeWidth='1.3'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </button>
                </motion.div>
                <motion.div
                  variants={gridVariants}
                  className='flex-1 min-h-0 grid'
                  style={{
                    gap: '8px',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: '1fr 1fr',
                    gridTemplateAreas: '"a a b c" "d e f c"',
                  }}
                >
                  {DESKTOP_BENTO.map(({ area, idx }) =>
                    gallery[idx] ? (
                      <BentoCard
                        key={area}
                        item={gallery[idx]}
                        gridArea={area}
                        onClick={() => openModal(idx)}
                      />
                    ) : null,
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* ── TABLET 768–1023px ── */}
            <div className='hidden md:flex lg:hidden flex-col absolute inset-0 p-4 gap-3'>
              <motion.div
                className='contents'
                variants={outerVariants}
                animate={cardsVisible ? 'visible' : 'hidden'}
              >
                <motion.div
                  variants={cardVariants}
                  className='flex items-center justify-between shrink-0'
                >
                  <div className='flex items-center gap-2.5'>
                    <div
                      className='h-px w-6 opacity-50'
                      style={{ background: GOLD }}
                    />
                    <span className='text-[0.72rem] tracking-[0.16em] uppercase font-semibold text-white/55'>
                      Galeri
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => openModal(0)}
                    className='flex items-center gap-2 border-0 bg-transparent p-0 cursor-pointer group'
                  >
                    <span className='text-[0.72rem] tracking-[0.14em] uppercase font-semibold text-white/45 group-hover:text-white/75 transition-colors'>
                      Tümünü Gör
                    </span>
                    <span
                      className='text-[0.72rem] font-bold tabular-nums'
                      style={{
                        background: GOLD,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ({String(gallery.length).padStart(2, '0')})
                    </span>
                  </button>
                </motion.div>
                <motion.div
                  variants={gridVariants}
                  className='flex-1 min-h-0 grid'
                  style={{
                    gap: '8px',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: '1fr 1fr 0.5fr',
                    gridTemplateAreas: '"a b c" "a d e" "f f f"',
                  }}
                >
                  {TABLET_BENTO.map(({ area, idx }) =>
                    gallery[idx] ? (
                      <BentoCard
                        key={area}
                        item={gallery[idx]}
                        gridArea={area}
                        onClick={() => openModal(idx)}
                      />
                    ) : null,
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* ── MOBILE <768px ── */}
            <div className='flex md:hidden flex-col absolute inset-0 p-3.5 gap-3'>
              <motion.div
                className='contents'
                variants={outerVariants}
                animate={cardsVisible ? 'visible' : 'hidden'}
              >
                <motion.div
                  variants={cardVariants}
                  className='flex items-center justify-between shrink-0'
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-px w-5 opacity-50'
                      style={{ background: GOLD }}
                    />
                    <span className='text-[0.72rem] tracking-[0.15em] uppercase font-semibold text-white/55'>
                      Galeri
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => openModal(0)}
                    className='flex items-center gap-1.5 border-0 bg-transparent p-0 cursor-pointer'
                  >
                    <span className='text-[0.72rem] tracking-[0.13em] uppercase font-semibold text-white/45'>
                      Tümünü Gör
                    </span>
                    <span
                      className='text-[0.72rem] font-bold tabular-nums'
                      style={{
                        background: GOLD,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ({gallery.length})
                    </span>
                  </button>
                </motion.div>
                <motion.div
                  variants={gridVariants}
                  className='flex-1 min-h-0 grid'
                  style={{
                    gap: '7px',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1.3fr 1fr 1fr',
                    gridTemplateAreas: '"a a" "b c" "d e"',
                  }}
                >
                  {gallery.slice(0, 5).map((img, i) => {
                    const areas = ['a', 'b', 'c', 'd', 'e'];
                    return (
                      <BentoCard
                        key={img.id}
                        item={img}
                        gridArea={areas[i]}
                        onClick={() => openModal(i)}
                      />
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div
            ref={hintRef}
            className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-none z-20 select-none'
          >
            <span className='text-[0.55rem] tracking-[0.22em] uppercase text-white/28 font-medium whitespace-nowrap'>
              Galeriye girmek için kaydır
            </span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 1.7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <svg width='13' height='13' viewBox='0 0 16 16' fill='none'>
                <path
                  d='M3 6L8 11L13 6'
                  stroke='rgba(255,255,255,0.24)'
                  strokeWidth='1.4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {portalReady && modalIndex !== null && (
          <GalleryModal
            index={modalIndex}
            total={gallery.length}
            onClose={closeModal}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
