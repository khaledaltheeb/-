type DirectEmailSource = {
  id: string;
  organization: string;
  title: string;
  href: string;
  origin: 'direct_email' | 'discovered_within_direct_email_resource';
  received: string;
  use: string;
};

const SOURCES: Record<string, DirectEmailSource> = {
  sloveniaEthics: {
    id: 'slovenia-pisrs-drug4023',
    organization: 'Slovenian Association of Social Workers / Social Chamber of Slovenia',
    title: 'Kodeks etičnih načel v socialnem varstvu — PISRS DRUG4023',
    href: 'https://pisrs.si/pregledPredpisa?id=DRUG4023',
    origin: 'direct_email',
    received: '2026-08-30 · Hostinger INBOX UID 391',
    use: 'الكرامة، الاستقلال، المشاركة، السرية، المسؤولية المهنية وحدود السلطة ضمن السياق السلوفيني.'
  },
  sloveniaFamilies: {
    id: 'slovenia-ljubljana-2016091213042605',
    organization: 'Slovenian Association of Social Workers / University of Ljubljana',
    title: 'Families with Multiple Challenges: Co-creating Support in the Community',
    href: 'https://www.fsd.uni-lj.si/mma/-/2016091213042605/',
    origin: 'direct_email',
    received: '2026-08-30 · Hostinger INBOX UID 406',
    use: 'مشروع المساعدة التشاركي، النتائج المرغوبة، موارد الأسرة والمجتمع، التشارك والخبرة المعاشة.'
  },
  talentiaGuide: {
    id: 'talentia-work-values-ethics',
    organization: 'Talentia — Finland',
    title: 'Work, Values and Ethics — Ethical Guidelines for Social Welfare Professionals',
    href: 'https://talentia.lukusali.fi/index.html#/reader/c5aa171b-223d-43b7-9778-05a0d8cede8e',
    origin: 'direct_email',
    received: '2026-08-31 · Hostinger INBOX UID 436',
    use: 'الكرامة والعدالة الاجتماعية وحقوق المستفيد وتقرير المصير والمسؤولية المهنية واتخاذ القرار الأخلاقي. Talentia سمحت صراحة بالاقتباس والربط مع النسب الكامل.'
  },
  avenirDe: {
    id: 'avenirsocial-code-2026-de',
    organization: 'AvenirSocial — Switzerland',
    title: 'Berufskodex Soziale Arbeit Schweiz 2026',
    href: 'https://avenirsocial.ch/app/uploads/2025/12/berufskodex_de_2026-07.pdf',
    origin: 'direct_email',
    received: '2026-09-01 · Hostinger INBOX UID 505',
    use: 'الأخلاقيات المهنية والهوية والمسؤولية وعلاقات القوة والمناصرة المهنية ضمن السياق السويسري.'
  },
  avenirFr: {
    id: 'avenirsocial-code-2026-fr',
    organization: 'AvenirSocial — Switzerland',
    title: 'Code de déontologie du travail social en Suisse 2026',
    href: 'https://avenirsocial.ch/app/uploads/2025/12/code_de_deontologie_fr_2026-07.pdf',
    origin: 'direct_email',
    received: '2026-09-01 · Hostinger INBOX UID 505',
    use: 'نسخة فرنسية رسمية موازية للتحقق الاصطلاحي والمقارنة الأخلاقية؛ لا تُعامل كقانون خارج سويسرا.'
  },
  lithuaniaCode: {
    id: 'lithuania-etar-a1-448',
    organization: 'Lithuanian Association of Social Workers / e-TAR',
    title: 'Lithuanian social-services ethics document — Order A1-448',
    href: 'https://www.e-tar.lt/portal/lt/legalAct/f596df101af111eeb233e8b04dc9bb3d',
    origin: 'direct_email',
    received: '2026-09-01 · Hostinger INBOX UID 521',
    use: 'سياق وطني مقارن للسلوك المهني والمسؤولية والشفافية والسرية؛ أحكامه التنظيمية ليتوانية فقط.'
  },
  pktcLibrary: {
    id: 'lithuania-pktc-method-library',
    organization: 'Lithuanian Association of Social Workers / PKTC',
    title: 'PKTC — Methodological materials for social-services practice',
    href: 'https://pktc.lt/metodine-informacija/metodine-medziaga',
    origin: 'direct_email',
    received: '2026-09-01 · Hostinger INBOX UID 520',
    use: 'مكتبة منهجية للكفاءات وتقييمها وتطويرها، طرق العمل، الإشراف والتعلم التنظيمي، إدارة الحالة والخطط الفردية وتقييم الأثر.'
  },
  pktcCompetencyModel: {
    id: 'lithuania-pktc-competency-model',
    organization: 'PKTC',
    title: 'Social-work competencies and methodological recommendations for organisational competency models',
    href: 'https://api.pktc.lt/methodological-informations/99628ad8-aa62-4dd9-88f9-821a8632fd9f/99628ad8-af52-4176-a764-b1ca189e3567/download',
    origin: 'discovered_within_direct_email_resource',
    received: 'identified 2026-09-03 inside the PKTC library directly supplied by LSDA',
    use: 'يتناول مجالات كفاءات العمل الاجتماعي، بناء نموذج كفاءات تنظيمي، تقييم الكفاءات، وخطط تطوير الفرد والمؤسسة؛ يُستخدم في صفحات الجودة والتطوير المهني.'
  }
};

