import type { Metadata } from 'next';
import JoinSpecialistPage from '@/app/join/specialist/page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title:'الانضمام إلى شبكة المختصين والشراكات المهنية', description:'نموذج الانضمام المهني الحالي داخل المسار التاريخي للمختصين والشركاء، دون تحويل الرابط.', robots:{index:false,follow:true} };
type Props = Parameters<typeof JoinSpecialistPage>[0];
export default function LegacySpecialistJoinPage(props: Props){ return <JoinSpecialistPage {...props}/>; }
