import assert from 'node:assert/strict';

const {
  analyzeFreeQuery,
  buildExtractiveAnswer,
  rerankFreeResults,
} = await import(new URL('../lib/free-search-intelligence.ts', import.meta.url));

const dialect = analyzeFreeQuery('طفلي ما بحكي');
assert.ok(
  dialect.topics.includes('speech-language'),
  `Dialect speech query must resolve to speech-language; got ${JSON.stringify(dialect)}`,
);
assert.equal(dialect.subject, 'child', 'Dialect speech query must preserve child subject.');

const emergency = analyzeFreeQuery('تناولت جرعة زائدة وفقدت الوعي ماذا افعل');
assert.equal(
  emergency.intent,
  'safety',
  `Overdose with loss of consciousness must have safety priority; got ${emergency.intent}`,
);
assert.equal(emergency.clarifying_question, null, 'Safety queries must never be delayed by clarification.');

const socialQuery = 'أخلاقيات العمل الاجتماعي';
const socialUnderstanding = analyzeFreeQuery(socialQuery);
assert.ok(socialUnderstanding.topics.includes('social-work'), 'Social-work ethics query must resolve to social-work.');

const syntheticResults = [
  {
    entity_type: 'content',
    entity_id: 'unrelated-social-smile',
    slug: 'social-smile',
    title: 'الابتسامة الاجتماعية عند الطفل',
    subtitle: 'التطور الاجتماعي المبكر',
    excerpt: 'الابتسامة الاجتماعية علامة من علامات التفاعل المبكر عند الرضع، ويختلف توقيتها وسياقها عن أخلاقيات الممارسة المهنية في العمل الاجتماعي.',
    destination: '/encyclopedia/social-smile/',
    score: 1000,
  },
  {
    entity_type: 'content',
    entity_id: 'social-work-ethics',
    slug: 'social-work-ethics',
    title: 'أخلاقيات العمل الاجتماعي: مرجع تطبيقي عربي',
    subtitle: 'الكرامة الإنسانية وتقرير المصير والسرية المهنية',
    excerpt: 'تتطلب أخلاقيات العمل الاجتماعي احترام الكرامة الإنسانية وتقرير المصير والسرية المهنية، مع توثيق مبررات القرار الأخلاقي ومراجعة تضارب المصالح والسياق المؤسسي.',
    destination: '/evidence-guides/social-work/ethics/',
    score: 900,
  },
];

const ranked = rerankFreeResults(socialQuery, syntheticResults, socialUnderstanding);
assert.equal(
  ranked[0]?.destination,
  '/evidence-guides/social-work/ethics/',
  `Topic-aware reranking must place social-work evidence first; got ${ranked[0]?.destination ?? 'none'}`,
);

const answer = buildExtractiveAnswer(socialQuery, syntheticResults, socialUnderstanding);
assert.ok(answer?.points.length, 'Social-work query must produce a grounded extractive answer.');
assert.ok(
  answer.points.every((point) => point.destination.startsWith('/evidence-guides/social-work/')),
  `Extractive answer must reject unrelated evidence; got ${JSON.stringify(answer.points)}`,
);

console.log('Rawafid assistant intelligence contract passed.');
