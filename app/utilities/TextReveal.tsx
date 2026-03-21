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

        // Animation already played — snap visible, no replay
        if (hasPlayed.current) {
          gsap.set(lines.current, { y: '0%' });
          return;
        }

        gsap.set(lines.current, { y: '100%' });

        const animationProps: gsap.TweenVars = {
          y: '0%',
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          delay: delay,

          onStart: () => {
            hasPlayed.current = true;
          },
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
              once: true,
            },
          });
        } else {
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

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientation);
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
