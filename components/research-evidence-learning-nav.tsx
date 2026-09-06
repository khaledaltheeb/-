import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ROOT = '/sections/research-evidence-learning/';
const ORDER = [
  'basics',
  'read-paper',
  'questions',
  'design',
  'quality',
  'bias',
  'critical-checklist',
  'analysis',
  'interpret-results',
  'certainty',
  'common-errors',
  'compare',
  'example',
  'reporting',
  'advanced',
  'researcher',
  'professional',
  'application',
  'school',
  'family',
] as const;

const LABELS: Record<(typeof ORDER)[number], string> = {
  basics: 'الأساسيات',
  'read-paper': 'كيف تقرأ الدراسة',
  questions: '20 سؤالًا قبل تصديق الادعاء',
  design: 'تصميم دراسة قوية',
  quality: 'الحكم على الجودة',
  bias: 'التحيز ومصادره',
  'critical-checklist': 'قائمة التقييم النقدي',
  analysis: 'التحليل الإحصائي والمنهجي',
  'interpret-results': 'تفسير النتائج',
  certainty: 'درجة الثقة في الاستنتاج',
  'common-errors': 'الأخطاء الشائعة',
  compare: 'المقارنة مع البدائل',
  example: 'مثال تطبيقي مشروح',
  reporting: 'التقرير العلمي والشفافية',
  advanced: 'قراءة متقدمة',
  researcher: 'دليل للباحث',
  professional: 'دليل للمختص',
  application: 'التطبيق في الواقع',
  school: 'التطبيق في المدرسة',
  family: 'ما الذي يعنيه للأسرة',
};

type Suffix = (typeof ORDER)[number];
type Row = { title: string; canonical_url: string | null };

function routeParts(route: string) {
  if (!route.startsWith(ROOT)) return null;
  const leaf = route.slice(ROOT.length).replace(/^\/+|\/+$/g, '');
  if (!leaf) return null;
  for (const suffix of ORDER) {
    const marker = `-${suffix}`;
    if (leaf.endsWith(marker)) {
      const topic = leaf.slice(0, -marker.length);
      if (topic) return { topic, suffix };
    }
  }
  return null;
}

function suffixForCanonical(canonical: string, topic: string): Suffix | null {
  const leaf = canonical.replace(/^.*\/research-evidence-learning\//, '').replace(/^\/+|\/+$/g, '');
  const prefix = `${topic}-`;
  if (!leaf.startsWith(prefix)) return null;
  const suffix = leaf.slice(prefix.length) as Suffix;
  return ORDER.includes(suffix) ? suffix : null;
}

export default async function ResearchEvidenceLearningNav({ route }: { route: string }) {
  const parsed = routeParts(route);
  if (!parsed) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('title,canonical_url')
    .like('canonical_url', `${ROOT}${parsed.topic}-%/`)
    .eq('status', 'published')
    .eq('robots_index', true)
    .eq('robots_follow', true)
    .lte('published_at', new Date().toISOString());
  if (error || !data?.length) return null;

  const bySuffix = new Map<Suffix, Row>();
  for (const row of data as Row[]) {
    if (!row.canonical_url) continue;
    const suffix = suffixForCanonical(row.canonical_url, parsed.topic);
    if (suffix && !bySuffix.has(suffix)) bySuffix.set(suffix, row);
  }

  const currentIndex = ORDER.indexOf(parsed.suffix);
  const previous = currentIndex > 0 ? bySuffix.get(ORDER[currentIndex - 1]) : null;
  const next = currentIndex >= 0 && currentIndex < ORDER.length - 1 ? bySuffix.get(ORDER[currentIndex + 1]) : null;
  const currentRow = bySuffix.get(parsed.suffix);
  const topicLabel = currentRow?.title.includes(':') ? currentRow.title.split(':').slice(1).join(':').trim() : currentRow?.title || parsed.topic.replace(/-/g, ' ');

  return <section className="article-related research-learning-path" aria-labelledby="research-learning-path-title">
    <div className="section-heading">
      <span>مسار تعلم مترابط</span>
      <h2 id="research-learning-path-title">مسار: {topicLabel}</h2>
      <p>هذه الصفحة جزء من مسار من 20 خطوة. انتقل بين الأساسيات، التقييم النقدي، التحليل، التفسير ثم التطبيق بدل قراءة الصفحات كمواد منفصلة.</p>
    </div>

    <div className="public-stat-strip">
      <span>الخطوة {(currentIndex + 1).toLocaleString('ar')} من {ORDER.length.toLocaleString('ar')}</span>
      <span>{bySuffix.size.toLocaleString('ar')} صفحة متاحة في هذا المسار</span>
    </div>

    <nav className="sector-quick-nav" aria-label={`خطوات تعلم ${topicLabel}`}>
      {ORDER.map((suffix, index) => {
        const row = bySuffix.get(suffix);
        if (!row?.canonical_url) return null;
        const current = suffix === parsed.suffix;
        return <Link key={suffix} href={row.canonical_url} aria-current={current ? 'page' : undefined}>
          {`${(index + 1).toLocaleString('ar')}. ${LABELS[suffix]}${current ? ' — أنت هنا' : ''}`}
        </Link>;
      })}
    </nav>

    {(previous || next) ? <div className="article-related">
      <h3>تابع المسار</h3>
      <ul>
        {previous?.canonical_url ? <li><Link href={previous.canonical_url}>السابق: {previous.title}</Link></li> : null}
        {next?.canonical_url ? <li><Link href={next.canonical_url}>التالي: {next.title}</Link></li> : null}
      </ul>
    </div> : null}
  </section>;
}
