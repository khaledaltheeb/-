import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '../content-form';
import { createDraft } from '../actions';
import { ADMIN_CONTENT_TEMPLATES, resolveContentTemplate } from '@/lib/content-templates';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ error?: string; type?: string }>;

export default async function NewContentPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [{ data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('sectors').select('id,name_ar').order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,name_ar').order('sort_order').order('name_ar'),
  ]);
  const params = await searchParams;
  const template = resolveContentTemplate(params.type, ADMIN_CONTENT_TEMPLATES);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card cms-editor">
        <div className="admin-heading">
          <div><span className="eyebrow">مسودة جديدة</span><h1>إضافة صفحة إلى منصة روافد</h1><p>اختر قالب البداية ثم أكمل الحقول بخطوات واضحة. الحفظ ينشئ مسودة خاصة ولا ينشرها مباشرة.</p></div>
          <Link className="button" href="/admin/content">العودة للمحتوى</Link>
        </div>
        {params.error && <p className="system-message error">تعذر إنشاء المسودة. تحقق من الـSlug والقطاع والقسم والحقول المطلوبة.</p>}
        <section className="content-template-launcher" aria-labelledby="content-template-title">
          <div className="section-mini-heading"><div><span className="eyebrow">بداية منظمة</span><h2 id="content-template-title">ما نوع الصفحة التي تريد إنشاءها؟</h2></div><span>يمكن تغيير النوع لاحقًا ما دامت الصفحة مسودة.</span></div>
          <div className="content-template-grid">{ADMIN_CONTENT_TEMPLATES.map((item) => <Link className={template.type === item.type ? 'selected' : ''} href={`/admin/content/new?type=${item.type}`} key={item.type}><strong>{item.label}</strong><span>{item.description}</span><small>{item.cue}</small></Link>)}</div>
          <div className="content-template-selection"><strong>القالب المختار: {template.label}</strong><span>{template.cue}</span></div>
        </section>
        <ContentForm action={createDraft} sectors={sectors ?? []} categories={categories ?? []} submitLabel="إنشاء المسودة" initialType={template.type} />
      </section>
    </main>
  );
}
