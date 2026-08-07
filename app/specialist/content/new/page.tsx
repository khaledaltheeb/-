import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '@/app/admin/content/content-form';
import { createSpecialistDraft } from '../actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'إضافة محتوى مهني',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{error?:string}>;

export default async function NewSpecialistContent({searchParams}:{searchParams:SearchParams}){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId) redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||profile.role!=='specialist') redirect('/account');
  const [{data:sectors},{data:categories}]=await Promise.all([
    supabase.from('sectors').select('id,name_ar').eq('is_active',true).order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,name_ar').eq('is_active',true).order('sort_order').order('name_ar'),
  ]);
  const params=await searchParams;
  return <main className="dashboard-shell"><section className="dashboard-card cms-editor">
    <div className="admin-heading"><div><span className="eyebrow">مسودة مهنية جديدة</span><h1>إضافة محتوى</h1><p>المختص يستطيع إنشاء مقال أو دليل أو مورد. الحفظ لا يعني النشر؛ بعد الإكمال تُرسل المسودة للمراجعة العلمية.</p></div><Link className="button" href="/specialist/content">العودة لمحتواي</Link></div>
    {params.error&&<p className="system-message error">تعذر إنشاء المسودة. تحقق من الحقول والـSlug وبنية المحتوى.</p>}
    <ContentForm action={createSpecialistDraft} sectors={sectors??[]} categories={categories??[]} submitLabel="إنشاء المسودة" allowedTypes={['article','guide','resource']} />
  </section></main>;
}
