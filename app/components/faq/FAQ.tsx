'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { faq } from './Collection';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className='relative bg-secondaryColor text-softWhite px-5 pt-20 sm:px-8 md:px-16'>
      <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10'>
        Sıkça Sorulan Sorular
      </h2>

      <div className='max-w-5xl mx-auto space-y-4'>
        {faq.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <AccordionItem
              key={index}
              isActive={isActive}
              onToggle={() => toggleAccordion(index)}
              item={item}
            />
          );
        })}
      </div>
    </section>
  );
}

function AccordionItem({
  isActive,
  onToggle,
  item,
}: {
  isActive: boolean;
  onToggle: () => void;
  item: { question: string; describe: string; lists?: string[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  return (
    <div className='bg-tertiaryColor border border-[#2a2a2a] rounded-xl overflow-hidden transition-all'>
      <button
        onClick={() => {
          onToggle();
          if (ref.current) {
            setHeight(ref.current.scrollHeight);
          }
        }}
        className='w-full flex justify-between items-center px-6 py-5 text-left text-sm  md:text-lg font-bold'
      >
        <span>{item.question}</span>
        <motion.span
          animate={{ rotate: isActive ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className='text-softWhite text-2xl'
        >
          +
        </motion.span>
      </button>

      <motion.div
        animate={{ height: isActive ? height : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className='overflow-hidden px-6'
      >
        <div ref={ref} className='pb-5 text-[#c0c0c0] text-[15px] sm:text-base'>
          <p className='mb-3'>{item.describe}</p>
          {item.lists && (
            <ul className='pl-6 list-disc marker:text-[#c0c0c0] space-y-2'>
              {item.lists.map((listItem, i) => (
                <li key={i}>{listItem}</li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
