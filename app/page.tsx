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
     * ── FIX FOR BUG 2: ignoreMobileResize ────────────────────────────
     *
     * This is the single most important fix for the "page shifts when
     * scrolling up/down past gallery" bug.
     *
     * Without this, ScrollTrigger re-measures and repositions ALL pin
     * spacers on every viewport resize — including the tiny, continuous
     * resize events fired by mobile browsers as the URL bar animates
     * in/out during scrolling. Each remeasurement desynchronises the
     * pin spacer height from Lenis's virtual scroll position, causing
     * the content above/below the pinned section to jump.
     *
     * ignoreMobileResize tells ScrollTrigger to ignore resize events
     * where only the vertical height changed by a small amount (i.e.
     * URL bar show/hide). It still responds to real orientation changes
     * and desktop resizes. This is GSAP's official recommendation for
     * Lenis + mobile pin layouts.
     *
     * Must be called BEFORE Lenis and ScrollTrigger are initialised.
     */
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    setSmoother(lenis);

    /*
     * ── FIX FOR BUG 1: scroll-aware ResizeObserver ───────────────────
     *
     * The previous ResizeObserver called ScrollTrigger.refresh() on
     * any <main> size change. The problem:
     *
     *   1. The Gallery's visualViewport listener (now removed) was
     *      setting panel.style.height = px on every URL-bar event.
     *   2. That changed <main>'s height.
     *   3. ResizeObserver fired and called refresh() with only 120ms
     *      debounce — still fast enough to fire mid-scroll.
     *   4. refresh() + Lenis running = pin spacer jumps = glitch.
     *
     * Two changes here:
     *
     *   a) isScrolling guard: track whether Lenis is actively moving.
     *      If it is, skip the refresh — the layout hasn't settled yet.
     *      Refresh will happen naturally once scroll stops.
     *
     *   b) Debounce increased from 120ms → 400ms: content layout
     *      changes (image loads, font swaps, countdowns) need a longer
     *      settling window on mobile, especially after orientation change.
     *
     * Together these ensure refresh() only fires when the page is truly
     * at rest, never while Lenis is animating the scroll position.
     */
    let isScrolling = false;
    let scrollIdleTimer: ReturnType<typeof setTimeout>;

    lenis.on('scroll', () => {
      isScrolling = true;
      clearTimeout(scrollIdleTimer);
      // Mark scroll as idle 200ms after the last scroll event.
      // This is shorter than the ResizeObserver debounce so that
      // if a resize fires right as scrolling stops, the flag has
      // already cleared by the time the debounce resolves.
      scrollIdleTimer = setTimeout(() => {
        isScrolling = false;
      }, 200);
    });

    let refreshTimeout: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        // Only refresh when Lenis is idle. If the user is still
        // scrolling, the layout hasn't settled — skip and wait
        // for the next ResizeObserver event after scroll stops.
        if (!isScrolling) {
          ScrollTrigger.refresh();
        }
      }, 400); // increased from 120ms → 400ms
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
       * Any child using position: sticky or GSAP pin (position: fixed)
       * will be clipped and miscalculated inside it.
       *
       * Rule: components that use pin:true (Gallery) or position:sticky
       * must live OUTSIDE overflow-x-hidden wrappers.
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
