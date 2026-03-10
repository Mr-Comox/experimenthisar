'use client';

import { motion } from 'framer-motion';

type Props = {
  text: string;
};

export default function AnimatedText({ text }: Props) {
  return (
    <div className='relative inline-block'>
      <motion.h2
        initial='hidden'
        whileInView='visible'
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.035,
            },
          },
        }}
        viewport={{ once: true, amount: 0.5 }}
        className='text-4xl lg:text-5xl font-(family-name:--font-graphik) font-bold text-softWhite leading-tight mb-6'
      >
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h2>
    </div>
  );
}
