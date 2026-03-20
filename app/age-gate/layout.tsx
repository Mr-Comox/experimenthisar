import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // ← kills iOS zoom on input focus
  viewportFit: 'cover',
};

export default function AgeGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
