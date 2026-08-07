import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '../content-form';
import { updateDraft } from '../actions';

export const dynamic = 'force-dynamic';
type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ ok?: string; error?: string }>;

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة', scientific_review: 'مراجعة علمية', editorial_review: 'مراجعة تحريرية', seo_review: 'مراجعة SEO',
  accessibility_review: 'مراجعة الإتاحة', approved: 'معتمد', scheduled: 'مجدول', published: 'منشور', archived: 'مؤرشف',
};

export default async function EditContentPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [{ data: record }, { data: sectors }, { data: categories }, { data: versions }] = await Promise.all([
    supabase.from('content').select('id,content_type,slug,title,excerpt,body_text,sector_id,category_id,audience,search_aliases,seo_title,seo_description,canonical_url,robots_index,robots_follow,status,updated_at').eq('id', id).maybeSingle(),
    supabase.from('sectors').select('id,name_ar').order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,name_ar').order('sort_order').order('name_ar'),
    supabase.from('content_versions').select('version,created_at').eq('content_id', id).order('version', { ascending: false }).limit(12),
  ]);
  if (!record) notFound();
  const query = await searchParams;

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card cms-editor">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">Versioned Content</span>
            <h1>{record.title}</h1>
            <div className="editor-meta"><span className={`status-badge status-${record.status}`}>{STATUS_LABELS[record.status] ?? record.status}</span><span>آخر تعديل: {new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.updated_at))}</span></div>
          </div>
          <div className="dashboard-actions"><Link className="button" href="/admin/content">كل المحتوى</Link>{record.status === 'published' && <Link className="button" href={`/content/${record.slug}`}>عرض الصفحة</Link>}</div>
        </div>

        {query.ok && <p className="system-message success">تم الحفظ وإنشاء نسخة جديدة من الصفحة.</p>}
        {query.error && <p className="system-message error">فشل الحفظ ولم تُعتمد نسخة جزئية.</p>}

        <ContentForm action={updateDraft} sectors={sectors ?? []} categories={categories ?? []} record={record} submitLabel="حفظ نسخة جديدة" />

        <aside className="version-panel" aria-labelledby="versions-title">
          <div className="section-mini-heading"><h2 id="versions-title">سجل النسخ</h2><span>{versions?.length ?? 0} نسخة حديثة</span></div>
          <div className="version-list">
            {(versions ?? []).map((version) => <div key={version.version}><strong>v{version.version}</strong><span>{new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(version.created_at))}</span></div>)}
          </div>
        </aside>
      </section>
    </main>
  );
}
