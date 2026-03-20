'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/public/Icons';

type FieldState = { day: boolean; month: boolean; year: boolean };

export default function AgeGatePage() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<FieldState>({
    day: false,
    month: false,
    year: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldState>({
    day: false,
    month: false,
    year: false,
  });

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // iOS Safari bfcache fix — when user navigates back/forward
    // Safari restores a visual snapshot of previous page
    // Force reload if page is restored from cache
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);
  // Check localStorage — if already verified redirect immediately
  useEffect(() => {
    const verified = localStorage.getItem('ageVerified') === 'true';
    if (verified) {
      document.cookie =
        'ageVerified=true; path=/; max-age=31536000; SameSite=Lax';
      const dest = searchParams.get('redirect') ?? '/';
      window.location.href = dest;
      return;
    }

    // Clear any stale cookie
    document.cookie = 'ageVerified=; path=/; max-age=0; SameSite=Lax';
    startTransition(() => setReady(true));
  }, [searchParams]);

  // Visual Viewport API — pins overlay when iOS keyboard opens
  // Nothing is behind this page so this is purely for keeping
  // the form centered correctly when keyboard appears
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const el = overlayRef.current;
      if (!el) return;
      el.style.top = `${vv.offsetTop}px`;
      el.style.left = `${vv.offsetLeft}px`;
      el.style.width = `${vv.width}px`;
      el.style.height = `${vv.height}px`;
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Focus day input once gate is ready
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => dayRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [ready]);

  const isDayValid = (v: string) =>
    !v || (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 31);
  const isMonthValid = (v: string) =>
    !v || (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 12);
  const isYearValid = (v: string) => {
    if (!v || v.length < 4) return true;
    const y = parseInt(v, 10);
    return y >= 1900 && y <= new Date().getFullYear();
  };

  const clearInputs = () => {
    dayRef.current?.blur();
    monthRef.current?.blur();
    yearRef.current?.blur();
    setBirthDate({ day: '', month: '', year: '' });
    setTouched({ day: false, month: false, year: false });
    setFieldErrors({ day: false, month: false, year: false });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let v = value.replace(/\D/g, '');
    setError('');

    if (name === 'day') {
      if (v.length > 2) v = v.slice(0, 2);
      setBirthDate((p) => ({ ...p, day: v }));
      if (v.length === 2) {
        const valid = isDayValid(v);
        setTouched((p) => ({ ...p, day: true }));
        setFieldErrors((p) => ({ ...p, day: !valid }));
        if (!valid) {
          setError('Geçersiz tarih girdiniz!');
          return;
        }
        monthRef.current?.focus();
      }
    } else if (name === 'month') {
      if (v.length > 2) v = v.slice(0, 2);
      setBirthDate((p) => ({ ...p, month: v }));
      if (v.length === 2) {
        const valid = isMonthValid(v);
        setTouched((p) => ({ ...p, month: true }));
        setFieldErrors((p) => ({ ...p, month: !valid }));
        if (!valid) {
          setError('Geçersiz tarih girdiniz!');
          return;
        }
        yearRef.current?.focus();
      }
    } else if (name === 'year') {
      v = v.slice(0, 4);
      setBirthDate((p) => ({ ...p, year: v }));
      if (v.length === 4) {
        const valid = isYearValid(v);
        setTouched((p) => ({ ...p, year: true }));
        setFieldErrors((p) => ({ ...p, year: !valid }));
        if (!valid) setError('Geçersiz tarih girdiniz!');
      } else {
        setFieldErrors((p) => ({ ...p, year: false }));
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
    setTouched((p) => ({ ...p, [name]: true }));
    setFieldErrors((p) => ({ ...p, [name]: invalid }));
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
    const currentYear = new Date().getFullYear();
    return (
      parseInt(day, 10) >= 1 &&
      parseInt(day, 10) <= 31 &&
      parseInt(month, 10) >= 1 &&
      parseInt(month, 10) <= 12 &&
      year.length === 4 &&
      parseInt(year, 10) >= 1900 &&
      parseInt(year, 10) <= currentYear &&
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
      setTouched({ day: true, month: true, year: true });
      setFieldErrors({ day: true, month: true, year: true });
      clearInputs();
      return;
    }

    setLoading(true);
    clearInputs();

    setTimeout(() => {
      localStorage.setItem('ageVerified', 'true');
      document.cookie =
        'ageVerified=true; path=/; max-age=31536000; SameSite=Lax';
      setExiting(true);
      const dest = searchParams.get('redirect') ?? '/';
      // Full page navigation — forces server to re-check cookie
      setTimeout(() => {
        window.location.href = dest;
      }, 700);
    }, 600);
  };

  const inputClass = (field: keyof FieldState) =>
    [
      'text-center py-2 rounded-md bg-tertiaryColor border',
      'placeholder-subtleGray focus:outline-none focus:ring-2',
      'transition-colors duration-200',
      touched[field] && fieldErrors[field]
        ? 'border-red-500/70 focus:ring-red-500/30'
        : 'border-softGray/20 focus:ring-softGray/40',
    ].join(' ');

  // Show solid background while localStorage check runs
  if (!ready) return <div className='fixed inset-0 bg-secondaryColor' />;

  return (
    <>
      {/* Silent video preload — zero size, completely invisible */}
      <video
        src='/yenihisar.mp4'
        preload='auto'
        muted
        playsInline
        aria-hidden
        style={{
          position: 'fixed',
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <AnimatePresence>
        {!exiting && (
          <motion.div
            ref={overlayRef}
            key='age-gate'
            className='fixed z-[9999] bg-secondaryColor text-softWhite
                       flex flex-col items-center justify-center px-6'
            style={{ top: 0, left: 0, width: '100%', height: '100%' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className='flex flex-col justify-center items-center gap-0 mb-5'>
              <Logo className='w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] mb-6' />
              <p className='text-2xl -mt-7'>Yeni Hisar International</p>
              <p className='text-2xl'>Night Club</p>
            </div>

            <div className='text-center max-w-lg w-full'>
              <h1 className='text-2xl sm:text-4xl font-bold mb-4 leading-tight'>
                Lütfen doğum tarihinizi girin
              </h1>
              <p className='text-xs px-5 lg:px-20 text-subtleGray mb-16'>
                Bu siteye girerek Kullanım Koşullarımızı ve Gizlilik
                Politikamızı kabul etmiş olursunuz.
              </p>

              <motion.div
                className='flex justify-center gap-4 mb-5'
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
                  style={{ fontSize: '16px' }}
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
                  style={{ fontSize: '16px' }}
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
                  style={{ fontSize: '16px' }}
                  className={`w-24 sm:w-28 ${inputClass('year')}`}
                />
              </motion.div>

              <AnimatePresence mode='wait'>
                {error && (
                  <motion.p
                    key='error'
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className='text-red-400 text-xs tracking-wide mb-3'
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={handleEnter}
                disabled={!isValidDate() || loading}
                className={`mt-2 w-full py-2 rounded-md text-base font-bold transition-all duration-300
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
}
