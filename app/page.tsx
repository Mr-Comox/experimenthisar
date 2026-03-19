'use client';

import { useState, useEffect, startTransition } from 'react';
import AgeGate from '@/app/components/agegate/AgeGate';
import Home from './components/home/Home';
import { getSmoother } from '@/app/lib/smoother';

type State = 'loading' | 'gate' | 'verified';

export default function Page() {
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    const alreadyVerified = localStorage.getItem('ageVerified') === 'true';
    startTransition(() => {
      setState(alreadyVerified ? 'verified' : 'gate');
    });
  }, []);

  const handleAccessGranted = () => {
    // Reset both native scroll and Lenis before revealing site
    window.scrollTo(0, 0);
    const lenis = getSmoother();
    if (lenis) lenis.scrollTo(0, { immediate: true });

    document.documentElement.style.overflow = '';
    window.dispatchEvent(new CustomEvent('age-gate-cleared'));
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
