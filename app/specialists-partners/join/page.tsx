import type { Metadata } from 'next';
import JoinSpecialistPage from '@/app/join/specialist/page';
import { buildSeoMetadata } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({ title:'الانضمام إلى شبكة المختصين والشراكات المهنية', description:'نموذج الانضمام المهني الحالي داخل المسار التاريخي للمختصين والشركاء، دون تحويل الرابط.', path:'/specialists-partners/join/', index:true, follow:true, type:'website', keywords:['الانضمام إلى روافد','شبكة المختصين','الشراكات المهنية'] });
type Props = Parameters<typeof JoinSpecialistPage>[0];
export default function LegacySpecialistJoinPage(props: Props){ return <JoinSpecialistPage {...props}/>; }
