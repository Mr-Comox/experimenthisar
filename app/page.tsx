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
import FAQ from './components/faq/FAQ';

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

    // Every time ScrollTrigger remeasures the page (pin spacer added/removed,
    // images load, etc.) tell Lenis the new scroll limit so it doesn't
    // clamp scroll position at the wrong point and cause the tick-back.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    // ─── Window resize only ───────────────────────────────────────────
    // The previous ResizeObserver on <main> was firing on every scroll
    // frame while GSAP's Gallery pin was active (GSAP toggles position:fixed
    // on the pinned element, which changes <main>'s layout continuously).
    // That caused ScrollTrigger.refresh() + invalidateOnRefresh to run
    // ~120ms after every scroll pause → tiny position correction → the tick.
    //
    // window 'resize' only fires on real viewport changes (orientation,
    // browser chrome resize) — never on GSAP pin updates — so it's safe.
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onWindowResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh(); // fires onRefresh above → lenis.resize()
      }, 150);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', onWindowResize);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      clearSmoother();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return (
    <main ref={mainRef} className='relative'>
      <Navbar />
      <Hero />

      <div className='overflow-x-hidden'>
        <AboutUs id='about' />
        <Offer id='offer' />
        <Activities id='activities' />
        <Menu id='menu' />
      </div>

      {/* Gallery uses GSAP pin:true — must be outside overflow-x-hidden */}
      <Gallery id='gallery' />

      <div className='overflow-x-hidden'>
        <Testimonials id='testimonials' />
        <Location id='location' />
        <Reservation id='reservation' />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
