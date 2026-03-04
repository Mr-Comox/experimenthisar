'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActivitiesLogo,
  LeftLeafletIcon,
  RightLeafletIcon,
} from '@/public/Icons';
import AnimatedText from '@/app/utilities/AnimatedText';

type Props = { id: string };
type SeatingType = 'lounge' | 'vip' | 'masa';

interface UserInfo {
  name: string;
  surname: string;
  phone: string;
  email: string;
}

const Reservation = ({ id }: Props) => {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [guests, setGuests] = useState(2);
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
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const nextMonth = () => {
    if (viewingMonth === 11) {
      setViewingMonth(0);
      setViewingYear(viewingYear + 1);
    } else {
      setViewingMonth(viewingMonth + 1);
    }
  };

  const prevMonth = () => {
    if (viewingMonth === 0) {
      setViewingMonth(11);
      setViewingYear(viewingYear - 1);
    } else {
      setViewingMonth(viewingMonth - 1);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9+\s()-]{10,}$/.test(phone);
  };

  const canProceed = () => {
    if (currentStep === 1) return guests > 0;
    if (currentStep === 2) return seatingType !== null;
    if (currentStep === 3)
      return selectedDate !== null && selectedTime !== null;
    if (currentStep === 4) {
      return (
        userInfo.name.trim().length >= 2 &&
        userInfo.surname.trim().length >= 2 &&
        validatePhone(userInfo.phone) &&
        validateEmail(userInfo.email)
      );
    }
    return true;
  };

  const generateCalendar = () => {
    const firstDay = new Date(viewingYear, viewingMonth, 1);
    const lastDay = new Date(viewingYear, viewingMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(
        viewingYear,
        viewingMonth,
        -startingDayOfWeek + i + 1,
      );
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(viewingYear, viewingMonth, i),
        isCurrentMonth: true,
      });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(viewingYear, viewingMonth + 1, i),
        isCurrentMonth: false,
      });
    }
    return days;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 23; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push({
          time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          period: 'Gece',
        });
      }
    }
    for (let hour = 0; hour <= 5; hour++) {
      const maxMin = hour === 5 ? 0 : 45;
      for (let min = 0; min <= maxMin; min += 15) {
        slots.push({
          time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          period: hour < 3 ? 'Gece' : 'Sabah',
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const nightSlots = timeSlots.filter((s) => s.period === 'Gece');
  const morningSlots = timeSlots.filter((s) => s.period === 'Sabah');

  const isTimeSlotPast = (slotTime: string): boolean => {
    if (!selectedDate) return false;

    const now = new Date();
    const nowH = now.getHours();
    const nowM = now.getMinutes();

    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const selMidnight = new Date(selectedDate);
    selMidnight.setHours(0, 0, 0, 0);

    if (selMidnight.getTime() !== todayMidnight.getTime()) return false;

    const [slotH, slotM] = slotTime.split(':').map(Number);

    // Case 1: 23:xx right now — only 23:xx slots can be past
    if (nowH === 23) {
      if (slotH !== 23) return false;
      return nowH * 60 + nowM >= slotH * 60 + slotM;
    }

    // Case 2: past midnight (00:xx–05:xx) — session is ongoing
    if (nowH <= 5) {
      if (slotH === 23) return true; // all 23:xx already gone
      return nowH * 60 + nowM >= slotH * 60 + slotM;
    }

    return false; // daytime, nothing blocked
  };

  React.useEffect(() => {
    if (selectedTime && isTimeSlotPast(selectedTime)) {
      setSelectedTime(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime]);

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      <div className='relative flex'>
        <div className='hidden lg:flex items-start justify-center w-14 pt-20 flex-shrink-0'>
          <span
            className='text-softWhite/20 text-[9px] tracking-[0.35em] uppercase select-none whitespace-nowrap'
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Rezervasyon
          </span>
        </div>

        <div className='flex-1 px-6 sm:px-10 lg:px-12 pt-20 pb-14 flex flex-col gap-6'>
          <header className='flex items-center gap-2'>
            <LeftLeafletIcon widthSize='9' heightSize='18' />
            <span className='text-mainColor uppercase tracking-[0.35em] text-[0.65rem]'>
              Rezervasyon
            </span>
            <RightLeafletIcon widthSize='9' heightSize='18' />
          </header>

          <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5'>
            <h2 className='text-softWhite font-serif text-[2rem] sm:text-[2.8rem] md:text-[3.4rem] lg:text-[4rem] xl:text-[4.8rem] leading-[1.1] max-w-3xl'>
              <AnimatedText text='Rezervasyon Talebi' />
            </h2>
          </div>
        </div>
      </div>

      <div className='w-full h-px bg-softWhite/10' />

      <div className='relative flex'>
        <div className='hidden lg:block w-14 flex-shrink-0' />
        <div className='flex-1 px-6 sm:px-10 lg:px-12 py-12 lg:py-16'>
          <AnimatePresence mode='wait'>
            {!showReservationForm ? (
              <motion.div
                key='intro'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className='min-h-[500px] flex items-center'
              >
                <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full'>
                  {/* Left Side - Premium Visual Showcase */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className='relative h-[500px] lg:h-[600px]'
                  >
                    <div className='absolute inset-0 rounded-2xl overflow-hidden'>
                      <div className='absolute inset-0 bg-gradient-to-br from-mainColor/5 via-transparent to-mainColor/10' />
                      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64'>
                        <div className='absolute inset-0 rounded-full border border-mainColor/40 animate-ping' />
                        <div className='absolute inset-4 rounded-full border border-softWhite/10 animate-pulse' />
                        <div className='absolute inset-4 rounded-full border border-softWhite/10 animate-pulse' />
                        <div className='absolute inset-0 rounded-full border border-mainColor/40 animate-ping' />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <ActivitiesLogo className='w-40 h-40 opacity-25' />
                        </div>
                      </div>
                      <div className='absolute inset-0 p-4 sm:p-6 md:p-8'>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className='absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 group max-w-[160px] sm:max-w-none'
                        >
                          <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/[0.02] backdrop-blur-sm border border-softWhite/[0.08] rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/[0.05] transition-all duration-300'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center flex-shrink-0'>
                              <svg
                                className='w-5 h-5 text-mainColor'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M8 3h8v3a4 4 0 01-8 0V3zm4 10v5m-3 3h6'
                                />
                              </svg>
                            </div>
                            <div className='min-w-0'>
                              <p className='text-softWhite/90 text-xs sm:text-sm font-medium truncate'>
                                Lounge Bar
                              </p>
                              <p className='text-softWhite/40 text-[10px] sm:text-xs truncate'>
                                Lüks ambiyans
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className='absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 max-w-[160px] sm:max-w-none'
                        >
                          <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/[0.02] backdrop-blur-sm border border-softWhite/[0.08] rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/[0.05] transition-all duration-300'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center flex-shrink-0'>
                              <svg
                                className='w-5 h-5 text-mainColor'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 21v-3'
                                />
                              </svg>
                            </div>
                            <div className='min-w-0'>
                              <p className='text-softWhite/90 text-xs sm:text-sm font-medium truncate'>
                                Canlı Müzik
                              </p>
                              <p className='text-softWhite/40 text-[10px] sm:text-xs truncate'>
                                Seçkin sanatçılar
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className='absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 max-w-[160px] sm:max-w-none'
                        >
                          <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/[0.02] backdrop-blur-sm border border-softWhite/[0.08] rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/[0.05] transition-all duration-300'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center flex-shrink-0'>
                              <svg
                                className='w-5 h-5 text-mainColor'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M3 7l4 5 5-7 5 7 4-5v10H3V7z'
                                />
                              </svg>
                            </div>
                            <div className='min-w-0'>
                              <p className='text-softWhite/90 text-xs sm:text-sm font-medium truncate'>
                                VIP Loca
                              </p>
                              <p className='text-softWhite/40 text-[10px] sm:text-xs truncate'>
                                Size özel konfor
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className='absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 max-w-[160px] sm:max-w-none'
                        >
                          <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/[0.02] backdrop-blur-sm border border-softWhite/[0.08] rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/[0.05] transition-all duration-300'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center flex-shrink-0'>
                              <svg
                                className='w-5 h-5 text-mainColor'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z'
                                />
                              </svg>
                            </div>
                            <div className='min-w-0'>
                              <p className='text-softWhite/90 text-xs sm:text-sm font-medium truncate'>
                                Seçkin Atmosfer
                              </p>
                              <p className='text-softWhite/40 text-[10px] sm:text-xs truncate'>
                                Üst düzey ışık
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      <div className='absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-mainColor/20 rounded-tl-2xl' />
                      <div className='absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-mainColor/20 rounded-br-2xl' />
                    </div>
                  </motion.div>

                  {/* Right Side */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className='space-y-8 lg:pl-8'
                  >
                    <div className='space-y-4'>
                      <motion.div
                        className='inline-flex items-center gap-2 bg-mainColor/10 border border-mainColor/20 rounded-full px-4 py-1.5'
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className='w-2 h-2 rounded-full bg-mainColor animate-pulse' />
                        <span className='text-mainColor text-xs font-medium tracking-wide uppercase'>
                          Hemen Rezerve Et
                        </span>
                      </motion.div>
                      <h3 className='text-softWhite font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]'>
                        Akşamını
                        <span className='block text-mainColor mt-2'>
                          Planla
                        </span>
                      </h3>
                      <p className='text-softWhite/60 text-base md:text-lg leading-relaxed max-w-xl'>
                        Unutulmaz bir gece için yerinizi şimdi ayırtın. Premium
                        hizmet, özel atmosfer ve unutulmaz anlar sizi bekliyor.
                      </p>
                    </div>

                    <div className='space-y-3'>
                      {[
                        'Özel davet ve etkinliklerde öncelikli erişim',
                        'Size özel masa planlaması ve hızlı randevu',
                        'Tüm bilgileriniz üst düzey güvenlik ile korunur ',
                      ].map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className='flex items-center gap-3'
                        >
                          <div className='w-5 h-5 rounded-full bg-mainColor/20 flex items-center justify-center flex-shrink-0'>
                            <svg
                              className='w-3 h-3 text-mainColor'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={3}
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                          </div>
                          <span className='text-softWhite/70 text-sm'>
                            {benefit}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div className='space-y-4 pt-4'>
                      <button
                        onClick={() => setShowReservationForm(true)}
                        className='group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-4 bg-mainColor text-secondaryColor rounded-xl text-sm md:text-base font-semibold transition-all duration-500 hover:bg-mainColor/90 hover:shadow-2xl hover:shadow-mainColor/20 hover:scale-[1.02] overflow-hidden'
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000' />
                        <span className='relative z-10 uppercase tracking-widest font-medium text-softWhite flex items-center justify-center gap-2'>
                          Rezervasyon Yap
                          <svg
                            className='w-4 h-4 group-hover:translate-x-1 transition-transform'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 5l7 7-7 7'
                            />
                          </svg>
                        </span>
                      </button>
                      <p className='text-softWhite/30 text-xs sm:text-sm flex items-center gap-2'>
                        <svg
                          className='w-4 h-4'
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
                        Rezervasyonunuz onay sonrası kesinleşir.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key='form'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className='max-w-5xl mx-auto'
              >
                <div className='mb-8'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-softWhite/90 text-base sm:text-lg font-medium'>
                      {currentStep === 1 && 'Kişi Sayısı'}
                      {currentStep === 2 && 'Oturma Tercihi'}
                      {currentStep === 3 && 'Tarih ve Saat'}
                      {currentStep === 4 && 'İletişim Bilgileri'}
                      {currentStep === 5 && 'Rezervasyon Özeti'}
                    </h3>
                    <div className='flex items-center gap-2'>
                      <span className='text-mainColor/70 text-[0.65rem] uppercase tracking-widest font-mono'>
                        {Math.round(progress)}%
                      </span>
                      <span className='text-softWhite/30 text-[0.65rem] font-mono'>
                        {currentStep}/{totalSteps}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-[3px] rounded-full transition-all duration-500 ${i < currentStep ? 'bg-mainColor' : i === currentStep ? 'bg-mainColor/50' : 'bg-softWhite/10'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className='min-h-[250px] relative'>
                  <AnimatePresence mode='wait'>
                    {currentStep === 1 && (
                      <motion.div
                        key='step1'
                        variants={stepVariants}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className='space-y-14'
                      >
                        <p className='text-softWhite/50 text-base text-left'>
                          Kaç kişilik rezervasyon yapmak istiyorsunuz?
                        </p>
                        <div className='flex justify-evenly'>
                          <div className='inline-grid grid-cols-4 gap-6 md:grid-cols-8 md:gap-8'>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <button
                                key={num}
                                onClick={() => setGuests(num)}
                                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border transition-all duration-300 flex items-center justify-center ${guests === num ? 'border-mainColor/50 bg-mainColor/10 shadow-lg shadow-mainColor/10' : 'border-softWhite/10 hover:border-softWhite/25 hover:bg-softWhite/[0.02]'}`}
                              >
                                <span
                                  className={`text-2xl sm:text-3xl font-serif ${guests === num ? 'text-mainColor' : 'text-softWhite/60'}`}
                                >
                                  {num}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key='step2'
                        variants={stepVariants}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className='space-y-6'
                      >
                        <p className='text-softWhite/50 text-base'>
                          Oturma tercihinizi seçin
                        </p>
                        <div className='space-y-3'>
                          {[
                            {
                              value: 'vip' as SeatingType,
                              label: 'VIP Loca',
                              desc: 'Özel ve konforlu alan',
                            },
                            {
                              value: 'lounge' as SeatingType,
                              label: 'Lounge Bar',
                              desc: 'Rahat ve sosyal atmosfer',
                            },
                            {
                              value: 'masa' as SeatingType,
                              label: 'Masa',
                              desc: 'Standart oturma alanı',
                            },
                          ].map(({ value, label, desc }) => (
                            <button
                              key={value}
                              onClick={() => setSeatingType(value)}
                              className={`w-full p-5 rounded-lg border text-left transition-all duration-300 ${seatingType === value ? 'border-mainColor/50 bg-mainColor/10 shadow-lg shadow-mainColor/10' : 'border-softWhite/10 hover:border-softWhite/25 hover:bg-softWhite/[0.02]'}`}
                            >
                              <div className='flex items-center justify-between'>
                                <div>
                                  <h4
                                    className={`text-base font-medium mb-0.5 ${seatingType === value ? 'text-mainColor' : 'text-softWhite/90'}`}
                                  >
                                    {label}
                                  </h4>
                                  <p className='text-xs text-softWhite/40'>
                                    {desc}
                                  </p>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${seatingType === value ? 'border-mainColor' : 'border-softWhite/30'}`}
                                >
                                  {seatingType === value && (
                                    <div className='w-4 h-4 rounded-full bg-mainColor' />
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        key='step3'
                        variants={stepVariants}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className='space-y-6'
                      >
                        <div className='grid lg:grid-cols-[1fr_1.2fr] gap-6'>
                          {/* Calendar */}
                          <div className='bg-softWhite/[0.03] border border-softWhite/[0.08] rounded-lg p-5'>
                            <div className='flex items-center justify-between mb-4'>
                              <h4 className='text-softWhite/90 text-sm font-medium'>
                                {new Date(
                                  viewingYear,
                                  viewingMonth,
                                ).toLocaleDateString('tr-TR', {
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </h4>
                              <div className='flex gap-1'>
                                <button
                                  onClick={prevMonth}
                                  className='w-7 h-7 flex items-center justify-center rounded hover:bg-softWhite/[0.05] text-softWhite/50 text-sm transition-colors'
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={nextMonth}
                                  className='w-7 h-7 flex items-center justify-center rounded hover:bg-softWhite/[0.05] text-softWhite/50 text-sm transition-colors'
                                >
                                  ›
                                </button>
                              </div>
                            </div>
                            <div className='grid grid-cols-7 gap-1.5'>
                              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(
                                (day) => (
                                  <div
                                    key={day}
                                    className='text-center text-[0.65rem] text-softWhite/30 font-medium py-2'
                                  >
                                    {day}
                                  </div>
                                ),
                              )}
                              {generateCalendar().map((day, i) => {
                                const isSelected =
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
                                    className={`aspect-square rounded-md text-xs transition-all duration-200
                                      ${!day.isCurrentMonth ? 'text-softWhite/15' : ''}
                                      ${isPast ? 'text-softWhite/15 cursor-not-allowed' : ''}
                                      ${isSelected ? 'bg-mainColor text-secondaryColor font-medium' : ''}
                                      ${!isSelected && !isPast && day.isCurrentMonth ? 'hover:bg-softWhite/[0.05] text-softWhite/60' : ''}
                                      ${isToday && !isSelected ? 'ring-1 ring-mainColor/40' : ''}`}
                                  >
                                    {day.date.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Time slots */}
                          <div className='space-y-5'>
                            {selectedDate ? (
                              <>
                                {(() => {
                                  const now = new Date();
                                  const nowH = now.getHours();
                                  const todayMidnight = new Date(now);
                                  todayMidnight.setHours(0, 0, 0, 0);
                                  const selMidnight = new Date(selectedDate);
                                  selMidnight.setHours(0, 0, 0, 0);
                                  const isToday =
                                    selMidnight.getTime() ===
                                    todayMidnight.getTime();

                                  // Only show for today AND while we're in the 00:xx–05:xx window
                                  if (!isToday || nowH > 5) return null;

                                  const sessionStartDate = new Date(
                                    selectedDate,
                                  );
                                  sessionStartDate.setDate(
                                    sessionStartDate.getDate() - 1,
                                  );
                                  const sessionStart =
                                    sessionStartDate.toLocaleDateString(
                                      'tr-TR',
                                      { day: 'numeric', month: 'long' },
                                    );
                                  const sessionEnd =
                                    selectedDate.toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'long',
                                    });

                                  return (
                                    <div className='flex items-start gap-2.5 bg-mainColor/[0.06] border border-mainColor/20 rounded-lg px-4 py-3'>
                                      <svg
                                        className='w-4 h-4 text-mainColor/70 flex-shrink-0 mt-0.5'
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
                                      <p className='text-xs text-softWhite/60 leading-relaxed'>
                                        Şu an{' '}
                                        <span className='text-mainColor font-medium'>
                                          {sessionStart} – {sessionEnd}
                                        </span>{' '}
                                        gecesinin devamındasınız.{' '}
                                        <span className='text-softWhite/40'>
                                          Gece saatleri geçtiği için yalnızca
                                          kalan süreler seçilebilir.
                                        </span>
                                      </p>
                                    </div>
                                  );
                                })()}

                                {(() => {
                                  if (!selectedTime) return null;

                                  const [slotH] = selectedTime
                                    .split(':')
                                    .map(Number);

                                  // Only relevant for early-morning slots
                                  if (slotH > 5) return null;

                                  // Guard: don't show while Banner 1 is active
                                  const now = new Date();
                                  const nowH = now.getHours();
                                  const todayMidnight = new Date(now);
                                  todayMidnight.setHours(0, 0, 0, 0);
                                  const selMidnight = new Date(selectedDate);
                                  selMidnight.setHours(0, 0, 0, 0);
                                  const isToday =
                                    selMidnight.getTime() ===
                                    todayMidnight.getTime();

                                  if (isToday && nowH <= 5) return null;

                                  const nextDay = new Date(selectedDate);
                                  nextDay.setDate(nextDay.getDate() + 1);
                                  const nextDayStr = nextDay.toLocaleDateString(
                                    'tr-TR',
                                    { day: 'numeric', month: 'long' },
                                  );
                                  const selectedDayStr =
                                    selectedDate.toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'long',
                                    });

                                  return (
                                    <div className='flex items-start gap-3 bg-mainColor/[0.06] border border-mainColor/20 rounded-lg px-4 py-3'>
                                      <svg
                                        className='w-4 h-4 text-mainColor/70 flex-shrink-0 mt-0.5'
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
                                      <p className='text-xs text-softWhite/60 leading-relaxed'>
                                        Seçtiğiniz saat{' '}
                                        <span className='text-mainColor font-medium'>
                                          {selectedTime}
                                        </span>{' '}
                                        olmaktadır ve{' '}
                                        <span className='text-mainColor font-medium'>
                                          {selectedDayStr} – {nextDayStr}
                                        </span>{' '}
                                        bağlayan geceye ait.{' '}
                                        <span className='text-softWhite/40'>
                                          Rezervasyonunuz{' '}
                                          <span className='text-softWhite/60 font-medium'>
                                            {nextDayStr}
                                          </span>{' '}
                                          sabahı için geçerli olacaktır.
                                        </span>
                                      </p>
                                    </div>
                                  );
                                })()}

                                {/* Night slots */}
                                <div>
                                  <div className='flex items-center gap-2 mb-3'>
                                    <span className='text-[0.65rem] text-softWhite/40 uppercase tracking-wider'>
                                      Gece
                                    </span>
                                    <span className='text-[0.65rem] text-softWhite/25 font-mono'>
                                      23:00 - 02:45
                                    </span>
                                  </div>
                                  <div className='grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2'>
                                    {nightSlots.map(({ time }) => {
                                      const isPast = isTimeSlotPast(time);
                                      return (
                                        <button
                                          key={time}
                                          onClick={() =>
                                            !isPast && setSelectedTime(time)
                                          }
                                          disabled={isPast}
                                          title={
                                            isPast
                                              ? 'Bu saat için rezervasyon süreci kapanmıştır.'
                                              : undefined
                                          }
                                          className={`px-3 py-2.5 rounded-md text-xs font-mono transition-all duration-200 ${
                                            selectedTime === time
                                              ? 'bg-mainColor text-secondaryColor font-medium shadow-lg shadow-mainColor/20'
                                              : isPast
                                                ? 'bg-softWhite/[0.02] text-softWhite/20 border border-softWhite/[0.05] cursor-not-allowed line-through'
                                                : 'bg-softWhite/[0.05] hover:bg-softWhite/[0.08] text-softWhite/60 border border-softWhite/10'
                                          }`}
                                        >
                                          {time}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Morning slots */}
                                <div>
                                  <div className='flex items-center gap-2 mb-3'>
                                    <span className='text-[0.65rem] text-softWhite/40 uppercase tracking-wider'>
                                      Sabah
                                    </span>
                                    <span className='text-[0.65rem] text-softWhite/25 font-mono'>
                                      03:00 - 05:00
                                    </span>
                                  </div>
                                  <div className='grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2'>
                                    {morningSlots.map(({ time }) => {
                                      const isPast = isTimeSlotPast(time);
                                      return (
                                        <button
                                          key={time}
                                          onClick={() =>
                                            !isPast && setSelectedTime(time)
                                          }
                                          disabled={isPast}
                                          title={
                                            isPast
                                              ? 'Bu saat için rezervasyon süreci kapanmıştır.'
                                              : undefined
                                          }
                                          className={`px-3 py-2.5 rounded-md text-xs font-mono transition-all duration-200 ${
                                            selectedTime === time
                                              ? 'bg-mainColor text-secondaryColor font-medium shadow-lg shadow-mainColor/20'
                                              : isPast
                                                ? 'bg-softWhite/[0.02] text-softWhite/20 border border-softWhite/[0.05] cursor-not-allowed line-through'
                                                : 'bg-softWhite/[0.05] hover:bg-softWhite/[0.08] text-softWhite/60 border border-softWhite/10'
                                          }`}
                                        >
                                          {time}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className='flex items-center justify-center h-full text-softWhite/30 text-sm'>
                                Lütfen önce bir tarih seçininiz.
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      <motion.div
                        key='step4'
                        variants={stepVariants}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className='space-y-6'
                      >
                        <p className='text-softWhite/50 text-base mb-6'>
                          Rezervasyonunuzu tamamlamak için lütfen bilgilerinizi
                          giriniz
                        </p>
                        <div className='grid sm:grid-cols-2 gap-5'>
                          {/* Name */}
                          <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-[0.7rem] text-softWhite/50 uppercase tracking-wider'>
                              <span>Ad</span>
                              <span className='text-mainColor/60'>*</span>
                            </label>
                            <div className='relative'>
                              <input
                                type='text'
                                value={userInfo.name}
                                onChange={(e) =>
                                  setUserInfo({
                                    ...userInfo,
                                    name: e.target.value,
                                  })
                                }
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                placeholder='Adınız'
                                className={`w-full px-4 py-3.5 bg-softWhite/[0.03] border rounded-lg text-softWhite/90 text-sm placeholder:text-softWhite/20 transition-all duration-300 focus:outline-none ${focusedField === 'name' ? 'border-mainColor/50 bg-mainColor/[0.02] shadow-lg shadow-mainColor/5' : userInfo.name.trim().length >= 2 ? 'border-softWhite/20' : 'border-softWhite/10'}`}
                              />
                              {userInfo.name.trim().length >= 2 && (
                                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                  <div className='w-5 h-5 rounded-full bg-mainColor/20 flex items-center justify-center'>
                                    <svg
                                      className='w-3 h-3 text-mainColor'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Surname */}
                          <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-[0.7rem] text-softWhite/50 uppercase tracking-wider'>
                              <span>Soyad</span>
                              <span className='text-mainColor/60'>*</span>
                            </label>
                            <div className='relative'>
                              <input
                                type='text'
                                value={userInfo.surname}
                                onChange={(e) =>
                                  setUserInfo({
                                    ...userInfo,
                                    surname: e.target.value,
                                  })
                                }
                                onFocus={() => setFocusedField('surname')}
                                onBlur={() => setFocusedField(null)}
                                placeholder='Soyadınız'
                                className={`w-full px-4 py-3.5 bg-softWhite/[0.03] border rounded-lg text-softWhite/90 text-sm placeholder:text-softWhite/20 transition-all duration-300 focus:outline-none ${focusedField === 'surname' ? 'border-mainColor/50 bg-mainColor/[0.02] shadow-lg shadow-mainColor/5' : userInfo.surname.trim().length >= 2 ? 'border-softWhite/20' : 'border-softWhite/10'}`}
                              />
                              {userInfo.surname.trim().length >= 2 && (
                                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                  <div className='w-5 h-5 rounded-full bg-mainColor/20 flex items-center justify-center'>
                                    <svg
                                      className='w-3 h-3 text-mainColor'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Phone */}
                          <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-[0.7rem] text-softWhite/50 uppercase tracking-wider'>
                              <span>Telefon</span>
                              <span className='text-mainColor/60'>*</span>
                            </label>
                            <div className='relative'>
                              <input
                                type='tel'
                                value={userInfo.phone}
                                onChange={(e) =>
                                  setUserInfo({
                                    ...userInfo,
                                    phone: e.target.value,
                                  })
                                }
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                placeholder='+90 5XX XXX XX XX'
                                className={`w-full px-4 py-3.5 bg-softWhite/[0.03] border rounded-lg text-softWhite/90 text-sm placeholder:text-softWhite/20 transition-all duration-300 focus:outline-none ${focusedField === 'phone' ? 'border-mainColor/50 bg-mainColor/[0.02] shadow-lg shadow-mainColor/5' : validatePhone(userInfo.phone) ? 'border-softWhite/20' : 'border-softWhite/10'}`}
                              />
                              {validatePhone(userInfo.phone) && (
                                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                  <div className='w-5 h-5 rounded-full bg-mainColor/20 flex items-center justify-center'>
                                    <svg
                                      className='w-3 h-3 text-mainColor'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Email */}
                          <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-[0.7rem] text-softWhite/50 uppercase tracking-wider'>
                              <span>E-posta</span>
                              <span className='text-mainColor/60'>*</span>
                            </label>
                            <div className='relative'>
                              <input
                                type='email'
                                value={userInfo.email}
                                onChange={(e) =>
                                  setUserInfo({
                                    ...userInfo,
                                    email: e.target.value,
                                  })
                                }
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                placeholder='ornek@email.com'
                                className={`w-full px-4 py-3.5 bg-softWhite/[0.03] border rounded-lg text-softWhite/90 text-sm placeholder:text-softWhite/20 transition-all duration-300 focus:outline-none ${focusedField === 'email' ? 'border-mainColor/50 bg-mainColor/[0.02] shadow-lg shadow-mainColor/5' : validateEmail(userInfo.email) ? 'border-softWhite/20' : 'border-softWhite/10'}`}
                              />
                              {validateEmail(userInfo.email) && (
                                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                  <div className='w-5 h-5 rounded-full bg-mainColor/20 flex items-center justify-center'>
                                    <svg
                                      className='w-3 h-3 text-mainColor'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='mt-8 pt-6 border-t border-softWhite/[0.08]'>
                          <div className='flex items-start gap-3 bg-softWhite/[0.02] border border-softWhite/[0.06] rounded-lg p-4'>
                            <div className='mt-0.5'>
                              <svg
                                className='w-4 h-4 text-mainColor/70'
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
                            </div>
                            <p className='text-xs text-softWhite/40 leading-relaxed'>
                              Girdiğiniz bilgiler rezervasyon onayı ve iletişim
                              amaçlı kullanılacaktır. Kişisel verileriniz gizli
                              tutulacaktır.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 5 && (
                      <motion.div
                        key='step5'
                        variants={stepVariants}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className='space-y-5'
                      >
                        {(() => {
                          const summaryDate = (() => {
                            if (!selectedDate || !selectedTime)
                              return selectedDate;
                            const [slotH] = selectedTime.split(':').map(Number);
                            if (slotH > 5) return selectedDate;

                            // Check if we're in an active midnight session
                            const now = new Date();
                            const nowH = now.getHours();
                            const todayMidnight = new Date(now);
                            todayMidnight.setHours(0, 0, 0, 0);
                            const selMidnight = new Date(selectedDate);
                            selMidnight.setHours(0, 0, 0, 0);
                            const isToday =
                              selMidnight.getTime() === todayMidnight.getTime();

                            if (isToday && nowH <= 5) return selectedDate;

                            // Normal hours picking an early-morning slot → next calendar day
                            const next = new Date(selectedDate);
                            next.setDate(next.getDate() + 1);
                            return next;
                          })();

                          return (
                            <div className='bg-softWhite/[0.03] border border-softWhite/[0.08] rounded-lg p-6 space-y-5'>
                              <h4 className='text-softWhite/90 text-base font-medium mb-4'>
                                Rezervasyon Detayları
                              </h4>
                              <div className='space-y-3'>
                                <div className='flex justify-between py-2.5 border-b border-softWhite/[0.06]'>
                                  <span className='text-softWhite/50 text-sm'>
                                    Kişi Sayısı
                                  </span>
                                  <span className='text-softWhite/90 font-medium text-sm'>
                                    {guests} Kişi
                                  </span>
                                </div>
                                <div className='flex justify-between py-2.5 border-b border-softWhite/[0.06]'>
                                  <span className='text-softWhite/50 text-sm'>
                                    Oturma Tercihi
                                  </span>
                                  <span className='text-softWhite/90 font-medium text-sm'>
                                    {seatingType === 'lounge' && 'Lounge Bar'}
                                    {seatingType === 'vip' && 'VIP Loca'}
                                    {seatingType === 'masa' && 'Masa'}
                                  </span>
                                </div>
                                <div className='flex justify-between py-2.5 border-b border-softWhite/[0.06]'>
                                  <span className='text-softWhite/50 text-sm'>
                                    Tarih
                                  </span>
                                  <span className='text-softWhite/90 font-medium text-sm'>
                                    {summaryDate?.toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <div className='flex justify-between py-2.5 border-b border-softWhite/[0.06]'>
                                  <span className='text-softWhite/50 text-sm'>
                                    Saat
                                  </span>
                                  <span className='text-mainColor font-mono font-medium text-sm'>
                                    {selectedTime}
                                  </span>
                                </div>
                              </div>
                              <div className='pt-4 mt-4 border-t border-softWhite/[0.08]'>
                                <h5 className='text-softWhite/70 text-sm font-medium mb-3'>
                                  İletişim Bilgileri
                                </h5>
                                <div className='space-y-2.5'>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-softWhite/40 text-xs'>
                                      Ad Soyad
                                    </span>
                                    <span className='text-softWhite/90 text-sm'>
                                      {userInfo.name} {userInfo.surname}
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-softWhite/40 text-xs'>
                                      Telefon
                                    </span>
                                    <span className='text-softWhite/90 text-sm font-mono'>
                                      {userInfo.phone}
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-softWhite/40 text-xs'>
                                      E-posta
                                    </span>
                                    <span className='text-softWhite/90 text-sm'>
                                      {userInfo.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className='pt-4 mt-4 border-t border-softWhite/[0.08]'>
                                <p className='text-xs text-softWhite/40 leading-relaxed'>
                                  * Rezervasyonunuz onay için gönderilecektir.
                                  En kısa sürede size dönüş yapılacaktır.
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className='flex items-center justify-between mt-8 pt-6 border-t border-softWhite/[0.08]'>
                  <button
                    onClick={() => {
                      if (currentStep === 1) {
                        setShowReservationForm(false);
                      } else {
                        prevStep();
                      }
                    }}
                    className='px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all duration-300 text-softWhite/70 hover:text-softWhite hover:bg-softWhite/[0.05]'
                  >
                    {currentStep === 1 ? 'İptal' : 'Geri'}
                  </button>
                  <button
                    onClick={
                      currentStep === totalSteps
                        ? () => alert('Rezervasyon tamamlandı!')
                        : nextStep
                    }
                    disabled={!canProceed()}
                    className={`relative px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all duration-300 overflow-hidden ${canProceed() ? 'bg-mainColor/20 hover:bg-mainColor/30 text-mainColor border border-mainColor/40 shadow-lg shadow-mainColor/10' : 'bg-softWhite/[0.03] text-softWhite/30 border border-softWhite/[0.06] cursor-not-allowed'}`}
                  >
                    {currentStep === totalSteps
                      ? 'Rezervasyonu Tamamla'
                      : 'Devam Et'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
