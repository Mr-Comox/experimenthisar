'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollTo } from '@/app/lib/scrollTo';

// ─── Shaders ────────────────────────────────────────────────────────────────
const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uSpread;
  varying vec2 vUv;

  float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
  }

  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(
      mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
      mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.0) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

    float dissolveEdge = uv.y - uProgress * 1.2;
    float noiseValue = fbm(centeredUv * 15.0);
    float d = dissolveEdge + noiseValue * uSpread;

    float pixelSize = 1.0 / uResolution.y;
    float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ─── Config ───────────────────────────────────────────────────────────────────
const SLIDES = [
  { src: '/photo1.jpeg', alt: 'Yeni Hisar' },
  { src: '/photo2.jpeg', alt: 'Yeni Hisar Sahne' },
  { src: '/photo3.jpeg', alt: 'Yeni Hisar Atmosfer' },
  { src: '/photo4.jpeg', alt: 'Yeni Hisar Atmosfer' },
];

const SLIDE_MS = 6000;

const DRIFT = [
  { x: ['0%', '-1.8%'], y: ['0%', '-0.6%'] },
  { x: ['-1.5%', '0%'], y: ['0%', '0.6%'] },
  { x: ['0%', '1.5%'], y: ['-0.4%', '0.4%'] },
  { x: ['1.2%', '-0.6%'], y: ['0%', '-0.5%'] },
];

const DISSOLVE_COLOR = '#070707';

// Lower = slower dissolve. 2 = full wipe at 50% scroll (too fast on mobile).
// 1.1 = full wipe at ~91% scroll — user can actually appreciate the effect.
const SHADER_SPEED = 1.1;
const SHADER_SPREAD = 0.5;

const DESCRIPTION =
  "Şehrin kalbinde, gecenin en özgün atmosferinde buluşuyoruz. Müzik, ışık ve enerjinin mükemmel uyumunu keşfetmek için sizi Yeni Hisar'a bekliyoruz.";

