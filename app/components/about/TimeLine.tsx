'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import AnimatedText from '../../utilities/AnimatedText';

const schedule = [
  { time: '23:00', label: 'Açılış' },
  { time: '23:30', label: 'Solist Aşkın' },
  { time: '01:00', label: 'Rus Bale Dansı' },
  { time: '01:30', label: 'Solist Asya' },
  { time: '03:30', label: 'Solist Emel' },
  { time: '05:30', label: 'Solist Nur Ateş' },
  { time: '06:30', label: 'Kapanış' },
];

function timeToSeconds(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h < 12 ? h + 24 : h) * 3600 + m * 60;
}

function getCurrentSeconds(): number {
  const n = new Date();
  const h = n.getHours();
  return (h < 12 ? h + 24 : h) * 3600 + n.getMinutes() * 60 + n.getSeconds();
}

function minsLeft(secs: number): string {
  const m = Math.ceil(secs / 60);
  if (m < 60) return `${m} dk kaldı`;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${hh}s ${mm}dk kaldı` : `${hh}s kaldı`;
}

function secsUntilOpen(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(23, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function decompose(totalSecs: number) {
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { hours, minutes, seconds };
}

function SingleDigit({ digit }: { digit: string }) {
  return (
    <div
      className='relative overflow-hidden'
      style={{
        width: 'clamp(2.2rem, 9vw, 5.4rem)',
        height: 'clamp(3.6rem, 14.5vw, 8.8rem)',
      }}
    >
      <AnimatePresence mode='popLayout'>
        <motion.span
          key={digit}
          initial={{ y: '-65%', opacity: 0, filter: 'blur(6px)', scale: 0.92 }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ y: '65%', opacity: 0, filter: 'blur(6px)', scale: 0.92 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className='absolute inset-0 flex items-center justify-center
                     font-black tabular-nums leading-none select-none
                     text-white/85 tracking-[-0.05em]'
          style={{ fontSize: 'clamp(3.2rem, 13vw, 8rem)' }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function SingleDigitPlaceholder() {
  return (
    <div
      className='relative overflow-hidden'
      style={{
        width: 'clamp(2.2rem, 9vw, 5.4rem)',
        height: 'clamp(3.6rem, 14.5vw, 8.8rem)',
      }}
    />
  );
}

function CountdownUnit({
  value,
  label,
  mounted,
}: {
  value: number;
  label: string;
  mounted: boolean;
}) {
  const display = String(value).padStart(2, '0');
  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='flex items-center'>
        {mounted ? (
          <>
            <SingleDigit digit={display[0]} />
            <SingleDigit digit={display[1]} />
          </>
        ) : (
          <>
            <SingleDigitPlaceholder />
            <SingleDigitPlaceholder />
          </>
        )}
      </div>
      <span className='uppercase tracking-[0.08em] text-[0.55rem] sm:text-[0.58rem] font-medium text-[#999] select-none'>
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <motion.span
      animate={{ opacity: [0.6, 0.12, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      className='font-black text-white/20 leading-none select-none'
      style={{
        fontSize: 'clamp(2rem, 8vw, 5.5rem)',
        paddingBottom: 'clamp(1.2rem, 4.5vw, 3rem)',
      }}
    >
      :
    </motion.span>
  );
}

const sharedStyles = `
  @property --border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
  @keyframes border-spin {
    to { --border-angle: 360deg; }
  }
  .countdown-border {
    background:
      linear-gradient(rgb(10 10 10 / 10), rgb(10 10 10 / 1)) padding-box,
      conic-gradient(
        from var(--border-angle),
        transparent 0%,
        transparent 30%,
        rgba(255, 25, 135, 0.9) 45%,
        rgba(157, 0, 255, 0.8) 55%,
        transparent 70%,
        transparent 100%
      ) border-box;
    border: 1px solid transparent;
    animation: border-spin 4s linear infinite;
  }
  .now-card-border {
    background:
      linear-gradient(rgb(10 10 10 / 10), rgb(10 10 10 / 1)) padding-box,
      conic-gradient(
        from var(--border-angle),
        transparent 0%,
        transparent 30%,
        rgba(255, 110, 199, 0.9) 45%,
        rgba(157, 0, 255, 0.8) 55%,
        transparent 70%,
        transparent 100%
      ) border-box;
    border: 1px solid transparent;
    animation: border-spin 4s linear infinite;
  }
`;

function CountdownCard() {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setSecs(secsUntilOpen());
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const mounted = secs !== null;
  const { hours, minutes, seconds } = decompose(secs ?? 0);

  return (
    <>
      <style>{sharedStyles}</style>
      <motion.div
        key='countdown-card'
        initial={{ opacity: 0, y: 20, filter: 'blur(12px)', scale: 0.97 }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
        exit={{ opacity: 0, y: -20, filter: 'blur(12px)', scale: 0.97 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className='relative mb-10 rounded-2xl overflow-hidden countdown-border max-w-5xl mx-auto w-full'
      >
        <div className='relative px-5 sm:px-8 py-6 sm:py-8'>
          {/* Header — always one row, text shrinks to fit on small screens */}
          <div className='flex items-center justify-between gap-3 mb-7 sm:mb-8'>
            <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0'>
              <span className='relative flex w-2 h-2'>
                <span className='absolute inset-0 rounded-full bg-white/30 opacity-70 animate-ping' />
                <span className='relative w-2 h-2 rounded-full bg-white/40' />
              </span>
              <span className='text-[0.7rem] tracking-widest uppercase font-semibold text-white/35'>
                Kapalı
              </span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className='text-right text-[#999] tracking-wide'
              style={{ fontSize: 'clamp(0.6rem, 2vw, 0.78rem)' }}
            >
              Kapılar <span className='text-white/80 font-semibold'>23:00</span>
              &apos;de açılıyor
            </motion.p>
          </div>

          {/* Digits */}
          <div className='flex items-end justify-center gap-2 sm:gap-4 lg:gap-8'>
            <CountdownUnit value={hours} label='Saat' mounted={mounted} />
            <Colon />
            <CountdownUnit value={minutes} label='Dakika' mounted={mounted} />
            <Colon />
            <CountdownUnit value={seconds} label='Saniye' mounted={mounted} />
          </div>

          <div className='mt-8 sm:mt-10' />
        </div>
      </motion.div>
    </>
  );
}

const eventTimes = schedule.map((e) => timeToSeconds(e.time));
const openTime = eventTimes[0];
const lastEnd = eventTimes[eventTimes.length - 1] + 2;

export default function Timeline() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(getCurrentSeconds());
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const mounted = now !== null;
  const isBeforeOpen = !mounted || now < openTime;
  const isAfterClose = mounted && now >= lastEnd;
  const isClosed = isBeforeOpen || isAfterClose;
  const afterEnd = mounted && now >= lastEnd;

  const rows = schedule.map((item, idx) => {
    const start = eventTimes[idx];
    const end = idx < schedule.length - 1 ? eventTimes[idx + 1] : start;
    const isPast = mounted && !afterEnd && now >= end;
    const isActive = mounted && !afterEnd && now >= start && now < end;
    const progress = isActive
      ? Math.min(100, ((now! - start) / (end - start)) * 100)
      : isPast
        ? 100
        : 0;
    const secsLeft = isActive ? end - now! : 0;
    return { ...item, idx, isPast, isActive, progress, secsLeft };
  });

  const active = rows.find((r) => r.isActive) ?? null;

  return (
    <div className='w-full mt-36'>
      <style>{sharedStyles}</style>
      <AnimatePresence mode='sync'>
        {isClosed ? (
          <CountdownCard key='countdown' />
        ) : (
          active && (
            <motion.div
              key='now-card'
              initial={{ opacity: 0, y: 20, filter: 'blur(12px)', scale: 0.97 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(12px)', scale: 0.97 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className='relative mb-10 rounded-2xl overflow-hidden now-card-border max-w-5xl mx-auto w-full'
            >
              <div className='relative px-5 sm:px-8 py-5 sm:py-7'>
                <div className='flex items-center justify-between mb-5'>
                  <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mainColor/15 border border-mainColor/30'>
                    <span className='relative flex w-2 h-2'>
                      <span className='absolute inset-0 rounded-full bg-mainColor opacity-70 animate-ping' />
                      <span className='relative w-2 h-2 rounded-full bg-mainColor' />
                    </span>
                    <span className='text-[0.7rem] tracking-widest uppercase font-semibold text-mainColor'>
                      Canlı
                    </span>
                  </div>
                  {active.secsLeft > 0 && (
                    <span className='text-[0.72rem] text-white/40 tracking-wide'>
                      {minsLeft(active.secsLeft)}
                    </span>
                  )}
                </div>
                <motion.p
                  key={active.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className='font-black tracking-[-0.03em] text-white leading-none pt-3'
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}
                >
                  {active.label}
                </motion.p>
                <p className='text-[0.88rem] font-medium text-white/60 tracking-wide pt-10'>
                  {active.time}
                  {active.idx < schedule.length - 1
                    ? ` — ${schedule[active.idx + 1].time}`
                    : ''}
                </p>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <div className='flex items-end justify-between mt-20'>
        <AnimatedText text='Sahne' />
      </div>

      <div>
        {rows.map(({ time, label, idx, isPast, isActive, progress }) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.05 }}
          >
            <div
              className={`relative transition-all duration-500 ${
                isActive
                  ? 'my-2 rounded-xl bg-white/5 border border-white/10'
                  : ''
              }`}
            >
              {isActive && (
                <div
                  className='absolute left-0 top-[15%] bottom-[15%] w-0.5 rounded-full'
                  style={{
                    background:
                      'linear-gradient(to bottom, var(--color-mainColor), var(--color-quaternaryColor))',
                    boxShadow: '0 0 10px rgba(255,25,135,0.8)',
                  }}
                />
              )}
              <div
                className={`flex items-center gap-6 transition-opacity duration-500 ${
                  isActive ? 'px-6 py-5' : 'px-1 py-4'
                } ${isActive ? 'opacity-100' : isPast ? 'opacity-45' : 'opacity-60'}`}
              >
                <span
                  className={`font-bold tracking-[-0.04em] tabular-nums min-w-[4.4ch] ${
                    isActive
                      ? 'text-white'
                      : isPast
                        ? 'text-white/60'
                        : 'text-white/25'
                  }`}
                  style={{ fontSize: 'clamp(1.5rem, 3.8vw, 2.6rem)' }}
                >
                  {time}
                </span>
                <div className='relative flex-1 h-px'>
                  <div className='absolute inset-0 bg-white/10 rounded-full' />
                  <div
                    className='absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000'
                    style={{
                      width: `${progress}%`,
                      background: isPast
                        ? 'rgba(255,255,255,0.25)'
                        : 'linear-gradient(to right, var(--color-mainColor), #c200d8, var(--color-quaternaryColor))',
                    }}
                  />
                </div>
                <div className='flex justify-end min-w-32'>
                  <span
                    className={`uppercase tracking-[0.12em] text-[0.72rem] ${
                      isActive
                        ? 'text-white font-semibold'
                        : isPast
                          ? 'text-white/60'
                          : 'text-white/40'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            </div>
            {!isActive && <div className='h-px bg-white/5 mx-1' />}
          </motion.div>
        ))}
      </div>

      <p className='mt-10 text-right text-[0.58rem] tracking-[0.22em] uppercase text-white/20 select-none'>
        * Saat bilgileri sistem saatine göre güncellenmektedir.
      </p>
    </div>
  );
}
