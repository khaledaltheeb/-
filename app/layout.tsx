import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { BRAND_NAME, DEFAULT_DESCRIPTION, SITE_URL, organizationJsonLd } from '@/lib/seo';
import './rawafid-theme-v6.css';

/* Compatibility modules stay behind the central V6 entry point, which imports
   the proven V5 theme before applying public-shell polish:
   './theme-empty.css' './dashboard-v3.css' './theme-preview.css'
   './public-modules-v3.css' './system-states.css' './content-v3.css'
   './structured-content.css' './block-editor-v3.css' './profile-v3.css'
   './admin-shell-v3.css'. */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: BRAND_NAME, template: `%s | ${BRAND_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: BRAND_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/pwa-icon-192?v=6', type: 'image/png', sizes: '192x192' },
      { url: '/icons/rawafid-app.svg?v=6', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/pwa-icon-180?v=6', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'منصة روافد',
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
  themeColor: '#075f61',
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

function validatedAnalyticsId(value: string | undefined, pattern: RegExp) {
  const normalized = value?.trim() ?? '';
  return pattern.test(normalized) ? normalized : '';
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = organizationJsonLd();
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
  const directGaEnabled = process.env.NEXT_PUBLIC_ENABLE_DIRECT_GA === 'true';
  const gtmId = validatedAnalyticsId(process.env.NEXT_PUBLIC_GTM_ID, /^GTM-[A-Z0-9]+$/i);
  const gaId = validatedAnalyticsId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, /^G-[A-Z0-9]+$/i);

  return (
    <html lang="ar" dir="rtl">
      <body id="top">
        {analyticsEnabled && gtmId ? (
          <>
            <Script id="rawafid-gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
                title="Google Tag Manager"
              />
            </noscript>
          </>
        ) : null}
        {analyticsEnabled && directGaEnabled && gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="rawafid-ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c') }} />
        {children}
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerBootstrap }} />
      </body>
    </html>
  );
}
