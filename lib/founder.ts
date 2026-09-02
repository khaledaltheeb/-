export const FOUNDER_NAME_AR = 'خالد الذيب';
export const FOUNDER_NAME_EN = 'Khaled altheeb';
export const FOUNDER_DISPLAY_NAME = `${FOUNDER_NAME_AR} — ${FOUNDER_NAME_EN}`;
export const FOUNDER_GITHUB_URL = 'https://github.com/khaledaltheeb';

export function founderJsonLd(siteUrl: string) {
  const founderId = `${siteUrl}/#founder`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': founderId,
        name: FOUNDER_NAME_AR,
        alternateName: FOUNDER_NAME_EN,
        url: `${siteUrl}/press#founder`,
        sameAs: [FOUNDER_GITHUB_URL],
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        founder: { '@id': founderId },
      },
    ],
  };
}
