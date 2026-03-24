'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Suspense, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MainColorToQuatFont } from '@/app/utilities/LinearFontColors';

gsap.registerPlugin(MotionPathPlugin);

interface Reservation {
  id: string;
  name: string;
  surname: string;
  guests: number;
  seating_type: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}
type FetchState =
  | { phase: 'loading' }
  | { phase: 'error' }
  | { phase: 'done'; data: Reservation };

const seatingLabel = (t: string) =>
  t === 'vip'
    ? 'VIP Loca'
    : t === 'lounge'
      ? 'Lounge Bar'
      : t === 'masa'
        ? 'Masa'
        : t;
const formatTime = (t: string) => t?.slice(0, 5) ?? '—';

function resolveDisplayDate(dateStr: string, timeStr: string) {
  const [h] = timeStr.split(':').map(Number);
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  if (h <= 5) d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function statusCfg(s: string) {
  if (s === 'confirmed')
    return {
      label: 'Onaylandı',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.25)',
    };
  if (s === 'cancelled')
    return {
      label: 'Reddedildi',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.25)',
    };
  return {
    label: 'Onay Bekleniyor',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.25)',
  };
}

const CACHE_PREFIX = 'res_';
const readCache = (id: string): Reservation | null => {
  try {
    const r = sessionStorage.getItem(CACHE_PREFIX + id);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
};
const writeCache = (id: string, d: Reservation): void => {
  try {
    sessionStorage.setItem(CACHE_PREFIX + id, JSON.stringify(d));
  } catch {
    /**/
  }
};

const FINAL_PX = 72;
const START_PX = 360;

const EASE_STD = [0.25, 0.46, 0.45, 0.94] as const;
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE_STD } },
};
const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.0, ease: EASE_STD } },
};

