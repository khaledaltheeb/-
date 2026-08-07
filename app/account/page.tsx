import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('display_name,phone,locale,role,is_active').eq('id', userId).single();

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <span className="eyebrow">حسابي</span>
        <h1>{profile?.display_name || 'حساب روافد'}</h1>
        <p>الدور الحالي: <strong>{profile?.role || 'user'}</strong></p>
        <div className="feature-list"><span>الملف الشخصي</span><span>الإشعارات</span><span>المحادثات</span><span>المواعيد</span></div>
        <div className="dashboard-actions">
          {(profile?.role === 'owner' || profile?.role === 'admin') && <Link className="button" href="/admin">لوحة المدير</Link>}
          {profile?.role === 'specialist' && <Link className="button" href="/specialist">لوحة المختص</Link>}
          <form action="/auth/signout" method="post"><button className="button" type="submit">تسجيل الخروج</button></form>
        </div>
      </section>
    </main>
  );
}
