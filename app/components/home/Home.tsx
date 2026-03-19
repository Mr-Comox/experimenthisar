'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { clearSmoother, setSmoother } from '@/app/lib/smoother';
import PreloadImages from '@/app/utilities/PreloadImages';

import Navbar from '../../shared/Navbar';
import Hero from '../hero/Hero';
import AboutUs from '../about/AboutUs';
import Offer from '../offer/Offer';
import ActivitiesSlider from '../activities/Activities';
import Gallery from '../gallery/Gallery';
import Menu from '../menu/Menu';
import Testimonials from '../testimonials/Testimonials';
import Reservation from '../reservation/Reservation';
import FAQ from '../faq/FAQ';
import Footer from '../footer/Footer';
import Location from '../location/Location';

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
      {/*  silently fetches all gallery images during age gate */}
      <PreloadImages />
      <Navbar />
      <Hero />
      <div className='overflow-x-hidden'>
        <AboutUs id='about' />
        <Offer id='offer' />
        <ActivitiesSlider id='activities' />
      </div>
      {/* Gallery uses GSAP pin:true — must be outside overflow-x-hidden */}
      <Gallery id='gallery' />
      <div className='overflow-x-hidden'>
        <Menu id='menu' />
        <Testimonials id='testimonials' />
        <Location id='location' />
        <Reservation id='reservation' />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
