'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LeftLeafletIcon,
  RightLeafletIcon,
  CocktailIcon,
  VipIcon,
  DiscoBallIcon,
  ActivitiesIcon,
} from '@/public/Icons';
import AnimatedText from '@/app/utilities/AnimatedText';

const services = [
  {
    id: 1,
    Icon: CocktailIcon,
    title: 'Lounge Bar',
    tag: 'İçki & Servis',
    description:
      'Zamana yayılan sohbetler, imza kokteyller ve rafine bir atmosfer. Her bardak, bir anın başlangıcı.',
  },
  {
    id: 2,
    Icon: VipIcon,
    title: 'VIP Loca',
    tag: 'VIP & Rezervasyon',
    description:
      'Size ait bir alan. Sessiz lüks, maksimum konfor ve kişiye özel hizmet anlayışı.',
  },
  {
    id: 3,
    Icon: DiscoBallIcon,
    title: 'Dans Alanı',
    tag: 'Sahne ',
    description:
      'Gece ilerledikçe yükselen tempo ve özgür hareket. Işıklar söndüğünde, müzik konuşur.',
  },
  {
    id: 4,
    Icon: ActivitiesIcon,
    title: 'Özel Etkinlikler',
    tag: 'Organizasyon',
    description:
      'Kutlamalar, davetler ve unutulmaz geceler için kürasyon. Her özel an, titizlikle planlanır.',
  },
];

type Props = { id: string };

const Offer = ({ id }: Props) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(
    new Array(services.length).fill(false),
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
            observer.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const setRef = (index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  };
  return (
    <section id={id} className='relative bg-secondaryColor overflow-hidden'>
      {/* ───── HERO ───── */}
      <div className='relative flex'>
        {/* vertical label */}
        <div className='hidden lg:flex w-14 pt-24 justify-center'>
          <span
            className='text-softWhite/20 text-[9px] tracking-[0.35em] uppercase select-none'
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Hizmetler
          </span>
        </div>

        <div className='relative flex-1 px-6 sm:px-10 lg:px-12 pt-24 pb-16 flex flex-col gap-8 overflow-hidden'>
          {/* ghost word */}
          <span className='whitespace-nowrap absolute top-10 -right-32 text-softWhite/[0.02] font-serif text-[12rem] leading-none select-none pointer-events-none'>
            Yeni Hisar
          </span>

          <header className='flex items-center gap-3 relative z-10'>
            <LeftLeafletIcon widthSize='9' heightSize='18' />
            <span className='text-mainColor uppercase tracking-[0.35em] text-[0.65rem]'>
              Deneyim
            </span>
            <RightLeafletIcon widthSize='9' heightSize='18' />
          </header>

          <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 relative z-10'>
            <h2 className='text-softWhite font-serif text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] lg:text-[4.5rem] xl:text-[5.2rem] leading-[1.05] max-w-4xl'>
              <AnimatedText text='Hizmetlerimiz' />
            </h2>
          </div>
        </div>
      </div>

      {/* ───── COLUMN HEADERS ───── */}
      <div className='flex'>
        <div className='hidden lg:block w-14' />
        <div className='flex-1 px-6 sm:px-10 lg:px-12'>
          <div className='grid grid-cols-[40px_1fr] sm:grid-cols-[56px_1fr_auto] py-3 gap-x-8'>
            <span className='text-softWhite/20 text-[0.6rem] tracking-[0.25em] uppercase'></span>
            <span className='text-softWhite/20 text-[0.6rem] tracking-[0.25em] uppercase'>
              Hizmet
            </span>
            <span className='hidden sm:block text-softWhite/20 text-[0.6rem] tracking-[0.25em] uppercase pr-2'>
              Kategori
            </span>
          </div>
        </div>
      </div>

      <div className='w-full h-px bg-softWhite/10' />

      {/* ───── LIST ───── */}
      <div className='flex flex-col group/list'>
        {services.map(({ id, Icon, title, tag, description }, index) => (
          <motion.div
            key={id}
            ref={setRef(index)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            className='group opacity-80 hover:opacity-100 transition-opacity'
          >
            <div className='flex'>
              <div className='hidden lg:block w-14' />

              <div className='flex-1 px-6 sm:px-10 lg:px-12'>
                <div
                  className='
                  relative grid grid-cols-[40px_1fr]
                  sm:grid-cols-[56px_1fr_auto]
                  gap-x-8 py-10
                  transition-all duration-300
                  hover:bg-softWhite/[0.025]
                  hover:scale-[1.01]
                '
                >
                  {/* left bar */}
                  <span className='absolute left-0 top-0 bottom-0 w-[2px] bg-mainColor scale-y-0 hover:scale-y-100 transition-transform origin-top' />

                  {/* index */}
                  <span className='text-softWhite/20 font-mono text-sm tracking-widest select-none ml-4'>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* content */}
                  <div className='flex flex-col gap-3'>
                    <div className='flex items-center gap-4'>
                      <div className='relative flex-shrink-0 before:absolute before:inset-[-8px] before:rounded-full before:bg-mainColor/5 before:scale-0 hover:before:scale-100 before:transition-transform'>
                        <Icon animate={visible[index]} />
                      </div>
                      <h3 className='text-softWhite/85 hover:text-softWhite font-serif text-xl md:text-2xl leading-tight tracking-tight transition-colors'>
                        {title}
                      </h3>
                    </div>

                    <p className='max-w-[520px] text-softWhite/45 hover:text-softWhite/60 text-sm md:text-base leading-relaxed transition-colors'>
                      {description}
                    </p>

                    <span className='sm:hidden text-mainColor/50 text-[0.6rem] tracking-[0.25em] uppercase'>
                      {tag}
                    </span>
                  </div>

                  <div className='hidden sm:flex pt-1 pr-2'>
                    <span className='text-softWhite/25 hover:text-mainColor/60 text-[0.65rem] tracking-[0.2em] uppercase transition-colors whitespace-nowrap'>
                      {tag}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='w-full h-px bg-softWhite/[0.06]' />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Offer;
