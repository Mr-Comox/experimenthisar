'use client';

import React, { useState } from 'react';
import Logo from '@/public/Icons/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { scroller } from 'react-scroll';
import { CloseIcon, HamburgerIcon } from '@/public/Icons';

const navItems = [
  { id: 'about', label: 'Hakkımızda' },
  { id: 'offer', label: 'Hizmetler' },
  { id: 'menu', label: 'Menü' },
  { id: 'activities', label: 'Etkİnlİkler' },
  { id: 'gallery', label: 'Galerİ' },
  { id: 'testimonials', label: 'Yorumlar' },
  { id: 'location', label: 'Konum' },
  { id: 'reservation', label: 'Rezervasyon' },
];

const smoothScroll = (e: React.MouseEvent, target: string, offset = 0) => {
  e.preventDefault();
  scroller.scrollTo(target, { smooth: true, offset, duration: 800 });
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [bgStep, setBgStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setBgStep(0);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 700);
  };

  return (
    <>
      <nav className='flex w-full absolute top-5 px-6 py-5 z-30 items-center justify-between h-20'>
        <div className='flex items-center h-full'>
          <Logo className='w-[60px] h-[60px] lg:w-[80px] lg:h-[80px]' />
        </div>

        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => setBgStep(1), 0);
            setTimeout(() => setBgStep(2), 600);
          }}
          className='flex flex-col justify-center items-center  space-y-1 h-10 w-10 bg-softWhite hover:bg-subtleGray rounded-full'
          aria-label='Menüyü Aç'
        >
          <HamburgerIcon />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className='fixed inset-0 z-40 flex flex-col'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!closing && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: bgStep >= 1 ? '0%' : '100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='absolute inset-0 bg-secondaryColor z-10'
              />
            )}

            <motion.div
              initial={{ x: closing ? '0%' : '100%' }}
              animate={{ x: closing ? '100%' : bgStep >= 2 ? '0%' : '100%' }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
                delay: closing ? 0 : 0.35,
              }}
              className='absolute inset-0 bg-tertiaryColor z-20'
            />

            {!closing && (
              <motion.button
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: bgStep === 2 ? 1 : 0 }}
                transition={{ delay: 1.2 }}
                className='self-end  flex justify-center items-center mx-6 mt-10 text-secondaryColor text-xl font-bold h-10 w-10 rounded-full bg-softWhite hover:bg-subtleGray z-50 transition-all'
              >
                <CloseIcon />
              </motion.button>
            )}

            {!closing && (
              <motion.div
                className='absolute inset-0 flex items-center justify-center flex-col space-y-6 z-30'
                initial={{ opacity: 0 }}
                animate={{ opacity: bgStep === 2 ? 1 : 0 }}
                transition={{ delay: 1.2 }}
              >
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      smoothScroll(e, item.id, 0);
                      handleClose();
                    }}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: 1.4 + index * 0.2,
                      duration: 0.35,
                    }}
                    className='relative group text-softWhite text-2xl uppercase font-semibold transition-all duration-300'
                  >
                    {item.label}
                    <span className='absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-softWhite transition-transform duration-300 ease-out group-hover:scale-x-100'></span>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
