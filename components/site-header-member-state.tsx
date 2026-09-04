'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import SiteNavIcon, { type SiteNavIconName } from '@/components/site-nav-icon';

const guestMobileItems: Array<{ href: string; label: string; icon: SiteNavIconName }> = [
  { href: '/', label: 'الرئيسية', icon: 'home' },
  { href: '/search', label: 'بحث', icon: 'search' },
  { href: '/care-guides/', label: 'الأدلة', icon: 'discover' },
  { href: '/specialists', label: 'مختصون', icon: 'specialists' },
  { href: '/about', label: 'من نحن', icon: 'more' },
];

const memberMobileItems: Array<{ href: string; label: string; icon: SiteNavIconName }> = [
  { href: '/', label: 'الرئيسية', icon: 'home' },
  { href: '/search', label: 'بحث', icon: 'search' },
  { href: '/care-guides/', label: 'الأدلة', icon: 'discover' },
  { href: '/messages', label: 'الرسائل', icon: 'messages' },
  { href: '/account', label: 'حسابي', icon: 'account' },
];

function hasBrowserSupabaseAuthCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .map((part) => part.trim().split('=')[0] ?? '')
    .some((name) => name.startsWith('sb-') && name.includes('-auth-token'));
}

function subscribeToAuthSnapshot(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') onStoreChange();
  };

  window.addEventListener('focus', onStoreChange);
  window.addEventListener('pageshow', onStoreChange);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    window.removeEventListener('focus', onStoreChange);
    window.removeEventListener('pageshow', onStoreChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

function useHeaderSignedIn() {
  return useSyncExternalStore(
    subscribeToAuthSnapshot,
    hasBrowserSupabaseAuthCookie,
    () => false,
  );
}

export function HeaderAccountAction() {
  const signedIn = useHeaderSignedIn();
  return signedIn
    ? <Link className="button header-login" href="/account" prefetch={false}>حسابي</Link>
    : <Link className="button header-login" href="/login" prefetch={false}>دخول</Link>;
}

export function HeaderMemberMenuLinks() {
  const signedIn = useHeaderSignedIn();
  if (!signedIn) return <Link href="/login" prefetch={false}>تسجيل الدخول</Link>;
  return <><Link href="/messages" prefetch={false}>الرسائل</Link><Link href="/appointments" prefetch={false}>المواعيد</Link><Link href="/notifications" prefetch={false}>الإشعارات</Link><Link href="/account" prefetch={false}>حسابي</Link></>;
}

export function HeaderMegaMemberLinks() {
  const signedIn = useHeaderSignedIn();
  if (!signedIn) return null;
  return <div className="mega-member-links"><Link href="/messages" prefetch={false}>الرسائل</Link><Link href="/appointments" prefetch={false}>المواعيد</Link><Link href="/notifications" prefetch={false}>الإشعارات</Link></div>;
}

export function HeaderMobileBottomNav() {
  const signedIn = useHeaderSignedIn();
  const items = signedIn ? memberMobileItems : guestMobileItems;

  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف">
      {items.map((item) => (
        <Link href={item.href} prefetch={false} key={item.href + item.label}>
          <SiteNavIcon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
