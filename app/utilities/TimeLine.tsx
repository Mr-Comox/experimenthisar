'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SimpleAnimatedText from './SimpleAnimatedText';

const schedule = [
  { time: '23:00', label: 'Açılış' },
  { time: '23:30', label: 'Solist Aşkın' },
  { time: '01:00', label: 'Rus Bale Dansı' },
  { time: '01:30', label: 'Solist Asya' },
  { time: '03:30', label: 'Solist Emel' },
  { time: '05:30', label: 'Solist Nur Ateş' },
  { time: '06:30', label: 'Kapanış' },
];

function timeToSeconds(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  const normalizedHour = hour < 12 ? hour + 24 : hour;
  return normalizedHour * 3600 + minute * 60;
}

function getCurrentSeconds(): number {
  const now = new Date();
  const hour = now.getHours();
  const normalizedHour = hour < 12 ? hour + 24 : hour;
  return normalizedHour * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

export default function Timeline() {
  const [currentTime, setCurrentTime] = useState<number>(getCurrentSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(getCurrentSeconds());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const eventTimes = schedule.map((e) => timeToSeconds(e.time));
  const lastEventEnd = eventTimes[eventTimes.length - 1] + 2;
  const isAfterLastEvent = currentTime >= lastEventEnd;

  return (
    <div className='w-full mt-28'>
      {/* ── Header ── */}
      <div className='flex items-end justify-between mb-12 sm:mb-16'>
        <SimpleAnimatedText
          text='Sahne'
          className='text-softWhite font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none'
        />
        <span className='hidden sm:block text-softWhite/20 text-[10px] tracking-[0.3em] uppercase mb-1'>
          Program / Yeni Hisar
        </span>
      </div>

      {/* ── Full-width rule ── */}
      <div className='w-full h-px bg-softWhite/10 mb-0' />

      {/* ── Schedule rows ── */}
      <div className='flex flex-col'>
        {schedule.map(({ time, label }, index) => {
          const eventTimeInSeconds = timeToSeconds(time);
          const nextEventTime =
            index < schedule.length - 1
              ? eventTimes[index + 1]
              : eventTimeInSeconds;

          const isPast = !isAfterLastEvent && currentTime >= nextEventTime;
          const isActive =
            !isAfterLastEvent &&
            currentTime >= eventTimeInSeconds &&
            currentTime < nextEventTime;

          let progressPercent = 0;
          if (!isAfterLastEvent) {
            if (isActive) {
              progressPercent =
                ((currentTime - eventTimeInSeconds) /
                  (nextEventTime - eventTimeInSeconds)) *
                100;
            } else if (isPast) {
              progressPercent = 100;
            }
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: 'easeOut',
              }}
              viewport={{ once: true }}
            >
              {/* Row */}
              <div
                className={`
                  group relative flex items-center
                  py-5 sm:py-6
                  gap-6 sm:gap-10
                  transition-all duration-500
                  ${
                    isActive
                      ? 'opacity-100'
                      : isPast
                        ? 'opacity-40'
                        : 'opacity-60'
                  }
                  hover:opacity-100
                `}
              >
                {/* Time */}
                <span
                  className={`
                    font-serif tabular-nums leading-none flex-shrink-0
                    text-xl sm:text-2xl md:text-3xl
                    ${isActive ? 'text-mainColor' : 'text-softWhite/30'}
                    transition-colors duration-500
                    w-[72px] sm:w-[88px]
                  `}
                >
                  {time}
                </span>

                {/* Connector line with fill */}
                <div className='relative flex-1 h-px bg-softWhite/10 mx-2 sm:mx-4 overflow-visible'>
                  {/* Progress fill */}
                  <div
                    className='absolute top-0 left-0 h-px bg-mainColor transition-all duration-700'
                    style={{ width: `${progressPercent}%` }}
                  />
                  {/* Live dot */}
                  {isActive && index !== schedule.length - 1 && (
                    <div
                      className='absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-mainColor shadow-[0_0_8px_2px_var(--mainColor)] animate-pulse'
                      style={{ left: `${progressPercent}%` }}
                    />
                  )}
                </div>

                {/* Label */}
                <div className='flex items-center gap-3 flex-shrink-0 min-w-[100px] sm:min-w-[140px] md:min-w-[180px] justify-end'>
                  {isActive && index !== schedule.length - 1 && (
                    <span className='text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-mainColor/80 select-none'>
                      Canlı
                    </span>
                  )}
                  <span
                    className={`
                      uppercase tracking-widest
                      text-xs sm:text-sm md:text-base
                      text-right
                      ${isActive ? 'text-softWhite' : 'text-softWhite/60'}
                      transition-colors duration-500
                    `}
                  >
                    {label}
                  </span>
                </div>
              </div>

              {/* Row divider */}
              <div className='w-full h-px bg-softWhite/[0.06]' />
            </motion.div>
          );
        })}
      </div>

      {/* ── Footer note ── */}
      <p className='mt-8 sm:mt-10 text-[10px] text-softWhite/25 tracking-[0.1em] uppercase text-right select-none '>
        * İçerik ve saat bilgileri güncel sistem verilerine göre sunulmaktadır.
      </p>
    </div>
  );
}
