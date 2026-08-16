import type { Metadata } from 'next';
import AccountPage from '@/app/account/page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title:'إدارة حساب المختص', description:'المسار التاريخي لإدارة حساب المختص بعد نقله إلى نظام الحساب الحالي.', robots:{index:false,follow:false,noarchive:true} };
type Props = Parameters<typeof AccountPage>[0];
export default function LegacySpecialistAccountPage(props: Props){ return <AccountPage {...props}/>; }
