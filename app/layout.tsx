import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import { BRAND_NAME, DEFAULT_DESCRIPTION, SITE_URL, organizationJsonLd } from '@/lib/seo';
import './globals.css';
import './sector-pages.css';
import './admin-ui.css';
import './cms.css';
import './search.css';
import './directory.css';
import './portal.css';
import './community.css';
import './trust.css';
import './theme-v3.css';
import './public-enhancements.css';
import MobileNav from './mobile-nav';
import PwaRegister from './pwa-register';

const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: BRAND_NAME, template: `%s | ${BRAND_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: BRAND_NAME,
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
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#075e5d',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = organizationJsonLd();
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c') }} />
        {children}
        <MobileNav />
        <PwaRegister />
      </body>
    </html>
  );
}
