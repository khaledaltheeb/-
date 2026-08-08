import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { reviewProviderDocument } from '../actions';

export const dynamic='force-dynamic';
type Params=Promise<{userId:string}>;type SearchParams=Promise<{ok?:string;error?:string}>;
type DocumentRow={id:string;provider_type:string;document_type:string;object_path:string;file_name:string;mime_type:string;size_bytes:number;review_status:string;review_note:string|null;reviewed_at:string|null;created_at:string};
const TYPE:Record<string,string>={identity:'إثبات الهوية',license:'الترخيص المهني',qualification:'المؤهل العلمي',registration:'تسجيل المنشأة',insurance:'التأمين المهني',other:'مستند آخر'};
const STATUS:Record<string,string>={pending:'بانتظار المراجعة',accepted:'مقبول',rejected:'مرفوض / يحتاج استبدالًا'};
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminVerificationDocumentsPage({params,searchParams}:{params:Params;searchParams:SearchParams}){
 const {userId}=await params;if(!UUID_RE.test(userId))notFound();
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect(`/login?next=${encodeURIComponent(`/admin/verification-documents/${userId}`)}`);
 const {data:admin}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!admin?.is_active||!['owner','admin'].includes(admin.role))redirect('/account');
 const [{data:applicant},{data}]=await Promise.all([
  supabase.from('profiles').select('display_name,role,is_active').eq('id',userId).maybeSingle(),
  supabase.from('provider_verification_documents').select('id,provider_type,document_type,object_path,file_name,mime_type,size_bytes,review_status,review_note,reviewed_at,created_at').eq('user_id',userId).order('created_at',{ascending:false}),
 ]);
 if(!applicant)notFound();const rows:Array<DocumentRow&{signed_url:string|null}>=await Promise.all((Array.isArray(data)?data as DocumentRow[]:[]).map(async doc=>{const {data:signed}=await supabase.storage.from('provider-verification').createSignedUrl(doc.object_path,600);return {...doc,signed_url:signed?.signedUrl??null};}));
 const q=await searchParams;
 return <main className="dashboard-shell specialist-admin-shell"><section className="dashboard-card specialist-admin-card">
  <div className="admin-heading"><div><span className="eyebrow">Private Verification</span><h1>مستندات التوثيق</h1><p>{applicant.display_name||'متقدم'} · المستندات خاصة وتُعرض للمدير عبر روابط مؤقتة فقط. لا تظهر في الملفات العامة أو مكتبة الوسائط.</p></div><div className="dashboard-actions"><Link className="button" href="/admin/specialists">طلبات المختصين</Link><Link className="button" href="/admin/centers">طلبات المراكز</Link><Link className="button" href="/admin">لوحة الإدارة</Link></div></div>
  {q.ok&&<div className="system-message success">تم حفظ مراجعة المستند.</div>}{q.error==='note-required'&&<div className="system-message error">أضف ملاحظة عند رفض المستند.</div>}{q.error==='review-failed'&&<div className="system-message error">تعذر حفظ المراجعة.</div>}
  <div className="verification-list">{rows.map(doc=><article className="verification-card" key={doc.id}><div className="verification-main"><div className="verification-title"><div><span className={`status-badge status-${doc.review_status}`}>{STATUS[doc.review_status]??doc.review_status}</span><h2>{TYPE[doc.document_type]??doc.document_type}</h2><p>{doc.provider_type==='specialist'?'طلب مختص':'طلب مركز'} · {doc.file_name}</p></div>{doc.signed_url&&<a className="button" href={doc.signed_url} target="_blank" rel="noreferrer">فتح المستند الخاص</a>}</div><div className="review-facts"><span><strong>النوع:</strong> {doc.mime_type}</span><span><strong>الحجم:</strong> {(doc.size_bytes/1024/1024).toFixed(2)} MB</span><span><strong>الرفع:</strong> {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(doc.created_at))}</span>{doc.reviewed_at&&<span><strong>آخر مراجعة:</strong> {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(doc.reviewed_at))}</span>}</div>{doc.review_note&&<div className="review-note"><strong>ملاحظة المراجعة</strong><p>{doc.review_note}</p></div>}</div>
   <form className="verification-controls" action={reviewProviderDocument}><input type="hidden" name="id" value={doc.id}/><input type="hidden" name="user_id" value={userId}/><label>قرار المستند<select name="status" defaultValue={doc.review_status}>{Object.entries(STATUS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label className="verification-note-field">ملاحظة<textarea name="review_note" rows={3} maxLength={2000} defaultValue={doc.review_note??''}/></label><button className="primary-action" type="submit">حفظ مراجعة المستند</button></form>
  </article>)}{!rows.length&&<div className="search-state"><h2>لا توجد مستندات</h2><p>لم يرفع المتقدم مستندات توثيق بعد.</p></div>}</div>
 </section></main>;
}
