'use client';

import { useEffect, useState } from 'react';
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

export function HeaderAccountAction() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(hasBrowserSupabaseAuthCookie());
  }, []);

  return signedIn
    ? <a className="button header-login" href="/account">حسابي</a>
    : <a className="button header-login" href="/login">دخول</a>;
}

export function HeaderMemberMenuLinks() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(hasBrowserSupabaseAuthCookie());
  }, []);

  if (!signedIn) return <a href="/login">تسجيل الدخول</a>;
  return <><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a><a href="/account">حسابي</a></>;
}

export function HeaderMegaMemberLinks() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(hasBrowserSupabaseAuthCookie());
  }, []);

  if (!signedIn) return null;
  return <div className="mega-member-links"><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a></div>;
}

export function HeaderMobileBottomNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(hasBrowserSupabaseAuthCookie());
  }, []);

  const items = signedIn ? memberMobileItems : guestMobileItems;
  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف">
      {items.map((item) => <a href={item.href} key={item.href + item.label}><SiteNavIcon name={item.icon} /><span>{item.label}</span></a>)}
    </nav>
  );
}
