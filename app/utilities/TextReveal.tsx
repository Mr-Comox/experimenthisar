'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface TextRevealProps {
  children: React.ReactElement | React.ReactElement[];
  animateOnScroll?: boolean;
  delay?: number;
}

export default function TextReveal({
  children,
  animateOnScroll = true,
  delay = 0,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<Element[]>([]);
  const splitRef = useRef<InstanceType<typeof SplitText>[]>([]);
  const lines = useRef<Element[]>([]);
  const hasPlayed = useRef(false);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const setup = () => {
        // Kill any ScrollTriggers bound to this container before re-creating
        ScrollTrigger.getAll()
          .filter((t) => t.trigger === containerRef.current)
          .forEach((t) => t.kill());

        splitRef.current.forEach((s) => s?.revert());
        splitRef.current = [];
        elementRef.current = [];
        lines.current = [];

        const childCount = containerRef.current!.children.length;
        const elements: Element[] =
          childCount === 1
            ? [containerRef.current!.children[0]]
            : Array.from(containerRef.current!.children);

        elements.forEach((element) => {
          elementRef.current.push(element);

          const split = SplitText.create(element as HTMLElement, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'line++',
          });

          splitRef.current.push(split);

          const computedStyle = window.getComputedStyle(element as HTMLElement);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== '0px') {
            if (split.lines.length > 0) {
              (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            }
            (element as HTMLElement).style.textIndent = '0';
          }

          lines.current.push(...split.lines);
        });

        // Animation already played — snap visible, never reset
        if (hasPlayed.current) {
          gsap.set(lines.current, { y: '0%' });
          return;
        }

        gsap.set(lines.current, { y: '100%' });

        // NOTE: onStart is intentionally removed from animationProps.
        // hasPlayed is set synchronously BEFORE the tween fires so that
        // any ScrollTrigger.refresh() reflow triggered by a parent opacity
        // change (e.g. useReveal wrapper) hits the early-exit above and
        // snaps to y:0% instead of resetting lines and fighting the tween.
        const animationProps: gsap.TweenVars = {
          y: '0%',
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          delay: delay,
        };

        if (animateOnScroll) {
          const el = containerRef.current!;
          const rect = el.getBoundingClientRect();
          const alreadyPassed = rect.top < window.innerHeight * 0.75;

          if (alreadyPassed) {
            // Element is already in/past the viewport threshold.
            // Mark as played NOW — before the tween — so any refresh
            // that fires during the tween's lifetime hits the snap path.
            hasPlayed.current = true;
            gsap.to(lines.current, { ...animationProps, delay: 0 });
          } else {
            ScrollTrigger.create({
              trigger: el,
              start: 'top 75%',
              once: true,
              onEnter: () => {
                // Mark as played synchronously before gsap.to so that
                // any reflow-triggered setup() call during animation
                // snaps to y:0% and exits, never resetting lines.
                hasPlayed.current = true;
                gsap.to(lines.current, animationProps);
              },
            });
          }
        } else {
          hasPlayed.current = true;
          gsap.to(lines.current, animationProps);
        }
      };

      setup();

      let resizeTimer: ReturnType<typeof setTimeout>;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          setup();
          ScrollTrigger.refresh(true);
        }, 200);
      };

      const handleOrientation = () => {
        setTimeout(() => {
          setup();
          ScrollTrigger.refresh(true);
        }, 400);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleOrientation);

      const handleSTRefresh = () => setup();
      ScrollTrigger.addEventListener('refresh', handleSTRefresh);

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientation);
        ScrollTrigger.removeEventListener('refresh', handleSTRefresh);
        splitRef.current.forEach((s) => s?.revert());
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay],
    },
  );

  return (
    <div ref={containerRef} data-text-reveal-wrapper='true'>
      {children}
    </div>
  );
}
