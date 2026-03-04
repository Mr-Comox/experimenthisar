'use client';

import { useEffect, useRef } from 'react';
import { logoData } from '@/app/utilities/LogoData';

const Hero = () => {
  const heroImgContainerRef = useRef<HTMLDivElement>(null);
  const heroImgLogoRef = useRef<HTMLDivElement>(null);
  const heroImgCopyRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  const svgOverlayRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const logoMaskRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let ctx: any;
    let lenis: any;
    let scrollTriggerInstance: any;

    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const Lenis = (await import('lenis')).default;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      const heroImgContainer = heroImgContainerRef.current;
      const heroImgLogo = heroImgLogoRef.current;
      const heroImgCopy = heroImgCopyRef.current;
      const fadeOverlay = fadeOverlayRef.current;
      const svgOverlay = svgOverlayRef.current;
      const logoContainer = logoContainerRef.current;
      const logoMask = logoMaskRef.current;

      if (
        !heroImgContainer ||
        !heroImgLogo ||
        !heroImgCopy ||
        !fadeOverlay ||
        !svgOverlay ||
        !logoContainer ||
        !logoMask
      )
        return;

      const initialOverlayScale = 400;

      logoMask.setAttribute('d', logoData);

      const logoDimensions = logoContainer.getBoundingClientRect();
      const logoBoundingBox = logoMask.getBBox();

      const horizontalScaleRatio = logoDimensions.width / logoBoundingBox.width;
      const verticalScaleRatio = logoDimensions.height / logoBoundingBox.height;
      const logoScaleFactor = Math.min(
        horizontalScaleRatio,
        verticalScaleRatio,
      );

      const logoHorizontalPosition =
        logoDimensions.left +
        (logoDimensions.width - logoBoundingBox.width * logoScaleFactor) / 2 -
        logoBoundingBox.x * logoScaleFactor;

      const logoVerticalPosition =
        logoDimensions.top +
        (logoDimensions.height - logoBoundingBox.height * logoScaleFactor) / 2 -
        logoBoundingBox.y * logoScaleFactor;

      logoMask.setAttribute(
        'transform',
        `translate(${logoHorizontalPosition}, ${logoVerticalPosition}) scale(${logoScaleFactor})`,
      );

      ctx = gsap.context(() => {
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: '.hero',
          start: 'top top',
          end: `${window.innerHeight * 5}px`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self: any) => {
            const scrollProgress = self.progress;
            const fadeOpacity = 1 - scrollProgress * (1 / 0.15);

            if (scrollProgress <= 0.15) {
              gsap.set([heroImgLogo, heroImgCopy], { opacity: fadeOpacity });
            } else {
              gsap.set([heroImgLogo, heroImgCopy], { opacity: 0 });
            }

            if (scrollProgress <= 0.85) {
              const normalizedProgress = scrollProgress * (1 / 0.85);
              const heroImgContainerScale = 1 - 0.01 * normalizedProgress;
              const overlayScale =
                initialOverlayScale *
                Math.pow(1 / initialOverlayScale, normalizedProgress);

              let fadeOverlayOpacity = 0;

              gsap.set(heroImgContainer, { scale: heroImgContainerScale });
              gsap.set(svgOverlay, { scale: overlayScale });

              if (scrollProgress >= 0.25) {
                fadeOverlayOpacity = Math.min(
                  1,
                  (scrollProgress - 0.25) * (1 / 0.4),
                );
              }

              gsap.set(fadeOverlay, { opacity: fadeOverlayOpacity });
            }
          },
        });
      });
    };

    init();

    return () => {
      ctx?.revert();
      scrollTriggerInstance?.kill();
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <section className='hero'>
        <div ref={heroImgContainerRef} className='hero-img-container'>
          <img src='/photo1.jpeg' alt='' />
          <div ref={heroImgLogoRef} className='hero-img-logo'>
            <img src='/logo.webp' alt='' />
          </div>
          <div ref={heroImgCopyRef} className='hero-img-copy'>
            <p>Scroll down to reveal</p>
          </div>
        </div>

        <div ref={fadeOverlayRef} className='fade-overlay' />

        <div ref={svgOverlayRef} className='overlay'>
          <svg width='100%' height='100%'>
            <defs>
              <mask id='logoRevealMask'>
                <rect width='100%' height='100%' fill='white' />
                <path ref={logoMaskRef} id='logoMask' />
              </mask>
            </defs>
            <rect
              width='100%'
              height='100%'
              fill='#111117'
              mask='url(#logoRevealMask)'
            />
          </svg>
        </div>

        <div ref={logoContainerRef} className='logo-container' />

        <div className='overlay-copy'>
          <h1>
            Animation <br />
            cem <br />
            akar
          </h1>
        </div>
      </section>

      <section className='outro'>
        <p>build your empire</p>
      </section>
    </>
  );
};

export default Hero;
