import './rawafid-theme.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
