import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type SpecialistQueueRow = { id: string; user_id: string | null; full_name: string; professional_title: string | null; verification: string; updated_at: string };
type CenterQueueRow = { id: string; manager_user_id: string | null; name: string; center_type: string; verification: string; updated_at: string };
type CommunityQueueRow = { id: string; full_name: string; member_type: 'trainee' | 'volunteer'; verification: string; updated_at: string };
type DocumentQueueRow = { id: string; user_id: string; file_name: string; document_type: string; provider_type: string; review_status: string; created_at: string };
type QueueItem = { key: string; kind: string; title: string; detail: string; status: string; timestamp: string; href: string };

const STATUS_LABELS: Record<string, string> = { unverified: 'غير موثق', pending: 'بانتظار المراجعة', rejected: 'بانتظار التصحيح' };
const DOCUMENT_LABELS: Record<string, string> = { identity: 'إثبات هوية', license: 'ترخيص مهني', qualification: 'مؤهل علمي', registration: 'تسجيل منشأة', insurance: 'تأمين مهني', other: 'مستند آخر' };

function date(value: string) {
  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default async function AdminVerificationCenterPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login?next=/admin/verification');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [specialistResult, centerResult, communityResult, documentResult] = await Promise.all([
    supabase.rpc('admin_specialist_queue_v2', { p_limit: 500 }),
    supabase.rpc('admin_center_queue_v2', { p_limit: 500 }),
    supabase.from('community_profiles').select('id,full_name,member_type,verification,updated_at').order('updated_at', { ascending: false }).limit(500),
    supabase.from('provider_verification_documents').select('id,user_id,file_name,document_type,provider_type,review_status,created_at').order('created_at', { ascending: false }).limit(500),
  ]);

  const specialists = (Array.isArray(specialistResult.data) ? specialistResult.data : []) as SpecialistQueueRow[];
  const centers = (Array.isArray(centerResult.data) ? centerResult.data : []) as CenterQueueRow[];
  const community = (Array.isArray(communityResult.data) ? communityResult.data : []) as CommunityQueueRow[];
  const documents = (Array.isArray(documentResult.data) ? documentResult.data : []) as DocumentQueueRow[];
  const waitingSpecialists = specialists.filter((item) => ['pending', 'unverified'].includes(item.verification));
  const waitingCenters = centers.filter((item) => ['pending', 'unverified'].includes(item.verification));
  const waitingCommunity = community.filter((item) => ['pending', 'unverified'].includes(item.verification));
  const waitingDocuments = documents.filter((item) => item.review_status === 'pending');
  const correctionCount = specialists.filter((item) => item.verification === 'rejected').length + centers.filter((item) => item.verification === 'rejected').length + community.filter((item) => item.verification === 'rejected').length + documents.filter((item) => item.review_status === 'rejected').length;

  const queue: QueueItem[] = [
    ...waitingSpecialists.map((item) => ({ key: `specialist-${item.id}`, kind: 'مختص', title: item.full_name, detail: item.professional_title || 'طلب ملف مهني', status: item.verification, timestamp: item.updated_at, href: '/admin/specialists?status=pending' })),
    ...waitingCenters.map((item) => ({ key: `center-${item.id}`, kind: 'مركز', title: item.name, detail: item.center_type || 'طلب منشأة', status: item.verification, timestamp: item.updated_at, href: '/admin/centers?status=pending' })),
    ...waitingCommunity.map((item) => ({ key: `community-${item.id}`, kind: item.member_type === 'trainee' ? 'متدرب' : 'متطوع', title: item.full_name, detail: 'طلب انتساب مجتمعي', status: item.verification, timestamp: item.updated_at, href: '/admin/community?status=pending' })),
    ...waitingDocuments.map((item) => ({ key: `document-${item.id}`, kind: 'مستند خاص', title: item.file_name, detail: `${item.provider_type === 'specialist' ? 'مختص' : 'مركز'} · ${DOCUMENT_LABELS[item.document_type] ?? item.document_type}`, status: item.review_status, timestamp: item.created_at, href: `/admin/verification-documents/${item.user_id}` })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const hasError = specialistResult.error || centerResult.error || communityResult.error || documentResult.error;
  const totalWaiting = waitingSpecialists.length + waitingCenters.length + waitingCommunity.length + waitingDocuments.length;

  return <main className="dashboard-shell"><section className="dashboard-card verification-hub-shell">
    <div className="admin-heading"><div><span className="eyebrow">مركز التحقق المؤسسي</span><h1>كل طلبات الاعتماد في مكان واحد</h1><p>قائمة أولوية موحدة للمختصين والمراكز والمتدربين والمتطوعين والمستندات الخاصة، مع إبقاء كل قرار داخل مساره الآمن والمسجل.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="primary-link" href={queue[0]?.href || '/admin/specialists'}>ابدأ أول مراجعة</Link></div></div>
    {hasError && <p className="system-message error">تعذر تحميل جزء من طوابير التحقق. لم يتم تنفيذ أي تغيير.</p>}

    <div className="verification-hub-stats" aria-label="ملخص طابور التحقق">
      <article className="total"><span>إجمالي ما ينتظر المراجعة</span><strong>{totalWaiting}</strong><small>مرتب من الأحدث إلى الأقدم</small></article>
      <Link href="/admin/specialists?status=pending"><span>المختصون</span><strong>{waitingSpecialists.length}</strong><small>طلبات وملفات مهنية</small></Link>
      <Link href="/admin/centers?status=pending"><span>المراكز</span><strong>{waitingCenters.length}</strong><small>منشآت وفروع</small></Link>
      <Link href="/admin/community?status=pending"><span>المجتمع</span><strong>{waitingCommunity.length}</strong><small>متدربون ومتطوعون</small></Link>
      <article><span>مستندات خاصة</span><strong>{waitingDocuments.length}</strong><small>روابط مؤقتة فقط</small></article>
      <article className="correction"><span>بانتظار التصحيح</span><strong>{correctionCount}</strong><small>لا تُحسب ضمن الطابور النشط</small></article>
    </div>

    <section className="verification-process" aria-labelledby="verification-process-title"><div className="section-mini-heading"><div><span className="eyebrow">منهج قرار موحد</span><h2 id="verification-process-title">أربع نقاط قبل الاعتماد</h2></div><span>القرار والملاحظة والتغييرات محفوظة في سجل التدقيق.</span></div><ol><li><span>1</span><div><strong>مطابقة الهوية</strong><small>الحساب والصفة والجهة المرتبطة</small></div></li><li><span>2</span><div><strong>فحص المؤهلات</strong><small>الترخيص والمستندات وتواريخها</small></div></li><li><span>3</span><div><strong>جودة الملف العام</strong><small>وصف واضح وخدمات وبيانات لازمة</small></div></li><li><span>4</span><div><strong>قرار موثق</strong><small>اعتماد أو طلب تصحيح بملاحظة واضحة</small></div></li></ol></section>

    <section className="verification-priority" aria-labelledby="verification-priority-title"><div className="section-mini-heading"><div><span className="eyebrow">قائمة الأولوية</span><h2 id="verification-priority-title">الطلبات التي تحتاج إجراءً</h2></div><span>{queue.length} عنصرًا</span></div>
      <div className="verification-priority-list">{queue.slice(0, 40).map((item, index) => <Link href={item.href} key={item.key}><span className="queue-order">{String(index + 1).padStart(2, '0')}</span><div><div className="queue-title"><span>{item.kind}</span><strong>{item.title}</strong></div><p>{item.detail}</p></div><div className="queue-meta"><span>{STATUS_LABELS[item.status] ?? 'بانتظار المراجعة'}</span><time dateTime={item.timestamp}>{date(item.timestamp)}</time></div><i aria-hidden="true">←</i></Link>)}{queue.length === 0 && <div className="search-state"><h2>الطابور مكتمل</h2><p>لا توجد طلبات أو مستندات جديدة بانتظار المراجعة الآن.</p></div>}</div>
    </section>
  </section></main>;
}
