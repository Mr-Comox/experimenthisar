'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gallery } from '@/app/components/gallery/Collection';

const VIDEO_SRC = '/yenihisar.mp4';
const IMAGE_SRCS = gallery.map((g) =>
  typeof g.src === 'string' ? g.src : (g.src as { src: string }).src,
);
const ALL_ASSETS = [VIDEO_SRC, ...IMAGE_SRCS];
const TOTAL = ALL_ASSETS.length;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  // displayed counter animates independently — smooth, not jumpy
  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // smooth counter raf
  useEffect(() => {
    const tick = () => {
      const diff = targetRef.current - displayedRef.current;
      if (Math.abs(diff) < 0.5) {
        displayedRef.current = targetRef.current;
      } else {
        displayedRef.current += diff * 0.07;
      }
      setDisplayed(Math.round(displayedRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    let loaded = 0;

    const tick = () => {
      loaded++;
      const pct = Math.round((loaded / TOTAL) * 100);
      targetRef.current = pct;
      setProgress(pct);
      if (loaded === TOTAL) {
        targetRef.current = 100;
        // wait for counter to visually reach 100, then exit
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 900);
        }, 600);
      }
    };

    ALL_ASSETS.forEach((src) => {
      if (src.endsWith('.mp4')) {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.src = src;
        v.onloadedmetadata = tick;
        v.onerror = tick;
      } else {
        const img = new Image();
        img.src = src;
        img.onload = tick;
        img.onerror = tick;
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key='preloader'
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#080608',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* ── Grain ── */}
          <div
            style={{
              position: 'absolute',
              inset: '-10%',
              width: '120%',
              height: '120%',
              pointerEvents: 'none',
              opacity: 0.038,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              mixBlendMode: 'overlay',
            }}
          />

          {/* ── Radial glow behind counter ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 10 ? 0.18 : 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'absolute',
              width: '60vw',
              height: '60vw',
              maxWidth: 600,
              maxHeight: 600,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, #ff1987 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Center block ── */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
              userSelect: 'none',
            }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  height: 1,
                  width: 40,
                  background:
                    'linear-gradient(to right, transparent, rgba(255,25,135,0.5))',
                }}
              />
              <span
                style={{
                  fontSize: '0.52rem',
                  letterSpacing: '0.45em',
                  textTransform: 'uppercase',
                  color: 'rgba(251,251,251,0.35)',
                  fontWeight: 500,
                }}
              >
                Yükleniyor
              </span>
              <div
                style={{
                  height: 1,
                  width: 40,
                  background:
                    'linear-gradient(to left, transparent, rgba(255,25,135,0.5))',
                }}
              />
            </motion.div>

            {/* Big counter */}
            <div style={{ position: 'relative', lineHeight: 1 }}>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                style={
                  {
                    display: 'block',
                    fontSize: 'clamp(7rem, 22vw, 16rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    background:
                      'linear-gradient(135deg, #ff1987 0%, #ff6ec7 45%, rgba(251,251,251,0.7) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    tabularNums: 'tabular-nums',
                    fontVariantNumeric: 'tabular-nums',
                  } as React.CSSProperties
                }
              >
                {String(displayed).padStart(2, '0')}
              </motion.span>

              {/* % sign — smaller, sits top-right */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  position: 'absolute',
                  top: '12%',
                  right: '-0.55em',
                  fontSize: 'clamp(1.5rem, 4vw, 2.8rem)',
                  fontWeight: 700,
                  color: 'rgba(255,25,135,0.55)',
                  lineHeight: 1,
                }}
              >
                %
              </motion.span>
            </div>

            {/* YENI HISAR — masked reveal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ overflow: 'hidden', marginTop: 20 }}
            >
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.0, delay: 0.35, ease: EASE }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: 'clamp(0.65rem, 1.8vw, 1rem)',
                    fontWeight: 700,
                    letterSpacing: '0.55em',
                    textTransform: 'uppercase',
                    color: 'rgba(251,251,251,0.22)',
                  }}
                >
                  Yeni Hisar International
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Progress bar — bottom of screen ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.4 }}
              style={{
                height: '100%',
                background:
                  'linear-gradient(to right, #ff1987, #ff6ec7, rgba(251,251,251,0.6))',
                transformOrigin: 'left',
              }}
            />
          </motion.div>

          {/* ── Corner label — bottom right ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              position: 'absolute',
              bottom: 18,
              right: 24,
            }}
          >
            <span
              style={{
                fontSize: '0.5rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(251,251,251,0.18)',
                fontWeight: 500,
              }}
            >
              Night Club
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
