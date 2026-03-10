'use client';

import { useRef, useEffect } from 'react';
import React from 'react';

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  play?: boolean; // ✅ new
};

export default function AnimatedCounter({
  value,
  suffix = '',
  duration = 3500,
  delay = 400,
  className = '',
  style,
  play = false, // ✅
}: Props) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const hasPlayed = useRef(false); // ✅ prevent double-fire

  useEffect(() => {
    if (!play || hasPlayed.current) return; // ✅ wait for parent signal
    hasPlayed.current = true;

    const wrapper = wrapperRef.current;
    const number = numberRef.current;
    if (!wrapper || !number) return;

    // ✅ Remove the old IntersectionObserver entirely — parent handles it
    const timeoutId = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(eased * value);
        number.textContent = Intl.NumberFormat('en-US').format(current);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [play, value, duration, delay]); // ✅ re-runs only when `play` flips tru
  return (
    <span ref={wrapperRef} className={className} style={style}>
      <span ref={numberRef}>0</span>
      {suffix}
    </span>
  );
}
