'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ActivitiesLogo,
  LeftLeafletIcon,
  RightLeafletIcon,
} from '@/public/Icons';
import AnimatedText from '@/app/utilities/AnimatedText';

type Props = { id: string };

const Reservation = ({ id }: Props) => {
  const router = useRouter();

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      <div className='relative flex'>
        <div className='hidden lg:flex items-start justify-center w-14 pt-20 shrink-0'>
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
        <div className='hidden lg:block w-14 shrink-0' />
        <div className='flex-1 px-6 sm:px-10 lg:px-12 py-12 lg:py-16'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className='min-h-125 flex items-center'
          >
            <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full'>
              {/* Left Side - Premium Visual Showcase */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className='relative h-125 lg:h-150'
              >
                <div className='absolute inset-0 rounded-2xl overflow-hidden'>
                  <div className='absolute inset-0 bg-linear-to-br from-mainColor/5 via-transparent to-mainColor/10' />
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
                      className='absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 group max-w-40 sm:max-w-none'
                    >
                      <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/2 backdrop-blur-sm border border-softWhite/8 rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/5 transition-all duration-300'>
                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center shrink-0'>
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
                      className='absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 max-w-40 sm:max-w-none'
                    >
                      <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/2 backdrop-blur-sm border border-softWhite/8 rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/5 transition-all duration-300'>
                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center shrink-0'>
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
                      className='absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 max-w-40 sm:max-w-none'
                    >
                      <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/2 backdrop-blur-sm border border-softWhite/8 rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/5 transition-all duration-300'>
                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center shrink-0'>
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
                      className='absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 max-w-40 sm:max-w-none'
                    >
                      <div className='flex items-center gap-2 sm:gap-3 bg-softWhite/2 backdrop-blur-sm border border-softWhite/8 rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-softWhite/5 transition-all duration-300'>
                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mainColor/10 flex items-center justify-center shrink-0'>
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
                  <h3 className='text-softWhite font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]'>
                    Akşamını
                    <span className='block text-mainColor mt-2'>Planla</span>
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
                    'Tüm bilgileriniz üst düzey güvenlik ile korunur',
                  ].map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className='flex items-center gap-3'
                    >
                      <div className='w-5 h-5 rounded-full bg-mainColor/20 flex items-center justify-center shrink-0'>
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
                    onClick={() => router.push('/reservation')}
                    className='cursor-pointer group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-4 bg-mainColor text-secondaryColor rounded-xl text-sm md:text-base font-semibold transition-all duration-500 hover:bg-mainColor/90 hover:shadow-2xl hover:shadow-mainColor/20 hover:scale-[1.02] overflow-hidden'
                  >
                    <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
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
        </div>
      </div>
    </section>
  );
};

export default Reservation;
