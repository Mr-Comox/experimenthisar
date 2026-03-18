'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Fires `visible = true` once the element crosses the viewport threshold.
 * Disconnects after the first intersection — one-shot reveal only.
 *
 * @param threshold  IntersectionObserver threshold (0–1). Default: 0.08.
 */
export function useReveal(threshold = 0.08) {
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
