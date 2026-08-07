import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveCenter } from './actions';
import { saveCenterLicense } from './license-actions';

export const dynamic='force-dynamic';
type SearchParams=Promise<{id?:string;ok?:string;error?:string}>;
type CenterRow={id:string;slug:string;name:string;description:string|null;logo_url:string|null;cover_url:string|null;email:string|null;phone:string|null;website_url:string|null;country:string|null;region:string|null;city:string|null;address:string|null;latitude:number|null;longitude:number|null;working_hours:unknown;verification:string;verified_at:string|null;is_active:boolean;parent_center_id:string|null;center_type:string;services:string[];languages:string[];offers_remote:boolean;offers_in_person:boolean;show_email:boolean;show_phone:boolean;show_map:boolean;updated_at:string};
type LicenseRow={license_number:string|null;regulatory_authority:string|null;license_expiry_date:string|null};
const STATUS:Record<string,string>={unverified:'غير موثق',pending:'قيد المراجعة',verified:'موثق',rejected:'يحتاج تصحيحًا',suspended:'موقوف'};
const TYPES=[['center','مركز'],['clinic','عيادة'],['hospital','مستشفى'],['rehabilitation_center','مركز تأهيل'],['association','جمعية'],['school','مدرسة/مؤسسة تعليمية'],['other','أخرى']];
function hoursText(v:unknown){if(!v||typeof v!=='object'||Array.isArray(v))return'';return Object.entries(v as Record<string,unknown>).map(([k,val])=>`${k}: ${String(val)}`).join('\n')}

