import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AccountPage from '@/app/account/page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'إدارة حساب المختص',
  description: 'المسار التاريخي لإدارة حساب المختص بعد نقله إلى نظام الحساب الحالي.',
  robots: { index: false, follow: false, noarchive: true },
};

type Props = Parameters<typeof AccountPage>[0];

export default async function LegacySpecialistAccountPage(props: Props) {
  // Authenticate at the legacy route boundary before rendering the shared account
  // component. Relying only on the nested component redirect can produce a streamed
  // HTTP 200 response instead of an explicit login redirect.
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) {
    redirect('/login?next=/specialists-partners/account');
  }

  return <AccountPage {...props} />;
}
