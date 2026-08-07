import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateContentRelations } from '../../relations-actions';

export const dynamic='force-dynamic';
type Params=Promise<{id:string}>;type SearchParams=Promise<{ok?:string;error?:string}>;
export default async function ContentRelationsPage({params,searchParams}:{params:Params;searchParams:SearchParams}){
 const {id}=await params;const query=await searchParams;const supabase=await createClient();
 const [{data:record},{data:allTags},{data:selectedCategories},{data:selectedTags}]=await Promise.all([
  supabase.from('content').select('id,title,slug,sector_id,category_id').eq('id',id).maybeSingle(),
  supabase.from('tags').select('id,name_ar,slug').eq('is_active',true).order('name_ar'),
  supabase.from('content_categories').select('category_id').eq('content_id',id),
  supabase.from('content_tags').select('tag_id').eq('content_id',id),
 ]);if(!record)notFound();
 const {data:categories}=record.sector_id?await supabase.from('categories').select('id,name_ar,parent_id').eq('sector_id',record.sector_id).eq('is_active',true).order('sort_order').order('name_ar'):{data:[]};
 const selectedCategoryIds=new Set((selectedCategories??[]).map((row)=>row.category_id));const selectedTagIds=new Set((selectedTags??[]).map((row)=>row.tag_id));
 return <main className="dashboard-shell"><section className="dashboard-card"><div className="admin-heading"><div><span className="eyebrow">Semantic Relations</span><h1>الأقسام والوسوم — {record.title}</h1><p>القسم الأساسي يبقى من محرر الصفحة، ويمكن ربط الصفحة بأقسام إضافية ووسوم دلالية لتقوية الترابط دون نسخ المحتوى.</p></div><div className="dashboard-actions"><Link className="button" href={`/admin/content/${record.id}`}>العودة للمحرر</Link><Link className="button" href="/admin/tags">إدارة الوسوم</Link></div></div>{query.ok&&<p className="system-message success">تم تحديث العلاقات الدلالية.</p>}{query.error&&<p className="system-message error">تعذر الحفظ. تأكد أن الأقسام تنتمي إلى نفس القطاع.</p>}<form className="admin-form" action={updateContentRelations}><input type="hidden" name="id" value={record.id}/><div className="admin-form-grid"><label className="wide-field">أقسام إضافية<select name="category_ids" multiple size={Math.min(12,Math.max(5,(categories??[]).length))} defaultValue={[...selectedCategoryIds]}>{(categories??[]).filter((category)=>category.id!==record.category_id).map((category)=><option value={category.id} key={category.id}>{category.name_ar}</option>)}</select><small>Ctrl/Cmd لاختيار أكثر من قسم. لا يُكرر القسم الأساسي.</small></label><label className="wide-field">الوسوم الدلالية<select name="tag_ids" multiple size={Math.min(14,Math.max(6,(allTags??[]).length))} defaultValue={[...selectedTagIds]}>{(allTags??[]).map((tag)=><option value={tag.id} key={tag.id}>{tag.name_ar} — {tag.slug}</option>)}</select><small>استخدم الوسوم للمفاهيم المشتركة بين القطاعات، وليس بدل القطاع أو القسم.</small></label></div><button className="primary-action" type="submit">حفظ العلاقات</button></form></section></main>;
}
