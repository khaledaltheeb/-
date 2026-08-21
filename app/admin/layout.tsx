import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type AdminNavItem = readonly [href: string, label: string];
type AdminNavGroup = { label: string; items: AdminNavItem[] };
const adminGroups: AdminNavGroup[] = [
 {label:'المحتوى والمعرفة',items:[['/admin','نظرة عامة'],['/admin/content','المحتوى وCMS'],['/admin/media','مكتبة الوسائط'],['/admin/taxonomy','القطاعات والأقسام'],['/admin/tags','الوسوم الدلالية'],['/admin/redirects','الروابط والتحويلات']]},
 {label:'الدليل والمجتمع',items:[['/admin/specialists','المختصون والتوثيق'],['/admin/centers','المراكز والفروع'],['/admin/community','المتدربون والمتطوعون'],['/admin/users','المستخدمون والصلاحيات']]},
 {label:'التشغيل والرقابة',items:[['/admin/appointments','المواعيد'],['/admin/reports','البلاغات'],['/admin/audit','سجل التدقيق'],['/admin/integrity','سلامة المنصة']]},
];
const editorialGroups: AdminNavGroup[] = [
 {label:'مساحة التحرير',items:[['/admin/content','المحتوى وCMS']]},
];
const CONTENT_STAFF = new Set(['editor','scientific_reviewer','seo_manager']);
function isContentPath(pathname: string) { return pathname === '/admin/content' || pathname.startsWith('/admin/content/'); }

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const supabase=await createClient();
 const {data:claimsData}=await supabase.auth.getClaims();
 const userId=claimsData?.claims?.sub;
 if(!userId)redirect('/login?next=/admin');
 const {data:profile}=await supabase.from('profiles').select('display_name,role,is_active').eq('id',userId).single();
 if(!profile?.is_active)redirect('/account');
 const fullAdmin=['owner','admin'].includes(profile.role);
 const editorial=CONTENT_STAFF.has(profile.role);
 if(!fullAdmin&&!editorial)redirect('/account');
 const requestHeaders=await headers();
 const pathname=requestHeaders.get('x-rawafid-pathname')||'/admin';
 if(editorial&&!fullAdmin&&pathname==='/admin')redirect('/admin/content');
 if(editorial&&!fullAdmin&&!isContentPath(pathname))redirect('/account');
 const groups=fullAdmin?adminGroups:editorialGroups;
 const mobileItems:AdminNavItem[]=groups.flatMap((group)=>group.items);
 const roleLabel=profile.role==='owner'?'مالك المنصة':profile.role==='admin'?'مدير المنصة':profile.role==='editor'?'محرر':profile.role==='scientific_reviewer'?'مراجع علمي':'مدير SEO';
 return <div className="admin-app-shell"><aside className="admin-sidebar" aria-label="التنقل الإداري"><div className="admin-sidebar-brand"><Link href={fullAdmin?'/admin':'/admin/content'} aria-label="لوحة منصة روافد"><span>ر</span><div><strong>منصة روافد</strong><small>{fullAdmin?'لوحة الإدارة':'مساحة التحرير'}</small></div></Link></div><div className="admin-sidebar-user"><span>{profile.display_name||'فريق منصة روافد'}</span><small>{roleLabel}</small></div><nav className="admin-sidebar-nav">{groups.map((group)=><section key={group.label}><h2>{group.label}</h2>{group.items.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}</section>)}</nav><div className="admin-sidebar-footer"><Link href="/">عرض الموقع</Link><Link href="/account">حسابي</Link></div></aside><div className="admin-mobile-bar"><Link className="admin-mobile-brand" href={fullAdmin?'/admin':'/admin/content'}><span>ر</span><strong>{fullAdmin?'إدارة منصة روافد':'مساحة تحرير روافد'}</strong></Link><details className="admin-mobile-menu"><summary>القائمة</summary><div>{mobileItems.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}<Link href="/">عرض الموقع</Link><Link href="/account">حسابي</Link></div></details></div><div className="admin-workspace">{children}</div></div>;
}
