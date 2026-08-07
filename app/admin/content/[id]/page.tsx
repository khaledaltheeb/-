import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '../content-form';
import { transitionStatus, updateDraft } from '../actions';
import { updateSeoAuthority } from '../seo-actions';

export const dynamic = 'force-dynamic';
type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ ok?: string; error?: string }>;

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة', scientific_review: 'مراجعة علمية', editorial_review: 'مراجعة تحريرية', seo_review: 'مراجعة SEO',
  accessibility_review: 'مراجعة الإتاحة', approved: 'معتمد', scheduled: 'مجدول', published: 'منشور', archived: 'مؤرشف',
};

const TRANSITIONS: Record<string, { target: string; label: string; tone?: string }[]> = {
  draft: [{ target: 'scientific_review', label: 'إرسال للمراجعة العلمية' }],
  scientific_review: [{ target: 'draft', label: 'إعادة لمسودة', tone: 'muted' }, { target: 'editorial_review', label: 'اجتياز المراجعة العلمية' }],
  editorial_review: [{ target: 'draft', label: 'إعادة لمسودة', tone: 'muted' }, { target: 'seo_review', label: 'إرسال لمراجعة SEO' }],
  seo_review: [{ target: 'editorial_review', label: 'إعادة للتحرير', tone: 'muted' }, { target: 'accessibility_review', label: 'اجتياز SEO' }],
  accessibility_review: [{ target: 'editorial_review', label: 'إعادة للتحرير', tone: 'muted' }, { target: 'approved', label: 'اعتماد الصفحة' }],
  approved: [{ target: 'editorial_review', label: 'إعادة للتحرير', tone: 'muted' }, { target: 'published', label: 'نشر الصفحة', tone: 'publish' }],
  published: [{ target: 'archived', label: 'أرشفة الصفحة', tone: 'danger' }],
  archived: [{ target: 'draft', label: 'إعادة فتح كمسودة', tone: 'muted' }],
};

const EDITABLE = new Set(['draft','scientific_review','editorial_review','seo_review','accessibility_review']);

function referenceLines(value: unknown) {
  if (!Array.isArray(value)) return '';
  return value.slice(0, 100).map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return '';
    const ref = item as Record<string, unknown>;
    return [ref.title, ref.url, ref.publisher, ref.year].map((part) => typeof part === 'string' || typeof part === 'number' ? String(part) : '').join(' | ').replace(/(?:\s*\|\s*)+$/,'');
  }).filter(Boolean).join('\n');
}

function dateInput(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0,16);
}

