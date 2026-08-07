import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'محتواي المهني',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{ok?:string;error?:string}>;

const STATUS_LABELS:Record<string,string>={draft:'مسودة',scientific_review:'مراجعة علمية',editorial_review:'مراجعة تحريرية',seo_review:'مراجعة SEO',accessibility_review:'مراجعة الإتاحة',approved:'معتمد',scheduled:'مجدول',published:'منشور',archived:'مؤرشف'};

export default async function SpecialistContentPage({searchParams}:{searchParams:SearchParams}){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId) redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||profile.role!=='specialist') redirect('/account');
  const {data:rows}=await supabase.from('content').select('id,title,slug,content_type,status,updated_at,published_at').eq('author_id',userId).order('updated_at',{ascending:false}).limit(100);
  const params=await searchParams;
  const counts=(rows??[]).reduce<Record<string,number>>((acc,row)=>{acc[row.status]=(acc[row.status]??0)+1;return acc;},{});

  return <main className="dashboard-shell"><section className="dashboard-card cms-dashboard">
    <div className="admin-heading"><div><span className="eyebrow">بوابة المختص · المحتوى</span><h1>مقالاتي ومحتواي</h1><p>أنشئ مقالات وأدلة وموارد من محرر روافد المنظم. المسودة تبقى خاصة حتى ترسلها للمراجعة العلمية، ولا يمكن للمختص نشرها مباشرة.</p></div><div className="dashboard-actions"><Link className="button" href="/specialist">بوابة المختص</Link><Link className="primary-link" href="/specialist/content/new">إضافة محتوى</Link></div></div>
    {params.ok==='deleted'&&<p className="system-message success">تم حذف المسودة نهائيًا.</p>}{params.error&&<p className="system-message error">تعذر تنفيذ العملية المطلوبة.</p>}
    <div className="specialist-status-grid"><article><span>مسودات</span><strong>{counts.draft??0}</strong></article><article><span>في المراجعة</span><strong>{(counts.scientific_review??0)+(counts.editorial_review??0)+(counts.seo_review??0)+(counts.accessibility_review??0)}</strong></article><article><span>معتمد</span><strong>{counts.approved??0}</strong></article><article><span>منشور</span><strong>{counts.published??0}</strong></article></div>
    <div className="content-table-wrap"><table className="content-table"><thead><tr><th>العنوان</th><th>النوع</th><th>الحالة</th><th>آخر تعديل</th><th>الإجراء</th></tr></thead><tbody>{(rows??[]).map((row)=><tr key={row.id}><td><strong>{row.title}</strong><small dir="ltr">/{row.slug}</small></td><td>{row.content_type}</td><td><span className={`status-badge status-${row.status}`}>{STATUS_LABELS[row.status]??row.status}</span></td><td>{new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(row.updated_at))}</td><td><Link href={`/specialist/content/${row.id}`}>{row.status==='draft'?'تحرير':'متابعة'}</Link>{row.status==='published'&&<><span> · </span><Link href={`/content/${row.slug}`}>عرض</Link></>}</td></tr>)}{!rows?.length&&<tr><td colSpan={5} className="empty-table">لا يوجد محتوى بعد. ابدأ بمسودة جديدة.</td></tr>}</tbody></table></div>
  </section></main>;
}
