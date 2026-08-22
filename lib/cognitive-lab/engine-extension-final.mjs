import { makeExtensionTrial as makeQualityExtensionTrial, supportsExtensionMode } from './engine-extension-quality.mjs';

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededRandom(seed) {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (random, min, max) => min + Math.floor(random() * (max - min + 1));
function shuffle(random, values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function unique(values) { return [...new Set(values.map(String))]; }
function finish(random, tool, level, raw) {
  const answer = String(raw.answer);
  const options = shuffle(random, unique(raw.options));
  if (!options.includes(answer)) options.push(answer);
  const semantic = [tool.slug, level, raw.study ?? '', raw.prompt, raw.display ?? '', answer, [...options].sort().join('|'), raw.difficultySignature].join('::');
  return {
    kind: raw.kind ?? 'choice',
    prompt: raw.prompt,
    ...(raw.display ? { display: raw.display } : {}),
    ...(raw.study ? { study: raw.study } : {}),
    answer,
    options: options.map((value) => ({ value, label: value })),
    rationale: raw.rationale,
    level,
    difficultyDescriptor: raw.difficultyDescriptor,
    difficultySignature: raw.difficultySignature,
    fingerprint: hashText(semantic).toString(16).padStart(8, '0'),
  };
}

function meansEndTrial(random, tool, level) {
  const goal = 6 + level + int(random, 0, 5);
  const secondBlock = 3 + int(random, 0, Math.max(0, Math.min(2, goal - 5)));
  return finish(random, tool, level, {
    prompt: `ابدأ من 0 وهدفك الوصول إلى ${goal}. الحركتان المتاحتان هما +1 و+2، لكن يمنع الوقوف على 1 وعلى ${secondBlock}. ما الخطوة الأولى الوحيدة المسموح بها؟`,
    answer: '+2',
    options: ['+1', '+2', 'توقف', '-1'],
    rationale: 'الانتقال +1 يهبط مباشرة على النقطة 1 المحظورة؛ لذلك +2 هي الخطوة الأولى الوحيدة المسموح بها.',
    difficultyDescriptor: `هدف ${goal} مع قيدين مكانيين؛ المستوى ${level}`,
    difficultySignature: `means-end:${level}`,
  });
}

function evidenceUpdatingTrial(random, tool, level) {
  const priorA = int(random, 1, 3 + level);
  const priorB = int(random, 1, 3 + level);
  const likelihoodA = int(random, 2, 4 + level);
  const likelihoodB = int(random, 1, Math.max(1, likelihoodA - 1));
  const weightA = priorA * likelihoodA;
  const weightB = priorB * likelihoodB;
  if (weightA === weightB) return evidenceUpdatingTrial(random, tool, level);
  const answer = weightA > weightB ? 'الفرضية أ' : 'الفرضية ب';
  return finish(random, tool, level, {
    kind: 'memory',
    study: `قبل الدليل: وزن أ=${priorA}، وزن ب=${priorB}. قوة الدليل الجديد: تحت أ=${likelihoodA}، وتحت ب=${likelihoodB}. استخدم قاعدة تعليمية مبسطة: الوزن المحدّث = الوزن السابق × قوة الدليل.`,
    prompt: 'أي فرضية تصبح أكثر دعمًا بعد إدخال الدليل؟',
    answer,
    options: ['الفرضية أ', 'الفرضية ب', 'متساويتان', 'لا يمكن المقارنة'],
    rationale: `الوزن المحدّث لأ = ${priorA}×${likelihoodA}=${weightA}، ولب = ${priorB}×${likelihoodB}=${weightB}؛ لذلك ${answer} أكثر دعمًا في هذا النموذج التعليمي.`,
    difficultyDescriptor: `تحديث دليل بوزنين وقوتي ترجيح؛ المستوى ${level}`,
    difficultySignature: `evidence-update:${level}`,
  });
}

function feedbackRuleLearningTrial(random, tool, level) {
  const colors = ['أحمر', 'أزرق', 'أخضر'];
  const shapes = ['دائرة', 'مثلث', 'مربع'];
  const targetColor = colors[int(random, 0, colors.length - 1)];
  const targetShape = shapes[int(random, 0, shapes.length - 1)];
  const positive = `${targetColor} + ${targetShape}`;
  const negative1 = `${targetColor} + ${shapes.find((shape) => shape !== targetShape)}`;
  const negative2 = `${colors.find((color) => color !== targetColor)} + ${targetShape}`;
  const negative3 = `${colors.find((color) => color !== targetColor)} + ${shapes.find((shape) => shape !== targetShape)}`;
  const probePositive = int(random, 0, 1) === 1;
  const probe = probePositive ? positive : [negative1, negative2, negative3][int(random, 0, 2)];
  return finish(random, tool, level, {
    kind: 'memory',
    study: `أمثلة معلّمة: ${positive}=الفئة أ؛ ${negative1}=الفئة ب؛ ${negative2}=الفئة ب؛ ${negative3}=الفئة ب.`,
    prompt: `طبّق القاعدة المركبة على المثال الجديد «${probe}».`,
    answer: probePositive ? 'الفئة أ' : 'الفئة ب',
    options: ['الفئة أ', 'الفئة ب'],
    rationale: `الفئة أ تتطلب اجتماع اللون ${targetColor} والشكل ${targetShape} معًا؛ لذلك المثال ينتمي إلى ${probePositive ? 'الفئة أ' : 'الفئة ب'}.`,
    difficultyDescriptor: `استقراء قاعدة اقتران سمتين؛ المستوى ${level}`,
    difficultySignature: `feedback-rule:${level}`,
  });
}

const FINAL_OVERRIDES = new Set(['means_end_planning', 'evidence_updating', 'feedback_rule_learning']);

export { supportsExtensionMode };

export function makeExtensionTrial(tool, level, trialIndex, sessionSeed = 1) {
  if (!FINAL_OVERRIDES.has(tool.mode)) return makeQualityExtensionTrial(tool, level, trialIndex, sessionSeed);
  const normalizedLevel = Math.min(5, Math.max(1, Math.trunc(Number(level) || 1)));
  const normalizedIndex = Math.max(0, Math.trunc(Number(trialIndex) || 0));
  const random = seededRandom(hashText(`${tool.slug}:${normalizedLevel}:${normalizedIndex}:${sessionSeed}:final-v1`));
  if (tool.mode === 'means_end_planning') return meansEndTrial(random, tool, normalizedLevel);
  if (tool.mode === 'evidence_updating') return evidenceUpdatingTrial(random, tool, normalizedLevel);
  if (tool.mode === 'feedback_rule_learning') return feedbackRuleLearningTrial(random, tool, normalizedLevel);
  return makeQualityExtensionTrial(tool, level, trialIndex, sessionSeed);
}
