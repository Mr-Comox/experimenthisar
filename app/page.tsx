'use client';

import { useState, useEffect, startTransition } from 'react';
import AgeGate from '@/app/components/agegate/AgeGate';
import Home from './components/home/Home';

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
    // Remove the layout.tsx script lock before revealing the site
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
