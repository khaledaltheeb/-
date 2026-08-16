import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import MessagesPage from '@/app/messages/page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'بوابة المحادثة الخاصة | قطاع المختصين',
  description: 'المسار التاريخي للمحادثات الخاصة بعد نقله إلى نظام الرسائل الحالي.',
  robots: { index: false, follow: false, noarchive: true },
};

type Props = Parameters<typeof MessagesPage>[0];

export default async function LegacySpecialistPortalPage(props: Props) {
  // Authenticate before rendering the shared private-messaging component. This keeps
  // the preserved historical URL private at the HTTP boundary as well as in-app.
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) {
    redirect('/login?next=/specialists-partners/portal');
  }

  return <MessagesPage {...props} />;
}
