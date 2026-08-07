import type { Metadata, Viewport } from 'next';
import './globals.css';
import './sector-pages.css';
import PwaRegister from './pwa-register';

export const metadata: Metadata = {
  metadataBase: new URL('https://healthrenewal.org'),
  title: { default: 'منصة روافد', template: '%s | منصة روافد' },
  description: 'منصة عربية مؤسسية للصحة النفسية والتعافي والدمج والتمكين والمعرفة المتخصصة.',
  applicationName: 'منصة روافد',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/rawafid-app.svg',
    apple: '/icons/rawafid-app.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'روافد',
    statusBarStyle: 'default',
  },
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f8f88',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
