'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgeGate from '@/app/components/agegate/AgeGate';
import Home from './components/home/Home';
import { getSmoother } from '@/app/lib/smoother';

type State = 'loading' | 'gate' | 'verified';

export default function Page() {
  const [state, setState] = useState<State>('loading');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const check = () => {
      const alreadyVerified = localStorage.getItem('ageVerified') === 'true';

      if (alreadyVerified) {
        document.cookie =
          'ageVerified=true; path=/; max-age=31536000; SameSite=Lax';
      }
      startTransition(() => {
        setState(alreadyVerified ? 'verified' : 'gate');
      });
    };

    check();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleAccessGranted = () => {
    window.scrollTo(0, 0);
    const lenis = getSmoother();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    document.documentElement.style.overflow = '';
    window.dispatchEvent(new CustomEvent('age-gate-cleared'));

    // If user was trying to access a protected page, send them there
    const redirect = searchParams.get('redirect');
    if (redirect) {
      router.push(redirect);
      return;
    }

    setState('verified');
  };

  if (state === 'loading')
    return <div className='fixed inset-0 bg-secondaryColor' />;
  if (state === 'verified') return <Home />;

  return (
    <AgeGate onAccessGranted={handleAccessGranted}>
      <Home />
    </AgeGate>
  );
}
