'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { clearSmoother, getSmoother, setSmoother } from '@/app/lib/smoother';
import Preloader from '@/app/utilities/Preloader';

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
import { AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [preloading, setPreloading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  // ─── Lenis + ScrollTrigger setup ─────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    // Keep Lenis frozen until the preloader is gone
    lenis.stop();

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    setSmoother(lenis);

    let refreshTimeout: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
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

  // ─── Re-start Lenis the moment the preloader finishes ────────────────
  useEffect(() => {
    if (!preloading) {
      getSmoother()?.start();
    }
  }, [preloading]);

  return (
    <>
      <AnimatePresence>
        {preloading && <Preloader onComplete={() => setPreloading(false)} />}
      </AnimatePresence>
      <main ref={mainRef} className='relative'>
        <Navbar />
        <Hero />
        <div className='overflow-x-hidden'>
          <AboutUs id='about' />
          <Offer id='offer' />
          <ActivitiesSlider id='activities' />
        </div>
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
    </>
  );
}
