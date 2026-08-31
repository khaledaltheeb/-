import type { Metadata } from 'next';
import Link from 'next/link';
import { buildSeoMetadata } from '@/lib/seo';
import { lookupDoabPeerReview, OPEN_BOOK_SOURCE_INFO, searchOpenBooks, type OpenBookProvider, type OpenBookRecord } from '@/lib/open-book-discovery';

export function generateMetadata(): Metadata {
  return buildSeoMetadata({
    title: 'اكتشاف الكتب العلمية المفتوحة | OAPEN وDOAB | روافد',
    description: 'بحث عربي موحد في OAPEN وDOAB مع الناشر والترخيص والمعرفات والسجل الأصلي وفحص DOI عبر Crossref ومراجعة الأقران عند توفرها.',
    path: '/open-books/',
    index: true,
    follow: true,
    type: 'website',
    keywords: ['كتب علمية مفتوحة', 'كتب أكاديمية مفتوحة', 'OAPEN', 'DOAB', 'DOI', 'Open Access Books'],
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type SourceChoice = OpenBookProvider | 'both';

const styles = {
  shell: { maxWidth: 1120, margin: '0 auto', padding: '28px 18px 56px', lineHeight: 1.9 } as const,
  hero: { padding: 24, border: '1px solid #d9e2df', borderRadius: 20, background: '#f6fbf9', marginBottom: 18 } as const,
  form: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 180px 120px', gap: 10, marginTop: 16 } as const,
  input: { width: '100%', minHeight: 46, borderRadius: 12, border: '1px solid #b8c8c3', padding: '0 12px', font: 'inherit' } as const,
  button: { minHeight: 46, borderRadius: 12, border: 0, padding: '0 18px', background: '#075d4d', color: 'white', fontWeight: 700, cursor: 'pointer' } as const,
  card: { border: '1px solid #d9e2df', borderRadius: 16, padding: 18, margin: '14px 0', background: 'white' } as const,
  meta: { color: '#51645f', fontSize: '.94rem' } as const,
  badge: { display: 'inline-block', padding: '2px 9px', borderRadius: 999, background: '#e7f4ef', marginInlineEnd: 6, marginBottom: 5, fontSize: '.88rem' } as const,
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function ResultCard({ book, q }: { book: OpenBookRecord; q: string }) {
  return <article style={styles.card}>
    <div><span style={styles.badge}>{book.provider === 'doab' ? 'DOAB' : 'OAPEN'}</span>{book.language && <span style={styles.badge}>{book.language}</span>}{book.issued && <span style={styles.badge}>{book.issued}</span>}</div>
    <h3><a href={book.recordUrl} target="_blank" rel="noopener noreferrer">{book.title}</a></h3>
    {book.subtitle && <p>{book.subtitle}</p>}
    {book.creators.length > 0 && <p><strong>المؤلفون/المحررون:</strong> {book.creators.join('؛ ')}</p>}
    {book.publisher && <p><strong>الناشر:</strong> {book.publisher}</p>}
    {book.license && <p><strong>الترخيص/الحقوق المسجلة:</strong> {book.license}</p>}
    {book.doi && <p><strong>DOI:</strong> <Link href={`/research-tools/doi-resolver/?doi=${encodeURIComponent(book.doi)}`}>{book.doi} — فحص عبر Crossref</Link></p>}
    {book.isbn.length > 0 && <p><strong>ISBN:</strong> {book.isbn.join('، ')}</p>}
    {book.subjects.length > 0 && <p><strong>الموضوعات:</strong> {book.subjects.join('، ')}</p>}
    <p><a href={book.recordUrl} target="_blank" rel="noopener noreferrer"><strong>فتح السجل الأصلي</strong></a>{book.provider === 'doab' && book.doi && <> · <Link href={`/open-books/?q=${encodeURIComponent(q)}&source=doab&peerDoi=${encodeURIComponent(book.doi)}`}>التحقق من مراجعة الأقران في PRISM</Link></>}</p>
  </article>;
}

export default async function OpenBooksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const sourceRaw = one(params.source);
  const source: SourceChoice = sourceRaw === 'oapen' || sourceRaw === 'doab' ? sourceRaw : 'both';
  const peerDoi = one(params.peerDoi).trim();
  let error = '';
  let records: OpenBookRecord[] = [];
  let peerReview: Awaited<ReturnType<typeof lookupDoabPeerReview>> | null = null;

  if (q) {
    try {
      if (source === 'both') {
        const settled = await Promise.allSettled([searchOpenBooks('doab', q, 16), searchOpenBooks('oapen', q, 16)]);
        const fulfilled = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
        const seen = new Set<string>();
        records = fulfilled.filter((book) => {
          const key = book.doi?.toLowerCase() || book.isbn[0]?.replace(/-/g, '') || `${book.title.toLowerCase()}|${book.publisher ?? ''}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 28);
        if (!records.length && settled.every((result) => result.status === 'rejected')) error = 'تعذر الوصول إلى OAPEN وDOAB في هذه المحاولة.';
      } else {
        records = await searchOpenBooks(source, q, 24);
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'تعذر إكمال البحث الآن.';
    }
  }
  if (peerDoi) {
    try {
      peerReview = await lookupDoabPeerReview({ doi: peerDoi });
    } catch {
      peerReview = null;
    }
  }

  return <main dir="rtl" style={styles.shell}>
    <section style={styles.hero}>
      <span style={styles.badge}>OAPEN</span><span style={styles.badge}>DOAB</span><span style={styles.badge}>Crossref</span><span style={styles.badge}>Open Access</span>
      <h1>اكتشاف الكتب العلمية المفتوحة</h1>
      <p>واجهة عربية لاكتشاف الكتب الأكاديمية المفتوحة من OAPEN Library وDirectory of Open Access Books. نحافظ على الناشر والترخيص والمعرفات والمصدر القانوني، ونربط DOI بطبقة Crossref للتحقق من metadata بدل إنشاء قائمة كتب مجهولة المصدر.</p>
      <form method="get" action="/open-books/" style={styles.form}>
        <input name="q" defaultValue={q} aria-label="موضوع أو عنوان أو مؤلف" placeholder="مثال: mental health, autism, social work" style={styles.input} />
        <select name="source" defaultValue={source} aria-label="المصدر" style={styles.input}>
          <option value="both">OAPEN + DOAB</option>
          <option value="doab">DOAB فقط</option>
          <option value="oapen">OAPEN فقط</option>
        </select>
        <button type="submit" style={styles.button}>بحث</button>
      </form>
      <p style={styles.meta}>يمكن البحث بكلمات موضوعية أو عنوان أو اسم مؤلف. لا نعيد استضافة الكتب، ولا نعتبر مجرد وجود كتاب في الفهرس توصية سريرية.</p>
    </section>

    {peerDoi && <section style={styles.card}>
      <h2>تحقق مراجعة الأقران عبر DOAB PRISM</h2>
      {peerReview ? <p>{peerReview.found ? `وجد DOAB/PRISM ${peerReview.rawCount} سجل مراجعة مرتبطًا بالمعرف ${peerDoi}.` : `لم يُرجع DOAB/PRISM سجل مراجعة مطابقًا للمعرف ${peerDoi}.`}</p> : <p>تعذر التحقق من PRISM في هذه المحاولة؛ لا نفترض وجود مراجعة أقران من دون سجل.</p>}
    </section>}

    {error && <section style={styles.card}><h2>تعذر البحث</h2><p>{error}</p><p>يمكن استخدام الروابط الأصلية أدناه مباشرة، ولا يعني تعطل واجهة روافد أن المصدر الخارجي نفسه غير متاح.</p></section>}

    {q && !error && <section>
      <h2>النتائج: {records.length}</h2>
      {records.length === 0 && <p>لم تُرجع الواجهة نتائج لهذا الاستعلام. جرّب مصطلحًا أوسع أو باللغة الإنجليزية لأن فهرسة بعض الكتب قد لا تتضمن كلمات عربية.</p>}
      {records.map((book, index) => <ResultCard key={`${book.provider}-${book.uuid ?? book.handle ?? index}`} book={book} q={q} />)}
    </section>}

    <section style={styles.card}>
      <h2>طبقات التحقق التي نحافظ عليها</h2>
      <ul>
        <li><strong>الناشر والمعرفات:</strong> حتى لا يتحول الكتاب إلى عنوان مجهول المصدر.</li>
        <li><strong>الترخيص:</strong> لأن «مفتوح الوصول» لا يعني تلقائيًا السماح بكل أنواع إعادة الاستخدام.</li>
        <li><strong>السجل الأصلي:</strong> يبقى المرجع القانوني والتقني الأحدث للوصول.</li>
        <li><strong>Crossref:</strong> لفحص DOI والعلاقات والتمويل والترخيص والهوية الببليوغرافية عندما تكون مودعة.</li>
        <li><strong>DOAB PRISM:</strong> للتحقق من بيانات مراجعة الأقران عندما تتوفر، دون استنتاجها من اسم الناشر.</li>
      </ul>
      <p><Link href="/research-tools/doi-resolver/">فتح أداة فحص DOI عبر Crossref ←</Link></p>
    </section>

    <section style={styles.card}>
      <h2>المصادر التقنية الرسمية</h2>
      <ul>
        <li><a href={OPEN_BOOK_SOURCE_INFO.doab.metadata} target="_blank" rel="noopener noreferrer">DOAB — metadata harvesting and dissemination</a></li>
        <li><a href={OPEN_BOOK_SOURCE_INFO.doab.api} target="_blank" rel="noopener noreferrer">DOAB — REST search API</a></li>
        <li><a href={OPEN_BOOK_SOURCE_INFO.oapen.metadata} target="_blank" rel="noopener noreferrer">OAPEN Library — metadata</a></li>
        <li><a href={OPEN_BOOK_SOURCE_INFO.oapen.api} target="_blank" rel="noopener noreferrer">OAPEN Library — REST search API</a></li>
      </ul>
      <p style={styles.meta}>OAPEN Foundation منحتنا في مراسلتها الإذن باستخدام metadata وAPI لكل من OAPEN Library وDOAB. هذه الواجهة تنفيذ مستقل من Health Renewal ولا تعني اعتمادًا أو شراكة أو مراجعة من OAPEN/DOAB أو Crossref.</p>
    </section>
  </main>;
}
