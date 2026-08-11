import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { getCommunityRooms } from '@/lib/community';
import styles from '../experiences.module.css';

const POST_TYPES = new Set(['experience', 'question', 'tip', 'warning', 'resource']);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, '')
    .replace(/[\u0600-\u06ff]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 55) || `experience-${Date.now().toString(36)}`;
}

async function publishExperience(formData: FormData) {
  'use server';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/experiences/new/');
  if (!user.email_confirmed_at) redirect('/login?error=email-confirmation-required&next=/experiences/new/');

  const title = String(formData.get('title') || '').trim();
  const summary = String(formData.get('summary') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const roomId = String(formData.get('room_id') || '');
  const requestedPostType = String(formData.get('post_type') || 'experience');
  const postType = POST_TYPES.has(requestedPostType) ? requestedPostType : 'experience';
  const topics = String(formData.get('topics') || '')
    .split(/[،,]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 5);
  const keywords = String(formData.get('keywords') || '')
    .split(/[،,]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 8);

  const { data: room, error: roomError } = await supabase
    .from('community_rooms')
    .select('id,moderation_mode')
    .eq('id', roomId)
    .eq('status', 'active')
    .maybeSingle();

  if (roomError || !room) redirect('/experiences/new/?error=invalid-room');

  const status = room.moderation_mode === 'pre_publish' ? 'pending' : 'published';
  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: post, error } = await supabase
    .from('community_posts')
    .insert({
      room_id: roomId,
      author_id: user.id,
      slug,
      post_type: postType,
      title,
      summary,
      body,
      topics,
      keywords,
      status,
      moderation_state: status === 'pending' ? 'needs_review' : 'clean',
    })
    .select('slug,status')
    .single();

  if (error) throw new Error(error.message);
  if (post.status === 'pending') redirect('/experiences/?submitted=review');
  redirect(`/experiences/${post.slug}/`);
}

export default async function NewExperiencePage() {
  const supabase = await createClient();
  const [{ data: { user } }, rooms] = await Promise.all([
    supabase.auth.getUser(),
    getCommunityRooms(),
  ]);

  if (!user) redirect('/login?next=/experiences/new/');
  if (!user.email_confirmed_at) redirect('/login?error=email-confirmation-required&next=/experiences/new/');

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero}>
          <span className="eyebrow">محرر التجربة الموجّه</span>
          <h1>حوّل تجربتك إلى معرفة قابلة للعثور عليها</h1>
          <p>لا تحتاج إلى معرفة SEO. اكتب بلغة طبيعية، والحقول القصيرة تساعد النظام على فهم التجربة وتصنيفها وبناء بيانات الصفحة.</p>
        </section>
        <form action={publishExperience} className={styles.empty}>
          <label>
            نوع المشاركة
            <select name="post_type" required>
              <option value="experience">تجربة</option>
              <option value="question">سؤال</option>
              <option value="tip">نصيحة</option>
              <option value="warning">احتياط أو تنبيه</option>
              <option value="resource">مورد مفيد</option>
            </select>
          </label>
          <label>
            الغرفة
            <select name="room_id" required>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.title}</option>)}
            </select>
          </label>
          <label>
            عنوان واضح
            <input name="title" minLength={20} maxLength={120} required placeholder="مثال: ما تعلمناه عند انتقال طفلنا إلى صف دامج لأول مرة" />
          </label>
          <small>20–120 حرفًا. اكتب ما حدث، لا كلمات بحث.</small>
          <label>
            الخلاصة
            <textarea name="summary" minLength={60} maxLength={280} required rows={3} placeholder="ما المشكلة أو الموقف؟ وما أهم شيء تعلمته؟" />
          </label>
          <label>
            التجربة بالتفصيل
            <textarea name="body" minLength={200} maxLength={20000} required rows={14} placeholder="صف السياق، ما الذي جربتموه، ما الذي ساعد، ما الذي لم يساعد، وما الذي تتمنى لو عرفته قبل التجربة." />
          </label>
          <label>
            الموضوعات الرئيسية
            <input name="topics" maxLength={220} required placeholder="الدمج المدرسي، التهيئة، التواصل مع المدرسة" />
          </label>
          <small>حتى 5 موضوعات، افصل بينها بفاصلة.</small>
          <label>
            كلمات تصف التجربة <span>(اختياري)</span>
            <input name="keywords" maxLength={260} placeholder="الانتقال المدرسي، الخطة الفردية، التكيفات" />
          </label>
          <aside className={styles.safety}>
            <strong>فحص الخصوصية قبل الإرسال</strong>
            <p>لا تذكر الاسم الكامل للطفل، رقم الهاتف، العنوان، رقم الملف، أو أي معلومة تكشف هوية شخص آخر. لا تقدّم تجربة شخصية بصيغة تشخيص أو علاج ملزم. الغرف الحساسة ترسل المشاركة للمراجعة قبل إظهارها للعامة.</p>
          </aside>
          <button className={styles.primary} type="submit">إرسال التجربة</button>
          <Link href="/experiences/">إلغاء والعودة</Link>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
