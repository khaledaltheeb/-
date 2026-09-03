type EvidenceCard = {
  kind: string;
  title: string;
  publisher: string;
  href: string;
  note: string;
};

export const SOCIAL_WORK_CURATED_SOURCE_CORRECTIONS_RELEASE = '2026-09-03-v1';

const SFBT_2024: EvidenceCard = {
  kind: 'تحليل تلوي حديث',
  title: 'The current evidence of solution-focused brief therapy: A meta-analysis of psychosocial outcomes and moderating factors',
  publisher: 'Clinical Psychology Review, 2024',
  href: 'https://pubmed.ncbi.nlm.nih.gov/39489144/',
  note: 'شمل 72 دراسة و489 حجم أثر. يدعم وجود أثر نفسي-اجتماعي لـSFBT عبر سياقات متعددة، لكنه لا يبرر استخدام أسئلة الحل كبديل لتقييم الخطر أو التدخل المتخصص.'
};

const TRUST_2026: EvidenceCard = {
  kind: 'مراجعة نطاقية حديثة في العمل الاجتماعي',
  title: 'Building trust with children and parents in the social work context: A scoping review',
  publisher: 'The British Journal of Social Work, 2026',
  href: 'https://academic.oup.com/bjsw/article/56/3/1097/8321995',
  note: 'حللت 36 دراسة محكمة منشورة بين 2014 و2024. وجدت أن الثقة تدعم الشراكة، وأن اختلال القوة ودوران العاملين وتعقيد الاحتياجات ومشكلات النظام تعيق بناءها؛ وتبرز الوقت والاستمرارية ومنظور القوة والعمل مع الشبكات.'
};

function card(source: EvidenceCard) {
  return `<div class="source" data-curated-evidence-update="${SOCIAL_WORK_CURATED_SOURCE_CORRECTIONS_RELEASE}"><div class="source-kind">${source.kind}</div><p><strong>${source.title}</strong> — ${source.publisher}</p><p>${source.note}</p><p><a href="${source.href}" target="_blank" rel="noopener noreferrer">فتح المصدر</a></p></div>`;
}

const replacements: Array<[string, string]> = [
  [
    '<strong>A systematic review of the use of the concept family resilience in interventions with children and young people</strong> — Clinical Child Psychology and Psychiatry',
    '<strong>A systematic review of the use of the concept family resilience in interventions with families with children and young people</strong> — Public Health Nursing, 2024'
  ],
  ['https://pubmed.ncbi.nlm.nih.gov/39038209/', 'https://pubmed.ncbi.nlm.nih.gov/38284476/'],
  [
    '<strong>Systematic review and meta-analysis of home visiting interventions aimed at enhancing child mental health</strong> — European Child & Adolescent Psychiatry',
    '<strong>Systematic review and meta-analysis of home visiting interventions aimed at enhancing child mental health, psychosocial, and developmental outcomes in vulnerable families</strong> — BMC Pediatrics, 2025'
  ],
  ['https://pubmed.ncbi.nlm.nih.gov/35764846/', 'https://pubmed.ncbi.nlm.nih.gov/40264072/'],
  ['https://onlinelibrary.wiley.com/doi/10.1155/2024/9957991', 'https://onlinelibrary.wiley.com/doi/10.1155/2023/8250781'],
  [
    '<strong>Service-level barriers and facilitators to father engagement in child and family services</strong> — Child & Family Social Work',
    '<strong>Service-level barriers and facilitators to father engagement in child and family services: A systematic review and thematic synthesis of qualitative studies</strong> — Children and Youth Services Review, 2024'
  ],
  ['https://onlinelibrary.wiley.com/doi/10.1111/cfs.13173', 'https://doi.org/10.1016/j.childyouth.2023.107295']
];

const pageAdditions: Record<string, EvidenceCard[]> = {
  'solution-focused-conversations': [SFBT_2024],
  'rebuilding-trust-after-harm': [TRUST_2026]
};

export function correctCuratedSocialWorkEvidence(html: string, key: string) {
  if (!html.includes('data-rawafid-curated-page=')) return html;

  let corrected = html;
  for (const [from, to] of replacements) corrected = corrected.split(from).join(to);

  const additions = (pageAdditions[key] ?? []).filter((source) => !corrected.includes(source.href));
  if (!additions.length) return corrected;

  const anchor = '<div class="note"><strong>حد الاستنتاج:</strong>';
  if (!corrected.includes(anchor)) return corrected;
  return corrected.replace(anchor, `${additions.map(card).join('')}${anchor}`);
}
