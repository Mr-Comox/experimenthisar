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

    // ─── ResizeObserver ───────────────────────────────────────────────
    // Any dynamic height change above a pinned section (e.g. countdown
    // card → now card in Timeline) shifts that section's scroll offset.
    // ScrollTrigger only remeasures on window resize by default, so the
    // pin spacer goes stale and the snap/break happens.
    // Watching <main> with ResizeObserver catches every layout change —
    // countdown swap, image load, font swap, anything — and refreshes.
    let refreshTimeout: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      // Debounce: layout can change in several frames (e.g. image loads),
      // wait for it to settle before refreshing.
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    });

    if (mainRef.current) ro.observe(mainRef.current);

    return () => {
      clearTimeout(refreshTimeout);
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
       * (Gratitude) must live OUTSIDE overflow-x-hidden wrappers.
       *
       * overflow-x-hidden is only needed to contain sections that have
       * elements visually overflowing the viewport edge (slide-in panels,
       * parallax layers, etc.). Keep those sections in their own wrapper.
       */}

      <div className='overflow-x-hidden'>
        <AboutUs id='about' />
        <Offer id='offer' />
        <Activities id='activities' />
      </div>

      {/* Gallery uses GSAP pin:true — must be outside overflow-x-hidden */}
      {/* <Gallery id='gallery' /> */}

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
