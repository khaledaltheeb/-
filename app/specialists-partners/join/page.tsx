import type { Metadata } from 'next';
import JoinSpecialistPage from '@/app/join/specialist/page';
export const metadata: Metadata = { title:'الانضمام إلى شبكة المختصين والشراكات المهنية', description:'نموذج الانضمام المهني الحالي داخل المسار التاريخي للمختصين والشركاء، دون تحويل الرابط.', robots:{index:false,follow:true} };
export default function LegacySpecialistJoinPage(){ return <JoinSpecialistPage/>; }
