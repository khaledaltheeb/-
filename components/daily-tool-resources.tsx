import Link from 'next/link';
import type { LegacyPreservedPage } from '@/lib/legacy-preserved-page';
import { getDailyToolReferences, getDailyToolRelatedLinks } from '@/lib/daily-tools-catalog';

type Props = {
  page: LegacyPreservedPage;
  route: string;
};

export default function DailyToolResources({ page, route }: Props) {
  const related = getDailyToolRelatedLinks(page, route);
  const references = getDailyToolReferences(page);
  if (!related.length && !references.length) return null;

  return <div className="daily-tool-resources">
    {related.length ? <section className="article-related" aria-labelledby="daily-tool-related-title">
      <h2 id="daily-tool-related-title">أدوات ومسارات مرتبطة</h2>
      <p>روابط داخلية محفوظة من بنية الأداة الأصلية، ومطابقة الآن لمسارات روافد الحالية.</p>
      <ul>
        {related.map((item) => <li key={item.href}><Link href={item.href}>{item.title}</Link></li>)}
      </ul>
    </section> : null}

    {references.length ? <section className="article-references" aria-labelledby="daily-tool-references-title">
      <h2 id="daily-tool-references-title">المصادر والمراجع</h2>
      <p>المراجع التي كانت مرتبطة بالأداة في النسخة المصدرية، محفوظة للمراجعة والتتبع العلمي.</p>
      <ol>
        {references.map((reference) => <li key={reference.url}>
          <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}</a>
          {reference.publisher ? <small>{reference.publisher}</small> : null}
          {reference.year ? <small>{reference.year}</small> : null}
        </li>)}
      </ol>
    </section> : null}
  </div>;
}
