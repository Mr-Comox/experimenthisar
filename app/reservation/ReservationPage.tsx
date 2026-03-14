'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type SeatingType = 'lounge' | 'vip' | 'masa';
interface UserInfo {
  name: string;
  surname: string;
  phone: string;
  email: string;
}

const STEP_LABELS = ['Kişi', 'Oturma', 'Tarih & Saat', 'İletişim', 'Özet'];

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
];

export default function ReservationPage() {
  const router = useRouter();
  const [direction, setDirection] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [guestSelected, setGuestSelected] = useState(false);
  const [seatingType, setSeatingType] = useState<SeatingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [viewingMonth, setViewingMonth] = useState(new Date().getMonth());
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear());
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    surname: '',
    phone: '',
    email: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const totalSteps = 5;

  const goNext = () => {
    setDirection(1);
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };
  const goBack = () => {
    if (currentStep === 1) {
      router.back();
      return;
    }
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const nextMonth = () =>
    viewingMonth === 11
      ? (setViewingMonth(0), setViewingYear((y) => y + 1))
      : setViewingMonth((m) => m + 1);
  const prevMonth = () =>
    viewingMonth === 0
      ? (setViewingMonth(11), setViewingYear((y) => y - 1))
      : setViewingMonth((m) => m - 1);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p: string) => /^[0-9+\s()-]{10,}$/.test(p);

  const canProceed = () => {
    if (currentStep === 1) return guestSelected;
    if (currentStep === 2) return seatingType !== null;
    if (currentStep === 3)
      return selectedDate !== null && selectedTime !== null;
    if (currentStep === 4)
      return (
        userInfo.name.trim().length >= 2 &&
        userInfo.surname.trim().length >= 2 &&
        validatePhone(userInfo.phone) &&
        validateEmail(userInfo.email)
      );
    return true;
  };

  const generateCalendar = () => {
    const firstDay = new Date(viewingYear, viewingMonth, 1);
    const lastDay = new Date(viewingYear, viewingMonth + 1, 0);
    const days = [];
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    for (let i = 0; i < startOffset; i++)
      days.push({
        date: new Date(viewingYear, viewingMonth, -startOffset + i + 1),
        isCurrentMonth: false,
      });
    for (let i = 1; i <= lastDay.getDate(); i++)
      days.push({
        date: new Date(viewingYear, viewingMonth, i),
        isCurrentMonth: true,
      });
    while (days.length < 42)
      days.push({
        date: new Date(
          viewingYear,
          viewingMonth + 1,
          days.length - lastDay.getDate() - startOffset + 1,
        ),
        isCurrentMonth: false,
      });
    return days;
  };

  const generateTimeSlots = () => {
    const slots: { time: string; period: string }[] = [];
    for (let min = 0; min < 60; min += 15)
      slots.push({
        time: `23:${String(min).padStart(2, '0')}`,
        period: 'Gece',
      });
    for (let h = 0; h <= 5; h++) {
      const maxMin = h === 5 ? 0 : 45;
      for (let min = 0; min <= maxMin; min += 15)
        slots.push({
          time: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          period: h < 3 ? 'Gece' : 'Sabah',
        });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const nightSlots = timeSlots.filter((s) => s.period === 'Gece');
  const morningSlots = timeSlots.filter((s) => s.period === 'Sabah');

  const isTimeSlotPast = (slotTime: string): boolean => {
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
  };

  useEffect(() => {
    if (selectedTime && isTimeSlotPast(selectedTime)) setSelectedTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const easing = [0.25, 0.46, 0.45, 0.94] as const;

  const contentVariants = {
    enter: (d: number) => ({ opacity: 0, y: d > 0 ? 20 : -20 }),
    center: { opacity: 1, y: 0 },
    exit: (d: number) => ({ opacity: 0, y: d > 0 ? -20 : 20 }),
  };

  const panelVariants = {
    enter: (d: number) => ({ opacity: 0, y: d > 0 ? 16 : -16, scale: 0.98 }),
    center: { opacity: 1, y: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, y: d > 0 ? -16 : 16, scale: 0.98 }),
  };

  const summaryDate = (() => {
    if (!selectedDate || !selectedTime) return selectedDate;
    const [slotH] = selectedTime.split(':').map(Number);
    if (slotH > 5) return selectedDate;
    const now = new Date();
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);
    const selMidnight = new Date(selectedDate);
    selMidnight.setHours(0, 0, 0, 0);
    if (
      selMidnight.getTime() === todayMidnight.getTime() &&
      now.getHours() <= 5
    )
      return selectedDate;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    return next;
  })();

  const isFullWidth = currentStep === 3 || currentStep === 5;

  const renderRightPanel = () => {
    if (currentStep === 1) {
      return (
        <div className='flex flex-col items-center justify-center h-full gap-4 relative'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='absolute rounded-full border border-mainColor/10'
              style={{
                width: `${160 + i * 60}px`,
                height: `${160 + i * 60}px`,
                animation: `pulse ${2.5 + i * 0.6}s ease-in-out ${i * 0.4}s infinite alternate`,
                opacity: 0.5 - i * 0.12,
              }}
            />
          ))}
          <div className='relative text-center z-10'>
            <AnimatePresence mode='wait'>
              {guestSelected ? (
                <motion.div
                  key={guests}
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
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
                  className='text-center space-y-3'
                >
                  <div className='w-12 h-12 rounded-full border border-softWhite/[0.06] flex items-center justify-center mx-auto'>
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
                    Bir sayı seçin
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {guestSelected && (
              <>
                <div className='mt-2 text-softWhite/20 text-[0.58rem] uppercase tracking-[0.45em] font-medium'>
                  kişilik rezervasyon
                </div>
                <div className='flex gap-1.5 justify-center mt-4'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor:
                          i < guests
                            ? 'var(--color-mainColor)'
                            : 'rgba(255,255,255,0.06)',
                      }}
                      transition={{ duration: 0.2 }}
                      className='w-2 h-2 rounded-full'
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      const selected = SEATING_OPTIONS.find((o) => o.value === seatingType);
      return (
        <div className='flex flex-col justify-center h-full px-2'>
          <AnimatePresence mode='wait'>
            {selected ? (
              <motion.div
                key={selected.value}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
                  <p className='text-softWhite/35 text-sm leading-relaxed max-w-xs'>
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
                <p className='text-softWhite/18 text-xs leading-relaxed max-w-xs'>
                  {selected.desc}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='text-center space-y-4'
              >
                <div className='w-14 h-14 rounded-full border border-softWhite/[0.06] flex items-center justify-center mx-auto'>
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

    if (currentStep === 4) {
      const hasAny =
        userInfo.name || userInfo.surname || userInfo.phone || userInfo.email;
      return (
        <div className='flex flex-col justify-center h-full px-1'>
          <div className='space-y-4'>
            <p className='text-softWhite/18 text-[0.58rem] uppercase tracking-[0.28em] mb-4'>
              Rezervasyon önizlemesi
            </p>
            <div
              className='rounded-2xl border border-softWhite/[0.07] overflow-hidden'
              style={{
                background:
                  'linear-gradient(160deg, rgba(255,25,135,0.03) 0%, rgba(255,25,135,0.01) 100%)',
              }}
            >
              <div className='px-5 py-4 border-b border-softWhite/[0.05]'>
                <div className='flex items-center gap-2 mb-1.5'>
                  <div className='w-1.5 h-1.5 rounded-full bg-mainColor/50' />
                  <span className='text-softWhite/25 text-[0.6rem] uppercase tracking-[0.25em]'>
                    Yeni Hisar
                  </span>
                </div>
                <p className='text-softWhite/80 font-semibold text-base tracking-[-0.02em] min-h-[24px]'>
                  {userInfo.name || userInfo.surname ? (
                    `${userInfo.name} ${userInfo.surname}`.trim()
                  ) : (
                    <span className='text-softWhite/15'>Ad Soyad</span>
                  )}
                </p>
              </div>
              <div className='divide-y divide-softWhite/[0.04]'>
                {[
                  {
                    label: 'Oturma',
                    value:
                      seatingType === 'vip'
                        ? 'VIP Loca'
                        : seatingType === 'lounge'
                          ? 'Lounge Bar'
                          : seatingType === 'masa'
                            ? 'Masa'
                            : null,
                    filled: !!seatingType,
                  },
                  {
                    label: 'Tarih',
                    value:
                      selectedDate?.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      }) ?? null,
                    filled: !!selectedDate,
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
                  },
                ].map(({ label, value, filled, mono }) => (
                  <div
                    key={label}
                    className='flex items-center justify-between px-5 py-3'
                  >
                    <span className='text-softWhite/22 text-[0.62rem] uppercase tracking-[0.12em] shrink-0'>
                      {label}
                    </span>
                    <span
                      className={`text-[0.74rem] font-medium max-w-[145px] truncate text-right ${mono ? 'font-mono' : ''} ${filled && value ? 'text-softWhite/65' : 'text-softWhite/12'}`}
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
        </div>
      );
    }

    return null;
  };

  return (
    <main className='h-screen bg-secondaryColor' style={{ overflow: 'hidden' }}>
      <style>{`
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; }
        @keyframes pulse {
          from { transform: scale(0.97); opacity: 0.4; }
          to   { transform: scale(1.03); opacity: 0.9; }
        }
        button, [role="button"] { cursor: pointer; }
      `}</style>

      {/* Ambient bg */}
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

      {/* ── HEADER ── */}
      <header className='fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-center bg-secondaryColor/80 backdrop-blur-2xl border-b border-softWhite/[0.045]'>
        <div className='flex flex-col items-center gap-[5px]'>
          {/* Dots + connectors row */}
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
          {/* Labels row */}
          <div className='hidden sm:flex items-center'>
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isDone = stepNum < currentStep;
              return (
                <React.Fragment key={label}>
                  <div className='w-[6px] flex-shrink-0 flex justify-center'>
                    <span
                      className={`text-[0.42rem] uppercase tracking-[0.12em] font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-mainColor/65'
                          : isDone
                            ? 'text-softWhite/25'
                            : 'text-softWhite/12'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className='w-5 sm:w-8 md:w-11 flex-shrink-0' />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div
        className='flex h-screen pt-14 pb-[58px] justify-center'
        style={{ overflow: 'hidden' }}
      >
        <div
          className={`flex w-full ${
            currentStep === 3
              ? 'max-w-5xl'
              : isFullWidth
                ? 'max-w-3xl'
                : 'max-w-[1060px] xl:max-w-[1140px]'
          }`}
        >
          {/* Center content */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${!isFullWidth ? 'lg:border-r border-softWhite/[0.04]' : ''}`}
            style={{ overflow: 'hidden' }}
          >
            {/* Inner wrapper: my-auto centers whole block on mobile; flex-1 fills on desktop */}
            <div className='flex flex-col my-auto lg:my-0 lg:flex-1 lg:overflow-hidden'>
              {/* Step header */}
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  key={`h-${currentStep}`}
                  custom={direction}
                  initial={{ opacity: 0, y: direction > 0 ? 12 : -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: direction > 0 ? -12 : 12 }}
                  transition={{ duration: 0.24, ease: easing }}
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
                      [
                        'Kaç kişisiniz?',
                        'Nerede\noturmak istersiniz?',
                        'Geceyi planlayın.',
                        'Sizi nasıl bulalım?',
                        'Her şey hazır.',
                      ][currentStep - 1]
                    }
                  </h1>
                  <p className='text-softWhite/28 text-[0.8rem] mt-1.5 leading-snug'>
                    {
                      [
                        'Masanızı kişi sayısına göre hazırlayalım.',
                        'Size en uygun deneyimi seçin.',
                        'Tarih ve saatinizi belirleyin.',
                        'Rezervasyonunuzu tamamlamak için bilgilerinizi girin.',
                        'Rezervasyonunuzu gözden geçirin ve onaylayın.',
                      ][currentStep - 1]
                    }
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className='w-full h-px bg-softWhite/[0.045] shrink-0' />

              {/* ── Step body — CENTERED for all steps ── */}
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  key={`b-${currentStep}`}
                  custom={direction}
                  variants={contentVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ duration: 0.26, ease: easing }}
                  className='lg:flex-1 flex flex-col items-center justify-center px-5 sm:px-8 xl:px-12 py-5 sm:py-7'
                  style={{ overflowY: 'auto', overflowX: 'hidden' }}
                >
                  {/* ══ STEP 1 ══ */}
                  {currentStep === 1 && (
                    <div className='flex flex-col items-center gap-5 sm:gap-7 w-full'>
                      <div className='grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-sm'>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <motion.button
                            key={n}
                            onClick={() => {
                              setGuests(n);
                              setGuestSelected(true);
                            }}
                            whileTap={{ scale: 0.85 }}
                            animate={{
                              backgroundColor:
                                guestSelected && guests === n
                                  ? 'var(--color-mainColor)'
                                  : 'rgba(255,255,255,0.035)',
                              borderColor:
                                guestSelected && guests === n
                                  ? 'var(--color-mainColor)'
                                  : 'rgba(255,255,255,0.06)',
                            }}
                            transition={{ duration: 0.16 }}
                            className='cursor-pointer aspect-square rounded-2xl text-lg sm:text-xl font-bold border transition-colors'
                            style={{
                              color:
                                guestSelected && guests === n
                                  ? 'white'
                                  : 'rgba(255,255,255,0.3)',
                            }}
                          >
                            {n}
                          </motion.button>
                        ))}
                      </div>
                      {guestSelected && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                          className='text-softWhite/20 text-[0.68rem] tracking-wide text-center'
                        >
                          {guests} kişilik rezervasyon seçildi
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* ══ STEP 2 ══ */}
                  {currentStep === 2 && (
                    <div className='space-y-2 w-full max-w-xl'>
                      {SEATING_OPTIONS.map(
                        ({ value, num, label, desc, icon }, i) => (
                          <motion.button
                            key={value}
                            onClick={() => setSeatingType(value)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: i * 0.07,
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            whileTap={{ scale: 0.993 }}
                            className={`cursor-pointer w-full text-left rounded-xl border transition-all duration-300 overflow-hidden ${
                              seatingType === value
                                ? 'border-mainColor/30 bg-mainColor/[0.035]'
                                : 'border-softWhite/[0.055] bg-softWhite/[0.012] hover:bg-softWhite/[0.028] hover:border-softWhite/10'
                            }`}
                          >
                            <div className='flex items-center gap-4 px-5 py-4'>
                              <span
                                className={`font-mono font-black tabular-nums shrink-0 transition-colors duration-300 ${seatingType === value ? 'text-mainColor/40' : 'text-softWhite/[0.06]'}`}
                                style={{
                                  fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                                }}
                              >
                                {num}
                              </span>
                              <div
                                className={`w-px self-stretch transition-colors duration-300 ${seatingType === value ? 'bg-mainColor/15' : 'bg-softWhite/[0.04]'}`}
                              />
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-0.5'>
                                  <span
                                    className={`transition-colors duration-200 ${seatingType === value ? 'text-mainColor/65' : 'text-softWhite/18'}`}
                                  >
                                    {icon}
                                  </span>
                                  <span
                                    className={`font-semibold tracking-[-0.01em] transition-colors ${seatingType === value ? 'text-softWhite/90' : 'text-softWhite/65'}`}
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
                                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${seatingType === value ? 'border-mainColor' : 'border-softWhite/15'}`}
                              >
                                {seatingType === value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 600,
                                      damping: 25,
                                    }}
                                    className='w-2 h-2 rounded-full bg-mainColor'
                                  />
                                )}
                              </div>
                            </div>
                            {seatingType === value && (
                              <motion.div
                                layoutId='seat-accent'
                                className='h-px'
                                style={{
                                  background:
                                    'linear-gradient(to right, var(--color-mainColor) 0%, rgba(255,25,135,0.15) 70%, transparent 100%)',
                                }}
                              />
                            )}
                          </motion.button>
                        ),
                      )}
                    </div>
                  )}

                  {/* ══ STEP 3 ══ */}
                  {currentStep === 3 && (
                    <div className='grid lg:grid-cols-[440px_1fr] gap-5 xl:gap-7 w-full'>
                      {/* Calendar */}
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
                            {[
                              { fn: prevMonth, c: '‹' },
                              { fn: nextMonth, c: '›' },
                            ].map(({ fn, c }) => (
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
                          {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(
                            (d) => (
                              <div
                                key={d}
                                className='text-center text-softWhite/20 font-medium py-2'
                                style={{
                                  fontSize: 'clamp(0.6rem, 1vw, 0.68rem)',
                                }}
                              >
                                {d}
                              </div>
                            ),
                          )}
                        </div>
                        <div className='grid grid-cols-7 gap-1'>
                          {generateCalendar().map((day, i) => {
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

                      {/* Time slots */}
                      <div className='space-y-4 min-w-0'>
                        {selectedDate ? (
                          <>
                            {selectedTime &&
                              (() => {
                                const [slotH] = selectedTime
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
                                      <span className='text-mainColor/70 font-mono font-medium'>
                                        {selectedTime}
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

                            {[
                              {
                                label: 'Gece',
                                range: '23:00 – 02:45',
                                slots: nightSlots,
                              },
                              {
                                label: 'Sabah',
                                range: '03:00 – 05:00',
                                slots: morningSlots,
                              },
                            ].map(({ label, range, slots }) => (
                              <div key={label}>
                                <div className='flex items-baseline gap-2 mb-3'>
                                  <span className='text-softWhite/25 text-[0.58rem] uppercase tracking-[0.28em]'>
                                    {label}
                                  </span>
                                  <span className='text-softWhite/12 text-[0.55rem] font-mono'>
                                    {range}
                                  </span>
                                </div>
                                <div className='grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2'>
                                  {slots.map(({ time }) => {
                                    const isPast = isTimeSlotPast(time);
                                    const isSel = selectedTime === time;
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
                                        className={`cursor-pointer py-3 px-1 rounded-xl font-mono transition-all duration-150 ${
                                          isSel
                                            ? 'bg-mainColor text-white font-semibold shadow-lg shadow-mainColor/25'
                                            : isPast
                                              ? 'bg-softWhite/[0.01] text-softWhite/[0.08] border border-softWhite/[0.03] cursor-not-allowed line-through'
                                              : 'bg-softWhite/[0.04] hover:bg-softWhite/[0.075] text-softWhite/40 border border-softWhite/[0.055] hover:text-softWhite/70'
                                        }`}
                                        style={{
                                          fontSize:
                                            'clamp(0.62rem, 1.1vw, 0.72rem)',
                                        }}
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
                          <div className='flex flex-col items-center justify-center h-full py-16 gap-3'>
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

                  {/* ══ STEP 4 ══ */}
                  {currentStep === 4 && (
                    <div className='w-full max-w-lg space-y-3 mx-auto'>
                      <div className='flex flex-col sm:grid sm:grid-cols-2 gap-3'>
                        {[
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
                        ].map(({ key, label, type, valid }) => {
                          const isFoc = focusedField === key;
                          const hasVal =
                            userInfo[key as keyof UserInfo].length > 0;
                          const lifted = isFoc || hasVal;
                          return (
                            <div key={key} className='relative'>
                              <label
                                className={`absolute left-4 pointer-events-none z-10 transition-all duration-200 ${
                                  lifted
                                    ? 'top-[9px] text-[0.55rem] tracking-[0.08em]'
                                    : 'top-1/2 -translate-y-1/2 text-[0.85rem]'
                                } ${isFoc ? 'text-mainColor/60' : hasVal ? 'text-softWhite/22' : 'text-softWhite/20'}`}
                              >
                                {label}
                                <span className='ml-0.5 text-mainColor/35'>
                                  *
                                </span>
                              </label>
                              <input
                                type={type}
                                value={userInfo[key as keyof UserInfo]}
                                onChange={(e) =>
                                  setUserInfo({
                                    ...userInfo,
                                    [key]: e.target.value,
                                  })
                                }
                                onFocus={() => setFocusedField(key)}
                                onBlur={() => setFocusedField(null)}
                                className={`w-full px-4 pt-7 pb-3 bg-softWhite/[0.025] rounded-xl text-softWhite/80 text-[0.88rem]
                                transition-all focus:outline-none border ${
                                  isFoc
                                    ? 'border-mainColor/25 bg-mainColor/[0.018] shadow-md shadow-mainColor/[0.05]'
                                    : valid
                                      ? 'border-softWhite/10'
                                      : 'border-softWhite/[0.05]'
                                }`}
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

                  {/* ══ STEP 5 ══ */}
                  {currentStep === 5 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.38, ease: easing }}
                      className='w-full max-w-2xl mx-auto'
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
                          {[
                            {
                              label: 'Kişi',
                              value: `${guests} kişi`,
                              hi: false,
                            },
                            {
                              label: 'Oturma',
                              value:
                                seatingType === 'vip'
                                  ? 'VIP Loca'
                                  : seatingType === 'lounge'
                                    ? 'Lounge Bar'
                                    : 'Masa',
                              hi: false,
                            },
                            {
                              label: 'Tarih',
                              value: summaryDate?.toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }),
                              hi: false,
                            },
                            {
                              label: 'Saat',
                              value: selectedTime,
                              hi: true,
                              mono: true,
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
                            },
                          ].map(({ label, value, hi, mono }) => (
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
                            * Rezervasyonunuz onay için gönderilecektir. En kısa
                            sürede dönüş yapılacaktır.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* end inner wrapper */}
          </div>

          {/* Right panel */}
          {!isFullWidth && (
            <aside className='hidden lg:flex w-[300px] xl:w-[340px] shrink-0 flex-col justify-center px-7 xl:px-9 relative overflow-hidden'>
              <div
                className='absolute left-0 top-[15%] bottom-[15%] w-px'
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent 100%)',
                }}
              />
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  key={`p-${currentStep}`}
                  custom={direction}
                  variants={panelVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ duration: 0.28, ease: easing }}
                  className='h-full'
                >
                  {renderRightPanel()}
                </motion.div>
              </AnimatePresence>
            </aside>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className='fixed bottom-0 inset-x-0 z-50 bg-secondaryColor/85 backdrop-blur-2xl border-t border-softWhite/[0.045]'>
        <div className='flex items-center justify-between px-5 sm:px-7 h-[58px] gap-3'>
          <motion.button
            onClick={goBack}
            whileTap={{ scale: 0.95 }}
            className='cursor-pointer flex items-center gap-1.5 h-9 px-4 rounded-xl border border-softWhite/[0.07]
              text-softWhite/40 hover:text-softWhite/75 hover:border-softWhite/14
              text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-all duration-200'
          >
            <svg
              className='w-3.5 h-3.5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            {currentStep === 1 ? 'Geri Dön' : 'Geri'}
          </motion.button>

          <motion.button
            onClick={
              currentStep === totalSteps
                ? () => alert('Rezervasyon tamamlandı!')
                : goNext
            }
            disabled={!canProceed()}
            whileTap={canProceed() ? { scale: 0.96 } : {}}
            className={`flex items-center gap-2 h-9 px-5 rounded-xl text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
              canProceed()
                ? 'cursor-pointer bg-mainColor text-white hover:bg-mainColor/88 shadow-lg shadow-mainColor/18'
                : 'cursor-not-allowed bg-softWhite/[0.035] text-softWhite/12'
            }`}
          >
            {currentStep === totalSteps ? 'Tamamla' : 'Devam Et'}
            {canProceed() && (
              <svg
                className='w-3 h-3'
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
          </motion.button>
        </div>
      </div>
    </main>
  );
}
