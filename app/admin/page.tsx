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
    { count: contentCount }, { count: specialistsCount }, { count: centersCount }, { count: communityCount },
    { count: sectorsCount }, { count: categoriesCount }, { count: usersCount },
  ] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact', head: true }),
    supabase.from('specialists').select('id', { count: 'exact', head: true }),
    supabase.from('centers').select('id', { count: 'exact', head: true }),
    supabase.from('community_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('sectors').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="admin-heading">
          <div><span className="eyebrow">صلاحيات إدارية محكومة</span><h1>لوحة إدارة روافد</h1><p>إدارة البنية والمحتوى والحسابات والمختصين والمراكز والمتدربين والمتطوعين من طبقة مترابطة ومُسجلة.</p></div>
          <div className="dashboard-actions"><Link className="button" href="/">الموقع العام</Link><Link className="button" href="/account">حسابي</Link></div>
        </div>

        <div className="stat-grid admin-stat-grid">
          <article><strong>{contentCount ?? 0}</strong><span>المحتوى</span></article><article><strong>{sectorsCount ?? 0}</strong><span>القطاعات</span></article>
          <article><strong>{categoriesCount ?? 0}</strong><span>الأقسام</span></article><article><strong>{usersCount ?? 0}</strong><span>الحسابات</span></article>
          <article><strong>{specialistsCount ?? 0}</strong><span>المختصون</span></article><article><strong>{centersCount ?? 0}</strong><span>المراكز</span></article>
          <article><strong>{communityCount ?? 0}</strong><span>المتدربون والمتطوعون</span></article>
        </div>

        <div className="admin-module-grid">
          <Link href="/admin/taxonomy"><strong>القطاعات والأقسام</strong><span>إنشاء وتعديل وترتيب وتعطيل Taxonomy دون تعديل الكود.</span></Link>
          <Link href="/admin/content"><strong>إدارة المحتوى وSEO</strong><span>CMS بإصدارات وسير مراجعة وحقول SEO قبل النشر.</span></Link>
          <Link href="/admin/users"><strong>الحسابات والصلاحيات</strong><span>الأدوار، التفعيل، وحماية التصعيد غير المصرح به.</span></Link>
          <Link href="/admin/specialists"><strong>إدارة المختصين</strong><span>إضافة مختص، مراجعة المؤهلات، الاعتماد والرفض والتعليق.</span></Link>
          <Link href="/admin/centers"><strong>إدارة المراكز</strong><span>مراجعة واعتماد المراكز والفروع والبيانات المهنية.</span></Link>
          <Link href="/admin/community"><strong>المتدربون والمتطوعون</strong><span>إضافة، مراجعة واعتماد الملفات مع فصل الصفة عن المختص المرخص.</span></Link>
          <div><strong>SEO والـRedirects</strong><span>العقد المركزي للميتا والسكيما موجود؛ إدارة Redirects وتقسيم Sitemaps ما زالا ضمن الإغلاق التقني.</span></div>
          <div><strong>Audit Log</strong><span>التسجيل موجود للعمليات الحساسة؛ واجهة الاستعراض والفلترة ما زالت قيد الإكمال.</span></div>
          <div><strong>الرسائل والمواعيد</strong><span>الجداول الأساسية موجودة؛ واجهات التشغيل الآمنة لم تكتمل بعد.</span></div>
        </div>
      </section>
    </main>
  );
}
