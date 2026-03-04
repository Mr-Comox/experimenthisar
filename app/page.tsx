'use client';

import { useEffect } from 'react';
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
// import Location from './components/location/Location';
import Reservation from './components/reservation/Reservation';
import Footer from './components/footer/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    // Wire Lenis into GSAP's ticker so ScrollTrigger stays in sync.
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Reset to top on every mount (mirrors the old smoother.scrollTo(0) fix).
    lenis.scrollTo(0, { immediate: true });

    setSmoother(lenis);

    return () => {
      // Clear singleton FIRST so any pending rAF polls don't see a dead instance.
      clearSmoother();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  return (
    <main className='relative'>
      <Navbar />
      <Hero />
      <div className='overflow-x-hidden'>
        <AboutUs id='about' />
        <Activities id='activities' />
        <Offer id='offer' />
        <Gallery id='gallery' />
        <Menu id='menu' />
        <Testimonials id='testimonials' />
        {/* <Location id='location' /> */}
        <Reservation id='reservation' />
        <Footer />
      </div>
    </main>
  );
}
