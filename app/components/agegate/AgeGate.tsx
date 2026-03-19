'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/public/Icons';

type Props = {
  onAccessGranted: () => void;
  children?: React.ReactNode;
};

type FieldErrors = {
  day: boolean;
  month: boolean;
  year: boolean;
};

const AgeGate = ({ onAccessGranted, children }: Props) => {
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    day: false,
    month: false,
    year: false,
  });

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', preventTouch);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => dayRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const isDayValid = (val: string) => {
    if (!val) return true; // empty is not invalid yet
    const dd = parseInt(val, 10);
    return dd >= 1 && dd <= 31;
  };

  const isMonthValid = (val: string) => {
    if (!val) return true;
    const mm = parseInt(val, 10);
    return mm >= 1 && mm <= 12;
  };

  const isYearValid = (val: string) => {
    if (!val || val.length < 4) return true;
    const yyyy = parseInt(val, 10);
    const currentYear = new Date().getFullYear();
    return yyyy >= 1900 && yyyy <= currentYear;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanedValue = value.replace(/\D/g, '');

    setError('');

    if (name === 'day') {
      if (cleanedValue.length > 2) cleanedValue = cleanedValue.slice(0, 2);
      setBirthDate((prev) => ({ ...prev, day: cleanedValue }));

      const valid = isDayValid(cleanedValue);
      setFieldErrors((prev) => ({
        ...prev,
        day: !valid && cleanedValue.length === 2,
      }));

      if (!valid && cleanedValue.length === 2) {
        // Invalid — stay in this field, show error
        setError('Geçersiz tarih girdiniz!');
        return;
      }
      // Valid and complete — advance
      if (cleanedValue.length === 2) monthRef.current?.focus();
    } else if (name === 'month') {
      if (cleanedValue.length > 2) cleanedValue = cleanedValue.slice(0, 2);
      setBirthDate((prev) => ({ ...prev, month: cleanedValue }));

      const valid = isMonthValid(cleanedValue);
      setFieldErrors((prev) => ({
        ...prev,
        month: !valid && cleanedValue.length === 2,
      }));

      if (!valid && cleanedValue.length === 2) {
        setError('Geçersiz tarih girdiniz!');
        return;
      }
      if (cleanedValue.length === 2) yearRef.current?.focus();
    } else if (name === 'year') {
      cleanedValue = cleanedValue.slice(0, 4);
      setBirthDate((prev) => ({ ...prev, year: cleanedValue }));

      if (cleanedValue.length === 4) {
        const valid = isYearValid(cleanedValue);
        setFieldErrors((prev) => ({ ...prev, year: !valid }));
        if (!valid) setError('Geçersiz tarih girdiniz!');
      } else {
        setFieldErrors((prev) => ({ ...prev, year: false }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) return;

    let invalid = false;

    if (name === 'day') invalid = !isDayValid(value);
    else if (name === 'month') invalid = !isMonthValid(value);
    else if (name === 'year') invalid = !isYearValid(value);

    setFieldErrors((prev) => ({ ...prev, [name]: invalid }));
    if (invalid) setError('Geçersiz tarih girdiniz!');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { name } = e.currentTarget;

    if (e.key === 'Enter' && isValidDate()) {
      handleEnter();
      return;
    }

    if (e.key === 'Backspace') {
      if (name === 'month' && birthDate.month === '') {
        e.preventDefault();
        dayRef.current?.focus();
      }
      if (name === 'year' && birthDate.year === '') {
        e.preventDefault();
        monthRef.current?.focus();
      }
    }
  };

  const isValidDate = () => {
    const { day, month, year } = birthDate;
    if (!day || !month || !year) return false;
    const dd = parseInt(day, 10);
    const mm = parseInt(month, 10);
    const yyyy = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    return (
      dd >= 1 &&
      dd <= 31 &&
      mm >= 1 &&
      mm <= 12 &&
      year.length === 4 &&
      yyyy >= 1900 &&
      yyyy <= currentYear &&
      !fieldErrors.day &&
      !fieldErrors.month &&
      !fieldErrors.year
    );
  };

  const handleEnter = () => {
    if (!isValidDate() || loading) return;

    const { day, month, year } = birthDate;
    const birth = new Date(
      `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    );
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const d = today.getDate() - birth.getDate();
    const is18 = age > 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));

    if (!is18) {
      setError('Bu siteye giriş için 18 yaşında olmanız gerekmektedir.');
      setFieldErrors({ day: true, month: true, year: true });
      dayRef.current?.blur();
      monthRef.current?.blur();
      yearRef.current?.blur();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('ageVerified', 'true');
      setExiting(true);
      setTimeout(() => onAccessGranted(), 700);
    }, 600);
  };

  const inputClass = (field: keyof FieldErrors) =>
    [
      'text-center py-2 rounded-md bg-tertiaryColor border',
      'placeholder-subtleGray focus:outline-none focus:ring-2',
      'transition-colors duration-200',
      fieldErrors[field]
        ? 'border-red-500/70 focus:ring-red-500/30'
        : 'border-softGray/20 focus:ring-softGray/40',
    ].join(' ');

  return (
    <>
      <div aria-hidden style={{ pointerEvents: 'none' }}>
        {children}
      </div>

      <AnimatePresence>
        {!exiting && (
          <motion.div
            key='age-gate'
            className='fixed inset-0 z-[9999] bg-secondaryColor text-softWhite
                       flex flex-col items-center justify-center px-6'
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo + name */}
            <div className='flex flex-col justify-center items-center gap-0 mb-5'>
              <Logo className='w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] mb-6' />
              <p className='text-2xl -mt-7'>Yeni Hisar International</p>
              <p className='text-2xl'>Night Club</p>
            </div>

            {/* Form */}
            <div className='text-center max-w-lg w-full'>
              <h1 className='text-2xl sm:text-4xl font-bold mb-4 leading-tight'>
                Lütfen doğum tarihinizi girin
              </h1>
              <p className='text-xs px-5 lg:px-20 text-subtleGray mb-16'>
                Bu siteye girerek Kullanım Koşullarımızı ve Gizlilik
                Politikamızı kabul etmiş olursunuz.
              </p>

              {/* Inputs */}
              <motion.div
                className='flex justify-center gap-4 mb-3'
                animate={error ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <input
                  ref={dayRef}
                  type='text'
                  name='day'
                  inputMode='numeric'
                  maxLength={2}
                  placeholder='GG'
                  value={birthDate.day}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className={`w-16 sm:w-20 ${inputClass('day')}`}
                />
                <input
                  ref={monthRef}
                  type='text'
                  name='month'
                  inputMode='numeric'
                  maxLength={2}
                  placeholder='AA'
                  value={birthDate.month}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className={`w-16 sm:w-20 ${inputClass('month')}`}
                />
                <input
                  ref={yearRef}
                  type='text'
                  name='year'
                  inputMode='numeric'
                  maxLength={4}
                  placeholder='YYYY'
                  value={birthDate.year}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className={`w-24 sm:w-28 ${inputClass('year')}`}
                />
              </motion.div>

              {/* Error message */}
              <AnimatePresence mode='wait'>
                {error && (
                  <motion.p
                    key='error'
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className='text-red-400 text-xs tracking-wide mb-4'
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={handleEnter}
                disabled={!isValidDate() || loading}
                className={`w-full py-2 rounded-md text-base font-bold transition-all duration-300
                           flex justify-center items-center gap-2 ${
                             !isValidDate() || loading
                               ? 'bg-softWhite/30 text-subtleGray cursor-not-allowed'
                               : 'bg-softWhite text-secondaryColor hover:bg-softGray'
                           }`}
              >
                {loading ? (
                  <div
                    role='status'
                    className='flex items-center justify-center'
                  >
                    <svg
                      aria-hidden='true'
                      className='w-6 h-6 animate-spin'
                      viewBox='0 0 100 101'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                        fill='#fff'
                      />
                      <path
                        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                        fill='#fff'
                      />
                    </svg>
                  </div>
                ) : (
                  'Giriş'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgeGate;
