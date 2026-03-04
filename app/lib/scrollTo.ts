import { getSmoother } from './smoother';

export function scrollTo(id: string, offsetY = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = getSmoother();

  if (lenis) {
    lenis.scrollTo(el, {
      offset: offsetY,
      duration: 2.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
