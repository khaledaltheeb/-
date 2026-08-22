import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateContentRelations } from '../../relations-actions';

export const dynamic='force-dynamic';
type Params=Promise<{id:string}>;type SearchParams=Promise<{ok?:string;error?:string}>;
const EDITABLE=new Set(['draft','scientific_review','editorial_review','seo_review','accessibility_review']);
export default async function ContentRelationsPage({params,searchParams}:{params:Params;searchParams:SearchParams}){
 const {id}=await params;const query=await searchParams;const supabase=await createClient();
 const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;if(!userId)redirect('/login');
 const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const [{data:record},{data:allTags},{data:selectedCategories},{data:selectedTags}]=await Promise.all([
  supabase.from('content').select('id,title,slug,sector_id,category_id,status,schema_json').eq('id',id).maybeSingle(),
  supabase.from('tags').select('id,name_ar,slug').eq('is_active',true).order('name_ar'),
  supabase.from('content_categories').select('category_id').eq('content_id',id),
  supabase.from('content_tags').select('tag_id').eq('content_id',id),
 ]);if(!record)notFound();
 if(!EDITABLE.has(record.status))redirect(`/admin/content/${record.id}?error=relations-require-editable-revision`);
 const isRevision=record.schema_json&&typeof record.schema_json==='object'&&!Array.isArray(record.schema_json)&&typeof (record.schema_json as Record<string,unknown>).revision_of==='string';
 const {data:categories}=record.sector_id?await supabase.from('categories').select('id,name_ar,parent_id').eq('sector_id',record.sector_id).eq('is_active',true).order('sort_order').order('name_ar'):{data:[]};
 const selectedCategoryIds=new Set((selectedCategories??[]).map((row)=>row.category_id));const selectedTagIds=new Set((selectedTags??[]).map((row)=>row.tag_id));
 return <main className="dashboard-shell"><section className="dashboard-card"><div className="admin-heading"><div><span className="eyebrow">Semantic Relations</span><h1>الأقسام والوسوم — {record.title}</h1><p>{isRevision?'هذه العلاقات تخص النسخة التحريرية فقط، ولا تتغير الصفحة الحية حتى اعتماد الـRevision وتطبيقه.':'القسم الأساسي يبقى من محرر الصفحة، ويمكن ربط الصفحة بأقسام إضافية ووسوم دلالية خلال مرحلة التحرير.'}</p></div><div className="dashboard-actions"><Link className="button" href={`/admin/content/${record.id}`}>العودة للمحرر</Link><Link className="button" href="/admin/tags">إدارة الوسوم</Link></div></div>{query.ok&&<p className="system-message success">تم تحديث العلاقات الدلالية وحفظ نسخة جديدة منها.</p>}{query.error&&<p className="system-message error">تعذر الحفظ. تأكد أن الأقسام تنتمي إلى نفس القطاع وأن المحتوى ما يزال في مرحلة تحرير.</p>}<form className="admin-form" action={updateContentRelations}><input type="hidden" name="id" value={record.id}/><div className="admin-form-grid"><label className="wide-field">أقسام إضافية<select name="category_ids" multiple size={Math.min(12,Math.max(5,(categories??[]).length))} defaultValue={[...selectedCategoryIds]}>{(categories??[]).filter((category)=>category.id!==record.category_id).map((category)=><option value={category.id} key={category.id}>{category.name_ar}</option>)}</select><small>Ctrl/Cmd لاختيار أكثر من قسم. لا يُكرر القسم الأساسي.</small></label><label className="wide-field">الوسوم الدلالية<select name="tag_ids" multiple size={Math.min(14,Math.max(6,(allTags??[]).length))} defaultValue={[...selectedTagIds]}>{(allTags??[]).map((tag)=><option value={tag.id} key={tag.id}>{tag.name_ar} — {tag.slug}</option>)}</select><small>استخدم الوسوم للمفاهيم المشتركة بين القطاعات، وليس بدل القطاع أو القسم.</small></label></div><button className="primary-action" type="submit">حفظ العلاقات كنسخة جديدة</button></form></section></main>;
}
