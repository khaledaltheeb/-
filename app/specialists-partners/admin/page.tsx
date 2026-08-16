import type { Metadata } from 'next';
import AdminPage from '@/app/admin/page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title:'لوحة الإدارة المتقدمة', description:'المسار التاريخي للوحة الإدارة بعد نقله إلى نظام الصلاحيات والإدارة الحالي.', robots:{index:false,follow:false,noarchive:true} };
export default function LegacySpecialistAdminPage(){ return <AdminPage/>; }
