import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SpecialistDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('display_name,role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['specialist','owner','admin'].includes(profile.role)) redirect('/account');

  return <main className="dashboard-shell"><section className="dashboard-card"><span className="eyebrow">بوابة المختص</span><h1>{profile.display_name || 'المختص'}</h1><p>الوحدة جاهزة لاستقبال الملف المهني والمحتوى والمحادثات والمواعيد بعد استكمال واجهات الإدارة.</p><div className="feature-list"><span>ملفي المهني</span><span>مقالاتي</span><span>مسوداتي</span><span>المراجعات</span><span>المحادثات</span><span>المواعيد</span></div></section></main>;
}
