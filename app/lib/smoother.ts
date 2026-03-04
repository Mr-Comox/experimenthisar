import type Lenis from 'lenis';

let _lenis: Lenis | null = null;

export function setSmoother(l: Lenis) {
  _lenis = l;
}

/** Call before destroying Lenis so stale polls don't see a dead instance. */
export function clearSmoother() {
  _lenis = null;
}

export function getSmoother(): Lenis | null {
  return _lenis;
}
