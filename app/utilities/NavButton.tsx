'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   NAV BUTTON — shared carousel navigation utility
   • dir        : 'left' | 'right'
   • onClick    : () => void
   • disabled?  : boolean          (default false)
   • size?      : number           (default 48)
   • iconSize?  : number           (default 15)
───────────────────────────────────────────────────────────────── */

interface NavButtonProps {
  dir: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
  size?: number;
  iconSize?: number;
}

const NavButton = ({
  dir,
  onClick,
  disabled = false,
  size = 48,
  iconSize = 15,
}: NavButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      aria-label={dir === 'left' ? 'Önceki' : 'Sonraki'}
      whileTap={disabled ? {} : { scale: 0.86 }}
      transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }} // back.out feel
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color: disabled ? 'rgba(251,251,251,0.18)' : 'rgba(251,251,251,0.72)',
        cursor: disabled ? 'default' : 'pointer',
        border: '1px solid rgba(251,251,251,0.18)',
        flexShrink: 0,
        transition: 'color 0.2s ease',
      }}
    >
      {dir === 'left' ? (
        <svg width={iconSize} height={iconSize} viewBox='0 0 16 16' fill='none'>
          <path
            d='M10 12L6 8L10 4'
            stroke='currentColor'
            strokeWidth='1.6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox='0 0 16 16' fill='none'>
          <path
            d='M6 4L10 8L6 12'
            stroke='currentColor'
            strokeWidth='1.6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )}
    </motion.button>
  );
};

export default NavButton;