export default async function EditContentPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [{ data: record }, { data: sectors }, { data: categories }, { data: versions }] = await Promise.all([
    supabase.from('content').select('id,content_type,slug,title,excerpt,body_json,body_text,sector_id,category_id,audience,search_aliases,seo_title,seo_description,canonical_url,robots_index,robots_follow,status,updated_at,published_at,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,featured_image_alt').eq('id', id).maybeSingle(),
    supabase.from('sectors').select('id,name_ar').order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,name_ar').order('sort_order').order('name_ar'),
    supabase.from('content_versions').select('version,created_at').eq('content_id', id).order('version', { ascending: false }).limit(12),
  ]);
  if (!record) notFound();
  const query = await searchParams;
  const transitions = TRANSITIONS[record.status] ?? [];
  const editable = EDITABLE.has(record.status);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card cms-editor">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">Versioned Content</span>
            <h1>{record.title}</h1>
            <div className="editor-meta">
              <span className={`status-badge status-${record.status}`}>{STATUS_LABELS[record.status] ?? record.status}</span>
              <span>آخر تعديل: {new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.updated_at))}</span>
              {record.published_at && <span>النشر: {new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.published_at))}</span>}
            </div>
          </div>
          <div className="dashboard-actions"><Link className="button" href="/admin/content">كل المحتوى</Link>{record.status === 'published' && <Link className="button" href={`/content/${record.slug}`}>عرض الصفحة</Link>}</div>
        </div>

        {query.ok && <p className="system-message success">تم تنفيذ العملية بنجاح.</p>}
        {query.error && <p className="system-message error">فشلت العملية ولم تُعتمد حالة أو نسخة جزئية.</p>}

        <section className="workflow-panel" aria-labelledby="workflow-title">
          <div><span className="eyebrow">Workflow Gate</span><h2 id="workflow-title">المرحلة الحالية: {STATUS_LABELS[record.status] ?? record.status}</h2></div>
          <div className="workflow-actions">
            {transitions.map((transition) => (
              <form action={transitionStatus} key={transition.target}>
                <input type="hidden" name="id" value={record.id} /><input type="hidden" name="slug" value={record.slug} /><input type="hidden" name="target" value={transition.target} />
                <button className={`workflow-button ${transition.tone ?? ''}`} type="submit">{transition.label}</button>
              </form>
            ))}
          </div>
        </section>

        {editable ? <ContentForm action={updateDraft} sectors={sectors ?? []} categories={categories ?? []} record={record} submitLabel="حفظ نسخة جديدة" /> : <div className="locked-content"><strong>المحتوى مقفل للتحرير في هذه المرحلة.</strong><p>أعده عبر Workflow إلى مرحلة تحرير قبل تغيير النص أو SEO. هذا يمنع تعديل النسخة الحية مباشرة.</p></div>}

        <section className="seo-authority-panel" aria-labelledby="seo-authority-title">
          <div className="section-mini-heading"><div><span className="eyebrow">SEO + E-E-A-T Contract</span><h2 id="seo-authority-title">الدلالة، المراجع والسلطة العلمية</h2></div><span>هذه الحقول تغذي Metadata، Structured Data، صفحة المصادر وإشارات المراجعة.</span></div>
          {editable ? <form className="admin-form" action={updateSeoAuthority}>
            <input type="hidden" name="id" value={record.id} /><input type="hidden" name="slug" value={record.slug} />
            <div className="admin-form-grid seo-authority-grid">
              <label>الكلمة المفتاحية الأساسية<input name="primary_keyword" defaultValue={record.primary_keyword || ''} maxLength={250} /></label>
              <label>نية البحث<select name="search_intent" defaultValue={record.search_intent || ''}><option value="">غير محددة</option><option value="informational">Informational</option><option value="transactional">Transactional</option><option value="navigational">Navigational</option><option value="commercial">Commercial</option><option value="local">Local</option></select></label>
              <label className="wide-field">الكلمات الثانوية<input name="secondary_keywords" defaultValue={(record.secondary_keywords || []).join('، ')} maxLength={4000} /></label>
              <label className="wide-field">المصطلحات الدلالية والمرادفات<input name="semantic_terms" defaultValue={(record.semantic_terms || []).join('، ')} maxLength={4000} /></label>
              <label>اسم المؤلف الظاهر<input name="author_display_name" defaultValue={record.author_display_name || ''} maxLength={200} /></label>
              <label>اسم المراجع العلمي<input name="reviewer_display_name" defaultValue={record.reviewer_display_name || ''} maxLength={200} /></label>
              <label>صفة/مؤهلات المراجع<input name="reviewer_credentials" defaultValue={record.reviewer_credentials || ''} maxLength={300} /></label>
              <label>تاريخ آخر مراجعة<input name="last_reviewed_at" type="datetime-local" defaultValue={dateInput(record.last_reviewed_at)} /></label>
              <label className="wide-field">Alt للصورة البارزة<input name="featured_image_alt" defaultValue={record.featured_image_alt || ''} maxLength={500} placeholder="وصف دقيق للصورة دون حشو كلمات مفتاحية" /></label>
              <label className="wide-field">إخلاء المسؤولية الخاص بالصفحة<textarea name="medical_disclaimer" defaultValue={record.medical_disclaimer || ''} maxLength={3000} rows={4} /></label>
              <label className="wide-field seo-reference-field">المراجع العلمية<textarea name="references" defaultValue={referenceLines(record.references_json)} maxLength={30000} rows={9} placeholder="العنوان | https://example.org/source | الجهة الناشرة | 2026" /><small>مرجع واحد في كل سطر: العنوان | الرابط HTTPS | الجهة | السنة</small></label>
            </div>
            <button className="primary-action" type="submit">حفظ SEO والمراجعة والمراجع</button>
          </form> : <div className="locked-content"><strong>بيانات السلطة العلمية مقفلة مع النسخة المنشورة.</strong><p>أي تعديل جوهري يجب أن يمر بإصدار ومسار مراجعة جديد.</p></div>}
        </section>

        <aside className="version-panel" aria-labelledby="versions-title">
          <div className="section-mini-heading"><h2 id="versions-title">سجل النسخ</h2><span>{versions?.length ?? 0} نسخة حديثة</span></div>
          <div className="version-list">{(versions ?? []).map((version) => <div key={version.version}><strong>v{version.version}</strong><span>{new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(version.created_at))}</span></div>)}</div>
        </aside>
      </section>
    </main>
  );
}
