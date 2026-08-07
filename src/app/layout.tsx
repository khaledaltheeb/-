import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://healthrenewal.org"),
  title: {
    default: "منصة روافد",
    template: "%s | منصة روافد",
  },
  description: "منصة عربية مؤسسية للمعرفة والدعم والتمكين.",
  applicationName: "منصة روافد",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b8f86",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
