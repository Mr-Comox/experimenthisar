'use client';

import { useState } from 'react';
import { Logo } from '@/public/Icons';

type Props = {
  onAccessGranted: () => void;
};

const AgeGate = ({ onAccessGranted }: Props) => {
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [loading, setLoading] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanedValue = value.replace(/\D/g, '');

    if (name === 'day') {
      if (cleanedValue.length > 2) cleanedValue = cleanedValue.slice(0, 2);
      const day = parseInt(cleanedValue, 10);
      if (cleanedValue && (day < 1 || day > 31)) cleanedValue = '';
      setBirthDate({ ...birthDate, day: cleanedValue });
    } else if (name === 'month') {
      if (cleanedValue.length > 2) cleanedValue = cleanedValue.slice(0, 2);
      const month = parseInt(cleanedValue, 10);
      if (cleanedValue && (month < 1 || month > 12)) cleanedValue = '';
      setBirthDate({ ...birthDate, month: cleanedValue });
    } else if (name === 'year') {
      cleanedValue = cleanedValue.slice(0, 4);
      if (cleanedValue.length === 4) {
        const year = parseInt(cleanedValue, 10);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) cleanedValue = '';
      }
      setBirthDate({ ...birthDate, year: cleanedValue });
    }
  };

  const isValidDate = () => {
    const { day, month, year } = birthDate;
    if (!day || !month || !year) return false;

    const dd = parseInt(day, 10);
    const mm = parseInt(month, 10);
    const yyyy = parseInt(year, 10);

    const isValidDay = dd >= 1 && dd <= 31;
    const isValidMonth = mm >= 1 && mm <= 12;
    const isValidYear =
      year.length === 4 && yyyy >= 1900 && yyyy <= new Date().getFullYear();

    return isValidDay && isValidMonth && isValidYear;
  };

  const handleEnter = () => {
    const { day, month, year } = birthDate;
    const birth = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const d = today.getDate() - birth.getDate();

    const is18 = age > 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));

    if (!is18) {
      window.location.href = 'https://www.google.com';
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('ageVerified', 'true');
      onAccessGranted();
    }, 1000);
  };

  return (
    <div className='fixed inset-0 z-50 bg-secondaryColor text-softWhite flex flex-col items-center justify-center px-6'>
      <div className='flex flex-col justify-center items-center gap-0 mb-5'>
        <Logo className='w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] mb-6' />
        <p className='text-2xl -mt-7'>Yeni Hisar International</p>
        <p className='text-2xl'>Night club</p>
      </div>

      <div className='text-center max-w-lg w-full'>
        <h1 className='text-2xl sm:text-4xl font-bold mb-4 leading-tight'>
          Lütfen doğum tarihinizi girin
        </h1>
        <p className='text-xs px-5 lg:px-20 text-subtleGray mb-16'>
          Bu siteye girerek Kullanım Koşullarımızı ve Gizlilik Politikamızı
          kabul etmiş olursunuz.
        </p>

        <div className='flex justify-center gap-4 mb-6'>
          <input
            type='text'
            name='day'
            maxLength={2}
            placeholder='GG'
            value={birthDate.day}
            onChange={handleInput}
            className='w-16 sm:w-20 text-center py-2 rounded-md bg-tertiaryColor border border-softGray/20 placeholder-subtleGray focus:outline-none focus:ring-2 focus:ring-softGray/40'
          />
          <input
            type='text'
            name='month'
            maxLength={2}
            placeholder='AA'
            value={birthDate.month}
            onChange={handleInput}
            className='w-16 sm:w-20 text-center py-2 rounded-md bg-tertiaryColor border border-softGray/20 placeholder-subtleGray focus:outline-none focus:ring-2 focus:ring-softGray/40'
          />
          <input
            type='text'
            name='year'
            maxLength={4}
            placeholder='YYYY'
            value={birthDate.year}
            onChange={handleInput}
            className='w-24 sm:w-28 text-center py-2 rounded-md bg-tertiaryColor border border-softGray/20 placeholder-subtleGray focus:outline-none focus:ring-2 focus:ring-softGray/40'
          />
        </div>

        <button
          onClick={handleEnter}
          disabled={!isValidDate() || loading}
          className={`w-full py-2 rounded-md text-base font-bold transition-all duration-300 flex justify-center items-center gap-2 ${
            !isValidDate() || loading
              ? 'bg-softWhite/30 text-subtleGray cursor-not-allowed'
              : 'bg-softWhite text-secondaryColor hover:bg-softGray'
          }`}
        >
          {loading ? (
            <div role='status' className='flex items-center justify-center'>
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
    </div>
  );
};

export default AgeGate;
