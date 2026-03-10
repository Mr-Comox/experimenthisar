import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';
import Script from 'next/script';

const graphik = localFont({
  src: [
    {
      path: '../public/fonts/Graphik-Regular-Web.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Graphik-Medium-Web.woff2',
      weight: '500',
      style: 'medium',
    },
    {
      path: '../public/fonts/Graphik-Semibold-Web.woff2',
      weight: '600',
      style: 'semibold',
    },
    {
      path: '../public/fonts/Graphik-Bold-Web.woff2',
      weight: '700',
      style: 'bold',
    },
    {
      path: '../public/fonts/Graphik-Black-Web.woff2',
      weight: '900',
      style: 'black',
    },
  ],
  variable: '--font-graphik',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yenihisargazinosu.com'),
  title: {
    default: 'Yeni Hisar Gazinosu',
    template: '%s | Yeni Hisar Gazinosu',
  },
  description: "Bursa'nın Eğlence Adresi",
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={graphik.variable}>
      <head>
        <Script id='scroll-reset' strategy='beforeInteractive'>
          {`history.scrollRestoration = 'manual'; window.scrollTo(0, 0);`}
        </Script>
      </head>
      <body className='font-sans'>{children}</body>
    </html>
  );
}
