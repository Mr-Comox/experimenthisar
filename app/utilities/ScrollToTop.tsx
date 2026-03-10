'use client';

import { useEffect } from 'react';

// Drop this component at the top of any page that needs to start from top.
// ScrollSmoother doesn't exist on /kvkk and /privacy so plain window works.
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return null;
}
