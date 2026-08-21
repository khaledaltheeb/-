import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContentForm from '../content-form';
import ReleaseContractForm from '../release-contract-form';
import ScheduleForm from '../schedule-form';
import { restoreVersion, transitionStatus, updateDraft } from '../actions';
import { updateReleaseContract } from '../release-actions';
import { updateSeoAuthority } from '../seo-actions';

export const dynamic = 'force-dynamic';
type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ ok?: string; error?: string }>;
type WorkflowTransition = { target: string; label: string; tone?: string };
const CONTENT_STAFF = new Set(['owner','admin','editor','scientific_reviewer','seo_manager']);
const STATUS_LABELS: Record<string, string> = { draft:'مسودة',scientific_review:'مراجعة علمية اختيارية',editorial_review:'مراجعة تحريرية',seo_review:'مراجعة SEO',accessibility_review:'مراجعة الإتاحة',approved:'معتمد',scheduled:'مجدول',published:'منشور',archived:'مؤرشف' };
const ADMIN_TRANSITIONS: Record<string,WorkflowTransition[]> = {
 draft:[{target:'editorial_review',label:'إرسال للمراجعة التحريرية'}],
 scientific_review:[{target:'draft',label:'إعادة لمسودة',tone:'muted'},{target:'editorial_review',label:'متابعة للمراجعة التحريرية'}],
 editorial_review:[{target:'draft',label:'إعادة لمسودة',tone:'muted'},{target:'seo_review',label:'إرسال لمراجعة SEO'}],
 seo_review:[{target:'editorial_review',label:'إعادة للتحرير',tone:'muted'},{target:'accessibility_review',label:'اجتياز SEO'}],
 accessibility_review:[{target:'editorial_review',label:'إعادة للتحرير',tone:'muted'},{target:'approved',label:'اعتماد الصفحة'}],
 approved:[{target:'editorial_review',label:'إعادة للتحرير',tone:'muted'}],
 scheduled:[{target:'approved',label:'إلغاء الجدولة',tone:'muted'}],
 published:[{target:'archived',label:'أرشفة الصفحة',tone:'danger'}],
 archived:[{target:'draft',label:'إعادة فتح كمسودة',tone:'muted'}],
};
const ROLE_TRANSITIONS: Record<string,Record<string,string[]>> = {
 editor:{draft:['editorial_review'],editorial_review:['draft','seo_review'],accessibility_review:['editorial_review','approved']},
 scientific_reviewer:{scientific_review:['draft','editorial_review']},
 seo_manager:{seo_review:['editorial_review','accessibility_review']},
};
const EDITABLE=new Set(['draft','scientific_review','editorial_review','seo_review','accessibility_review']);
const EDITOR_BODY_STATES=new Set(['draft','editorial_review','accessibility_review']);
function referenceLines(value:unknown){if(!Array.isArray(value))return'';return value.slice(0,100).map((item)=>{if(!item||typeof item!=='object'||Array.isArray(item))return'';const ref=item as Record<string,unknown>;return[ref.title,ref.url,ref.publisher,ref.year,ref.source_type,ref.authority_tier].map((part)=>typeof part==='string'||typeof part==='number'?String(part):'').join(' | ').replace(/(?:\s*\|\s*)+$/,'');}).filter(Boolean).join('\n');}
function dateInput(value:string|null|undefined){if(!value)return'';const date=new Date(value);if(Number.isNaN(date.getTime()))return'';return date.toISOString().slice(0,16);}
function transitionsFor(role:string,status:string){const available=ADMIN_TRANSITIONS[status]??[];if(role==='owner'||role==='admin')return available;const allowed=new Set(ROLE_TRANSITIONS[role]?.[status]??[]);return available.filter((transition)=>allowed.has(transition.target));}

