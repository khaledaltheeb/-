import type { Metadata } from 'next';
import ResetPasswordPage from '@/app/reset-password/page';
export const metadata: Metadata = { title:'تعيين كلمة المرور | قطاع المختصين', description:'صفحة تعيين كلمة مرور جديدة في المسار التاريخي باستخدام نظام الاستعادة الحالي.', robots:{index:false,follow:false,noarchive:true} };
export default function LegacySpecialistPasswordResetPage(){ return <ResetPasswordPage/>; }
