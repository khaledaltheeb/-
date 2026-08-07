'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Compass, Ellipsis, Grid2X2, Home, MessageCircle, Search, Stethoscope, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const HIDDEN_PREFIXES = ['/admin', '/login', '/auth', '/forgot-password', '/reset-password'];

export default function MobileNav() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSignedIn(Boolean(data.session)); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (active) setSignedIn(Boolean(session)); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;

  const items = signedIn ? [
    { href: '/', label: 'الرئيسية', Icon: Home },
    { href: '/search', label: 'بحث', Icon: Search },
    { href: '/#sectors', label: 'اكتشف', Icon: Compass },
    { href: '/messages', label: 'الرسائل', Icon: MessageCircle },
    { href: '/account', label: 'حسابي', Icon: UserRound },
  ] : [
    { href: '/', label: 'الرئيسية', Icon: Home },
    { href: '/search', label: 'بحث', Icon: Search },
    { href: '/#sectors', label: 'الأقسام', Icon: Grid2X2 },
    { href: '/specialists', label: 'مختصون', Icon: Stethoscope },
    { href: '/about', label: 'المزيد', Icon: Ellipsis },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف">
      {items.map(({ href, label, Icon }) => <Link href={href} aria-label={label} key={`${href}-${label}`}><Icon aria-hidden="true" size={20} /><span>{label}</span></Link>)}
    </nav>
  );
}
