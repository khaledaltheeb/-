import type { Metadata } from 'next';
import ForgotPasswordPage from '@/app/forgot-password/page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title:'استعادة حساب المختص', description:'المسار التاريخي لاستعادة حساب المختص باستخدام آلية إعادة التعيين الحالية.', robots:{index:false,follow:false,noarchive:true} };
type Props = Parameters<typeof ForgotPasswordPage>[0];
export default function LegacySpecialistRecoverPage(props: Props){ return <ForgotPasswordPage {...props}/>; }
