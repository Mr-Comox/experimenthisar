import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

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
      style: 'normal',
    },
    {
      path: '../public/fonts/Graphik-Semibold-Web.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Graphik-Bold-Web.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Graphik-Black-Web.woff2',
      weight: '900',
      style: 'normal',
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
    <html suppressHydrationWarning>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <link
          rel='preload'
          as='font'
          type='font/woff2'
          href='/fonts/Graphik-Regular-Web.woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          as='font'
          type='font/woff2'
          href='/fonts/Graphik-Medium-Web.woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          as='font'
          type='font/woff2'
          href='/fonts/Graphik-Semibold-Web.woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          as='font'
          type='font/woff2'
          href='/fonts/Graphik-Bold-Web.woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          as='font'
          type='font/woff2'
          href='/fonts/Graphik-Black-Web.woff2'
          crossOrigin='anonymous'
        />
        <Script
          id='scroll-reset'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration = 'manual'; window.scrollTo(0, 0);`,
          }}
        />
        <Script
          id='age-gate-scroll-lock'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname === '/age-gate') {
                  document.documentElement.style.overflow = 'hidden';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${graphik.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
