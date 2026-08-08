import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type AdminNavItem = readonly [href: string, label: string];
type AdminNavGroup = { label: string; items: AdminNavItem[] };
const groups: AdminNavGroup[] = [
 {label:'المحتوى والمعرفة',items:[['/admin','نظرة عامة'],['/admin/content','المحتوى وCMS'],['/admin/media','مكتبة الوسائط'],['/admin/taxonomy','القطاعات والأقسام'],['/admin/tags','الوسوم الدلالية'],['/admin/redirects','الروابط والتحويلات']]},
 {label:'الدليل والمجتمع',items:[['/admin/specialists','المختصون والتوثيق'],['/admin/centers','المراكز والفروع'],['/admin/community','المتدربون والمتطوعون'],['/admin/users','المستخدمون والصلاحيات']]},
 {label:'التشغيل والرقابة',items:[['/admin/appointments','المواعيد'],['/admin/reports','البلاغات'],['/admin/audit','سجل التدقيق'],['/admin/integrity','سلامة المنصة']]},
];
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const supabase=await createClient();const {data:claimsData}=await supabase.auth.getClaims();const userId=claimsData?.claims?.sub;if(!userId)redirect('/login?next=/admin');const {data:profile}=await supabase.from('profiles').select('display_name,role,is_active').eq('id',userId).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');const mobileItems:AdminNavItem[]=groups.flatMap((group)=>group.items);
 return <div className="admin-app-shell"><aside className="admin-sidebar" aria-label="التنقل الإداري"><div className="admin-sidebar-brand"><Link href="/admin" aria-label="لوحة منصة روافد"><span>ر</span><div><strong>منصة روافد</strong><small>لوحة الإدارة</small></div></Link></div><div className="admin-sidebar-user"><span>{profile.display_name||'مدير منصة روافد'}</span><small>{profile.role==='owner'?'مالك المنصة':'مدير المنصة'}</small></div><nav className="admin-sidebar-nav">{groups.map((group)=><section key={group.label}><h2>{group.label}</h2>{group.items.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}</section>)}</nav><div className="admin-sidebar-footer"><Link href="/">عرض الموقع</Link><Link href="/account">حسابي</Link></div></aside><div className="admin-mobile-bar"><Link className="admin-mobile-brand" href="/admin"><span>ر</span><strong>إدارة منصة روافد</strong></Link><details className="admin-mobile-menu"><summary>القائمة</summary><div>{mobileItems.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}<Link href="/">عرض الموقع</Link><Link href="/account">حسابي</Link></div></details></div><div className="admin-workspace">{children}</div></div>;
}
