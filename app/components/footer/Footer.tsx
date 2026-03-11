'use client';

import {
  FacebookIcon,
  InstagramIcon,
  Logo,
  WhatsappIcon,
} from '@/public/Icons';
import { useRouter } from 'next/navigation';
import { scrollTo } from '@/app/lib/scrollTo';
import Link from 'next/link';

const Footer = () => {
  const router = useRouter();

  return (
    <footer className='bg-secondaryColor pt-10 pb-10 px-4'>
      <div className='max-w-7xl mx-auto border-t border-[#2f3134] pt-8 pb-24 md:pb-10'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='flex flex-col items-center text-softWhite'>
            <Logo className='w-15 h-15 lg:w-17.5 lg:h-17.5' />
            <p className='text-sm font-bold mt-1'>Yeni Hisar Internatinoal</p>
            <p className='text-sm font-bold'>Night Club</p>
          </div>

          <div className='flex flex-wrap justify-center gap-6 text-subtleGray font-medium text-base'>
            <a
              href='#about'
              onClick={(e) => {
                e.preventDefault();
                scrollTo('about');
              }}
              className='hover:text-softWhite transition cursor-pointer'
            >
              Hakkımızda
            </a>
            <button
              onClick={() => router.push('/privacy')}
              className='hover:text-softWhite transition cursor-pointer bg-transparent border-0 p-0 font-medium text-base text-subtleGray'
            >
              Gizlilik Politikası
            </button>
            <button
              onClick={() => router.push('/kvkk')}
              className='hover:text-softWhite transition cursor-pointer bg-transparent border-0 p-0 font-medium text-base text-subtleGray'
            >
              K.V.K.K
            </button>
          </div>

          <div className='flex items-center gap-4'>
            <Link
              href='https://www.instagram.com/hisarnight/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
            >
              <InstagramIcon />
            </Link>
            <Link
              href='https://www.facebook.com/p/Yenihisar-Gazinosu-100068385632516/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Facebook'
            >
              <FacebookIcon />
            </Link>
            <Link
              href='https://wa.me/905369703132'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='WhatsApp'
            >
              <WhatsappIcon />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
