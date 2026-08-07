import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('display_name,role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [{ count: contentCount }, { count: specialistsCount }, { count: centersCount }] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact', head: true }),
    supabase.from('specialists').select('id', { count: 'exact', head: true }),
    supabase.from('centers').select('id', { count: 'exact', head: true }),
  ]);

  return <main className="dashboard-shell"><section className="dashboard-card"><span className="eyebrow">صلاحيات كاملة</span><h1>لوحة إدارة روافد</h1><div className="stat-grid"><article><strong>{contentCount ?? 0}</strong><span>المحتوى</span></article><article><strong>{specialistsCount ?? 0}</strong><span>المختصون</span></article><article><strong>{centersCount ?? 0}</strong><span>المراكز</span></article></div><div className="feature-list"><span>إدارة المحتوى</span><span>توثيق المختصين</span><span>إدارة المراكز</span><span>SEO</span><span>الصلاحيات</span><span>Audit Log</span></div></section></main>;
}
