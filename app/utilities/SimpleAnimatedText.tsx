'use client';

import { motion } from 'framer-motion';

const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      staggerChildren: 0.03,
    },
  },
};

const letter = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

type Props = {
  text: string;
  className?: string;
};

export default function SimpleAnimatedText({ text, className = '' }: Props) {
  return (
    <motion.h2
      variants={sentence}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true }}
      className={`tracking-wide select-none ${className}`}
    >
      {text.split('').map((char, index) => (
        <motion.span key={`${char}-${index}`} variants={letter}>
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
}
