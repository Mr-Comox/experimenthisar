'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
type SeatingType = 'lounge' | 'vip' | 'masa';

interface UserInfo {
  name: string;
  surname: string;
  phone: string;
  email: string;
}

// ─── Static constants ─────────────────────────────────────────────────────────
const STEP_LABELS = [
  'Kişi',
  'Oturma',
  'Tarih & Saat',
  'İletişim',
  'Özet',
] as const;
const TOTAL_STEPS = STEP_LABELS.length;
const EASING = [0.25, 0.46, 0.45, 0.94] as const;

const CONTENT_VARIANTS = {
  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 16 : -16 }),
  center: { opacity: 1, y: 0 },
  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -10 : 10 }),
};
const CONTENT_TRANSITION = {
  enter: { duration: 0.26, ease: EASING },
  center: { duration: 0.26, ease: EASING },
  exit: { duration: 0.12, ease: [0.4, 0, 1, 1] as const },
};
const PANEL_VARIANTS = {
  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 14 : -14, scale: 0.98 }),
  center: { opacity: 1, y: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -14 : 14, scale: 0.98 }),
};

const SEATING_OPTIONS = [
  {
    value: 'vip' as SeatingType,
    num: '01',
    label: 'VIP Loca',
    desc: 'Özel ve konforlu alan — sahneye en yakın deneyim',
    detail:
      'Kapalı, özel alanınızda gecenin tüm enerjisini hissederken tam konfor yaşayın.',
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-5 h-5'>
        <path
          d='M12 2l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 2z'
          stroke='currentColor'
          strokeWidth={1.4}
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    value: 'lounge' as SeatingType,
    num: '02',
    label: 'Lounge Bar',
    desc: 'Rahat ve sosyal atmosfer — hareket özgürlüğü',
    detail:
      'Sahne boyunca uzanan bar bölümünde müzikle iç içe, dinamik bir gece.',
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-5 h-5'>
        <path
          d='M8 3h8v3a4 4 0 01-8 0V3zm4 10v5m-3 3h6'
          stroke='currentColor'
          strokeWidth={1.4}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    value: 'masa' as SeatingType,
    num: '03',
    label: 'Masa',
    desc: 'Standart oturma alanı — klasik deneyim',
    detail:
      'Seçkin salonumuzda yerleşik masanızda geceyi tüm detaylarıyla keşfedin.',
    icon: (
      <svg viewBox='0 0 24 24' fill='none' className='w-5 h-5'>
        <rect
          x='3'
          y='8'
          width='18'
          height='3'
          rx='1'
          stroke='currentColor'
          strokeWidth={1.4}
        />
        <path
          d='M7 11v6M17 11v6'
          stroke='currentColor'
          strokeWidth={1.4}
          strokeLinecap='round'
        />
      </svg>
    ),
  },
] as const;

const WEEK_DAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'] as const;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p: string) => /^[0-9+\s()-]{10,}$/.test(p);

function generateTimeSlots(): { time: string; period: 'Gece' | 'Sabah' }[] {
  const slots: { time: string; period: 'Gece' | 'Sabah' }[] = [];
  for (let min = 0; min < 60; min += 15)
    slots.push({ time: `23:${String(min).padStart(2, '0')}`, period: 'Gece' });
  for (let h = 0; h <= 5; h++) {
    const maxMin = h === 5 ? 0 : 45;
    for (let min = 0; min <= maxMin; min += 15)
      slots.push({
        time: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        period: h < 3 ? 'Gece' : 'Sabah',
      });
  }
  return slots;
}

const ALL_TIME_SLOTS = generateTimeSlots();
const NIGHT_SLOTS = ALL_TIME_SLOTS.filter((s) => s.period === 'Gece');
const MORNING_SLOTS = ALL_TIME_SLOTS.filter((s) => s.period === 'Sabah');

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  for (let i = 0; i < startOffset; i++)
    days.push({
      date: new Date(year, month, -startOffset + i + 1),
      isCurrentMonth: false,
    });
  for (let i = 1; i <= lastDay.getDate(); i++)
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  while (days.length < 42)
    days.push({
      date: new Date(
        year,
        month + 1,
        days.length - lastDay.getDate() - startOffset + 1,
      ),
      isCurrentMonth: false,
    });
  return days;
}

