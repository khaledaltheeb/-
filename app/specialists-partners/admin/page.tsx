import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminPage from '@/app/admin/page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'لوحة الإدارة المتقدمة',
  description: 'المسار التاريخي للوحة الإدارة بعد نقله إلى نظام الصلاحيات والإدارة الحالي.',
  robots: { index: false, follow: false, noarchive: true },
};

export default async function LegacySpecialistAdminPage() {
  // Enforce authentication and role authorization at the legacy route boundary so
  // unauthenticated requests cannot receive a streamed 200 before AdminPage redirects.
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    redirect('/login?next=/specialists-partners/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,is_active')
    .eq('id', userId)
    .single();

  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) {
    redirect('/account');
  }

  return <AdminPage />;
}
