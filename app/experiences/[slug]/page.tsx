import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';
import { getCommunityPost, getPostComments, getRoomById } from '@/lib/community';
import styles from '../experiences.module.css';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCommunityPost(slug);
  if (!post) return {};
  return buildSeoMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.summary,
    path: `/experiences/${post.slug}/`,
    index: post.seo_indexable,
    follow: true,
    type: 'article',
    keywords: [...(post.topics || []), ...(post.keywords || [])],
  });
}

async function addComment(formData: FormData) {
  'use server';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = String(formData.get('slug') || '');
  if (!user) redirect(`/login?next=/experiences/${slug}/`);
  if (!user.email_confirmed_at) redirect(`/login?error=email-confirmation-required&next=/experiences/${slug}/`);

  const postId = String(formData.get('post_id') || '');
  const body = String(formData.get('body') || '').trim();
  if (body.length < 2 || body.length > 4000) return;

  const { data: comment, error } = await supabase
    .from('community_comments')
    .insert({ post_id: postId, author_id: user.id, body, status: 'published' })
    .select('status')
    .single();

  if (error) throw new Error(error.message);
  if (comment.status === 'pending') redirect(`/experiences/${slug}/?comment=review#discussion`);
  redirect(`/experiences/${slug}/#discussion`);
}

export default async function ExperienceDetail({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const post = await getCommunityPost(slug);
  if (!post) notFound();

  const [room, comments] = await Promise.all([
    getRoomById(post.room_id),
    getPostComments(post.id),
  ]);
  const url = `${SITE_URL}/experiences/${post.slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': `${url}#post`,
    url,
    headline: post.title,
    abstract: post.summary,
    articleBody: post.body,
    inLanguage: 'ar',
    datePublished: post.published_at || undefined,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.comments_count,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.useful_count,
      },
    ],
  };
  const crumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'شاركنا تجربتك', path: '/experiences/' },
    { name: post.title, path: `/experiences/${post.slug}/` },
  ]);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
        <article className={styles.hero}>
          <span className="eyebrow">{room?.title || 'شاركنا تجربتك'}</span>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <div className={styles.actions}>
            <span>{post.useful_count} وجدها مفيدة</span>
            <span>{post.comments_count} تعليق</span>
          </div>
        </article>
        <article className={styles.empty}>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.08rem', lineHeight: 2 }}>{post.body}</p>
          {post.topics.length ? (
            <div>{post.topics.map((topic) => <span key={topic} style={{ marginInlineEnd: 8 }}>#{topic}</span>)}</div>
          ) : null}
        </article>
        <section id="discussion">
          <div className={styles.sectionHead}>
            <span className="eyebrow">النقاش</span>
            <h2>أضف خبرتك إلى التجربة</h2>
          </div>
          {query.comment === 'review' ? (
            <p className="system-message success" role="status">
              استلمنا تعليقك وأُرسل للمراجعة قبل ظهوره للعامة.
            </p>
          ) : null}
          <form action={addComment} className={styles.empty}>
            <input type="hidden" name="post_id" value={post.id} />
            <input type="hidden" name="slug" value={post.slug} />
            <label>
              تعليقك
              <textarea name="body" minLength={2} maxLength={4000} rows={5} required placeholder="أضف تجربة مرتبطة، سؤالاً توضيحياً، أو معلومة تساعد صاحب المنشور والقراء." />
            </label>
            <button className={styles.primary}>إضافة التعليق</button>
          </form>
          <div className={styles.feed}>
            {comments.map((comment) => (
              <article className={styles.post} key={comment.id}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{comment.body}</p>
                <footer>
                  <span>{comment.useful_count} مفيدة</span>
                  <span>{new Date(comment.created_at).toLocaleDateString('ar')}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>
        <aside className={styles.safety}>
          <strong>ملاحظة معرفية</strong>
          <p>هذا محتوى من تجربة مستخدم وليس تشخيصًا أو توصية علاجية. تختلف الاحتياجات والسياقات، ويجب الرجوع إلى مختص مؤهل عند الحاجة إلى تقييم فردي.</p>
          <Link href="/experiences/">العودة إلى المجتمع</Link>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