export const SOCIAL_WORK_DIRECT_EMAIL_SOURCE_RELEASE = '2026-09-03-v1';

export const SOCIAL_WORK_CURATED_DIRECT_EMAIL_COVERAGE: Record<string, string[]> = {
  'participation-and-voice': ['talentiaGuide'],
  'supported-decision-making': ['talentiaGuide'],
  'ethics-power-autonomy': ['talentiaGuide', 'avenirDe', 'avenirFr', 'lithuaniaCode'],
  'privacy-information-sharing': ['talentiaGuide', 'lithuaniaCode'],
  'documenting-disagreement': ['lithuaniaCode'],
  'institutional-advocacy': ['avenirDe', 'avenirFr'],
  'community-resource-map': ['pktcLibrary'],
  'service-coordination': ['pktcLibrary'],
  'professional-persistence': ['pktcLibrary', 'pktcCompetencyModel'],
  'help-plan-quality-audit': ['pktcLibrary', 'pktcCompetencyModel', 'talentiaGuide'],
  'family-burden-monitoring': ['pktcLibrary'],
  'poverty-structural-barriers': ['talentiaGuide', 'avenirDe'],
  'community-independence-plan': ['talentiaGuide'],
  'service-exit-plan': ['pktcLibrary']
};

function sourceCard(source: DirectEmailSource) {
  const originLabel = source.origin === 'direct_email'
    ? 'مصدر وصل إلى روافد مباشرة عبر البريد'
    : 'وثيقة فرعية حددناها داخل مورد وصل إلينا مباشرة عبر البريد';
  return `<div class="source" data-direct-email-source="${source.id}"><div class="source-kind">${originLabel}</div><p><strong>${source.title}</strong> — ${source.organization}</p><p>${source.use}</p><p class="small"><strong>التتبّع:</strong> ${source.received}</p><p><a href="${source.href}" target="_blank" rel="noopener noreferrer">فتح المصدر الأصلي</a></p></div>`;
}

export function enrichCuratedPageWithDirectEmailSources(html: string, key: string) {
  if (!html.includes('data-rawafid-curated-page=')) return html;
  const sourceKeys = SOCIAL_WORK_CURATED_DIRECT_EMAIL_COVERAGE[key];
  if (!sourceKeys?.length) return html;

  const additions = sourceKeys
    .map((sourceKey) => SOURCES[sourceKey])
    .filter(Boolean)
    .filter((source) => !html.includes(source.href))
    .map(sourceCard);

  if (!additions.length) return html;

  const anchor = '<div class="note"><strong>حد الاستنتاج:</strong>';
  if (!html.includes(anchor)) return html;

  const block = `<div data-direct-email-source-layer="${SOCIAL_WORK_DIRECT_EMAIL_SOURCE_RELEASE}"><h3>مصادر مؤسسية وصلتنا مباشرة وذات صلة بهذه الصفحة</h3><p class="small">لا نضيف المصدر لمجرد وصوله بالبريد؛ يظهر هنا فقط عندما يغيّر تفسير هذه الصفحة أو أداة ممارستها. القانون والأنظمة الوطنية تبقى محلية.</p>${additions.join('')}</div>`;
  return html.replace(anchor, `${block}${anchor}`);
}
