import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProviderDocumentManager from '@/components/provider-document-manager';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'مستندات التوثيق', robots: { index: false, follow: false, noarchive: true, nosnippet: true } };
type ProviderType = 'specialist' | 'center';
type DocumentRow = { id:string; document_type:string; object_path:string; file_name:string; mime_type:string; size_bytes:number; review_status:string; review_note:string|null; created_at:string };

export default async function VerificationDocumentsPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect('/login?next=/account/verification-documents');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active) redirect('/account');

  let providerType: ProviderType | null = profile.role === 'specialist' ? 'specialist' : profile.role === 'center_manager' ? 'center' : null;
  let verification = profile.role === 'specialist' || profile.role === 'center_manager' ? 'verified' : '';
  if (profile.role === 'user') {
    const [{ data: specialist }, { data: center }] = await Promise.all([
      supabase.rpc('get_my_specialist_application'),
      supabase.rpc('get_my_center_application'),
    ]);
    const specialistApp = Array.isArray(specialist) ? specialist[0] : null;
    const centerApp = Array.isArray(center) ? center[0] : null;
    if (specialistApp) { providerType = 'specialist'; verification = String(specialistApp.verification ?? 'pending'); }
    else if (centerApp) { providerType = 'center'; verification = String(centerApp.verification ?? 'pending'); }
  }
  if (!providerType) redirect('/join');

  const { data } = await supabase.from('provider_verification_documents').select('id,document_type,object_path,file_name,mime_type,size_bytes,review_status,review_note,created_at').eq('user_id', userId).eq('provider_type', providerType).order('created_at', { ascending: false });
  const baseRows: DocumentRow[] = Array.isArray(data) ? data as DocumentRow[] : [];
  const documents = await Promise.all(baseRows.map(async (doc) => {
    const { data: signed } = await supabase.storage.from('provider-verification').createSignedUrl(doc.object_path, 600);
    return { ...doc, signed_url: signed?.signedUrl ?? null };
  }));
  const editable = profile.role === 'user' && ['unverified','pending','rejected'].includes(verification);
  const applicationHref = providerType === 'specialist' ? '/join/specialist' : '/join/center';

  return <><SiteHeader/><main className="dashboard-shell account-shell"><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/account">حسابي</Link><span>/</span><span aria-current="page">مستندات التوثيق</span></nav><nav className="account-local-nav" aria-label="خدمات الحساب"><Link href="/account">حسابي</Link><Link href={applicationHref}>طلب الانضمام</Link><Link className="active" href="/account/verification-documents" aria-current="page">مستندات التوثيق</Link><Link href="/account/security">أمان الحساب</Link></nav><section className="dashboard-card account-card">
    <div className="admin-heading"><div><span className="eyebrow">توثيق خاص</span><h1>مستندات {providerType === 'specialist' ? 'المختص' : 'المركز'}</h1><p>مساحة خاصة لرفع الوثائق التي يحتاجها فريق منصة روافد للتحقق من المؤهلات والترخيص والهوية أو تسجيل المنشأة. هذه الملفات لا تُنشر في الدليل العام.</p></div><div className="dashboard-actions"><Link className="button" href="/account">حسابي</Link><Link className="button" href={applicationHref}>طلب الانضمام</Link></div></div>
    {!editable && <div className="portal-notice"><strong>الرفع مقفل في هذه المرحلة.</strong><span>يمكنك مراجعة المستندات المحفوظة، لكن التعديل يتوقف بعد الاعتماد أو انتقال الحساب إلى البوابة المهنية.</span></div>}
    <section className="account-section"><div className="section-mini-heading"><h2>الوثائق</h2><span>تخزين خاص · روابط عرض مؤقتة فقط</span></div><ProviderDocumentManager userId={userId} providerType={providerType} editable={editable} documents={documents} /></section>
  </section></main><SiteFooter/></>;
}