export default async function EditContentPage({params,searchParams}:{params:Params;searchParams:SearchParams}){
 const {id}=await params;
 const supabase=await createClient();
 const {data:claimsData}=await supabase.auth.getClaims();
 const userId=claimsData?.claims?.sub;
 if(!userId)redirect('/login');
 const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
 if(!profile?.is_active||!CONTENT_STAFF.has(profile.role))redirect('/account');
 const fullAdmin=['owner','admin'].includes(profile.role);
 const [{data:record},{data:sectors},{data:categories},{data:versions}]=await Promise.all([
  supabase.from('content').select('id,content_type,slug,title,excerpt,body_json,body_text,schema_json,sector_id,category_id,audience,search_aliases,seo_title,seo_description,canonical_url,robots_index,robots_follow,status,updated_at,published_at,scheduled_at,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,featured_image_url,featured_image_alt').eq('id',id).maybeSingle(),
  supabase.from('sectors').select('id,name_ar').order('sort_order').order('name_ar'),
  supabase.from('categories').select('id,sector_id,name_ar').order('sort_order').order('name_ar'),
  supabase.from('content_versions').select('version,created_at').eq('content_id',id).order('version',{ascending:false}).limit(30),
 ]);
 if(!record)notFound();
 const query=await searchParams;
 const transitions=transitionsFor(profile.role,record.status);
 const editable=EDITABLE.has(record.status);
 const bodyEditable=fullAdmin?editable:profile.role==='editor'&&EDITOR_BODY_STATES.has(record.status);
 const authorityEditable=editable;
 const canRestore=fullAdmin&&!['published','scheduled'].includes(record.status);
 return <main className="dashboard-shell"><section className="dashboard-card cms-editor">
  <div className="admin-heading"><div><span className="eyebrow">Versioned Content</span><h1>{record.title}</h1><div className="editor-meta"><span className={`status-badge status-${record.status}`}>{STATUS_LABELS[record.status]??record.status}</span><span>آخر تعديل: {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(record.updated_at))}</span>{record.scheduled_at&&<span>موعد النشر: {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(record.scheduled_at))}</span>}{record.published_at&&<span>النشر: {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(record.published_at))}</span>}</div></div><div className="dashboard-actions"><Link className="button" href="/admin/content">كل المحتوى</Link>{fullAdmin&&<Link className="button" href={`/admin/content/${record.id}/relations`}>الأقسام والوسوم</Link>}{record.status==='published'&&<Link className="button" href={`/content/${record.slug}`}>عرض الصفحة</Link>}</div></div>
  {query.ok&&<p className="system-message success">تم تنفيذ العملية بنجاح وحفظ التغيير ضمن سجل النسخ عند الحاجة.</p>}{query.error&&<p className="system-message error">فشلت العملية ولم تُعتمد حالة أو نسخة جزئية.</p>}
  <section className="workflow-panel" aria-labelledby="workflow-title"><div><span className="eyebrow">Workflow Gate</span><h2 id="workflow-title">المرحلة الحالية: {STATUS_LABELS[record.status]??record.status}</h2></div><div className="workflow-actions">{transitions.map((transition)=><form action={transitionStatus} key={transition.target}><input type="hidden" name="id" value={record.id}/><input type="hidden" name="slug" value={record.slug}/><input type="hidden" name="target" value={transition.target}/><button className={`workflow-button ${transition.tone??''}`} type="submit">{transition.label}</button></form>)}</div>{fullAdmin&&record.status==='approved'&&<ScheduleForm id={record.id} slug={record.slug}/>}</section>
  {bodyEditable?<ContentForm action={updateDraft} sectors={sectors??[]} categories={categories??[]} record={record} submitLabel="حفظ نسخة جديدة"/>:<div className="locked-content"><strong>نص الصفحة مقفل لهذا الدور أو لهذه المرحلة.</strong><p>{editable?'يمكنك تنفيذ مهام المراجعة المخصصة لدورك أدناه دون تعديل النص الأساسي.':'أعد المحتوى عبر Workflow إلى مرحلة تحرير مخولة قبل تغيير النص.'}</p></div>}
  <section className="seo-authority-panel" aria-labelledby="seo-authority-title"><div className="section-mini-heading"><div><span className="eyebrow">SEO + Sources</span><h2 id="seo-authority-title">الدلالة، المصادر وبيانات الاعتماد</h2></div><span>هذه الحقول تُنسخ Versioned وتغذي Metadata وStructured Data وعقد الإصدار.</span></div>{authorityEditable?<form className="admin-form" action={updateSeoAuthority}><input type="hidden" name="id" value={record.id}/><input type="hidden" name="slug" value={record.slug}/><div className="admin-form-grid seo-authority-grid"><label>الكلمة المفتاحية الأساسية<input name="primary_keyword" defaultValue={record.primary_keyword||''} maxLength={250}/></label><label>نية البحث<select name="search_intent" defaultValue={record.search_intent||''}><option value="">غير محددة</option><option value="informational">Informational</option><option value="transactional">Transactional</option><option value="navigational">Navigational</option><option value="commercial">Commercial</option><option value="local">Local</option></select></label><label className="wide-field">الكلمات الثانوية<input name="secondary_keywords" defaultValue={(record.secondary_keywords||[]).join('، ')} maxLength={4000}/></label><label className="wide-field">المصطلحات الدلالية والمرادفات<input name="semantic_terms" defaultValue={(record.semantic_terms||[]).join('، ')} maxLength={4000}/></label><label>اسم المؤلف الظاهر<input name="author_display_name" defaultValue={record.author_display_name||''} maxLength={200}/></label><label>اسم المراجع — اختياري<input name="reviewer_display_name" defaultValue={record.reviewer_display_name||''} maxLength={200}/></label><label>صفة/مؤهلات المراجع — اختياري<input name="reviewer_credentials" defaultValue={record.reviewer_credentials||''} maxLength={300}/></label><label>تاريخ آخر مراجعة — اختياري<input name="last_reviewed_at" type="datetime-local" defaultValue={dateInput(record.last_reviewed_at)}/></label><label className="wide-field">Alt للصورة البارزة<input name="featured_image_alt" defaultValue={record.featured_image_alt||''} maxLength={500} placeholder="وصف دقيق للصورة دون حشو كلمات مفتاحية"/></label><div className="wide-field locked-content"><strong>إخلاء المسؤولية مركزي وغير قابل للتحرير لكل صفحة.</strong><p>يُثبت عقد V6 تلقائياً الرابط <span dir="ltr">/disclaimer</span> والنص «إخلاء المسؤولية والتنبيهات».</p></div><label className="wide-field seo-reference-field">المصادر والمراجع<textarea name="references" defaultValue={referenceLines(record.references_json)} maxLength={30000} rows={10} placeholder="العنوان | https://example.org/source | الجهة | 2026 | guideline | primary"/><small>مرجع واحد في كل سطر: العنوان | الرابط HTTPS | الجهة | السنة | نوع المصدر | مستوى السلطة. أمثلة النوع: guideline، systematic-review، official-definition. مستوى السلطة: primary / secondary / tertiary.</small></label></div><button className="primary-action" type="submit">حفظ SEO والمصادر كنسخة جديدة</button></form>:<div className="locked-content"><strong>بيانات SEO والمصادر مقفلة في هذه المرحلة.</strong><p>أي تعديل جوهري يمر بإصدار قابل للتحرير حتى يبقى تاريخ المحتوى واضحًا.</p></div>}</section>
  {authorityEditable?<ReleaseContractForm id={record.id} slug={record.slug} schemaJson={record.schema_json} contentType={record.content_type} action={updateReleaseContract}/>:<div className="locked-content"><strong>عقد Release V6 مقفل في هذه المرحلة.</strong><p>يُعدل العقد فقط أثناء المسودة أو مراحل المراجعة قبل الاعتماد.</p></div>}
  <aside className="version-panel" aria-labelledby="versions-title"><div className="section-mini-heading"><h2 id="versions-title">سجل النسخ</h2><span>{versions?.length??0} نسخة حديثة</span></div><p className="version-help">الاستعادة لا تمحو التاريخ. ولا يمكن استعادة نسخة مباشرة فوق محتوى منشور أو مجدول.</p><div className="version-list">{(versions??[]).map((version)=><div key={version.version}><strong>v{version.version}</strong><span>{new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(version.created_at))}</span>{canRestore&&<form action={restoreVersion}><input type="hidden" name="id" value={record.id}/><input type="hidden" name="slug" value={record.slug}/><input type="hidden" name="version" value={version.version}/><button className="button" type="submit">استعادة كمسودة</button></form>}</div>)}</div></aside>
 </section></main>;
}
