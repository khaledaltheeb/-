import type { AtlasSubstance } from '@/lib/addiction-atlas';

export const ADF_RESOURCES = {
  organization: 'Alcohol and Drug Foundation (ADF)',
  drugFacts: 'https://adf.org.au/drug-facts/',
  powerOfWords: 'https://adf.org.au/talking-about-drugs/power-words/',
  stigmaBackground: 'https://adf.org.au/talking-about-drugs/power-words/stigma-background/',
  messageGuide: 'https://adf.org.au/talking-about-drugs/power-words/message-guide/',
  drugWheel: 'https://adf.org.au/alcohol-drug-use/effects/drug-wheel/',
  copyright: 'https://adf.org.au/copyright/',
} as const;

export type AdfDrugFactReference = {
  id: string;
  title: string;
  url: string;
  matchKeys: string[];
};

const ADF_DRUG_FACT_REFERENCES: AdfDrugFactReference[] = [
  { id: 'adf-alcohol', title: 'Alcohol', url: 'https://adf.org.au/drug-facts/alcohol/', matchKeys: ['alcohol', 'ethanol'] },
  { id: 'adf-cannabis', title: 'Cannabis (THC)', url: 'https://adf.org.au/drug-facts/cannabis/', matchKeys: ['cannabis', 'marijuana', 'thc'] },
  { id: 'adf-cannabinoids', title: 'Cannabinoids', url: 'https://adf.org.au/drug-facts/cannabinoids/', matchKeys: ['cannabinoids'] },
  { id: 'adf-synthetic-cannabinoids', title: 'Synthetic cannabinoids', url: 'https://adf.org.au/drug-facts/synthetic-cannabinoids/', matchKeys: ['synthetic cannabinoids', 'synthetic cannabis'] },
  { id: 'adf-cocaine', title: 'Cocaine', url: 'https://adf.org.au/drug-facts/cocaine/', matchKeys: ['cocaine'] },
  { id: 'adf-ice', title: 'Crystal methamphetamine (Ice)', url: 'https://adf.org.au/drug-facts/ice/', matchKeys: ['crystal methamphetamine', 'methamphetamine', 'ice'] },
  { id: 'adf-amphetamines', title: 'Amphetamines', url: 'https://adf.org.au/drug-facts/amphetamines/', matchKeys: ['amphetamines', 'amphetamine'] },
  { id: 'adf-mdma', title: 'MDMA (ecstasy)', url: 'https://adf.org.au/drug-facts/mdma/', matchKeys: ['mdma', 'ecstasy'] },
  { id: 'adf-lsd', title: 'LSD', url: 'https://adf.org.au/drug-facts/lsd/', matchKeys: ['lsd', 'lysergic acid diethylamide'] },
  { id: 'adf-psilocybin', title: 'Psilocybin', url: 'https://adf.org.au/drug-facts/psilocybin/', matchKeys: ['psilocybin', 'magic mushrooms'] },
  { id: 'adf-dmt', title: 'DMT', url: 'https://adf.org.au/drug-facts/dmt/', matchKeys: ['dmt', 'dimethyltryptamine'] },
  { id: 'adf-psychedelics', title: 'Psychedelics', url: 'https://adf.org.au/drug-facts/psychedelics/', matchKeys: ['psychedelics', 'hallucinogens'] },
  { id: 'adf-ketamine', title: 'Ketamine', url: 'https://adf.org.au/drug-facts/ketamine/', matchKeys: ['ketamine'] },
  { id: 'adf-dxm', title: 'Dextromethorphan (DXM)', url: 'https://adf.org.au/drug-facts/dxm/', matchKeys: ['dextromethorphan', 'dxm'] },
  { id: 'adf-nitrous-oxide', title: 'Nitrous oxide', url: 'https://adf.org.au/drug-facts/nitrous-oxide/', matchKeys: ['nitrous oxide', 'n2o', 'nangs'] },
  { id: 'adf-ghb', title: 'GHB', url: 'https://adf.org.au/drug-facts/ghb/', matchKeys: ['ghb', 'gamma hydroxybutyrate'] },
  { id: 'adf-benzodiazepines', title: 'Benzodiazepines', url: 'https://adf.org.au/drug-facts/benzodiazepines/', matchKeys: ['benzodiazepines', 'benzodiazepine'] },
  { id: 'adf-opioids', title: 'Opioids', url: 'https://adf.org.au/drug-facts/opioids/', matchKeys: ['opioids'] },
  { id: 'adf-heroin', title: 'Heroin', url: 'https://adf.org.au/drug-facts/heroin/', matchKeys: ['heroin'] },
  { id: 'adf-fentanyl', title: 'Fentanyl', url: 'https://adf.org.au/drug-facts/fentanyl/', matchKeys: ['fentanyl'] },
  { id: 'adf-codeine', title: 'Codeine', url: 'https://adf.org.au/drug-facts/codeine/', matchKeys: ['codeine'] },
  { id: 'adf-oxycodone', title: 'Oxycodone', url: 'https://adf.org.au/drug-facts/oxycodone/', matchKeys: ['oxycodone'] },
  { id: 'adf-methadone', title: 'Methadone', url: 'https://adf.org.au/drug-facts/methadone/', matchKeys: ['methadone'] },
  { id: 'adf-buprenorphine', title: 'Buprenorphine', url: 'https://adf.org.au/drug-facts/buprenorphine/', matchKeys: ['buprenorphine'] },
  { id: 'adf-inhalants', title: 'Inhalants', url: 'https://adf.org.au/drug-facts/inhalants/', matchKeys: ['inhalants', 'volatile substances'] },
  { id: 'adf-caffeine', title: 'Caffeine', url: 'https://adf.org.au/drug-facts/caffeine/', matchKeys: ['caffeine'] },
  { id: 'adf-nicotine', title: 'Nicotine', url: 'https://adf.org.au/drug-facts/nicotine/', matchKeys: ['nicotine'] },
  { id: 'adf-tobacco', title: 'Tobacco', url: 'https://adf.org.au/drug-facts/tobacco/', matchKeys: ['tobacco'] },
  { id: 'adf-anabolic-steroids', title: 'Anabolic steroids', url: 'https://adf.org.au/drug-facts/steroids/', matchKeys: ['anabolic steroids', 'anabolic androgenic steroids', 'aas'] },
  { id: 'adf-new-psychoactive-substances', title: 'New psychoactive substances', url: 'https://adf.org.au/drug-facts/new-psychoactive-substances/', matchKeys: ['new psychoactive substances', 'nps'] },
];

