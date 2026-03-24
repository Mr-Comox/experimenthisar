export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ThankYouPage from './ThankYou';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ThankYouPage />
    </Suspense>
  );
}
