import { Suspense } from 'react';
import ThankYouPage from './ThankYou';

const page = () => {
  return (
    <Suspense fallback={null}>
      <ThankYouPage />
    </Suspense>
  );
};

export default page;
