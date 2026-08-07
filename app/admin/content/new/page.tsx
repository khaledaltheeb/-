import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '../content-form';
import { createDraft } from '../actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ error?: string }>;

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

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card cms-editor">
        <div className="admin-heading">
          <div><span className="eyebrow">New Draft</span><h1>إضافة صفحة جديدة</h1><p>إنشاء صفحة نظيفة داخل CMS الجديد. لا يتم جلب أي محتوى قديم في هذه المرحلة.</p></div>
          <Link className="button" href="/admin/content">العودة للمحتوى</Link>
        </div>
        {params.error && <p className="system-message error">تعذر إنشاء المسودة. تحقق من الـSlug والقطاع والقسم والحقول المطلوبة.</p>}
        <ContentForm action={createDraft} sectors={sectors ?? []} categories={categories ?? []} submitLabel="إنشاء المسودة" />
      </section>
    </main>
  );
}