if (typeof window !== 'undefined') {
  SLIDES.forEach(({ src }) => {
    const img = new window.Image();
    img.src = src;
  });
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({
  active,
  done,
  animKey,
  onClick,
}: {
  active: boolean;
  done: boolean;
  animKey: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label='Slayta git'
      className='h-0.5 flex-1 relative overflow-hidden cursor-pointer bg-white/15'
    >
      {done && <span className='absolute inset-0 bg-[#FF1987]/55' />}
      {active && (
        <span
          key={animKey}
          className='absolute inset-0 animate-progress bg-linear-to-r from-[#FF1987] to-[#c800cc]'
        />
      )}
    </button>
  );
}

// ─── MaskedLine ───────────────────────────────────────────────────────────────
function MaskedLine({
  children,
  delay = 0,
  ready,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  ready: boolean;
  className?: string;
}) {
  return (
    <div
      className='overflow-hidden'
      style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
    >
      <motion.div
        initial={{ y: '105%' }}
        animate={ready ? { y: '0%' } : { y: '105%' }}
        transition={{ duration: 1.05, delay, ease: EASE_OUT_EXPO }}
        style={{ willChange: 'transform' }}
      >
        <span className={className}>{children}</span>
      </motion.div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [ready, setReady] = useState(false);
  // true once scroll-dissolve starts — disables pills + CTA so user can't
  // accidentally tap them while the wipe is happening
  const [dissolving, setDissolving] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const descRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
      setAnimKey((k) => k + 1);
    }, SLIDE_MS);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = SLIDES[0].src;

    const onReady = () => {
      setReady(true);
      startTimer();
    };

    if (img.complete) {
      requestAnimationFrame(onReady);
    } else {
      img.onload = onReady;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let material: any;
    let rafId: number;
    let scrollProgress = 0;

    const init = async () => {
      const THREE = await import('three');

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
      });

      const setSize = () => {
        const w = section.offsetWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (material) material.uniforms.uResolution.value.set(w, h);
      };

      setSize();

      const hex = DISSOLVE_COLOR.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;

      const geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uProgress: { value: 0 },
          uResolution: {
            value: new THREE.Vector2(section.offsetWidth, window.innerHeight),
          },
          uColor: { value: new THREE.Vector3(r, g, b) },
          uSpread: { value: SHADER_SPREAD },
        },
        transparent: true,
      });

      scene.add(new THREE.Mesh(geometry, material));

      const tick = () => {
        material.uniforms.uProgress.value = scrollProgress;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      };
      tick();

      window.addEventListener('resize', setSize);
    };

    const onScroll = () => {
      if (!section) return;
      const heroHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = heroHeight - windowHeight;
      const scroll = window.scrollY;
      const progress =
        maxScroll > 0 ? Math.min((scroll / maxScroll) * SHADER_SPEED, 1.1) : 0;
      scrollProgress = progress;
      // Disable controls as soon as dissolve begins (progress > small threshold)
      setDissolving(progress > 0.04);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    init();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;
    let fallbackTimer: ReturnType<typeof setTimeout>;

    const setup = async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { SplitText } = await import('gsap/SplitText');
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const el = descRef.current;
      if (!el) return;

      const split = new SplitText(el, { type: 'words' });
      const words = split.words as HTMLElement[];

      // ── FIX 2: prevent flash ───────────────────────────────────────────────
      // Hide words THEN show container — text is invisible from first paint,
      // so there is no flash even on reload. GSAP controls opacity from here.
      gsap.set(words, { opacity: 0 });
      gsap.set(el, { opacity: 1 });

      // Safety fallback: on short viewports (landscape phones, small tablets)
      // ScrollTrigger may never fire because the section is unreachable.
      // After 1.5s, fade all words in so text is never permanently hidden.
      fallbackTimer = setTimeout(() => {
        gsap.to(words, { opacity: 1, duration: 0.8, stagger: 0.03 });
      }, 1500);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '.hero-desc',
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () => clearTimeout(fallbackTimer),
          onUpdate: (self) => {
            clearTimeout(fallbackTimer);
            const progress = self.progress;
            const total = words.length;

            words.forEach((word, i) => {
              const start = i / total;
              const end = (i + 1) / total;
              let opacity = 0;

              if (progress >= end) {
                opacity = 1;
              } else if (progress >= start) {
                opacity = (progress - start) / (end - start);
              }

              gsap.to(word, { opacity, duration: 0.1, overwrite: true });
            });
          },
        });
      });
    };

    setup();
    return () => {
      clearTimeout(fallbackTimer);
      ctx?.revert();
    };
  }, [ready]);

  const goTo = (i: number) => {
    if (i === index) return;
    setIndex(i);
    setAnimKey((k) => k + 1);
    startTimer();
  };

  // ── FIX 1: landscape responsiveness ───────────────────────────────────────
  // portrait:  5rem → 12rem  (your original, unchanged)
  // landscape: drops to 3rem on phones so both lines fit in short vh
  const sharedTextClass =
    'font-black tracking-tight leading-[0.88] ' +
    'text-[5rem] xs:text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[10.5rem] xl:text-[12rem] ' +
    // landscape: 6.5vw gives ~60px on 926px wide — readable but not overwhelming
    'landscape:max-lg:text-[clamp(2rem,6.5vw,3.8rem)]';

  return (
    <section
      ref={sectionRef}
      className='relative w-full overflow-hidden bg-secondaryColor'
      style={{ height: '175svh' }}
    >
      {/* ── GRAIN ─────────────────────────────────────────────────────────── */}
      <div
        className='absolute inset-0 z-[15] pointer-events-none opacity-[0.032] mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── STICKY IMAGE + OVERLAYS + CANVAS ─────────────────────────────── */}
      <div className='sticky top-0 w-full h-svh overflow-hidden'>
        {/* Slideshow */}
        <AnimatePresence mode='sync'>
          <motion.div
            key={index}
            className='absolute inset-0 z-[2]'
            initial={{ opacity: ready ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <motion.img
              src={SLIDES[index].src}
              alt={SLIDES[index].alt}
              draggable={false}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              onContextMenu={(e) => e.preventDefault()}
              className='absolute inset-0 w-full h-full object-cover object-center select-none'
              style={{
                willChange: 'transform',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              initial={{ x: DRIFT[index].x[0], y: DRIFT[index].y[0] }}
              animate={{ x: DRIFT[index].x[1], y: DRIFT[index].y[1] }}
              transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: 'linear' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div
          className='absolute inset-0 z-[10] pointer-events-none'
          style={{
            background: `
              linear-gradient(to bottom,  var(--color-secondaryColor, #000) 0%, transparent 40%, var(--color-secondaryColor, #000) 100%),
              linear-gradient(to right,   var(--color-secondaryColor, #000) 0%, transparent 60%),
              linear-gradient(to left,    var(--color-secondaryColor, #000) 0%, transparent 55%)
            `,
            opacity: 0.85,
          }}
        />

        {/* Centered title */}
        <div className='absolute inset-0 z-[20] flex flex-col items-center justify-center text-center pointer-events-none'>
          <MaskedLine
            delay={0}
            ready={ready}
            className={`text-[#FBFBFB] ${sharedTextClass}`}
          >
            YENI
          </MaskedLine>
          <MaskedLine
            delay={0.18}
            ready={ready}
            className={`text-stroke-white ${sharedTextClass}`}
          >
            HISAR
          </MaskedLine>
          <motion.p
            className='text-[#FBFBFB]/60 text-sm sm:text-base landscape:max-lg:text-[0.6rem] tracking-[0.3em] landscape:max-lg:tracking-[0.2em] uppercase mt-3 landscape:max-lg:mt-1'
            initial={{ opacity: 0, y: 8 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT_EXPO }}
          >
            International Night Club
          </motion.p>
        </div>

        {/* Progress bars + CTA */}
        <motion.div
          className='absolute bottom-0 left-0 z-[20] pb-8 sm:pb-10 landscape:max-lg:pb-4 px-6 sm:px-10 lg:px-14 w-full
                     flex items-center justify-between gap-6 transition-opacity duration-300'
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          style={{
            willChange: 'transform, opacity',
            // Fade out and block all interaction as soon as dissolve starts
            opacity: dissolving ? 0 : undefined,
            pointerEvents: dissolving ? 'none' : undefined,
          }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT_EXPO }}
        >
          <div className='flex items-center gap-2 flex-1 max-w-40'>
            {SLIDES.map((_, i) => (
              <ProgressBar
                key={i}
                active={i === index}
                done={i < index}
                animKey={animKey}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <motion.button
            onClick={() => scrollTo('reservation')}
            className='cursor-pointer group flex items-center gap-3 border rounded-3xl
                       border-[#FBFBFB]/20 px-4 py-3 lg:px-8 lg:py-4 landscape:max-lg:px-3 landscape:max-lg:py-2
                       hover:border-[#FF1987]/60 transition-colors duration-300'
            whileTap={{ scale: 0.97 }}
          >
            <span
              className='text-[#FBFBFB]/75 group-hover:text-[#FBFBFB] uppercase font-bold
                             tracking-[0.25em] transition-colors duration-300 text-[0.62rem]'
            >
              Rezervasyon
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 16 16'
              fill='none'
              className='text-[#FF1987] translate-x-0 group-hover:translate-x-1 transition-transform duration-300'
            >
              <path
                d='M1 8h14M9 2l6 6-6 6'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </motion.button>
        </motion.div>

        <canvas
          ref={canvasRef}
          className='absolute inset-0 z-[30] w-full h-full pointer-events-none'
        />
      </div>

      {/* ── DESCRIPTION ───────────────────────────────────────────────────── */}
      <div className='hero-desc absolute bottom-0 left-0 w-full h-[70svh] flex items-center justify-center bg-secondaryColor'>
        <h2
          ref={descRef}
          style={{
            opacity: 0,
            // mobile/tablet: starts at 1.6rem (was 1.1rem), fluid up to 4.5rem on desktop
            // 5vw hits ~1.9rem on 375px phone, ~3rem on 600px tablet — much more readable
            fontSize: 'clamp(1.6rem, 5vw, 3rem)',
          }}
          className='text-center text-[#FBFBFB] uppercase font-black tracking-tight leading-[0.9]
                     w-[85%] sm:w-[78%] lg:w-[70%]
                     max-[1000px]:w-[calc(100%-3rem)]'
        >
          {DESCRIPTION}
        </h2>
      </div>
    </section>
  );
}