function seatingLabel(s: SeatingType | null) {
  if (s === 'vip') return 'VIP Loca';
  if (s === 'lounge') return 'Lounge Bar';
  if (s === 'masa') return 'Masa';
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReservationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [guestSelected, setGuestSelected] = useState(false);
  const [seatingType, setSeatingType] = useState<SeatingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [viewingMonth, setViewingMonth] = useState(() => new Date().getMonth());
  const [viewingYear, setViewingYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    surname: '',
    phone: '',
    email: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredCount, setHoveredCount] = useState<number | null>(null);

  // Refs for programmatic scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const innerScrollRef = useRef<HTMLDivElement>(null);
  const timeNoticeRef = useRef<HTMLDivElement>(null);

  // Scroll BOTH containers to top on every step change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    if (innerScrollRef.current) innerScrollRef.current.scrollTop = 0;
  }, [currentStep]);

  // ── Derived / memoised ──────────────────────────────────────────────────────
  const isFullWidth = currentStep === 3 || currentStep === 5;

  const calendarDays = useMemo(
    () => buildCalendar(viewingYear, viewingMonth),
    [viewingYear, viewingMonth],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isTimeSlotPast = useCallback(
    (slotTime: string): boolean => {
      if (!selectedDate) return false;
      const now = new Date();
      const [slotH, slotM] = slotTime.split(':').map(Number);
      const todayMidnight = new Date(now);
      todayMidnight.setHours(0, 0, 0, 0);
      const selMidnight = new Date(selectedDate);
      selMidnight.setHours(0, 0, 0, 0);
      if (selMidnight.getTime() !== todayMidnight.getTime()) return false;
      const nowH = now.getHours(),
        nowM = now.getMinutes();
      if (nowH === 23) {
        if (slotH !== 23) return false;
        return nowH * 60 + nowM >= slotH * 60 + slotM;
      }
      if (nowH <= 5) {
        if (slotH === 23) return true;
        return nowH * 60 + nowM >= slotH * 60 + slotM;
      }
      return false;
    },
    [selectedDate],
  );

  const effectiveTime =
    selectedTime && isTimeSlotPast(selectedTime) ? null : selectedTime;

  const summaryDate = useMemo(() => {
    if (!selectedDate || !effectiveTime) return selectedDate;
    const [slotH] = effectiveTime.split(':').map(Number);
    if (slotH > 5) return selectedDate;
    const now = new Date();
    const todayMid = new Date(now);
    todayMid.setHours(0, 0, 0, 0);
    const selMid = new Date(selectedDate);
    selMid.setHours(0, 0, 0, 0);
    if (selMid.getTime() === todayMid.getTime() && now.getHours() <= 5)
      return selectedDate;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    return next;
  }, [selectedDate, effectiveTime]);

  // When an early-morning slot is chosen scroll the notice into view
  // (syncing with the DOM — this is the correct useEffect pattern)
  useEffect(() => {
    if (!effectiveTime) return;
    const [h] = effectiveTime.split(':').map(Number);
    if (h <= 5) {
      const id = setTimeout(() => {
        timeNoticeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 180);
      return () => clearTimeout(id);
    }
  }, [effectiveTime]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return guestSelected;
      case 2:
        return seatingType !== null;
      case 3:
        return selectedDate !== null && effectiveTime !== null;
      case 4:
        return (
          userInfo.name.trim().length >= 2 &&
          userInfo.surname.trim().length >= 2 &&
          validatePhone(userInfo.phone) &&
          validateEmail(userInfo.email)
        );
      default:
        return true;
    }
  }, [
    currentStep,
    guestSelected,
    seatingType,
    selectedDate,
    effectiveTime,
    userInfo,
  ]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    if (currentStep === 1) {
      router.back();
      return;
    }
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }, [currentStep, router]);

  const nextMonth = useCallback(() => {
    if (viewingMonth === 11) {
      setViewingMonth(0);
      setViewingYear((y) => y + 1);
    } else setViewingMonth((m) => m + 1);
  }, [viewingMonth]);

  const prevMonth = useCallback(() => {
    if (viewingMonth === 0) {
      setViewingMonth(11);
      setViewingYear((y) => y - 1);
    } else setViewingMonth((m) => m - 1);
  }, [viewingMonth]);

  const handleUserInfoChange = useCallback(
    (key: keyof UserInfo, value: string) =>
      setUserInfo((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests,
          seatingType,
          date: [
            selectedDate!.getFullYear(),
            String(selectedDate!.getMonth() + 1).padStart(2, '0'),
            String(selectedDate!.getDate()).padStart(2, '0'),
          ].join('-'),
          time: effectiveTime, // → "23:30"
          name: userInfo.name,
          surname: userInfo.surname,
          phone: userInfo.phone,
          email: userInfo.email,
        }),
      });

      if (!res.ok) throw new Error('Failed');

      const { id } = await res.json();
      router.push(`/reservation/thank-you?id=${id}`);
    } catch {
      setSubmitError('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Right panel ─────────────────────────────────────────────────────────────
  const renderRightPanel = () => {
    /* Step 1 — original big number */
    if (currentStep === 1) {
      return (
        <div className='w-full flex flex-col items-center text-center gap-4'>
          <AnimatePresence mode='wait'>
            {guestSelected ? (
              <motion.div
                key={guests}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
                className='font-black tabular-nums leading-none tracking-[-0.06em] text-softWhite select-none'
                style={{
                  fontSize: 'clamp(6rem, 14vw, 11rem)',
                  textShadow: '0 0 80px rgba(255,25,135,0.2)',
                }}
              >
                {guests}
              </motion.div>
            ) : (
              <motion.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className='flex flex-col items-center space-y-3'
              >
                <div className='w-12 h-12 rounded-full border border-softWhite/[0.06] flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-softWhite/12'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
                <p className='text-softWhite/18 text-[0.7rem] tracking-[0.2em] uppercase'>
                  Kaç kişisiniz?
                </p>
                <p className='text-softWhite/10 text-[0.62rem]'>
                  Bir masa seçin
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {guestSelected && (
            <>
              <div className='text-softWhite/20 text-[0.58rem] uppercase tracking-[0.45em] font-medium'>
                kişilik rezervasyon
              </div>
              <div className='flex gap-1.5 justify-center'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className='w-2 h-2 rounded-full transition-colors duration-150'
                    style={{
                      backgroundColor:
                        i < guests
                          ? 'var(--color-mainColor)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    /* Step 2 */
    if (currentStep === 2) {
      const selected = SEATING_OPTIONS.find((o) => o.value === seatingType);
      return (
        <div className='w-full'>
          <AnimatePresence mode='wait'>
            {selected ? (
              <motion.div
                key={selected.value}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className='space-y-5'
              >
                <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-mainColor/25 bg-mainColor/[0.06]'>
                  <span className='text-mainColor/70'>{selected.icon}</span>
                  <span className='text-mainColor/80 text-[0.7rem] uppercase tracking-[0.22em] font-semibold'>
                    {selected.num}
                  </span>
                </div>
                <div>
                  <h3
                    className='font-black text-softWhite leading-[1] tracking-[-0.04em] mb-3'
                    style={{
                      fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                      textShadow: '0 0 60px rgba(255,25,135,0.15)',
                    }}
                  >
                    {selected.label}
                  </h3>
                  <p className='text-softWhite/35 text-sm leading-relaxed'>
                    {selected.detail}
                  </p>
                </div>
                <div
                  className='w-16 h-[1.5px]'
                  style={{
                    background:
                      'linear-gradient(to right, var(--color-mainColor) 0%, transparent 100%)',
                  }}
                />
                <p className='text-softWhite/18 text-xs leading-relaxed'>
                  {selected.desc}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex flex-col items-center space-y-4 text-center'
              >
                <div className='w-14 h-14 rounded-full border border-softWhite/[0.06] flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-softWhite/12'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-softWhite/18 text-[0.7rem] tracking-[0.2em] uppercase'>
                    Oturma tercihinizi seçiniz
                  </p>
                  <p className='text-softWhite/10 text-[0.62rem] mt-1'>
                    Seçiminizin önizlemesi burada görünecek
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    /* Step 4 — preview card (no time/date row) */
    if (currentStep === 4) {
      const hasAny =
        userInfo.name || userInfo.surname || userInfo.phone || userInfo.email;
      return (
        <div className='w-full space-y-4'>
          <p className='text-softWhite/18 text-[0.58rem] uppercase tracking-[0.28em]'>
            Rezervasyon önizlemesi
          </p>
          <div
            className='rounded-2xl border border-softWhite/[0.08] overflow-hidden'
            style={{
              background:
                'linear-gradient(160deg, rgba(255,25,135,0.05) 0%, rgba(255,25,135,0.01) 100%)',
            }}
          >
            <div className='px-5 py-5 border-b border-softWhite/[0.05]'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-1.5 h-1.5 rounded-full bg-mainColor/50' />
                <span className='text-softWhite/25 text-[0.62rem] uppercase tracking-[0.25em]'>
                  Yeni Hisar
                </span>
              </div>
              <p className='text-softWhite/80 font-semibold text-xl tracking-[-0.02em] min-h-[28px]'>
                {userInfo.name || userInfo.surname ? (
                  `${userInfo.name} ${userInfo.surname}`.trim()
                ) : (
                  <span className='text-softWhite/15'>Ad Soyad</span>
                )}
              </p>
            </div>
            <div className='divide-y divide-softWhite/[0.04]'>
              {(
                [
                  {
                    label: 'Kişi',
                    value: guestSelected ? `${guests} kişi` : null,
                    filled: guestSelected,
                    mono: false,
                  },
                  {
                    label: 'Oturma',
                    value: seatingLabel(seatingType),
                    filled: !!seatingType,
                    mono: false,
                  },
                  {
                    label: 'Telefon',
                    value: validatePhone(userInfo.phone)
                      ? userInfo.phone
                      : null,
                    filled: validatePhone(userInfo.phone),
                    mono: true,
                  },
                  {
                    label: 'E-posta',
                    value: validateEmail(userInfo.email)
                      ? userInfo.email
                      : null,
                    filled: validateEmail(userInfo.email),
                    mono: false,
                  },
                ] satisfies {
                  label: string;
                  value: string | null;
                  filled: boolean;
                  mono: boolean;
                }[]
              ).map(({ label, value, filled, mono }) => (
                <div
                  key={label}
                  className='flex items-center justify-between px-5 py-4'
                >
                  <span className='text-softWhite/22 text-[0.65rem] uppercase tracking-[0.12em] shrink-0'>
                    {label}
                  </span>
                  <span
                    className={`text-[0.82rem] font-medium max-w-[150px] truncate text-right ${mono ? 'font-mono' : ''} ${filled && value ? 'text-softWhite/70' : 'text-softWhite/12'}`}
                  >
                    {value ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {!hasAny && (
            <p className='text-softWhite/12 text-[0.6rem] text-center tracking-wide'>
              Formu doldurdukça burada güncellenir
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <main className='bg-secondaryColor min-h-screen lg:h-screen lg:overflow-hidden'>
      <style>{`
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; }
        @keyframes ringPulse {
          from { transform: scale(0.95); opacity: 0.35; }
          to   { transform: scale(1.05); opacity: 0.85; }
        }
        button, [role="button"] { cursor: pointer; }
      `}</style>

      {/* Ambient */}
      <div className='fixed inset-0 pointer-events-none'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className='absolute inset-0'
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255,25,135,0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className='absolute inset-0 opacity-[0.022]'
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '256px',
          }}
        />
      </div>

      {/* ── Header — dots only, no text labels on any device ── */}
      <header className='fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-center bg-secondaryColor/80 backdrop-blur-2xl border-b border-softWhite/[0.045]'>
        <div className='flex items-center'>
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;
            return (
              <React.Fragment key={label}>
                <motion.div
                  animate={{
                    backgroundColor: isActive
                      ? 'var(--color-mainColor)'
                      : isDone
                        ? 'rgba(255,25,135,0.4)'
                        : 'rgba(255,255,255,0.08)',
                    scale: isActive ? 1.35 : 1,
                  }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className='w-[6px] h-[6px] rounded-full flex-shrink-0'
                />
                {i < STEP_LABELS.length - 1 && (
                  <motion.div
                    animate={{
                      backgroundColor: isDone
                        ? 'rgba(255,25,135,0.22)'
                        : 'rgba(255,255,255,0.05)',
                    }}
                    transition={{ duration: 0.4 }}
                    className='w-5 sm:w-8 md:w-11 h-px flex-shrink-0'
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>

      {/* ── Main scroll container (ref for scroll-to-top) ── */}
      <div
        ref={scrollContainerRef}
        className='flex min-h-screen lg:h-screen pt-14 pb-[64px] justify-center'
        style={{
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        <div
          className={`flex w-full ${currentStep === 3 ? 'max-w-5xl' : isFullWidth ? 'max-w-3xl' : 'max-w-[1060px] xl:max-w-[1140px]'}`}
        >
          {/* ── Content column ── */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${!isFullWidth ? 'lg:border-r border-softWhite/[0.04]' : ''}`}
            style={{ overflow: 'hidden' }}
          >
            <div className='flex flex-col lg:flex-1 lg:overflow-hidden'>
              {/* Step header */}
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  key={`h-${currentStep}`}
                  custom={direction}
                  initial={{ opacity: 0, y: direction > 0 ? 12 : -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASING }}
                  className='px-5 sm:px-8 xl:px-12 pt-5 sm:pt-9 pb-4 sm:pb-6 shrink-0'
                >
                  <p className='text-mainColor/50 text-[0.56rem] uppercase tracking-[0.42em] mb-2 sm:mb-3 font-semibold'>
                    adım {String(currentStep).padStart(2, '0')} —{' '}
                    {STEP_LABELS[currentStep - 1]}
                  </p>
                  <h1
                    className='font-black text-softWhite leading-[1.06] tracking-[-0.034em] whitespace-pre-line'
                    style={{ fontSize: 'clamp(1.7rem, 4.5vw, 3.6rem)' }}
                  >
                    {
                      (
                        [
                          'Kaç kişisiniz?',
                          'Nerede\noturmak istersiniz?',
                          'Geceyi planlayın.',
                          'Size nasıl ulaşalım?',
                          'Her şey hazır.',
                        ] as const
                      )[currentStep - 1]
                    }
                  </h1>
                  <p className='text-softWhite/28 text-[0.8rem] mt-1.5 leading-snug'>
                    {
                      (
                        [
                          'Masanızı kişi sayısına göre hazırlayalım.',
                          'Size en uygun deneyimi seçin.',
                          'Tarih ve saatinizi belirleyin.',
                          'Rezervasyonunuzu tamamlamak için bilgilerinizi girin.',
                          'Rezervasyonunuzu gözden geçirin ve onaylayın.',
                        ] as const
                      )[currentStep - 1]
                    }
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className='w-full h-px bg-softWhite/[0.045] shrink-0' />

              {/* Step body */}
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  ref={innerScrollRef}
                  key={`b-${currentStep}`}
                  custom={direction}
                  variants={CONTENT_VARIANTS}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={CONTENT_TRANSITION.enter}
                  className='lg:flex-1 flex flex-col items-start px-5 sm:px-8 xl:px-12 pb-10 pt-8 sm:pt-10'
                  style={{
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    scrollbarWidth: 'none',
                  }}
                >
                  {/* ══ Step 1 — Rectangle table selector ══ */}
                  {currentStep === 1 &&
                    (() => {
                      const activeCount =
                        hoveredCount ?? (guestSelected ? guests : 0);

                      // 3 top (1-2-3), right (4), 3 bottom (5-6-7), left (8)
                      const W = 560,
                        H = 270;
                      const TABLE = { x: 70, y: 82, w: 420, h: 106, rx: 6 };
                      const TX = TABLE.x + TABLE.w / 2; // 280
                      const TY = TABLE.y + TABLE.h / 2; // 129
                      const topXs = [160, 280, 400];
                      const SEATS = [
                        // top row — 1 2 3
                        { x: topXs[0], y: TABLE.y - 28, rot: 0, n: 1 },
                        { x: topXs[1], y: TABLE.y - 28, rot: 0, n: 2 },
                        { x: topXs[2], y: TABLE.y - 28, rot: 0, n: 3 },
                        // right side — 4
                        { x: TABLE.x + TABLE.w + 28, y: TY, rot: 90, n: 4 },
                        // bottom row — 7 6 5  (reversed so 1↔7, 2↔6, 3↔5)
                        {
                          x: topXs[0],
                          y: TABLE.y + TABLE.h + 28,
                          rot: 180,
                          n: 7,
                        },
                        {
                          x: topXs[1],
                          y: TABLE.y + TABLE.h + 28,
                          rot: 180,
                          n: 6,
                        },
                        {
                          x: topXs[2],
                          y: TABLE.y + TABLE.h + 28,
                          rot: 180,
                          n: 5,
                        },
                        // left side — 8
                        { x: TABLE.x - 28, y: TY, rot: -90, n: 8 },
                      ] as const;

                      return (
                        <div className='flex flex-col gap-5 w-full max-w-xl'>
                          <div
                            className='w-full relative'
                            style={{ touchAction: 'manipulation' }}
                          >
                            <svg
                              viewBox={`0 0 ${W} ${H}`}
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                              className='w-full h-auto'
                              style={{
                                overflow: 'visible',
                                WebkitTapHighlightColor: 'transparent',
                              }}
                            >
                              {/* ── Table surface ── */}
                              <rect
                                x={TABLE.x}
                                y={TABLE.y}
                                width={TABLE.w}
                                height={TABLE.h}
                                rx={TABLE.rx}
                                fill='rgba(255,255,255,0.022)'
                                stroke='rgba(255,255,255,0.08)'
                                strokeWidth='1.5'
                              />
                              {/* ── Chairs ── */}
                              {SEATS.map(({ x, y, rot, n }) => {
                                const isActive = n <= activeCount;
                                const isChosen =
                                  guestSelected &&
                                  guests === n &&
                                  hoveredCount === null;
                                return (
                                  <g
                                    key={n}
                                    transform={`translate(${x},${y}) rotate(${rot})`}
                                    style={{
                                      cursor: 'pointer',
                                      WebkitTapHighlightColor: 'transparent',
                                    }}
                                    onClick={() => {
                                      setGuests(n);
                                      setGuestSelected(true);
                                      setHoveredCount(null);
                                    }}
                                    onTouchEnd={(e) => {
                                      e.preventDefault();
                                      setGuests(n);
                                      setGuestSelected(true);
                                      setHoveredCount(null);
                                    }}
                                    onMouseEnter={() => setHoveredCount(n)}
                                    onMouseLeave={() => setHoveredCount(null)}
                                  >
                                    {/* Hit area — enlarged for finger-sized touch targets */}
                                    <rect
                                      x='-32'
                                      y='-38'
                                      width='64'
                                      height='62'
                                      fill='transparent'
                                    />
                                    {/* Chair back — taller, more visible */}
                                    <rect
                                      x='-18'
                                      y='-32'
                                      width='36'
                                      height='14'
                                      rx='5'
                                      fill={
                                        isActive
                                          ? 'rgba(255,25,135,0.25)'
                                          : 'rgba(255,255,255,0.05)'
                                      }
                                      stroke={
                                        isActive
                                          ? 'rgba(255,25,135,0.9)'
                                          : 'rgba(255,255,255,0.18)'
                                      }
                                      strokeWidth={isChosen ? '2' : '1.4'}
                                      style={{ transition: 'all 0.15s ease' }}
                                    />
                                    {/* Chair seat — wider, more visible */}
                                    <rect
                                      x='-16'
                                      y='-15'
                                      width='32'
                                      height='14'
                                      rx='4'
                                      fill={
                                        isActive
                                          ? 'rgba(255,25,135,0.15)'
                                          : 'rgba(255,255,255,0.04)'
                                      }
                                      stroke={
                                        isActive
                                          ? 'rgba(255,25,135,0.5)'
                                          : 'rgba(255,255,255,0.1)'
                                      }
                                      strokeWidth='1.2'
                                      style={{ transition: 'all 0.15s ease' }}
                                    />
                                    {/* Chosen glow */}
                                    {isChosen && (
                                      <rect
                                        x='-18'
                                        y='-32'
                                        width='36'
                                        height='31'
                                        rx='5'
                                        fill='none'
                                        stroke='rgba(255,25,135,0.5)'
                                        strokeWidth='5'
                                        style={{
                                          filter: 'blur(6px)',
                                          opacity: 0.7,
                                        }}
                                      />
                                    )}
                                    {/* Seat number — bigger, punchy */}
                                    <text
                                      x='0'
                                      y='-22'
                                      textAnchor='middle'
                                      fontSize='8'
                                      fontWeight='700'
                                      fill={
                                        isActive
                                          ? 'rgba(255,255,255,0.9)'
                                          : 'rgba(255,255,255,0.25)'
                                      }
                                      fontFamily='inherit'
                                      style={{
                                        transition: 'fill 0.15s ease',
                                        userSelect: 'none',
                                      }}
                                    >
                                      {n}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                            {/* Centre count — mobile/tablet only */}
                            <AnimatePresence mode='wait'>
                              {activeCount > 0 && (
                                <motion.div
                                  key={activeCount}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{
                                    duration: 0.14,
                                    ease: [0.16, 1, 0.3, 1],
                                  }}
                                  className='lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none'
                                >
                                  <span
                                    className='font-black tabular-nums leading-none tracking-[-0.04em] select-none'
                                    style={{
                                      fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                                      color:
                                        guestSelected && hoveredCount === null
                                          ? 'rgba(255,255,255,0.75)'
                                          : 'rgba(255,255,255,0.3)',
                                      textShadow:
                                        guestSelected && hoveredCount === null
                                          ? '0 0 40px rgba(255,25,135,0.35)'
                                          : 'none',
                                      transition:
                                        'color 0.2s ease, text-shadow 0.2s ease',
                                    }}
                                  >
                                    {activeCount}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Confirmation — mobile/tablet only (desktop has the right panel) */}
                          <AnimatePresence mode='wait'>
                            {guestSelected ? (
                              <motion.div
                                key='confirmed'
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.18 }}
                                className='lg:hidden flex items-center gap-3 justify-end pt-4'
                              >
                                <div className='flex gap-1.5'>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className='rounded-full transition-all duration-150'
                                      style={{
                                        width: i < guests ? '7px' : '5px',
                                        height: i < guests ? '7px' : '5px',
                                        backgroundColor:
                                          i < guests
                                            ? 'var(--color-mainColor)'
                                            : 'rgba(255,255,255,0.07)',
                                      }}
                                    />
                                  ))}
                                </div>
                                <span className='text-softWhite/25 text-[0.65rem] tracking-[0.2em] uppercase'>
                                  {guests} kişilik masa
                                </span>
                              </motion.div>
                            ) : (
                              <motion.p
                                key='hint'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className='lg:hidden text-softWhite/15 text-[0.68rem] tracking-wide w-full text-right pt-4'
                              >
                                Bir koltuğa tıklayın
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })()}

                  {/* ══ Step 2 — Seating type ══ */}
                  {currentStep === 2 && (
                    <div className='space-y-2 w-full max-w-xl'>
                      {SEATING_OPTIONS.map(
                        ({ value, num, label, desc, icon }) => (
                          <motion.button
                            key={value}
                            onClick={() => setSeatingType(value)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            whileTap={{ scale: 0.985 }}
                            className={`cursor-pointer w-full text-left rounded-xl border transition-colors duration-150 overflow-hidden
                            ${
                              seatingType === value
                                ? 'border-mainColor/30 bg-mainColor/[0.035]'
                                : 'border-softWhite/[0.055] bg-softWhite/[0.012] hover:bg-softWhite/[0.028] hover:border-softWhite/10'
                            }`}
                          >
                            <div className='flex items-center gap-4 px-5 py-4'>
                              <span
                                className={`font-mono font-black tabular-nums shrink-0 transition-colors duration-150 ${seatingType === value ? 'text-mainColor/40' : 'text-softWhite/[0.06]'}`}
                                style={{
                                  fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                                }}
                              >
                                {num}
                              </span>
                              <div
                                className={`w-px self-stretch transition-colors duration-150 ${seatingType === value ? 'bg-mainColor/15' : 'bg-softWhite/[0.04]'}`}
                              />
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-0.5'>
                                  <span
                                    className={`transition-colors duration-150 ${seatingType === value ? 'text-mainColor/65' : 'text-softWhite/18'}`}
                                  >
                                    {icon}
                                  </span>
                                  <span
                                    className={`font-semibold tracking-[-0.01em] transition-colors duration-150 ${seatingType === value ? 'text-softWhite/90' : 'text-softWhite/65'}`}
                                    style={{
                                      fontSize: 'clamp(0.88rem, 1.6vw, 1rem)',
                                    }}
                                  >
                                    {label}
                                  </span>
                                </div>
                                <p className='text-softWhite/22 text-[0.72rem] leading-snug'>
                                  {desc}
                                </p>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${seatingType === value ? 'border-mainColor' : 'border-softWhite/15'}`}
                              >
                                <div
                                  className='w-2 h-2 rounded-full bg-mainColor transition-all duration-150'
                                  style={{
                                    transform:
                                      seatingType === value
                                        ? 'scale(1)'
                                        : 'scale(0)',
                                    opacity: seatingType === value ? 1 : 0,
                                  }}
                                />
                              </div>
                            </div>
                            <div
                              className='h-px transition-opacity duration-150'
                              style={{
                                background:
                                  'linear-gradient(to right, var(--color-mainColor) 0%, rgba(255,25,135,0.15) 70%, transparent 100%)',
                                opacity: seatingType === value ? 1 : 0,
                              }}
                            />
                          </motion.button>
                        ),
                      )}
                    </div>
                  )}

                  {/* ══ Step 3 — Date & time ══ */}
                  {currentStep === 3 && (
                    <div className='grid lg:grid-cols-[440px_1fr] gap-5 xl:gap-7 w-full pt-2'>
                      {/* ─ Calendar ─ */}
                      <div
                        className='rounded-2xl border border-softWhite/[0.08] bg-softWhite/[0.018] self-start w-full max-w-[360px] mx-auto lg:mx-0 lg:max-w-none'
                        style={{ padding: 'clamp(1rem, 2.5vw, 1.75rem)' }}
                      >
                        <div className='flex items-center justify-between mb-5'>
                          <span
                            className='text-softWhite/70 font-semibold tracking-[-0.01em]'
                            style={{
                              fontSize: 'clamp(0.82rem, 1.4vw, 0.95rem)',
                            }}
                          >
                            {new Date(
                              viewingYear,
                              viewingMonth,
                            ).toLocaleDateString('tr-TR', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <div className='flex gap-1'>
                            {(
                              [
                                { fn: prevMonth, c: '‹' },
                                { fn: nextMonth, c: '›' },
                              ] as const
                            ).map(({ fn, c }) => (
                              <button
                                key={c}
                                onClick={fn}
                                className='cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-softWhite/30 hover:text-softWhite/75 hover:bg-softWhite/[0.06] transition-all text-lg'
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className='grid grid-cols-7 mb-2'>
                          {WEEK_DAYS.map((d) => (
                            <div
                              key={d}
                              className='text-center text-softWhite/20 font-medium py-2'
                              style={{
                                fontSize: 'clamp(0.6rem, 1vw, 0.68rem)',
                              }}
                            >
                              {d}
                            </div>
                          ))}
                        </div>

                        <div className='grid grid-cols-7 gap-1'>
                          {calendarDays.map((day, i) => {
                            const isSel =
                              selectedDate?.toDateString() ===
                              day.date.toDateString();
                            const isToday =
                              day.date.toDateString() ===
                              new Date().toDateString();
                            const dayDate = new Date(day.date);
                            dayDate.setHours(0, 0, 0, 0);
                            const isPast = dayDate < today;
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  !isPast &&
                                  day.isCurrentMonth &&
                                  setSelectedDate(day.date)
                                }
                                disabled={isPast || !day.isCurrentMonth}
                                className={`cursor-pointer rounded-xl transition-all duration-150 font-medium h-9 lg:h-10 xl:h-11
                                  ${!day.isCurrentMonth || isPast ? 'text-softWhite/[0.07] cursor-not-allowed' : ''}
                                  ${isSel ? 'bg-mainColor text-white font-semibold shadow-lg shadow-mainColor/25' : ''}
                                  ${!isSel && !isPast && day.isCurrentMonth ? 'hover:bg-softWhite/[0.07] text-softWhite/50 hover:text-softWhite/80' : ''}
                                  ${isToday && !isSel ? 'ring-1 ring-mainColor/35' : ''}`}
                                style={{
                                  fontSize: 'clamp(0.68rem, 1.2vw, 0.78rem)',
                                }}
                              >
                                {day.date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ─ Time slots ─ */}
                      <div className='space-y-5 min-w-0 pt-1'>
                        {selectedDate ? (
                          <>
                            {/* Notice anchor — scrollIntoView when a past-midnight time is picked */}
                            <div ref={timeNoticeRef}>
                              {effectiveTime &&
                                (() => {
                                  const [slotH] = effectiveTime
                                    .split(':')
                                    .map(Number);
                                  if (slotH > 5) return null;
                                  const now = new Date();
                                  const todayMid = new Date(now);
                                  todayMid.setHours(0, 0, 0, 0);
                                  const selMid = new Date(selectedDate);
                                  selMid.setHours(0, 0, 0, 0);
                                  if (
                                    selMid.getTime() === todayMid.getTime() &&
                                    now.getHours() <= 5
                                  )
                                    return null;
                                  const nextDay = new Date(selectedDate);
                                  nextDay.setDate(nextDay.getDate() + 1);
                                  return (
                                    <motion.div
                                      initial={{ opacity: 0, y: -6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className='flex items-center gap-2.5 rounded-xl border border-mainColor/15 bg-mainColor/[0.03] px-3.5 py-2.5'
                                    >
                                      <svg
                                        className='w-3 h-3 text-mainColor/50 shrink-0'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                        />
                                      </svg>
                                      <p className='text-[0.68rem] text-softWhite/40 leading-snug'>
                                        <span className='text-mainColor/70 font-medium'>
                                          {effectiveTime}
                                        </span>{' '}
                                        seçtiniz —{' '}
                                        <span className='text-softWhite/55'>
                                          {nextDay.toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                          })}{' '}
                                          sabahı için geçerli
                                        </span>
                                      </p>
                                    </motion.div>
                                  );
                                })()}
                            </div>

                            {/* "Continuation of last night" notice */}
                            {(() => {
                              const now = new Date();
                              const nowH = now.getHours();
                              const todayMid = new Date(now);
                              todayMid.setHours(0, 0, 0, 0);
                              const selMid = new Date(selectedDate);
                              selMid.setHours(0, 0, 0, 0);
                              if (
                                selMid.getTime() !== todayMid.getTime() ||
                                nowH > 5
                              )
                                return null;
                              const prev = new Date(selectedDate);
                              prev.setDate(prev.getDate() - 1);
                              return (
                                <p className='text-softWhite/22 text-[0.64rem] leading-relaxed'>
                                  <span className='text-mainColor/40'>↗</span>{' '}
                                  {prev.toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                  })}{' '}
                                  –{' '}
                                  {selectedDate.toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                  })}{' '}
                                  gecesinin devamındasınız
                                </p>
                              );
                            })()}

                            {(
                              [
                                {
                                  label: 'Gece',
                                  range: '23:00 – 02:45',
                                  slots: NIGHT_SLOTS,
                                },
                                {
                                  label: 'Sabah',
                                  range: '03:00 – 05:00',
                                  slots: MORNING_SLOTS,
                                },
                              ] as const
                            ).map(({ label, range, slots }) => (
                              <div key={label}>
                                <div className='flex items-baseline gap-2 mb-3'>
                                  <span className='text-softWhite/25 text-[0.58rem] uppercase tracking-[0.28em]'>
                                    {label}
                                  </span>
                                  <span className='text-softWhite/12 text-[0.55rem]'>
                                    {range}
                                  </span>
                                </div>
                                <div className='grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2'>
                                  {slots.map(({ time }) => {
                                    const isPast = isTimeSlotPast(time);
                                    const isSel = effectiveTime === time;
                                    return (
                                      <motion.button
                                        key={time}
                                        onClick={() =>
                                          !isPast && setSelectedTime(time)
                                        }
                                        disabled={isPast}
                                        whileTap={
                                          !isPast ? { scale: 0.91 } : {}
                                        }
                                        className={`cursor-pointer py-3 px-2 rounded-xl text-[0.8rem] tracking-wide transition-all duration-150
                                          ${
                                            isSel
                                              ? 'bg-mainColor text-white font-semibold shadow-lg shadow-mainColor/25'
                                              : isPast
                                                ? 'bg-softWhite/[0.01] text-softWhite/[0.08] border border-softWhite/[0.03] cursor-not-allowed line-through'
                                                : 'bg-softWhite/[0.04] hover:bg-softWhite/[0.075] text-softWhite/45 border border-softWhite/[0.055] hover:text-softWhite/75'
                                          }`}
                                      >
                                        {time}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className='flex flex-col items-center justify-center py-16 gap-3'>
                            <div className='w-10 h-10 rounded-full border border-softWhite/[0.06] flex items-center justify-center'>
                              <svg
                                className='w-4 h-4 text-softWhite/15'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={1.5}
                                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                />
                              </svg>
                            </div>
                            <p className='text-softWhite/18 text-[0.7rem] tracking-wide'>
                              Önce bir tarih seçin
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ══ Step 4 — Contact info ══ */}
                  {currentStep === 4 && (
                    <div className='w-full space-y-3'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {(
                          [
                            {
                              key: 'name',
                              label: 'Ad',
                              type: 'text',
                              valid: userInfo.name.trim().length >= 2,
                            },
                            {
                              key: 'surname',
                              label: 'Soyad',
                              type: 'text',
                              valid: userInfo.surname.trim().length >= 2,
                            },
                            {
                              key: 'phone',
                              label: 'Telefon',
                              type: 'tel',
                              valid: validatePhone(userInfo.phone),
                            },
                            {
                              key: 'email',
                              label: 'E-posta',
                              type: 'email',
                              valid: validateEmail(userInfo.email),
                            },
                          ] as const
                        ).map(({ key, label, type, valid }) => {
                          const isFoc = focusedField === key;
                          const hasVal = userInfo[key].length > 0;
                          const lifted = isFoc || hasVal;
                          return (
                            <div key={key} className='relative'>
                              <label
                                className={`absolute left-4 pointer-events-none z-10 transition-all duration-200
                                ${lifted ? 'top-[9px] text-[0.55rem] tracking-[0.08em]' : 'top-1/2 -translate-y-1/2 text-[0.85rem]'}
                                ${isFoc ? 'text-mainColor/60' : hasVal ? 'text-softWhite/22' : 'text-softWhite/20'}`}
                              >
                                {label}
                                <span className='ml-0.5 text-mainColor/35'>
                                  *
                                </span>
                              </label>
                              <input
                                type={type}
                                value={userInfo[key]}
                                onChange={(e) =>
                                  handleUserInfoChange(key, e.target.value)
                                }
                                onFocus={() => setFocusedField(key)}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 pt-7 pb-3 bg-softWhite/[0.025] rounded-xl text-softWhite/80 text-[0.88rem] transition-all focus:outline-none border
                                  ${isFoc ? 'border-mainColor/25 bg-mainColor/[0.018] shadow-md shadow-mainColor/[0.05]' : valid ? 'border-softWhite/10' : 'border-softWhite/[0.05]'}`}
                              />
                              {valid && !isFoc && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className='absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-mainColor/10 flex items-center justify-center'
                                >
                                  <svg
                                    className='w-2.5 h-2.5 text-mainColor/80'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2.5}
                                      d='M5 13l4 4L19 7'
                                    />
                                  </svg>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className='flex gap-2.5 rounded-xl border border-softWhite/[0.04] bg-softWhite/[0.01] p-3.5'>
                        <svg
                          className='w-3 h-3 text-softWhite/15 shrink-0 mt-0.5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <p className='text-softWhite/18 text-[0.68rem] leading-relaxed'>
                          Bilgileriniz yalnızca rezervasyon onayı için
                          kullanılır ve güvenle saklanır.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ══ Step 5 — Summary ══ */}
                  {currentStep === 5 && (
                    <div className='w-full flex items-center justify-center'>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{
                          opacity: isLoading ? 0.35 : 1,
                          scale: isLoading ? 0.98 : 1,
                          filter: isLoading ? 'blur(2px)' : 'blur(0px)',
                        }}
                        transition={{ duration: 0.38, ease: EASING }}
                        className='w-full max-w-2xl'
                        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
                      >
                        <div
                          className='rounded-2xl border border-softWhite/[0.07] overflow-hidden'
                          style={{
                            background:
                              'linear-gradient(145deg, rgba(255,25,135,0.025) 0%, rgba(0,0,0,0) 50%)',
                          }}
                        >
                          <div className='px-6 sm:px-8 py-5 sm:py-6 border-b border-softWhite/[0.05]'>
                            <p className='text-softWhite/18 text-[0.55rem] uppercase tracking-[0.3em] mb-1'>
                              Rezervasyon Detayları
                            </p>
                            <p className='text-softWhite/70 font-semibold text-xl tracking-[-0.02em]'>
                              {userInfo.name} {userInfo.surname}
                            </p>
                          </div>
                          <div className='divide-y divide-softWhite/[0.04]'>
                            {(
                              [
                                {
                                  label: 'Kişi',
                                  value: `${guests} kişi`,
                                  hi: false,
                                  mono: false,
                                },
                                {
                                  label: 'Oturma',
                                  value: seatingLabel(seatingType),
                                  hi: false,
                                  mono: false,
                                },
                                {
                                  label: 'Tarih',
                                  value: summaryDate?.toLocaleDateString(
                                    'tr-TR',
                                    {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    },
                                  ),
                                  hi: false,
                                  mono: false,
                                },
                                {
                                  label: 'Saat',
                                  value: effectiveTime,
                                  hi: true,
                                  mono: false,
                                },
                                {
                                  label: 'Telefon',
                                  value: userInfo.phone,
                                  hi: false,
                                  mono: true,
                                },
                                {
                                  label: 'E-posta',
                                  value: userInfo.email,
                                  hi: false,
                                  mono: false,
                                },
                              ] satisfies {
                                label: string;
                                value: string | null | undefined;
                                hi: boolean;
                                mono: boolean;
                              }[]
                            ).map(({ label, value, hi, mono }) => (
                              <div
                                key={label}
                                className='flex items-center justify-between px-6 sm:px-8 py-3.5'
                              >
                                <span className='text-softWhite/22 text-[0.62rem] uppercase tracking-[0.14em]'>
                                  {label}
                                </span>
                                <span
                                  className={`text-[0.85rem] font-medium ${mono ? 'font-mono' : ''} ${hi ? 'text-mainColor' : 'text-softWhite/65'}`}
                                >
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className='px-6 sm:px-8 py-4 border-t border-softWhite/[0.04] bg-softWhite/[0.008]'>
                            <p className='text-softWhite/15 text-[0.62rem] leading-relaxed'>
                              * Rezervasyonunuz onay için gönderilecektir. En
                              kısa sürede dönüş yapılacaktır.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right panel ── */}
          {!isFullWidth && (
            <aside className='hidden lg:flex w-[300px] xl:w-[360px] shrink-0 relative overflow-hidden'>
              <div
                className='absolute left-0 top-[15%] bottom-[15%] w-px pointer-events-none'
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent 100%)',
                }}
              />
              {currentStep === 1 && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='absolute rounded-full border border-mainColor/10'
                      style={{
                        width: `${150 + i * 55}px`,
                        height: `${150 + i * 55}px`,
                        animation: `ringPulse ${2.5 + i * 0.6}s ease-in-out ${i * 0.4}s infinite alternate`,
                        opacity: 0.45 - i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  key={`p-${currentStep}`}
                  custom={direction}
                  variants={PANEL_VARIANTS}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ duration: 0.26, ease: EASING }}
                  className='absolute inset-0 flex flex-col items-center justify-center px-6 xl:px-8'
                >
                  {renderRightPanel()}
                </motion.div>
              </AnimatePresence>
            </aside>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className='fixed bottom-0 inset-x-0 z-50 bg-secondaryColor/85 backdrop-blur-2xl border-t border-softWhite/[0.045]'
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className='flex flex-col'>
          {submitError && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center text-red-400/70 text-[0.7rem] py-1.5 border-b border-red-400/10 bg-red-400/[0.04]'
            >
              ⚠ {submitError}
            </motion.p>
          )}
          <div className='flex items-center justify-between px-3 sm:px-5 h-[64px] gap-3'>
            <motion.button
              onClick={goBack}
              disabled={isLoading}
              whileTap={!isLoading ? { scale: 0.88, opacity: 0.65 } : {}}
              animate={{ opacity: isLoading ? 0.3 : 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 28 }}
              className='flex items-center justify-center gap-2 h-11 px-5 min-w-[110px] rounded-xl border border-softWhite/[0.09] text-softWhite/45 hover:text-softWhite/80 hover:border-softWhite/18 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-150 select-none'
              style={
                {
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                } as React.CSSProperties
              }
            >
              <svg
                className='w-3.5 h-3.5 shrink-0'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              {currentStep === 1 ? 'Geri Dön' : 'Geri'}
            </motion.button>

            <motion.button
              onClick={
                currentStep === TOTAL_STEPS ? () => handleSubmit() : goNext
              }
              disabled={!canProceed() || isLoading}
              whileTap={
                canProceed() && !isLoading ? { scale: 0.88, opacity: 0.8 } : {}
              }
              transition={{ type: 'spring', stiffness: 600, damping: 28 }}
              className={`flex items-center justify-center gap-2 h-11 px-6 min-w-[140px] rounded-xl text-[0.72rem] font-semibold uppercase tracking-[0.16em] select-none transition-all duration-200
  ${canProceed() && !isLoading ? 'bg-mainColor text-white hover:bg-mainColor/88 shadow-lg shadow-mainColor/20' : 'bg-softWhite/[0.035] text-softWhite/12 cursor-not-allowed'}`}
              style={
                {
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                } as React.CSSProperties
              }
            >
              {isLoading ? (
                <>
                  <svg
                    className='w-3.5 h-3.5 shrink-0 animate-spin'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='3'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                    />
                  </svg>
                </>
              ) : (
                <>
                  {currentStep === TOTAL_STEPS ? 'Onayla' : 'Devam Et'}
                  {canProceed() && (
                    <svg
                      className='w-3.5 h-3.5 shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2.2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  )}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
