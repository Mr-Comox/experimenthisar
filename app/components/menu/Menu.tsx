'use client';

import { LeftLeafletIcon, RightLeafletIcon } from '@/public/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import AnimatedText from '@/app/utilities/AnimatedText';
import { menuData } from '@/app/components/menu/Collection';

type Props = {
  id: string;
};

const Menu = ({ id }: Props) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const categories = Object.entries(menuData);

  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      {/* ───── HERO ───── */}
      <div className='relative flex'>
        <div className='hidden lg:flex w-14 pt-24 justify-center'></div>

        <div className='relative flex-1 px-6 sm:px-10 lg:px-12 pt-24 pb-16 flex flex-col gap-8 overflow-hidden'>
          <header className='flex items-center gap-3 relative z-10'>
            <LeftLeafletIcon widthSize='9' heightSize='18' />
            <span className='text-mainColor uppercase tracking-[0.35em] text-[0.65rem]'>
              Menü
            </span>
            <RightLeafletIcon widthSize='9' heightSize='18' />
          </header>

          <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 relative z-10'>
            <h2 className='text-softWhite font-serif text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] lg:text-[4.5rem] xl:text-[5.2rem] leading-[1.05] max-w-4xl'>
              <AnimatedText text='İçkiler & Mezeler' />
            </h2>
            <span className='hidden sm:block text-softWhite/20 text-[10px] tracking-[0.3em] uppercase mb-2'>
              Seçkin Tatlar
            </span>
          </div>
        </div>
      </div>

      {/* ───── DIVIDER ───── */}
      <div className='w-full h-px bg-softWhite/10' />

      {/* ───── MENU ROWS ───── */}
      <div className='relative flex'>
        <div className='hidden lg:flex items-start justify-center w-14 pt-16 flex-shrink-0'>
          <span
            className='text-softWhite/20 text-[9px] tracking-[0.35em] uppercase select-none whitespace-nowrap'
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Kategoriler
          </span>
        </div>

        <div className='flex-1'>
          {/* Instructions */}
          <div className='px-6 sm:px-10 lg:px-12 pt-6 pb-10'>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='hidden sm:block text-softWhite/20 text-[9.4px] tracking-[0.1em] uppercase -mb-10  leading-relaxed text-right w-full'
            >
              Ürünleri görmek için kategorilere tıklayınız.
            </motion.p>
          </div>

          {/* Category List */}
          <div className='flex flex-col gap-6'>
            {categories.map(([category, items], index) => {
              const isOpen = openCategory === category;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{ once: true }}
                  className='relative'
                >
                  {/* Category Row */}
                  <div
                    className={`
                      group relative
                      px-6 sm:px-10 lg:px-12
                      transition-all duration-500
                      ${isOpen ? 'opacity-100' : 'opacity-80'}
                      hover:opacity-100
                    `}
                  >
                    <button
                      onClick={() => setOpenCategory(isOpen ? null : category)}
                      className='w-full flex items-center gap-6 sm:gap-10 py-6 sm:py-8 text-left group/button'
                    >
                      {/* Index number */}
                      <span className='hidden md:block text-softWhite/10 font-serif text-4xl lg:text-5xl w-12 text-right select-none flex-shrink-0 leading-none'>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* Category name */}
                      <div className='flex-1 flex items-center gap-4'>
                        <h3
                          className={`
                            font-serif text-2xl sm:text-3xl md:text-4xl leading-tight
                            ${isOpen ? 'text-softWhite/95' : 'text-softWhite/75 group-hover/button:text-softWhite'}
                            transition-colors duration-500
                          `}
                        >
                          {category}
                        </h3>
                      </div>

                      {/* Connector line */}
                      <div className='relative flex-1 h-px bg-softWhite/10 mx-2 sm:mx-4 overflow-visible'>
                        <motion.div
                          className='absolute top-0 left-0 h-px bg-mainColor'
                          initial={{ width: '0%' }}
                          animate={{ width: isOpen ? '100%' : '0%' }}
                          transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>

                      {/* chevron */}
                      <div className='flex items-center gap-4 sm:gap-6 flex-shrink-0 min-w-[140px] sm:min-w-[180px] justify-end'>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className='flex items-center justify-center w-8 h-8 rounded-full border border-softWhite/10 group-hover/button:border-mainColor/30 transition-colors duration-500'
                        >
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 20 20'
                            fill='none'
                            className={`${isOpen ? 'text-mainColor' : 'text-softWhite/40'} transition-colors duration-500`}
                          >
                            <path
                              d='M5 7.5L10 12.5L15 7.5'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </button>

                    {/* Expanded Items - REFINED & ELEGANT */}
                    <AnimatePresence mode='wait'>
                      {isOpen && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                              height: {
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                              },
                              opacity: {
                                duration: 0.5,
                                delay: 0.15,
                              },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: {
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                              },
                              opacity: {
                                duration: 0.25,
                                delay: 0,
                              },
                            },
                          }}
                          className='overflow-hidden'
                        >
                          <div className='pt-8 pb-12 ml-0 md:ml-[88px]'>
                            {/* Premium card design */}
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: -30,
                                scale: 0.96,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                              }}
                              exit={{
                                opacity: 0,
                                y: -15,
                                scale: 0.96,
                              }}
                              transition={{
                                duration: 0.7,
                                delay: 0.1,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className='relative'
                            >
                              {/* Subtle border glow */}
                              <div className='absolute inset-0  border border-softWhite/[0.08]' />

                              {/* Top accent line */}
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                  duration: 1.2,
                                  delay: 0.3,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className='absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mainColor/40 to-transparent origin-center'
                              />

                              {/* Content wrapper */}
                              <div className='relative px-8 sm:px-12 py-10 sm:py-12'>
                                {/* Grid layout for items - CLEAN VERSION */}
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6'>
                                  {items.map(({ name }, itemIndex) => {
                                    const column = itemIndex % 2;
                                    const row = Math.floor(itemIndex / 2);

                                    return (
                                      <motion.div
                                        key={name}
                                        initial={{
                                          opacity: 0,
                                          x: column === 0 ? -50 : 50,
                                          y: 20,
                                        }}
                                        animate={{
                                          opacity: 1,
                                          x: 0,
                                          y: 0,
                                          transition: {
                                            duration: 0.8,
                                            delay:
                                              0.2 + row * 0.08 + column * 0.04,
                                            ease: [0.16, 1, 0.3, 1],
                                          },
                                        }}
                                        exit={{
                                          opacity: 0,
                                          x: column === 0 ? -30 : 30,
                                          y: 10,
                                          transition: {
                                            duration: 0.4,
                                            delay:
                                              (items.length - itemIndex) * 0.02,
                                            ease: [0.16, 1, 0.3, 1],
                                          },
                                        }}
                                        className='relative group/item'
                                      >
                                        {/* Simple, elegant layout */}
                                        <div className='relative flex items-start gap-4 py-3'>
                                          {/* Vertical accent bar - subtle and elegant */}
                                          <motion.div
                                            initial={{ scaleY: 0, opacity: 0 }}
                                            animate={{
                                              scaleY: 1,
                                              opacity: 1,
                                              transition: {
                                                delay:
                                                  0.25 +
                                                  row * 0.08 +
                                                  column * 0.04,
                                                duration: 0.6,
                                                ease: [0.16, 1, 0.3, 1],
                                              },
                                            }}
                                            className='w-[2px] h-full bg-gradient-to-b from-mainColor/40 via-mainColor/20 to-transparent flex-shrink-0 origin-top rounded-full'
                                          />

                                          {/* Item name - clean typography */}
                                          <div className='flex-1 pt-0.5'>
                                            <motion.span
                                              className='block text-softWhite/75 group-hover/item:text-softWhite/90 text-[0.95rem] sm:text-base md:text-[1.05rem] leading-relaxed font-light tracking-wide transition-colors duration-500'
                                              initial={{ opacity: 0.7 }}
                                              animate={{
                                                opacity: 1,
                                                transition: {
                                                  delay:
                                                    0.3 +
                                                    row * 0.08 +
                                                    column * 0.04,
                                                  duration: 0.6,
                                                },
                                              }}
                                            >
                                              {name}
                                            </motion.span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>

                                {/* Bottom decorative element */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                      delay:
                                        0.5 +
                                        Math.ceil(items.length / 2) * 0.08,
                                      duration: 0.8,
                                      ease: [0.16, 1, 0.3, 1],
                                    },
                                  }}
                                  exit={{
                                    opacity: 0,
                                    y: 10,
                                    transition: { duration: 0.3 },
                                  }}
                                  className='mt-10 pt-8 border-t border-softWhite/[0.06]'
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                      <motion.div className='w-1.5 h-1.5 rounded-full bg-mainColor animate-pulse' />
                                      <span className='text-[0.7rem] sm:text-xs text-softWhite/40 tracking-wider uppercase'>
                                        {items.length} Ürün Listelendi
                                      </span>
                                    </div>

                                    <motion.div
                                      initial={{ scaleX: 0 }}
                                      animate={{
                                        scaleX: 1,
                                        transition: {
                                          delay:
                                            0.6 +
                                            Math.ceil(items.length / 2) * 0.08,
                                          duration: 1,
                                          ease: [0.16, 1, 0.3, 1],
                                        },
                                      }}
                                      className='flex-1 ml-6 h-[1px] bg-gradient-to-r from-softWhite/10 via-mainColor/20 to-transparent origin-left'
                                    />
                                  </div>
                                </motion.div>
                              </div>

                              {/* Bottom glow effect */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: 1,
                                  transition: {
                                    delay: 0.4,
                                    duration: 1,
                                  },
                                }}
                                exit={{ opacity: 0 }}
                                className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-mainColor/[0.03] blur-3xl rounded-full pointer-events-none'
                              />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── FOOTER ───── */}
      <div className='flex'>
        <div className='hidden lg:block w-14' />
        <div className='flex-1 px-6 sm:px-10 lg:px-12 py-20'>
          <p className='text-[10px] sm:text-xs text-softWhite/25 tracking-[0.2em] uppercase text-right select-none italic'>
            * Menü içeriği duruma göre değişiklik gösterebilir.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Menu;
