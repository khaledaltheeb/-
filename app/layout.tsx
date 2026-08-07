import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import { BRAND_NAME, DEFAULT_DESCRIPTION, SITE_URL, organizationJsonLd } from '@/lib/seo';
import './globals.css';
import './sector-pages.css';
import './admin-ui.css';
import './admin-operations.css';
import './cms.css';
import './search.css';
import './directory.css';
import './portal.css';
import './community.css';
import './trust.css';
import './theme-v3.css';
import './public-enhancements.css';
import './communication.css';
import './mobile-nav-v3.css';
import './theme-empty.css';
import './dashboard-v3.css';
import './theme-preview.css';
import './public-modules-v3.css';
import './system-states.css';
import './content-v3.css';
import './structured-content.css';
import './block-editor-v3.css';
import './profile-v3.css';
import './admin-shell-v3.css';

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
    icon: [
      { url: '/pwa-icon-192', type: 'image/png', sizes: '192x192' },
      { url: '/icons/rawafid-app.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/pwa-icon-180', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'روافد',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false, email: false, address: false },
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

const serviceWorkerBootstrap = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      navigator.serviceWorker.register('/sw.js').then(function (registration) {
        registration.update().catch(function () {});
        if (registration.waiting) registration.waiting.postMessage('SKIP_WAITING');
      }).catch(function () {});
    }, 8000);
  }, { once: true });
}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = organizationJsonLd();
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c') }} />
        {children}
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerBootstrap }} />
      </body>
    </html>
  );
}
