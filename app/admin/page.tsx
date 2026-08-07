import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('display_name,role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [
    { count: contentCount },
    { count: specialistsCount },
    { count: centersCount },
    { count: sectorsCount },
    { count: categoriesCount },
  ] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact', head: true }),
    supabase.from('specialists').select('id', { count: 'exact', head: true }),
    supabase.from('centers').select('id', { count: 'exact', head: true }),
    supabase.from('sectors').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">صلاحيات كاملة</span>
            <h1>لوحة إدارة روافد</h1>
            <p>إدارة البنية والمحتوى والمختصين والمراكز والصلاحيات من طبقة واحدة.</p>
          </div>
          <Link className="button" href="/account">حسابي</Link>
        </div>

        <div className="stat-grid">
          <article><strong>{contentCount ?? 0}</strong><span>المحتوى</span></article>
          <article><strong>{sectorsCount ?? 0}</strong><span>القطاعات</span></article>
          <article><strong>{categoriesCount ?? 0}</strong><span>الأقسام</span></article>
          <article><strong>{specialistsCount ?? 0}</strong><span>المختصون</span></article>
          <article><strong>{centersCount ?? 0}</strong><span>المراكز</span></article>
        </div>

        <div className="admin-module-grid">
          <Link href="/admin/taxonomy"><strong>القطاعات والأقسام</strong><span>إنشاء، تعديل، ترتيب وتعطيل Taxonomy دون تعديل الكود.</span></Link>
          <Link href="/admin/content"><strong>إدارة المحتوى</strong><span>CMS بإصدارات، SEO، وسير مراجعة مؤسسي قبل النشر.</span></Link>
          <Link href="/admin/specialists"><strong>توثيق المختصين</strong><span>مراجعة الملف المهني، الاعتماد، الرفض، التعليق والتفعيل مع Audit Log.</span></Link>
          <Link href="/centers"><strong>دليل المراكز</strong><span>معاينة المراكز الموثقة والفرق المرتبطة بها؛ لوحة إدارة المراكز قيد الاستكمال.</span></Link>
          <div><strong>SEO والـRedirects</strong><span>Metadata وStructured Data موجودان؛ لوحة Redirects والإطلاق ما زالت قيد البناء.</span></div>
          <div><strong>Audit Log</strong><span>تتبّع العمليات الحساسة والتغييرات، مع واجهة إدارية قيد الاستكمال.</span></div>
        </div>
      </section>
    </main>
  );
}
