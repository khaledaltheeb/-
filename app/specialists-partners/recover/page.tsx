import type { Metadata } from 'next';
import ForgotPasswordPage from '@/app/forgot-password/page';
export const metadata: Metadata = { title:'استعادة حساب المختص', description:'المسار التاريخي لاستعادة حساب المختص باستخدام آلية إعادة التعيين الحالية.', robots:{index:false,follow:false,noarchive:true} };
export default function LegacySpecialistRecoverPage(){ return <ForgotPasswordPage/>; }
