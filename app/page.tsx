'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Home from './components/home/Home';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const verified = localStorage.getItem('ageVerified') === 'true';

    if (!verified) {
      // localStorage was cleared — kill cookie so proxy
      // catches them on next protected route visit
      document.cookie = 'ageVerified=; path=/; max-age=0; SameSite=Lax';
      // Redirect them to gate
      router.replace('/age-gate?redirect=/');
      return;
    }

    // Keep cookie in sync with localStorage
    document.cookie =
      'ageVerified=true; path=/; max-age=31536000; SameSite=Lax';
  }, [router]);

  return <Home />;
}
