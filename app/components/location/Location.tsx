'use client';

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { LocationIcon } from '@/public/Icons';
import { Headline } from '@/app/utilities/Headline';
import TextReveal from '@/app/utilities/TextReveal';

type Props = { id: string };

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const MARKER = { longitude: 29.0682211, latitude: 40.1830749 };

const MAPS_URL =
  'https://www.google.com/maps/place/Yeni+Hisar+Gazinosu(Bursan%C4%B1n+E%C4%9Flence+Merkezi,+Bursa+E%C4%9Flence+Mekanlar%C4%B1)/@40.1823853,29.0660151,16.4z/data=!4m6!3m5!1s0x14ca3de08bf8e0fd:0xf0e83dc86e09c47d!8m2!3d40.1830749!4d29.0682211!16s%2Fg%2F1ptvwwnrf?entry=ttu';

const SCHEDULE = [
  { day: 'Pazartesi', hours: '23:00 – 06:30' },
  { day: 'Salı', hours: '23:00 – 06:30' },
  { day: 'Çarşamba', hours: '23:00 – 06:30' },
  { day: 'Perşembe', hours: '23:00 – 06:30' },
  { day: 'Cuma', hours: '23:00 – 07:30' },
  { day: 'Cumartesi', hours: '23:00 – 07:30' },
  { day: 'Pazar', hours: '23:00 – 06:30' },
] as const;

const TR_DAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
] as const;

/* ─────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────── */
function useVenue() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [today, setToday] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = d.getHours();
      setOpen(h >= 23 || h < 8);
      setToday(TR_DAYS[d.getDay()]);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return { open, today };
}

function useOnce(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, on };
}

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
export default function Location({ id }: Props) {
  const { today } = useVenue();
  const { ref, on } = useOnce(0.05);

  // SSR-safe client detection — no setState inside an effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const mapStyleProp = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  return (
    <section
      id={id}
      aria-labelledby='location-heading'
      className='relative bg-secondaryColor overflow-hidden'
    >
      {/* ═══════════════════════════════════════════════════
          SPLIT — map left  ·  info right
      ═══════════════════════════════════════════════════ */}
      <div className='flex flex-col lg:flex-row min-h-[88vh] lg:min-h-[800px]'>
        {/* ── MAP — left 56% ── */}
        <div className='relative w-full lg:w-[56%] h-[60vw] min-h-[340px] lg:h-auto shrink-0'>
          {mounted && TOKEN ? (
            <Map
              initialViewState={{ ...MARKER, zoom: 15.5 }}
              style={mapStyleProp}
              mapStyle='mapbox://styles/mapbox/dark-v11'
              mapboxAccessToken={TOKEN}
              scrollZoom={false}
              doubleClickZoom={false}
              dragPan
              touchZoomRotate={false}
            >
              <Marker {...MARKER} anchor='bottom'>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.9,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  whileHover={{ scale: 1.12, transition: { duration: 0.18 } }}
                  className='cursor-pointer'
                >
                  <LocationIcon />
                </motion.div>
              </Marker>
            </Map>
          ) : (
            <div className='w-full h-full bg-tertiaryColor flex items-center justify-center'>
              <span className='text-white/10 text-[0.6rem] uppercase tracking-[0.3em]'>
                Yükleniyor
              </span>
            </div>
          )}

          {/* Right-edge dissolve into info panel */}
          <div className='hidden lg:block pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_right,transparent,#070707)]' />
        </div>

        {/* ── INFO PANEL — right 44% ── */}
        <div
          ref={ref}
          className='relative flex-1 flex flex-col justify-between px-8 sm:px-12 lg:pl-14 xl:pl-18 lg:pr-20 xl:pr-28 py-16 lg:py-20 overflow-hidden border-t lg:border-t-0 lg:border-l border-white/[0.06]'
        >
          {/* ── Headline ── */}
          <div className='relative mb-7'>
            <TextReveal>
              <Headline
                className={`
                font-bold text-white leading-[1.0] tracking-[-0.03em]
                text-[clamp(2.8rem,5vw,4.8rem)]
                transition-[opacity,transform] duration-[900ms] delay-75 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
              >
                İnönü Cad.
                <br />
                No:6,
                <br />
                Osmangazi,
                <br />
                Bursa.
              </Headline>
            </TextReveal>
          </div>

          {/* ── Schedule table ── */}
          <div
            className={`
              relative mb-16 mt-8
              transition-[opacity,transform] duration-[800ms] delay-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
              ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
            `}
          >
            <p className='text-[0.55rem] uppercase tracking-[0.26em] font-medium text-softWhite/50 mb-5'>
              Çalışma Saatleri
            </p>
            <div className='flex flex-col'>
              {SCHEDULE.map(({ day, hours }, i) => {
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className={`
                      flex items-center justify-between py-3
                      ${i < SCHEDULE.length - 1 ? 'border-b border-white/[0.05]' : ''}
                    `}
                  >
                    <span
                      className={`text-[0.82rem] leading-none ${
                        isToday ? 'text-softWhite' : 'text-white/18'
                      }`}
                    >
                      {day}
                    </span>
                    <span
                      className={`text-[0.82rem] tabular-nums leading-none ${
                        isToday ? 'text-mainColor' : 'text-white/18'
                      }`}
                    >
                      {hours}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Contact & CTA ── */}
          <div
            className={`
              relative
              transition-[opacity,transform] duration-[800ms] delay-[230ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
              ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
            `}
          >
            <p className='text-[0.55rem] uppercase tracking-[0.26em] font-medium text-softWhite/50 mb-4'>
              İletişim
            </p>
            <div className='flex flex-col md:flex-row  gap-2.5 mb-10'>
              {[
                { href: 'tel:+902242246634', label: '+90 (224) 224 66 34' },
                { href: 'tel:+902242246635', label: '+90 (224) 224 66 35' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className='group flex items-center gap-2 w-fit text-white/35 hover:text-white/85 transition-colors duration-200'
                >
                  <span className='text-[0.875rem] tabular-nums'>{label}</span>
                  <svg
                    width='9'
                    height='9'
                    viewBox='0 0 12 12'
                    fill='none'
                    className='opacity-0 group-hover:opacity-100 text-mainColor transition-opacity duration-200 shrink-0'
                  >
                    <path
                      d='M1 6h10M7 2l4 4-4 4'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </a>
              ))}
            </div>

            {/* CTA button */}
            <a
              href={MAPS_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='group flex items-center justify-between w-full py-4 px-5 rounded-2xl border border-white/[0.07] hover:border-mainColor/28 bg-white/[0.018] hover:bg-mainColor/[0.04] transition-all duration-300'
            >
              <span className='text-[0.78rem] tracking-[0.16em] uppercase font-medium text-white/40 group-hover:text-white/75 transition-colors duration-300'>
                Yol Tarifi Al
              </span>
              <span className='w-7 h-7 rounded-full border border-white/[0.08] group-hover:border-mainColor/35 flex items-center justify-center shrink-0 transition-colors duration-300'>
                <svg
                  width='9'
                  height='9'
                  viewBox='0 0 12 12'
                  fill='none'
                  className='text-mainColor group-hover:translate-x-px transition-transform duration-200'
                >
                  <path
                    d='M1 6h10M7 2l4 4-4 4'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ── BOTTOM RULE ── */}
      <div className='w-full h-px bg-white/[0.07]' />
    </section>
  );
}
