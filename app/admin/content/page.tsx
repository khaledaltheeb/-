import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ status?: string; q?: string; error?: string }>;

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة', scientific_review: 'مراجعة علمية', editorial_review: 'مراجعة تحريرية', seo_review: 'مراجعة SEO',
  accessibility_review: 'مراجعة الإتاحة', approved: 'معتمد', scheduled: 'مجدول', published: 'منشور', archived: 'مؤرشف',
};

export default async function ContentDashboard({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const params = await searchParams;
  const status = params.status && STATUS_LABELS[params.status] ? params.status : '';
  const q = String(params.q ?? '').trim().slice(0, 120);

  let query = supabase
    .from('content')
    .select('id,content_type,slug,title,status,updated_at,published_at,sectors(name_ar),categories(name_ar)')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('title', `%${q.replace(/[%_]/g, '\\$&')}%`);

  const { data: rows } = await query;

  const counts = await Promise.all(
    Object.keys(STATUS_LABELS).map(async (key) => {
      const { count } = await supabase.from('content').select('id', { count: 'exact', head: true }).eq('status', key);
      return [key, count ?? 0] as const;
    }),
  );
  const countMap = new Map(counts);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card cms-dashboard">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">Content CMS</span>
            <h1>إدارة الصفحات والمحتوى</h1>
            <p>كل صفحة تبدأ كمسودة، وتُحفظ نسخها، ثم تنتقل لاحقًا عبر بوابات المراجعة قبل النشر.</p>
          </div>
          <div className="dashboard-actions">
            <Link className="button" href="/admin">لوحة الإدارة</Link>
            <Link className="primary-link" href="/admin/content/new">إضافة صفحة</Link>
          </div>
        </div>

        {params.error && <p className="system-message error">تعذر تنفيذ العملية المطلوبة.</p>}

        <div className="workflow-strip" aria-label="حالات سير العمل">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Link className={status === key ? 'active' : ''} href={`/admin/content?status=${key}`} key={key}>
              <strong>{countMap.get(key) ?? 0}</strong><span>{label}</span>
            </Link>
          ))}
        </div>

        <form className="cms-filter" method="get">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="content-q">بحث في العناوين</label>
          <input id="content-q" name="q" defaultValue={q} placeholder="اكتب عنوانًا أو جزءًا منه" />
          <button className="secondary-action" type="submit">بحث</button>
          {(status || q) && <Link href="/admin/content">مسح الفلاتر</Link>}
        </form>

        <div className="content-table-wrap">
          <table className="content-table">
            <thead><tr><th>العنوان</th><th>النوع</th><th>القطاع / القسم</th><th>الحالة</th><th>آخر تعديل</th><th>الإجراء</th></tr></thead>
            <tbody>
              {(rows ?? []).map((row) => {
                const sector = Array.isArray(row.sectors) ? row.sectors[0] : row.sectors;
                const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
                return (
                  <tr key={row.id}>
                    <td><strong>{row.title}</strong><small dir="ltr">/{row.slug}</small></td>
                    <td>{row.content_type}</td>
                    <td>{sector?.name_ar ?? '—'}{category?.name_ar ? ` / ${category.name_ar}` : ''}</td>
                    <td><span className={`status-badge status-${row.status}`}>{STATUS_LABELS[row.status] ?? row.status}</span></td>
                    <td>{new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.updated_at))}</td>
                    <td><Link href={`/admin/content/${row.id}`}>تحرير</Link></td>
                  </tr>
                );
              })}
              {!rows?.length && <tr><td colSpan={6} className="empty-table">لا توجد صفحات مطابقة.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
