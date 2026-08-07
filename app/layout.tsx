import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://healthrenewal.org'),
  title: { default: 'منصة روافد', template: '%s | منصة روافد' },
  description: 'منصة عربية مؤسسية للصحة النفسية والتعافي والدمج والتمكين والمعرفة المتخصصة.',
  applicationName: 'منصة روافد',
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f8f88',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