function normalize(value: string) {
  return value.toLocaleLowerCase('en').normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

function substanceKeys(substance: Pick<AtlasSubstance, 'slug' | 'display_name_en' | 'common_name_en' | 'scientific_name' | 'search_aliases_en'>) {
  return [
    substance.slug,
    substance.display_name_en,
    substance.common_name_en,
    substance.scientific_name,
    ...(substance.search_aliases_en ?? []),
  ].filter((value): value is string => Boolean(value)).map(normalize);
}

export function getAdfDrugFactReference(substance: Pick<AtlasSubstance, 'slug' | 'display_name_en' | 'common_name_en' | 'scientific_name' | 'search_aliases_en'>) {
  const keys = new Set(substanceKeys(substance));
  return ADF_DRUG_FACT_REFERENCES.find((reference) => reference.matchKeys.some((key) => keys.has(normalize(key)))) ?? null;
}

export function countAdfDrugFactReferences(substances: AtlasSubstance[]) {
  return substances.reduce((count, substance) => count + (getAdfDrugFactReference(substance) ? 1 : 0), 0);
}

export const ADF_EDITORIAL_STANDARD_AR = [
  'استخدام لغة متمحورة حول الإنسان وعدم اختزال الشخص في استعمال مادة أو تشخيص.',
  'معاملة استخدام الكحول والمواد كموضوع صحة عامة ورعاية، لا كحكم أخلاقي أو وصف للشخصية.',
  'التمييز بين استخدام المادة والاعتماد واضطراب استخدام المواد وعدم افتراض التشخيص من مجرد الاستخدام.',
  'عرض المخاطر والقيود وعدم اليقين بلغة دقيقة غير مثيرة وغير مطمئنة زائفًا.',
  'اختيار مصطلحات سريرية ووصفية عند الحديث عن الفحوص والعلاج والتعافي بدل أوصاف تحمل حكمًا قيميًا.',
  'ربط المعلومات عالية الخطورة بعلامات طلب المساعدة والطوارئ، مع تجنب إعطاء جرعات استخدام أو وصفات خلط أو خطط انسحاب ذاتية.',
] as const;

export const ADF_PROVENANCE_NOTE_AR = 'تُستخدم موارد Alcohol and Drug Foundation هنا كمرجع خارجي للمقارنة المنهجية واللغة غير الوصمية. محتوى روافد عربي أصلي متعدد المصادر، ولا تعني الإحالة إلى ADF أن المؤسسة راجعت درجات الأطلس أو اعتمدتها.';
