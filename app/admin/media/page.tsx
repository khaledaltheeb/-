import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { deleteMedia, uploadMedia } from './actions';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'مكتبة الوسائط',robots:{index:false,follow:false,noarchive:true}};
type SearchParams=Promise<{ok?:string;error?:string}>;
type Asset={id:string;object_path:string;file_name:string;mime_type:string;size_bytes:number;alt_text:string;caption:string|null;purpose:string;created_at:string};
const PURPOSE_LABELS:Record<string,string>={content:'داخل المحتوى',featured:'صورة بارزة',profile:'ملف مختص',center:'مركز',community:'متدرب/متطوع',other:'أخرى'};

export default async function AdminMediaPage({searchParams}:{searchParams:SearchParams}){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims(); const userId=claimsData?.claims?.sub;
  if(!userId) redirect('/login?next=/admin/media');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||!['owner','admin'].includes(profile.role)) redirect('/account');
  const {data}=await supabase.from('media_assets').select('id,object_path,file_name,mime_type,size_bytes,alt_text,caption,purpose,created_at').order('created_at',{ascending:false}).limit(100);
  const assets=(data??[]) as Asset[]; const params=await searchParams;

  return <main className="dashboard-shell"><section className="dashboard-card media-admin-card">
    <div className="admin-heading"><div><span className="eyebrow">Media Library</span><h1>مكتبة الوسائط</h1><p>صور المنصة المرفوعة إلى Supabase Storage. Alt Text إلزامي، والصيغ المسموحة JPEG وPNG وWebP وAVIF فقط، بحد أقصى 6MB.</p></div></div>
    {params.ok==='uploaded'&&<p className="system-message success">تم رفع الصورة وتسجيلها في المكتبة.</p>}{params.ok==='deleted'&&<p className="system-message success">تم حذف الصورة من التخزين والمكتبة.</p>}{params.error&&<p className="system-message error">تعذر تنفيذ العملية. تحقق من النوع والحجم والحقول المطلوبة.</p>}

    <section className="portal-section media-upload-panel"><div className="section-mini-heading"><div><h2>رفع صورة جديدة</h2><span>لن يتم قبول صورة بلا نص بديل وصفي.</span></div></div>
      <form action={uploadMedia} className="media-upload-form">
        <label>الصورة<input name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/avif" /></label>
        <label>الغرض<select name="purpose" defaultValue="content"><option value="content">داخل المحتوى</option><option value="featured">صورة بارزة</option><option value="profile">ملف مختص</option><option value="center">مركز</option><option value="community">متدرب/متطوع</option><option value="other">أخرى</option></select></label>
        <label className="media-wide">Alt Text<input name="alt_text" required minLength={3} maxLength={500} placeholder="صف الصورة بدقة للمستخدم وقارئات الشاشة" /></label>
        <label className="media-wide">تعليق/وصف اختياري<textarea name="caption" rows={3} maxLength={1200} /></label>
        <div className="cms-actions media-wide"><button className="primary-action" type="submit">رفع الصورة</button><span>يُحظر SVG والملفات التنفيذية في هذه المكتبة.</span></div>
      </form>
    </section>

    <section className="portal-section"><div className="section-mini-heading"><div><h2>الصور</h2><span>أحدث 100 صورة · {assets.length}</span></div></div>
      {assets.length===0?<div className="rawafid-empty media-empty"><h3>المكتبة فارغة</h3><p>هذا متوقع في مرحلة الثيم الفارغ. ستظهر الصور هنا بعد رفعها من الإدارة.</p></div>:<div className="media-library-grid">{assets.map((asset)=>{
        const {data:publicUrl}=supabase.storage.from('rawafid-media').getPublicUrl(asset.object_path);
        return <article className="media-card" key={asset.id}>
          <div className="media-thumb"><Image src={publicUrl.publicUrl} alt={asset.alt_text} width={640} height={420} sizes="(max-width: 700px) 100vw, 320px" unoptimized /></div>
          <div className="media-card-copy"><span className="media-purpose">{PURPOSE_LABELS[asset.purpose]??asset.purpose}</span><strong>{asset.file_name}</strong><p>{asset.alt_text}</p>{asset.caption&&<small>{asset.caption}</small>}<div className="media-meta"><span>{(asset.size_bytes/1024/1024).toFixed(2)} MB</span><span>{asset.mime_type}</span></div><label className="media-url-label">الرابط العام<input dir="ltr" readOnly value={publicUrl.publicUrl} /></label><form action={deleteMedia}><input type="hidden" name="id" value={asset.id}/><button className="danger-action" type="submit">حذف الصورة</button></form></div>
        </article>;
      })}</div>}
    </section>
  </section></main>;
}
