'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type DocumentRow = {
  id: string;
  document_type: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  review_status: string;
  review_note: string | null;
  created_at: string;
  signed_url: string | null;
};

type Props = { userId: string; providerType: 'specialist' | 'center'; editable: boolean; documents: DocumentRow[] };
const LABELS: Record<string, string> = { identity: 'إثبات الهوية', license: 'الترخيص المهني', qualification: 'المؤهل العلمي', registration: 'تسجيل المنشأة', insurance: 'التأمين المهني', other: 'مستند آخر' };
const STATUS: Record<string, string> = { pending: 'بانتظار المراجعة', accepted: 'مقبول', rejected: 'مرفوض / يحتاج استبدالًا' };
const EXT: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_SIZE = 10 * 1024 * 1024;

export default function ProviderDocumentManager({ userId, providerType, editable, documents }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(formData: FormData) {
    setMessage(null);
    const file = fileRef.current?.files?.[0];
    const documentType = String(formData.get('document_type') ?? '');
    if (!file || !EXT[file.type] || file.size <= 0 || file.size > MAX_SIZE) {
      setMessage('اختر PDF أو صورة JPG/PNG/WebP بحجم لا يتجاوز 10MB.');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const objectPath = `${userId}/${providerType}/${crypto.randomUUID()}.${EXT[file.type]}`;
    const { error: uploadError } = await supabase.storage.from('provider-verification').upload(objectPath, file, { contentType: file.type, cacheControl: '3600', upsert: false });
    if (uploadError) {
      setMessage('تعذر رفع المستند الخاص. أعد المحاولة.');
      setBusy(false);
      return;
    }
    const { error: registerError } = await supabase.rpc('register_provider_verification_document', {
      p_provider_type: providerType,
      p_document_type: documentType,
      p_object_path: objectPath,
      p_file_name: file.name.slice(0, 300),
      p_mime_type: file.type,
      p_size_bytes: file.size,
    });
    if (registerError) {
      await supabase.storage.from('provider-verification').remove([objectPath]);
      setMessage('تم رفض تسجيل المستند. تحقق من حالة طلب الانضمام ثم أعد المحاولة.');
      setBusy(false);
      return;
    }
    if (fileRef.current) fileRef.current.value = '';
    setMessage('تم رفع المستند وحفظه بصورة خاصة للمراجعة.');
    setBusy(false);
    router.refresh();
  }

  async function removeDocument(id: string) {
    if (!editable || busy) return;
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const { data: objectPath, error } = await supabase.rpc('delete_provider_verification_document', { p_id: id });
    if (error || typeof objectPath !== 'string') {
      setMessage('تعذر حذف المستند. المستند المقبول يُقفل للحفاظ على سجل التوثيق.');
      setBusy(false);
      return;
    }
    const { error: storageError } = await supabase.storage.from('provider-verification').remove([objectPath]);
    setMessage(storageError ? 'حُذفت بيانات المستند لكن تعذر تنظيف الملف؛ سيظهر للمسؤول في سجل التدقيق.' : 'تم حذف المستند.');
    setBusy(false);
    router.refresh();
  }

  return <div className="verification-doc-manager">
    {message && <div className="system-message" role="status">{message}</div>}
    {editable && <form className="verification-upload-form" action={upload}>
      <label>نوع المستند<select name="document_type" required defaultValue="license"><option value="license">الترخيص المهني</option><option value="qualification">المؤهل العلمي</option><option value="identity">إثبات الهوية</option>{providerType === 'center' && <option value="registration">تسجيل المنشأة</option>}<option value="insurance">التأمين المهني</option><option value="other">مستند آخر</option></select></label>
      <label>الملف<input ref={fileRef} name="file" type="file" required accept="application/pdf,image/jpeg,image/png,image/webp" /></label>
      <button className="primary-action" type="submit" disabled={busy}>{busy ? 'جارٍ الرفع…' : 'رفع مستند خاص'}</button>
      <small>المستندات خاصة ولا تُنشر في الملف العام. الحد الأقصى 10MB.</small>
    </form>}
    <div className="verification-document-list">
      {documents.map((doc) => <article className="verification-document-card" key={doc.id}>
        <div><span className={`status-badge status-${doc.review_status}`}>{STATUS[doc.review_status] ?? doc.review_status}</span><h3>{LABELS[doc.document_type] ?? doc.document_type}</h3><p dir="auto">{doc.file_name}</p><small>{(doc.size_bytes / 1024 / 1024).toFixed(2)} MB · {new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(doc.created_at))}</small>{doc.review_note && <p className="review-note-inline">ملاحظة المراجع: {doc.review_note}</p>}</div>
        <div className="join-inline-actions">{doc.signed_url && <a className="button" href={doc.signed_url} target="_blank" rel="noreferrer">فتح المستند</a>}{editable && doc.review_status !== 'accepted' && <button className="button danger-button" type="button" onClick={() => removeDocument(doc.id)} disabled={busy}>حذف</button>}</div>
      </article>)}
      {!documents.length && <div className="search-state"><h3>لا توجد مستندات مرفوعة</h3><p>ارفع الوثائق التي تساعد فريق منصة روافد على التحقق من بيانات الطلب.</p></div>}
    </div>
  </div>;
}