const Skel = ({ w, h = 'h-[1.1rem]' }: { w: string; h?: string }) => (
  <div
    className={`animate-pulse rounded-md ${h} ${w}`}
    style={{ background: 'rgba(255,255,255,0.07)' }}
  />
);

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 'clamp(0.5rem,0.8vw,0.58rem)',
  color: 'rgba(255,255,255,0.25)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontWeight: 500,
  marginBottom: '8px',
  display: 'block',
};
const VALUE_STYLE: React.CSSProperties = {
  fontSize: 'clamp(0.9rem,1.4vw,1rem)',
  color: 'rgba(255,255,255,0.78)',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

// ─── Inner Component (receives id as prop) ────────────────────────────────────
function ThankYouInner({ id }: { id: string | null }) {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [fetchState, setFetchState] = useState<FetchState>({
    phase: 'loading',
  });
  const [animPhase, setAnimPhase] = useState<
    'animating' | 'drawing' | 'reveal'
  >('animating');
  const fetched = useRef(false);
  const ballRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ball = ballRef.current;
    const slot = slotRef.current;
    if (!ball || !slot) return;

    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const r = slot.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const startX = vw / 2 - START_PX / 2 - r.left;
        const startY = vh / 2 - START_PX / 2 - r.top;

        const shrunkX = vw / 2 - FINAL_PX / 2 - r.left;
        const shrunkY = vh / 2 - FINAL_PX / 2 - r.top;

        const tl = gsap.timeline();

        tl.set(ball, {
          width: START_PX,
          height: START_PX,
          x: startX,
          y: startY,
          opacity: 0,
          borderRadius: '50%',
        });

        tl.to(ball, { opacity: 1, duration: 0.28, ease: 'power2.out' });

        tl.to(ball, {
          width: FINAL_PX,
          height: FINAL_PX,
          x: shrunkX,
          y: shrunkY,
          duration: 0.5,
          ease: 'power3.inOut',
          onStart: () => {
            setAnimPhase('drawing');
          },
        });

        tl.to(ball, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: 'power3.inOut',
          onComplete: () => {
            void gsap.delayedCall(0.1, () => {
              setAnimPhase('reveal');
            });
          },
        });
      }),
    );

    return () => {
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    if (!id) {
      Promise.resolve().then(() => setFetchState({ phase: 'error' }));
      return;
    }
    const cached = readCache(id);
    if (cached) {
      setFetchState({ phase: 'done', data: cached });
      return;
    }
    fetch(`/api/reservations?id=${id}`)
      .then((r) => {
        if (!r.ok) throw 0;
        return r.json() as Promise<Reservation>;
      })
      .then((data) => {
        writeCache(id, data);
        setFetchState({ phase: 'done', data });
      })
      .catch(() => setFetchState({ phase: 'error' }));
  }, [id]);

  const loading = fetchState.phase === 'loading';
  const res = fetchState.phase === 'done' ? fetchState.data : null;
  const st = statusCfg(res?.status ?? 'pending');

  return (
    <main className='bg-secondaryColor min-h-screen relative overflow-hidden flex flex-col'>
      <style>{`
        button,[role=button],a{cursor:pointer!important}
        @keyframes shimmer{0%{background-position:-900px 0}100%{background-position:900px 0}}
        @keyframes cw {to{transform:rotate(360deg)}}
        @keyframes ccw{to{transform:rotate(-360deg)}}
        @keyframes pdot{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
      `}</style>

      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% -5%,rgba(255,25,135,0.11) 0%,transparent 65%)',
        }}
      />
      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse 45% 35% at 90% 92%,rgba(157,0,255,0.055) 0%,transparent 58%)',
        }}
      />
      <div
        className='fixed inset-0 pointer-events-none opacity-[0.022]'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px',
        }}
      />
      <div
        className='fixed pointer-events-none'
        style={{
          width: '800px',
          height: '800px',
          top: '50%',
          left: '50%',
          marginTop: '-400px',
          marginLeft: '-400px',
          animation: 'cw 65s linear infinite',
          opacity: 0.028,
        }}
      >
        <svg viewBox='0 0 800 800' fill='none'>
          <circle
            cx='400'
            cy='400'
            r='394'
            stroke='rgba(255,25,135,1)'
            strokeWidth='.5'
            strokeDasharray='6 16'
          />
          <circle
            cx='400'
            cy='400'
            r='308'
            stroke='rgba(255,25,135,1)'
            strokeWidth='.4'
            strokeDasharray='2 9'
          />
        </svg>
      </div>
      <div
        className='fixed pointer-events-none'
        style={{
          width: '1100px',
          height: '1100px',
          top: '50%',
          left: '50%',
          marginTop: '-550px',
          marginLeft: '-550px',
          animation: 'ccw 90s linear infinite',
          opacity: 0.015,
        }}
      >
        <svg viewBox='0 0 1100 1100' fill='none'>
          <circle
            cx='550'
            cy='550'
            r='544'
            stroke='rgba(157,0,255,1)'
            strokeWidth='.5'
            strokeDasharray='10 26'
          />
        </svg>
      </div>

      {fetchState.phase === 'error' && (
        <div className='flex-1 flex flex-col items-center justify-center z-10 px-6 text-center'>
          <p
            className='text-white/30 font-medium mb-5'
            style={{ fontSize: 'clamp(1rem,2vw,1.1rem)' }}
          >
            Rezervasyon bulunamadı.
          </p>
          <button
            onClick={() => router.push('/rezervasyon')}
            className='text-mainColor/55 hover:text-mainColor transition-colors duration-200 uppercase tracking-[0.22em] font-semibold'
            style={{ fontSize: 'clamp(0.6rem,1vw,0.68rem)' }}
          >
            Yeni Rezervasyon →
          </button>
        </div>
      )}

      {fetchState.phase !== 'error' && (
        <motion.div
          variants={stagger}
          initial='hidden'
          animate='show'
          className='relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8'
          style={{
            paddingTop: 'clamp(5rem,10vw,7rem)',
            paddingBottom: 'clamp(4rem,8vw,6rem)',
          }}
        >
          <div className='w-full max-w-[600px] lg:max-w-[700px] xl:max-w-[780px] flex flex-col items-center'>
            <div
              ref={slotRef}
              className='relative mb-12'
              style={{
                width: FINAL_PX,
                height: FINAL_PX,
                flexShrink: 0,
                overflow: 'visible',
              }}
            >
              <div
                ref={ballRef}
                className='absolute top-0 left-0 flex items-center justify-center'
                style={{
                  width: FINAL_PX,
                  height: FINAL_PX,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(145deg,rgba(255,25,135,0.22) 0%,rgba(255,25,135,0.06) 100%)',
                  border: '1.5px solid rgba(255,25,135,0.38)',
                  boxShadow:
                    '0 0 0 1px rgba(255,25,135,0.08),0 14px 44px rgba(255,25,135,0.2),inset 0 1px 0 rgba(255,255,255,0.1)',
                  opacity: 0,
                }}
              >
                {animPhase !== 'animating' && (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    style={{ width: 30, height: 30 }}
                  >
                    <motion.path
                      d='M5 13l4 4L19 7'
                      stroke='rgba(255,25,135,1)'
                      strokeWidth={2.5}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </svg>
                )}
              </div>
            </div>

            <motion.div
              className='w-full flex flex-col items-center'
              initial={false}
              animate={animPhase === 'reveal' ? 'show' : 'hidden'}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.09 } },
              }}
            >
              <motion.p
                variants={fade}
                className='text-mainColor/40 uppercase font-semibold tracking-[0.5em] mb-6 text-center'
                style={{ fontSize: 'clamp(0.5rem,0.85vw,0.58rem)' }}
              >
                rezervasyon alındı
              </motion.p>

              <motion.h1
                variants={rise}
                className='text-center font-black tracking-[-0.04em] leading-[1.0] mb-6'
                style={{ fontSize: 'clamp(4.5rem,14vw,8.5rem)' }}
              >
                <span className='text-white'>Görüşmek</span>
                <br />
                <MainColorToQuatFont>üzere.</MainColorToQuatFont>
              </motion.h1>

              <motion.p
                variants={rise}
                className='text-white/32 text-center leading-[1.8] mb-14'
                style={{
                  fontSize: 'clamp(0.875rem,1.35vw,0.9375rem)',
                  maxWidth: '30ch',
                }}
              >
                Rezervasyonunuz alındı ve onay sürecine girdi.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 38, scale: 0.96 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.82, ease: EASE_STD },
                  },
                }}
                className='w-full mb-7'
              >
                <div
                  className='relative rounded-[22px] overflow-hidden'
                  style={{
                    background:
                      'linear-gradient(165deg,rgba(255,255,255,0.065) 0%,rgba(255,255,255,0.022) 50%,rgba(157,0,255,0.028) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow:
                      '0 2px 0 rgba(255,255,255,0.05) inset,0 40px 90px rgba(0,0,0,0.6),0 0 0 1px rgba(255,25,135,0.07)',
                  }}
                >
                  <div
                    style={{
                      height: '2px',
                      background:
                        'linear-gradient(90deg,transparent 0%,rgba(255,25,135,.7) 20%,rgba(255,150,210,.55) 50%,rgba(255,25,135,.7) 80%,transparent 100%)',
                      backgroundSize: '900px 100%',
                      animation: 'shimmer 4s linear infinite',
                    }}
                  />

                  <div
                    className='px-8 sm:px-11 pt-8 pb-7'
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className='flex items-center justify-between gap-4'>
                      {loading ? (
                        <Skel w='w-48' h='h-11' />
                      ) : (
                        <p
                          className='text-white font-black tracking-[-0.025em] leading-none flex-1 min-w-0 truncate'
                          style={{ fontSize: 'clamp(1.7rem,4.5vw,2.4rem)' }}
                        >
                          {res?.name} {res?.surname}
                        </p>
                      )}
                      {loading ? (
                        <Skel w='w-32' h='h-7' />
                      ) : (
                        <div
                          className='inline-flex items-center gap-2 rounded-full px-3.5 py-2 shrink-0'
                          style={{
                            background: st.bg,
                            border: `1px solid ${st.border}`,
                          }}
                        >
                          <span
                            className='w-[7px] h-[7px] rounded-full shrink-0'
                            style={{
                              background: st.color,
                              animation: 'pdot 2s ease-in-out infinite',
                            }}
                          />
                          <span
                            className='font-semibold uppercase tracking-[0.1em]'
                            style={{ fontSize: '0.56rem', color: st.color }}
                          >
                            {st.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='relative flex items-center'>
                    <div
                      className='absolute -left-3.5 w-7 h-7 rounded-full z-10'
                      style={{ background: 'var(--color-secondaryColor)' }}
                    />
                    <div
                      className='flex-1 h-px'
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(to right,rgba(255,255,255,0.1) 0,rgba(255,255,255,0.1) 6px,transparent 6px,transparent 14px)',
                      }}
                    />
                    <div
                      className='absolute -right-3.5 w-7 h-7 rounded-full z-10'
                      style={{ background: 'var(--color-secondaryColor)' }}
                    />
                  </div>

                  <div className='px-8 sm:px-11'>
                    <div
                      className='grid grid-cols-2'
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.055)',
                      }}
                    >
                      <div
                        className='py-5 pr-7'
                        style={{
                          borderRight: '1px solid rgba(255,255,255,0.055)',
                        }}
                      >
                        <span style={LABEL_STYLE}>Kişi</span>
                        {loading ? (
                          <Skel w='w-16' />
                        ) : (
                          <span style={VALUE_STYLE}>
                            {res ? `${res.guests} kişi` : '—'}
                          </span>
                        )}
                      </div>
                      <div className='py-5 pl-7'>
                        <span style={LABEL_STYLE}>Oturma</span>
                        {loading ? (
                          <Skel w='w-20' />
                        ) : (
                          <span style={VALUE_STYLE}>
                            {res ? seatingLabel(res.seating_type) : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className='grid grid-cols-2'
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.055)',
                      }}
                    >
                      <div
                        className='py-5 pr-7'
                        style={{
                          borderRight: '1px solid rgba(255,255,255,0.055)',
                        }}
                      >
                        <span style={LABEL_STYLE}>Tarih</span>
                        {loading ? (
                          <Skel w='w-28' />
                        ) : (
                          <span style={VALUE_STYLE}>
                            {res ? resolveDisplayDate(res.date, res.time) : '—'}
                          </span>
                        )}
                      </div>
                      <div className='py-5 pl-7'>
                        <span style={LABEL_STYLE}>Saat</span>
                        {loading ? (
                          <Skel w='w-14' />
                        ) : (
                          <span
                            style={{
                              ...VALUE_STYLE,
                              color: 'var(--color-mainColor)',
                            }}
                          >
                            {res ? formatTime(res.time) : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='grid grid-cols-2'>
                      <div
                        className='py-5 pr-7'
                        style={{
                          borderRight: '1px solid rgba(255,255,255,0.055)',
                        }}
                      >
                        <span style={LABEL_STYLE}>Telefon</span>
                        {loading ? (
                          <Skel w='w-24' />
                        ) : (
                          <span
                            style={{ ...VALUE_STYLE, letterSpacing: '0.02em' }}
                          >
                            {res?.phone ?? '—'}
                          </span>
                        )}
                      </div>
                      <div className='py-5 pl-7'>
                        <span style={LABEL_STYLE}>E-posta</span>
                        {loading ? (
                          <Skel w='w-28' />
                        ) : (
                          <span style={VALUE_STYLE}>{res?.email ?? '—'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className='px-8 sm:px-11 py-4 flex items-center justify-end'
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.055)',
                      background: 'rgba(255,255,255,0.012)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 'clamp(0.54rem,0.82vw,0.62rem)',
                        color: 'rgba(255,255,255,0.42)',
                        fontWeight: 500,
                      }}
                    >
                      Onay sonrası bildirim gönderilecektir
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={rise}
                className='w-full rounded-2xl px-7 py-5 flex items-start gap-4 mb-8'
                style={{
                  background: 'rgba(255,255,255,0.028)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  className='w-4 h-4 shrink-0 mt-px'
                  style={{ color: 'rgba(255,25,135,0.42)' }}
                >
                  <path
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    stroke='currentColor'
                    strokeWidth={1.5}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <p
                  className='text-white/38 leading-[1.75]'
                  style={{ fontSize: 'clamp(0.8rem,1.2vw,0.9rem)' }}
                >
                  Onay bilgisi kayıtlı telefon ve e-posta adresinize
                  iletilecektir. Sorularınız için bizimle iletişime
                  geçebilirsiniz.
                </p>
              </motion.div>

              <motion.div
                variants={rise}
                className='flex flex-col sm:flex-row gap-3 w-full mb-14'
              >
                <button
                  onClick={() => router.push('/')}
                  className='flex-1 h-[52px] rounded-[14px] font-semibold uppercase tracking-[0.15em] transition-all duration-200'
                  style={{
                    fontSize: 'clamp(0.62rem,1vw,0.7rem)',
                    color: 'rgba(255,255,255,0.36)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget;
                    b.style.color = 'rgba(255,255,255,0.68)';
                    b.style.background = 'rgba(255,255,255,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget;
                    b.style.color = 'rgba(255,255,255,0.36)';
                    b.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  Ana Sayfaya Dön
                </button>
                <button
                  onClick={() => router.push('/rezervasyon')}
                  className='flex-1 h-[52px] rounded-[14px] font-semibold uppercase tracking-[0.15em] text-white transition-all duration-200'
                  style={{
                    fontSize: 'clamp(0.62rem,1vw,0.7rem)',
                    background:
                      'linear-gradient(135deg,rgba(255,25,135,0.95) 0%,rgba(210,0,105,0.95) 100%)',
                    boxShadow:
                      '0 1px 0 rgba(255,255,255,0.12) inset,0 12px 32px rgba(255,25,135,0.26)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Yeni Rezervasyon
                </button>
              </motion.div>

              <motion.div
                variants={fade}
                className='flex items-center gap-5 w-full'
              >
                <div
                  className='flex-1 h-px'
                  style={{
                    background:
                      'linear-gradient(to right,transparent,rgba(255,255,255,0.07))',
                  }}
                />
                <p
                  className='text-white/14 uppercase tracking-[0.38em] font-medium shrink-0'
                  style={{ fontSize: '0.48rem' }}
                >
                  Yeni Hisar · Bursa · 1964
                </p>
                <div
                  className='flex-1 h-px'
                  style={{
                    background:
                      'linear-gradient(to left,transparent,rgba(255,255,255,0.07))',
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
function ThankYouWithParams() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  return <ThankYouInner id={id} />;
}
// ─── Outer Component (owns useSearchParams) ───────────────────────────────────
export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouWithParams />
    </Suspense>
  );
}
