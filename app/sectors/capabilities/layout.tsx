import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/seo';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/sectors/capabilities/#collection`,
  url: `${SITE_URL}/sectors/capabilities/`,
  name: 'لنرتقي بقدراتهم',
  description: 'قطاع تطبيقي لاكتشاف القدرات وإزالة حواجز الأداء: أدلة حالات، بروتوكول عملي، منهجية أدلة، أوراق قابلة للطباعة وأفكار قابلة للقياس.',
  inLanguage: 'ar',
  isAccessibleForFree: true,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function CapabilitiesSectorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      {children}
    </>
  );
}