export default async function CenterManagerPage({searchParams}:{searchParams:SearchParams}){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('display_name,role,is_active').eq('id',uid).single();if(!profile?.is_active||profile.role!=='center_manager')redirect('/account');
  const {data,error}=await supabase.rpc('get_my_centers');
  const centers:CenterRow[]=Array.isArray(data)?data as CenterRow[]:[];
  const params=await searchParams;
  const selected=centers.find(c=>c.id===params.id)??null;
  const roots=centers.filter(c=>!c.parent_center_id);
  let license:LicenseRow|null=null;
  if(selected){const {data:licenseData}=await supabase.rpc('get_my_center_license',{p_center_id:selected.id});license=Array.isArray(licenseData)&&licenseData[0]?licenseData[0] as LicenseRow:null;}

  return <main className="dashboard-shell center-portal-shell"><section className="dashboard-card center-portal-card">
    <div className="admin-heading"><div><span className="eyebrow">بوابة المركز</span><h1>{profile.display_name||'إدارة المركز'}</h1><p>إدارة بيانات المركز والفروع والخدمات والخصوصية والترخيص. التغييرات الجوهرية على مركز موثق تعيده تلقائيًا للمراجعة.</p></div><div className="dashboard-actions"><Link className="button" href="/account">حسابي</Link><Link className="button" href="/centers">الدليل العام</Link></div></div>
    {params.ok&&<p className="system-message success">تم حفظ البيانات وتسجيل العملية.</p>}{(params.error||error)&&<p className="system-message error">تعذر حفظ أو تحميل بيانات المركز.</p>}

    <div className="center-portal-layout">
      <aside className="managed-centers"><div className="section-mini-heading"><h2>المراكز والفروع</h2><span>{centers.length}</span></div><Link className={`managed-center-link ${!selected?'active':''}`} href="/center"><strong>+ مركز أو فرع جديد</strong><span>إنشاء ملف جديد</span></Link>{centers.map(c=><Link className={`managed-center-link ${selected?.id===c.id?'active':''}`} href={`/center?id=${c.id}`} key={c.id}><strong>{c.name}</strong><span>{STATUS[c.verification]??c.verification}{c.parent_center_id?' — فرع':''}</span></Link>)}</aside>
      <div className="center-editor">
        <div className="center-editor-head"><div><span className={`status-badge status-${selected?.verification??'pending'}`}>{selected?STATUS[selected.verification]??selected.verification:'ملف جديد'}</span><h2>{selected?.name||'إنشاء مركز جديد'}</h2></div>{selected?.verification==='verified'&&<Link className="button" href={`/centers/${selected.slug}`}>عرض الملف العام</Link>}</div>
        {selected?.verification==='pending'&&<div className="portal-notice"><strong>قيد المراجعة.</strong><span>يمكن تعديل الملف، لكن الإدارة ستراجع أحدث نسخة محفوظة.</span></div>}{selected?.verification==='rejected'&&<div className="portal-notice warning"><strong>يحتاج تصحيحًا.</strong><span>راجع البيانات والخدمات والعنوان والترخيص ثم أعد الحفظ.</span></div>}

        <form action={saveCenter} className="specialist-form">{selected&&<input type="hidden" name="id" value={selected.id}/>}<section className="portal-section"><div className="section-mini-heading"><h3>الهوية والخدمات</h3><span>بيانات التوثيق الأساسية</span></div><div className="cms-grid">
          <label>اسم المركز<input name="name" required minLength={2} maxLength={220} defaultValue={selected?.name??''}/></label><label>Slug<input name="slug" required dir="ltr" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={140} defaultValue={selected?.slug??''}/></label>
          <label>نوع المركز<select name="center_type" defaultValue={selected?.center_type??'center'}>{TYPES.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><label>الفرع الرئيسي<select name="parent_center_id" defaultValue={selected?.parent_center_id??''}><option value="">مركز رئيسي</option>{roots.filter(c=>c.id!==selected?.id).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
          <label className="cms-wide">الخدمات<input name="services" defaultValue={(selected?.services??[]).join(', ')} placeholder="تقييم، علاج نفسي، تأهيل، تدريب..."/></label><label className="cms-wide">اللغات<input name="languages" defaultValue={(selected?.languages??[]).join(', ')} placeholder="العربية، الإنجليزية"/></label>
          <label className="cms-wide">الوصف<textarea name="description" rows={6} maxLength={12000} defaultValue={selected?.description??''}/></label><label>رابط الشعار<input name="logo_url" type="url" dir="ltr" defaultValue={selected?.logo_url??''}/></label><label>رابط الغلاف<input name="cover_url" type="url" dir="ltr" defaultValue={selected?.cover_url??''}/></label>
          <label className="check-field"><input name="offers_remote" type="checkbox" defaultChecked={selected?.offers_remote??false}/> خدمات عن بُعد</label><label className="check-field"><input name="offers_in_person" type="checkbox" defaultChecked={selected?.offers_in_person??true}/> خدمات حضورية</label>
        </div></section>
        <section className="portal-section"><div className="section-mini-heading"><h3>الموقع وساعات العمل</h3><span>للدليل والخريطة</span></div><div className="cms-grid"><label>الدولة<input name="country" defaultValue={selected?.country??''}/></label><label>المنطقة<input name="region" defaultValue={selected?.region??''}/></label><label>المدينة<input name="city" defaultValue={selected?.city??''}/></label><label className="cms-wide">العنوان<input name="address" maxLength={500} defaultValue={selected?.address??''}/></label><label>Latitude<input name="latitude" type="number" step="any" min="-90" max="90" dir="ltr" defaultValue={selected?.latitude??''}/></label><label>Longitude<input name="longitude" type="number" step="any" min="-180" max="180" dir="ltr" defaultValue={selected?.longitude??''}/></label><label className="cms-wide">ساعات العمل — يوم: ساعات<textarea name="working_hours" rows={6} defaultValue={hoursText(selected?.working_hours)} placeholder={'الأحد: 09:00 - 17:00\nالاثنين: 09:00 - 17:00'}/></label></div></section>
        <section className="portal-section"><div className="section-mini-heading"><h3>التواصل والخصوصية</h3><span>تُطبق في قاعدة البيانات</span></div><div className="cms-grid"><label>البريد<input name="email" type="email" defaultValue={selected?.email??''}/></label><label>الهاتف<input name="phone" dir="ltr" defaultValue={selected?.phone??''}/></label><label className="cms-wide">الموقع الإلكتروني<input name="website_url" type="url" dir="ltr" defaultValue={selected?.website_url??''}/></label><label className="check-field"><input name="show_email" type="checkbox" defaultChecked={selected?.show_email??true}/> عرض البريد للعامة</label><label className="check-field"><input name="show_phone" type="checkbox" defaultChecked={selected?.show_phone??true}/> عرض الهاتف للعامة</label><label className="check-field"><input name="show_map" type="checkbox" defaultChecked={selected?.show_map??true}/> عرض الموقع على الخريطة</label></div></section>
        <div className="cms-actions"><button className="primary-action" type="submit">{selected?'حفظ بيانات المركز':'إنشاء المركز'}</button><span>لا توجد كتابة مباشرة إلى جدول centers من المتصفح.</span></div></form>

        {selected&&<form action={saveCenterLicense} className="portal-section center-license-form"><input type="hidden" name="center_id" value={selected.id}/><input type="hidden" name="slug" value={selected.slug}/><div className="section-mini-heading"><div><span className="eyebrow">Licensing & Regulatory Trust</span><h3>الترخيص والجهة التنظيمية</h3></div><span>أي تغيير بعد التوثيق يعيد الملف للمراجعة.</span></div><div className="cms-grid"><label>رقم الترخيص/التسجيل<input name="license_number" dir="ltr" maxLength={200} defaultValue={license?.license_number??''}/></label><label>الجهة التنظيمية<input name="regulatory_authority" maxLength={240} defaultValue={license?.regulatory_authority??''}/></label><label>تاريخ انتهاء الترخيص<input name="license_expiry_date" type="date" defaultValue={license?.license_expiry_date??''}/></label></div><div className="cms-actions"><button className="primary-action" type="submit">حفظ بيانات الترخيص</button><span>تُعرض بيانات الترخيص العامة فقط بعد اعتماد المركز.</span></div></form>}
      </div>
    </div>
  </section></main>
}
