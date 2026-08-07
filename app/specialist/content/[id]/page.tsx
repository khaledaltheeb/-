import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '@/app/admin/content/content-form';
import { deleteSpecialistDraft, submitSpecialistDraft, updateSpecialistDraft } from '../actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'تحرير المحتوى المهني',robots:{index:false,follow:false,noarchive:true}};
type Params=Promise<{id:string}>; type SearchParams=Promise<{ok?:string;error?:string}>;
const STATUS_LABELS:Record<string,string>={draft:'مسودة',scientific_review:'مراجعة علمية',editorial_review:'مراجعة تحريرية',seo_review:'مراجعة SEO',accessibility_review:'مراجعة الإتاحة',approved:'معتمد',scheduled:'مجدول',published:'منشور',archived:'مؤرشف'};

export default async function SpecialistContentEditor({params,searchParams}:{params:Params;searchParams:SearchParams}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims(); const userId=claimsData?.claims?.sub;
  if(!userId) redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||profile.role!=='specialist') redirect('/account');
  const [{data:record},{data:sectors},{data:categories},{data:versions}]=await Promise.all([
    supabase.from('content').select('id,author_id,content_type,slug,title,excerpt,body_json,body_text,sector_id,category_id,audience,search_aliases,seo_title,seo_description,canonical_url,robots_index,robots_follow,status,updated_at,published_at').eq('id',id).eq('author_id',userId).maybeSingle(),
    supabase.from('sectors').select('id,name_ar').eq('is_active',true).order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,name_ar').eq('is_active',true).order('sort_order').order('name_ar'),
    supabase.from('content_versions').select('version,created_at').eq('content_id',id).order('version',{ascending:false}).limit(10),
  ]);
  if(!record) notFound(); const query=await searchParams; const draft=record.status==='draft';
  return <main className="dashboard-shell"><section className="dashboard-card cms-editor">
    <div className="admin-heading"><div><span className="eyebrow">محتوى المختص</span><h1>{record.title}</h1><div className="editor-meta"><span className={`status-badge status-${record.status}`}>{STATUS_LABELS[record.status]??record.status}</span><span>آخر تعديل: {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(record.updated_at))}</span></div></div><div className="dashboard-actions"><Link className="button" href="/specialist/content">محتواي</Link>{record.status==='published'&&<Link className="button" href={`/content/${record.slug}`}>عرض الصفحة</Link>}</div></div>
    {query.ok&&<p className="system-message success">تم تنفيذ العملية بنجاح.</p>}{query.error&&<p className="system-message error">تعذر تنفيذ العملية. لم تُحفظ حالة جزئية.</p>}
    {draft?<>
      <ContentForm action={updateSpecialistDraft} sectors={sectors??[]} categories={categories??[]} record={record} submitLabel="حفظ نسخة جديدة" allowedTypes={['article','guide','resource']} />
      <section className="portal-section specialist-submit-panel"><div className="section-mini-heading"><div><h2>إرسال للمراجعة</h2><span>بعد الإرسال يُقفل التحرير لدى المختص حتى تعيده المراجعة لمسودة.</span></div></div><div className="specialist-content-actions"><form action={submitSpecialistDraft}><input type="hidden" name="id" value={record.id}/><button className="primary-action" type="submit">إرسال للمراجعة العلمية</button></form><form action={deleteSpecialistDraft}><input type="hidden" name="id" value={record.id}/><button className="danger-action" type="submit">حذف المسودة</button></form></div></section>
    </>:<div className="locked-content"><strong>المحتوى خارج مرحلة المسودة.</strong><p>يمكنك متابعة حالته، لكن التعديل متوقف حتى يعيده فريق المراجعة إلى Draft. لا يمكن للمختص تجاوز المراجعة أو نشر المحتوى بنفسه.</p></div>}
    <aside className="version-panel"><div className="section-mini-heading"><h2>سجل النسخ</h2><span>{versions?.length??0} نسخة حديثة</span></div><div className="version-list">{(versions??[]).map((version)=><div key={version.version}><strong>v{version.version}</strong><span>{new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(version.created_at))}</span></div>)}</div></aside>
  </section></main>;
}
