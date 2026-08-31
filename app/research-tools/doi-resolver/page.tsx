import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/lib/seo';
import { resolveCrossrefDoi } from '@/lib/crossref-discovery';

export function generateMetadata(): Metadata {
  return buildSeoMetadata({
    title: 'فحص DOI والبيانات الببليوغرافية عبر Crossref | روافد',
    description: 'أداة عربية لفحص DOI عبر Crossref وعرض العنوان والناشر والمؤلفين والتاريخ والترخيص والتمويل والتحديثات ومعرفات ORCID وROR عندما تتوفر.',
    path: '/research-tools/doi-resolver/',
    index: true,
    follow: true,
    type: 'website',
    keywords: ['فحص DOI', 'Crossref', 'بيانات ببليوغرافية', 'ORCID', 'ROR', 'الاستشهادات العلمية'],
  });
}

type SearchParams = Promise<{ doi?: string }>;

export default async function DoiResolverPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const doi = (params.doi ?? '').trim();
  let record: Awaited<ReturnType<typeof resolveCrossrefDoi>> = null;
  let error = '';
  if (doi) {
    try {
      record = await resolveCrossrefDoi(doi);
      if (!record) error = 'لم يُعثر على DOI صالح في Crossref.';
    } catch {
      error = 'تعذر الوصول إلى Crossref في هذه المحاولة.';
    }
  }

  return <main dir="rtl" style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1rem',lineHeight:1.9,color:'#13251f'}}>
    <section style={{background:'#eef6fb',border:'1px solid #cedde7',borderRadius:20,padding:'1.5rem'}}>
      <p style={{margin:0,color:'#315d75',fontWeight:700}}>Crossref REST API</p>
      <h1>فحص DOI والبيانات الببليوغرافية</h1>
      <p>أدخل DOI لفحص السجل الذي أودعه الناشر أو المصدر الموثوق في Crossref. الأداة لا تحكم على جودة الدراسة ولا تستبدل التقييم العلمي؛ وظيفتها التحقق من هوية السجل وعلاقاته وبياناته الوصفية.</p>
      <form method="get" style={{display:'flex',gap:'.6rem',flexWrap:'wrap'}}>
        <input name="doi" defaultValue={doi} aria-label="DOI" placeholder="10.xxxx/xxxxx" style={{flex:'1 1 360px',padding:'.8rem',border:'1px solid #9fb7c4',borderRadius:12,fontSize:'1rem'}} />
        <button type="submit" style={{padding:'.8rem 1.2rem',border:0,borderRadius:12,background:'#315d75',color:'#fff',fontWeight:700}}>فحص</button>
      </form>
    </section>

    {error && <section style={{marginTop:'1rem',padding:'1rem',border:'1px solid #e4c7aa',borderRadius:14,background:'#fff7ec'}}><strong>{error}</strong></section>}

    {record && <section style={{marginTop:'1.5rem',border:'1px solid #d8e2df',borderRadius:18,padding:'1.2rem',background:'#fff'}}>
      <h2>{record.title || record.doi}</h2>
      <dl style={{display:'grid',gridTemplateColumns:'max-content 1fr',gap:'.45rem 1rem'}}>
        <dt>DOI</dt><dd><a href={record.resourceUrl} target="_blank" rel="noopener noreferrer">{record.doi}</a></dd>
        {record.type && <><dt>نوع السجل</dt><dd>{record.type}</dd></>}
        {record.publisher && <><dt>الناشر</dt><dd>{record.publisher}</dd></>}
        {record.containerTitle && <><dt>المجلة/الوعاء</dt><dd>{record.containerTitle}</dd></>}
        {record.published && <><dt>تاريخ النشر</dt><dd>{record.published}</dd></>}
        {record.authors.length > 0 && <><dt>المؤلفون</dt><dd>{record.authors.join('، ')}</dd></>}
        {record.issn.length > 0 && <><dt>ISSN</dt><dd>{record.issn.join('، ')}</dd></>}
        {record.isbn.length > 0 && <><dt>ISBN</dt><dd>{record.isbn.join('، ')}</dd></>}
        {record.referencesCount !== undefined && <><dt>المراجع المودعة</dt><dd>{record.referencesCount}</dd></>}
        {record.isReferencedByCount !== undefined && <><dt>عدد الاستشهادات في Crossref</dt><dd>{record.isReferencedByCount}</dd></>}
      </dl>

      {record.licenses.length > 0 && <div><h3>بيانات الترخيص المودعة</h3><ul>{record.licenses.map((url)=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul></div>}
      {record.funders.length > 0 && <div><h3>جهات التمويل</h3><p>{record.funders.join('، ')}</p></div>}
      {record.orcids.length > 0 && <div><h3>ORCID</h3><p>{record.orcids.join('، ')}</p></div>}
      {record.rors.length > 0 && <div><h3>ROR</h3><p>{record.rors.join('، ')}</p></div>}
      {record.updateTo.length > 0 && <div style={{background:'#fff6e6',padding:'1rem',borderRadius:12}}><h3>تحديثات أو علاقات ما بعد النشر</h3><ul>{record.updateTo.map((item,index)=><li key={`${item.doi}-${index}`}>{[item.type,item.label,item.doi].filter(Boolean).join(' — ')}</li>)}</ul></div>}
    </section>}

    <section style={{marginTop:'1.5rem'}}>
      <h2>كيف نستفيد من Crossref داخل روافد؟</h2>
      <ul>
        <li>تثبيت DOI والناشر والعنوان قبل إدراج المرجع.</li>
        <li>اكتشاف بيانات الترخيص والتمويل والمعرفات المؤسسية عندما أودعها الناشر.</li>
        <li>ملاحظة علاقات التصحيح أو التحديث بعد النشر عندما تظهر في metadata.</li>
        <li>ربط الكتب المكتشفة من OAPEN/DOAB بفحص DOI إضافي دون الادعاء أن Crossref مصدر سريري.</li>
      </ul>
      <p><strong>مهم:</strong> وجود DOI أو كثرة الاستشهادات لا يساوي جودة منهجية، ولا يعني أن الدراسة مناسبة لاتخاذ قرار طبي. يجب تقييم نوع الدراسة والمنهج وخطر التحيز والسياق السريري بشكل مستقل.</p>
    </section>

    <section style={{marginTop:'1.5rem',borderTop:'1px solid #d8e2df',paddingTop:'1rem'}}>
      <h2>المصدر التقني</h2>
      <p><a href="https://www.crossref.org/documentation/retrieve-metadata/rest-api/" target="_blank" rel="noopener noreferrer">Crossref REST API documentation</a> · <a href="https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/" target="_blank" rel="noopener noreferrer">Access and authentication</a></p>
      <p>يستخدم روافد تعريفًا واضحًا للعميل و`mailto` وكاشًا للطلبات وفق إرشادات Crossref. هذه أداة مستقلة ولا تعني اعتماد Crossref للموقع أو محتواه.</p>
    </section>
  </main>;
}
