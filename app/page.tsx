'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { clearSmoother, setSmoother } from '@/app/lib/smoother';

import Navbar from './shared/Navbar';
import Hero from './components/hero/Hero';
import AboutUs from './components/about/AboutUs';
import Offer from './components/offer/Offer';
import Menu from './components/menu/Menu';
import Activities from './components/activities/Activities';
import Gallery from './components/gallery/Gallery';
import Testimonials from './components/testimonials/Testimonials';
import Location from './components/location/Location';
import Reservation from './components/reservation/Reservation';
import Footer from './components/footer/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    /*
     * ── ignoreMobileResize ────────────────────────────────────────────
     * Prevents ScrollTrigger from remeasuring pin spacers when the
     * mobile URL bar shows/hides (which fires resize events).
     * Without this, every scroll causes a remeasure → pin spacer jumps
     * → page shifts. Must be called before any ScrollTrigger is created.
     */
    ScrollTrigger.config({ ignoreMobileResize: true });

    /*
     * ── FIX FOR BUG 2 (direction-change shift): Lenis config ─────────
     *
     * The "shifts in the direction I was previously scrolling" bug has
     * two causes that compound each other:
     *
     *   1. touchMultiplier: 1.5 — amplifies touch velocity by 1.5×.
     *      When scrolling fast and changing direction, Lenis still has
     *      accumulated velocity in the old direction. At 1.5× that
     *      overshoot is exaggerated.
     *      → Fixed by setting touchMultiplier: 1 (no amplification).
     *
     *   2. duration: 1.2 + scrub: 1.0 (in Gallery) — two separate
     *      easing layers both lagging behind the actual finger position.
     *      Lenis eases for 1.2s, then GSAP scrub adds another 1.0s lag
     *      on top. On a direction change, you feel BOTH delays working
     *      against you.
     *      → Fixed by reducing Lenis duration: 1.0 and scrub: 0.3
     *        (see Gallery.tsx). Together they feel snappy without jitter.
     *
     * Note: smoothTouch defaults to false in Lenis — touch events use
     * native scrolling. duration and easing only affect wheel/trackpad.
     * touchMultiplier is a native-scroll speed multiplier.
     */
    const lenis = new Lenis({
      duration: 1.0, // was 1.2 — tighter easing, less overshoot
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1, // was 1.5 — no velocity amplification on touch
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    setSmoother(lenis);

    /*
     * ── ResizeObserver: scroll-aware, debounced ───────────────────────
     * Watches <main> for layout changes (image loads, font swaps, etc.)
     * and refreshes ScrollTrigger when the page is at rest.
     *
     * isScrolling guard: if Lenis is actively moving when a resize fires,
     * we skip the refresh — the layout hasn't settled. This prevents the
     * "refresh mid-scroll" glitch that caused pin spacers to jump.
     *
     * 400ms debounce: gives layout-shifting content (images, fonts) time
     * to settle before we remeasure. Longer than the previous 120ms to
     * be safe on slow mobile connections.
     */
    let isScrolling = false;
    let scrollIdleTimer: ReturnType<typeof setTimeout>;

    lenis.on('scroll', () => {
      isScrolling = true;
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => {
        isScrolling = false;
      }, 200);
    });

    let refreshTimeout: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        if (!isScrolling) ScrollTrigger.refresh();
      }, 400);
    });

    if (mainRef.current) ro.observe(mainRef.current);

    return () => {
      clearTimeout(refreshTimeout);
      clearTimeout(scrollIdleTimer);
      ro.disconnect();
      clearSmoother();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return (
    <main ref={mainRef} className='relative'>
      <Navbar />
      <Hero />

      {/*
       * overflow-x-hidden creates a new scroll container in all browsers.
       * Components using GSAP pin:true or position:sticky MUST live
       * outside these wrappers — they will be clipped and miscalculated
       * inside overflow-x-hidden.
       */}
      <div className='overflow-x-hidden'>
        <AboutUs id='about' />
        <Offer id='offer' />
        <Activities id='activities' />
      </div>

      {/* Gallery uses GSAP pin:true — must be outside overflow-x-hidden */}
      <Gallery id='gallery' />

      <div className='overflow-x-hidden'>
        <Menu id='menu' />
        <Testimonials id='testimonials' />
        <Location id='location' />
        <Reservation id='reservation' />
        <Footer />
      </div>
    </main>
  );
}
