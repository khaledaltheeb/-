'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, Grid2X2, Home, UserRound } from 'lucide-react';

const HIDDEN_PREFIXES = ['/admin', '/login', '/auth'];

export default function MobileNav() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف">
      <Link href="/" aria-label="الرئيسية"><Home aria-hidden="true" size={20} /><span>الرئيسية</span></Link>
      <Link href="/#sectors" aria-label="القطاعات"><Grid2X2 aria-hidden="true" size={20} /><span>القطاعات</span></Link>
      <Link href="/#specialists" aria-label="المختصون"><BookOpenText aria-hidden="true" size={20} /><span>الدليل</span></Link>
      <Link href="/account" aria-label="الحساب"><UserRound aria-hidden="true" size={20} /><span>الحساب</span></Link>
    </nav>
  );
}
