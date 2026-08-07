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
    { data: reportRows }, { data: appointmentRows }, { data: redirectRows },
  ] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact', head: true }),
    supabase.from('specialists').select('id', { count: 'exact', head: true }),
    supabase.from('centers').select('id', { count: 'exact', head: true }),
    supabase.from('community_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('sectors').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.rpc('admin_conversation_reports', { p_status: 'pending', p_limit: 100, p_offset: 0 }),
    supabase.rpc('admin_appointments', { p_status: 'requested', p_limit: 100, p_offset: 0 }),
    supabase.rpc('admin_list_redirects', { p_query: null, p_limit: 500, p_offset: 0 }),
  ]);

  const pendingReports = Array.isArray(reportRows) ? reportRows.length : 0;
  const pendingAppointments = Array.isArray(appointmentRows) ? appointmentRows.length : 0;
  const redirectCount = Array.isArray(redirectRows) ? redirectRows.length : 0;

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="admin-heading">
          <div><span className="eyebrow">صلاحيات إدارية محكومة</span><h1>لوحة إدارة روافد</h1><p>إدارة البنية والمحتوى والحسابات والدلائل والتواصل والمواعيد والتحويلات من طبقة مترابطة ومُسجلة.</p></div>
          <div className="dashboard-actions"><Link className="button" href="/">الموقع العام</Link><Link className="button" href="/account">حسابي</Link></div>
        </div>

        <div className="stat-grid admin-stat-grid">
          <article><strong>{contentCount ?? 0}</strong><span>المحتوى</span></article><article><strong>{sectorsCount ?? 0}</strong><span>القطاعات</span></article>
          <article><strong>{categoriesCount ?? 0}</strong><span>الأقسام</span></article><article><strong>{usersCount ?? 0}</strong><span>الحسابات</span></article>
          <article><strong>{specialistsCount ?? 0}</strong><span>المختصون</span></article><article><strong>{centersCount ?? 0}</strong><span>المراكز</span></article>
          <article><strong>{communityCount ?? 0}</strong><span>المتدربون والمتطوعون</span></article><article><strong>{pendingReports}</strong><span>بلاغات تنتظر المراجعة</span></article>
          <article><strong>{pendingAppointments}</strong><span>طلبات مواعيد</span></article><article><strong>{redirectCount}</strong><span>Redirects</span></article>
        </div>

        <div className="admin-module-grid">
          <Link href="/admin/taxonomy"><strong>القطاعات والأقسام</strong><span>إنشاء وتعديل وترتيب وتعطيل Taxonomy دون تعديل الكود.</span></Link>
          <Link href="/admin/content"><strong>إدارة المحتوى وSEO</strong><span>CMS بإصدارات وسير مراجعة وحقول SEO قبل النشر.</span></Link>
          <Link href="/admin/users"><strong>الحسابات والصلاحيات</strong><span>الأدوار، التفعيل، وحماية التصعيد غير المصرح به.</span></Link>
          <Link href="/admin/specialists"><strong>إدارة المختصين</strong><span>إضافة مختص، مراجعة المؤهلات، الاعتماد والرفض والتعليق.</span></Link>
          <Link href="/admin/centers"><strong>إدارة المراكز</strong><span>مراجعة واعتماد المراكز والفروع والبيانات المهنية.</span></Link>
          <Link href="/admin/community"><strong>المتدربون والمتطوعون</strong><span>إضافة، مراجعة واعتماد الملفات مع فصل الصفة عن المختص المرخص.</span></Link>
          <Link href="/admin/reports"><strong>بلاغات المحادثات</strong><span>مراجعة Block/Report وإدارة الحالات دون كشف تلقائي لنصوص الرسائل.</span></Link>
          <Link href="/admin/appointments"><strong>المواعيد</strong><span>متابعة الطلبات والحالات التشغيلية وربطها بالمحادثات.</span></Link>
          <Link href="/admin/redirects"><strong>SEO والـRedirects</strong><span>إدارة 301/302/307/308 مع منع الحلقات وتسجيل كل تغيير.</span></Link>
          <Link href="/admin/audit"><strong>Audit Log</strong><span>بحث وفلترة الأحداث الحساسة والجهة المنفذة والتغييرات قبل/بعد.</span></Link>
          <Link href="/messages"><strong>الرسائل</strong><span>فتح صندوق الرسائل التشغيلي للحساب الإداري نفسه.</span></Link>
        </div>
      </section>
    </main>
  );
}
