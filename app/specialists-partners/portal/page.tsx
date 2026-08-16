import type { Metadata } from 'next';
import MessagesPage from '@/app/messages/page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title:'بوابة المحادثة الخاصة | قطاع المختصين', description:'المسار التاريخي للمحادثات الخاصة بعد نقله إلى نظام الرسائل الحالي.', robots:{index:false,follow:false,noarchive:true} };
type Props = Parameters<typeof MessagesPage>[0];
export default function LegacySpecialistPortalPage(props: Props){ return <MessagesPage {...props}/>; }
