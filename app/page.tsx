'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Home from './components/home/Home';

export default function Page() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem('ageVerified') === 'true';

    if (!isVerified) {
      // Kill stale cookie and send to gate
      document.cookie = 'ageVerified=; path=/; max-age=0; SameSite=Lax';
      router.replace('/age-gate?redirect=/');
      return;
    }

    // Keep cookie in sync
    document.cookie =
      'ageVerified=true; path=/; max-age=31536000; SameSite=Lax';
    startTransition(() => setVerified(true));
  }, [router]);

  // Black screen while checking — same color as your bg
  // so there's zero flash of any content
  if (!verified) return <div className='fixed inset-0 bg-secondaryColor' />;

  return <Home />;
}
