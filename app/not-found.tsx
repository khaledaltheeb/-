import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';

export default function NotFound() {
  return <>
    <SiteHeader />
    <main className="site-shell rawafid-home">
      <section className="rawafid-section">
        <div className="rawafid-empty system-state-large">
          <div className="rawafid-empty-icon"><PlatformIcon name="search" size={30} /></div>
          <span className="system-code">404</span>
          <h1>الصفحة غير موجودة</h1>
          <p>قد يكون الرابط قد تغيّر أو لم يعد متاحًا. استخدم البحث أو ارجع إلى الصفحة الرئيسية.</p>
          <div className="rawafid-directory-actions"><Link className="primary-link" href="/">العودة للرئيسية</Link><Link className="button" href="/search">البحث في روافد</Link></div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
