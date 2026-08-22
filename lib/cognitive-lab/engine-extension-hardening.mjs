import { makeExtensionTrial as makeAuditedExtensionTrial, supportsExtensionMode } from './engine-extension-audit.mjs';

const DIRECTIONS = ['↑', '→', '↓', '←'];
const OBJECTS = ['كتاب', 'مفتاح', 'كوب', 'قلم', 'كرة', 'مصباح', 'ساعة', 'دفتر', 'مظلة', 'جرس', 'خاتم', 'مرآة', 'صندوق', 'كرسي', 'باب', 'نافذة'];
const CONTEXTS = ['أحمر', 'أزرق', 'أخضر', 'ذهبي', 'مكتب', 'نافذة', 'باب', 'رف', 'شرفة', 'مدخل', 'يمين', 'يسار'];
const LABELS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];

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

const pick = (random, values) => values[Math.floor(random() * values.length)];
const int = (random, min, max) => min + Math.floor(random() * (max - min + 1));

function shuffle(random, values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function unique(values) {
  return [...new Set(values.map(String))];
}

function finish(random, tool, level, raw) {
  const answer = String(raw.answer);
  const values = unique(raw.options);
  if (!values.includes(answer)) values.push(answer);
  const shuffled = shuffle(random, values);
  const semantic = [
    tool.slug,
    level,
    raw.study ?? '',
    raw.prompt,
    raw.display ?? '',
    answer,
    [...shuffled].sort().join('|'),
    raw.difficultyDescriptor,
  ].join('::');
  return {
    kind: raw.kind ?? 'choice',
    prompt: String(raw.prompt),
    ...(raw.display ? { display: String(raw.display) } : {}),
    ...(raw.study ? { study: String(raw.study) } : {}),
    answer,
    options: shuffled.map((value) => ({ value, label: value })),
    rationale: String(raw.rationale),
    level,
    difficultyDescriptor: String(raw.difficultyDescriptor),
    difficultySignature: `${tool.mode}:raw-level:${level}`,
    fingerprint: hashText(semantic).toString(16).padStart(8, '0'),
  };
}

function spatialTransformTrial(random, tool, level) {
  const startIndex = int(random, 0, 3);
  let directionIndex = startIndex;
  const operationCount = 1 + level;
  const operations = [];
  const allowedTurns = level >= 3 ? [-1, 1, 2] : [-1, 1];
  for (let index = 0; index < operationCount; index += 1) {
    const turn = pick(random, allowedTurns);
    directionIndex = (directionIndex + turn + 4) % 4;
    operations.push(turn === -1 ? 'يسار 90°' : turn === 1 ? 'يمين 90°' : 'دوران 180°');
  }
  const answer = DIRECTIONS[directionIndex];
  return finish(random, tool, level, {
    kind: 'memory',
    study: `الاتجاه الابتدائي ${DIRECTIONS[startIndex]}. التحولات: ${operations.join('، ')}.`,
    prompt: 'بعد تنفيذ التحولات بالترتيب، ما الاتجاه النهائي؟',
    answer,
    options: DIRECTIONS,
    rationale: `بدأ المسار من ${DIRECTIONS[startIndex]} وبعد ${operationCount} تحولات انتهى عند ${answer}.`,
    difficultyDescriptor: `المستوى ${level}: ${operationCount} تحولات و${allowedTurns.length} نوع من الدوران`,
  });
}

function landmarkRouteTrial(random, tool, level) {
  const stationCount = 2 + level;
  const objects = shuffle(random, OBJECTS).slice(0, stationCount);
  const landmarks = shuffle(random, CONTEXTS).slice(0, stationCount);
  const targetIndex = int(random, 0, stationCount - 1);
  return finish(random, tool, level, {
    kind: 'memory',
    study: objects.map((objectName, index) => `المحطة ${index + 1}: ${objectName} عند ${landmarks[index]}`).join(' | '),
    prompt: `ما المعلم المرتبط بالمحطة ${targetIndex + 1} التي ظهر فيها «${objects[targetIndex]}»؟`,
    answer: landmarks[targetIndex],
    options: landmarks,
    rationale: `في مسار الدراسة ارتبطت المحطة ${targetIndex + 1} بالمعلم «${landmarks[targetIndex]}».`,
    difficultyDescriptor: `المستوى ${level}: مسار من ${stationCount} محطات وروابط معلم/عنصر`,
  });
}

function itemContextTrial(random, tool, level) {
  const count = 2 + level;
  const objects = shuffle(random, OBJECTS).slice(0, count);
  const contexts = shuffle(random, CONTEXTS).slice(0, count);
  const targetIndex = int(random, 0, count - 1);
  return finish(random, tool, level, {
    kind: 'memory',
    study: objects.map((objectName, index) => `${objectName} ↔ ${contexts[index]}`).join(' | '),
    prompt: `أي سياق كان مرتبطًا بالعنصر «${objects[targetIndex]}»؟`,
    answer: contexts[targetIndex],
    options: contexts,
    rationale: `في مرحلة الدراسة ظهر «${objects[targetIndex]}» مع السياق «${contexts[targetIndex]}».`,
    difficultyDescriptor: `المستوى ${level}: ${count} روابط مستقلة بين عنصر وسياق`,
  });
}

function relationalMemoryTrial(random, tool, level) {
  const pairCount = 2 + level;
  const items = shuffle(random, OBJECTS).slice(0, pairCount * 2);
  const pairs = Array.from({ length: pairCount }, (_, index) => [items[index * 2], items[index * 2 + 1]]);
  const targetIndex = int(random, 0, pairCount - 1);
  const askFirst = random() < 0.5;
  const cue = pairs[targetIndex][askFirst ? 0 : 1];
  const answer = pairs[targetIndex][askFirst ? 1 : 0];
  const options = pairs.map((pair) => pair[askFirst ? 1 : 0]);
  return finish(random, tool, level, {
    kind: 'memory',
    study: pairs.map(([first, second]) => `${first} ↔ ${second}`).join(' | '),
    prompt: `ما العنصر الذي كان مرتبطًا بـ«${cue}»؟`,
    answer,
    options,
    rationale: `العلاقة المدروسة كانت «${pairs[targetIndex][0]} ↔ ${pairs[targetIndex][1]}».`,
    difficultyDescriptor: `المستوى ${level}: ${pairCount} علاقات ثنائية مستقلة`,
  });
}

function categoryLearningTrial(random, tool, level) {
  const threshold = 5 + level;
  const ruleNames = [
    `القيم من ${threshold} فأعلى`,
    'الأعداد الزوجية',
    `الزوجي ومن ${threshold} فأعلى معًا`,
    `القيم الواقعة بين ${threshold - 2} و${threshold + 3}`, 
    `الأعداد التي تعطي باقي ${threshold % 3} عند القسمة على 3`,
  ];
  const classify = (value) => {
    if (level === 1) return value >= threshold;
    if (level === 2) return value % 2 === 0;
    if (level === 3) return value >= threshold && value % 2 === 0;
    if (level === 4) return value >= threshold - 2 && value <= threshold + 3;
    return value % 3 === threshold % 3;
  };
  const pool = Array.from({ length: 24 }, (_, index) => index + 1);
  const positives = shuffle(random, pool.filter(classify));
  const negatives = shuffle(random, pool.filter((value) => !classify(value)));
  const examplesPerClass = Math.min(2 + Math.floor(level / 2), 4);
  const selected = shuffle(random, [
    ...positives.slice(0, examplesPerClass).map((value) => `${value}=أ`),
    ...negatives.slice(0, examplesPerClass).map((value) => `${value}=ب`),
  ]);
  const used = new Set(selected.map((entry) => Number(entry.split('=')[0])));
  const targetCandidates = shuffle(random, pool.filter((value) => !used.has(value)));
  const wantPositive = random() < 0.5;
  const target = targetCandidates.find((value) => classify(value) === wantPositive) ?? targetCandidates[0];
  const answer = classify(target) ? 'الفئة أ' : 'الفئة ب';
  return finish(random, tool, level, {
    kind: 'memory',
    study: `أمثلة معلّمة: ${selected.join('، ')}.`,
    prompt: `استنتج القاعدة ثم صنّف العدد ${target}.`,
    answer,
    options: ['الفئة أ', 'الفئة ب'],
    rationale: `قاعدة هذا المستوى هي «${ruleNames[level - 1]}»، ولذلك ينتمي ${target} إلى ${answer}.`,
    difficultyDescriptor: `المستوى ${level}: ${ruleNames[level - 1]} من ${selected.length} أمثلة معلّمة`,
  });
}

function transitiveInferenceTrial(random, tool, level) {
  const count = 3 + level;
  const items = shuffle(random, LABELS).slice(0, count);
  const relations = items.slice(0, -1).map((item, index) => `${item} > ${items[index + 1]}`);
  const span = int(random, 2, count - 1);
  const startIndex = int(random, 0, count - span - 1);
  const left = items[startIndex];
  const right = items[startIndex + span];
  const askForward = random() < 0.5;
  const answer = askForward ? `${left} > ${right}` : `${right} < ${left}`;
  return finish(random, tool, level, {
    kind: 'memory',
    study: `العلاقات: ${relations.join('، ')}.`,
    prompt: `ما العلاقة الصحيحة بين ${askForward ? `${left} و${right}` : `${right} و${left}`}؟`,
    answer,
    options: askForward
      ? [`${left} > ${right}`, `${right} > ${left}`, `${left} = ${right}`, 'لا يمكن الاستنتاج']
      : [`${right} < ${left}`, `${right} > ${left}`, `${right} = ${left}`, 'لا يمكن الاستنتاج'],
    rationale: `تربط السلسلة ${span} علاقات متتابعة بين الطرفين، لذلك العلاقة المطلوبة هي «${answer}».`,
    difficultyDescriptor: `المستوى ${level}: سلسلة من ${count - 1} علاقات مع استنتاج يمتد ${span} روابط`,
  });
}

function arithmeticChainTrial(random, tool, level, counterfactual) {
  const start = int(random, 2, 12 + level * 3);
  const addFirst = int(random, 1, 2 + level);
  const addSecond = int(random, 1, 3 + level);
  const useMultiply = level >= 4 && random() < 0.5;
  const factualMiddle = start + addFirst;
  const factualFinal = useMultiply ? factualMiddle * 2 + addSecond : factualMiddle + addSecond;

  if (!counterfactual) {
    const answer = String(factualFinal);
    return finish(random, tool, level, {
      prompt: useMultiply
        ? `قاعدة السلسلة: أ=${start}، ثم ب=أ+${addFirst}، ثم ج=(ب×2)+${addSecond}. ما ج؟`
        : `قاعدة السلسلة: أ=${start}، ثم ب=أ+${addFirst}، ثم ج=ب+${addSecond}. ما ج؟`,
      answer,
      options: [answer, String(factualFinal + 1), String(Math.max(0, factualFinal - addFirst)), String(factualMiddle)],
      rationale: useMultiply
        ? `ب=${factualMiddle}، ثم (${factualMiddle}×2)+${addSecond}=${factualFinal}.`
        : `ب=${factualMiddle}، ثم ${factualMiddle}+${addSecond}=${factualFinal}.`,
      difficultyDescriptor: `المستوى ${level}: سلسلتان حسابيتان مع ${useMultiply ? 'ضرب ثم جمع' : 'جمعين متتابعين'} ونطاق بداية حتى ${12 + level * 3}`,
    });
  }

  let replacement = int(random, 0, Math.max(1, addFirst + level));
  if (replacement === addFirst) replacement = (replacement + 1) % (addFirst + level + 1);
  const counterMiddle = start + replacement;
  const counterFinal = useMultiply ? counterMiddle * 2 + addSecond : counterMiddle + addSecond;
  const answer = String(counterFinal);
  return finish(random, tool, level, {
    prompt: useMultiply
      ? `القاعدة الأصلية: ب=أ+${addFirst}، ج=(ب×2)+${addSecond}. إذا كان أ=${start} وافترض بدلًا من ذلك أن الزيادة الأولى أصبحت ${replacement}، فما ج؟`
      : `القاعدة الأصلية: ب=أ+${addFirst}، ج=ب+${addSecond}. إذا كان أ=${start} وافترض بدلًا من ذلك أن الزيادة الأولى أصبحت ${replacement}، فما ج؟`,
    answer,
    options: [answer, String(factualFinal), String(counterFinal + 1), String(Math.max(0, counterFinal - 1))],
    rationale: `تحت الافتراض البديل يصبح ب=${counterMiddle}، ثم ج=${counterFinal}. لا نستخدم الناتج الواقعي ${factualFinal}.`,
    difficultyDescriptor: `المستوى ${level}: تعديل افتراضي لمعامل أول مع ${useMultiply ? 'تحويل ضربي لاحق' : 'تحويل جمعي لاحق'}`,
  });
}

function numberLineTrial(random, tool, level) {
  const maximum = [100, 200, 500, 1000, 2000][level - 1];
  const percentages = level <= 2
    ? [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]
    : [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
  const percentage = pick(random, percentages);
  const answerValue = Math.round(maximum * percentage / 100);
  const nearby = Math.max(1, Math.round(maximum * (level <= 2 ? 0.1 : 0.05)));
  const answer = String(answerValue);
  return finish(random, tool, level, {
    prompt: `تخيل خطًا عدديًا من 0 إلى ${maximum}. ما القيمة الواقعة عند ${percentage}% من المسافة؟`,
    answer,
    options: [answer, String(Math.max(0, answerValue - nearby)), String(Math.min(maximum, answerValue + nearby)), String(percentage)],
    rationale: `${percentage}% من ${maximum} تساوي ${answerValue}.`,
    difficultyDescriptor: `المستوى ${level}: خط حتى ${maximum} مع مواضع بنسبة ${percentages.length > 11 ? '5%' : '10%/25% تقريبًا'}`,
  });
}

function constraintPlanningTrial(random, tool, level) {
  const itemCount = 3 + level;
  const items = shuffle(random, LABELS).slice(0, itemCount);
  const answer = items.join(' → ');
  const options = [answer];
  const seen = new Set(options);
  let attempts = 0;
  while (options.length < 4 && attempts < 20) {
    attempts += 1;
    const candidate = [...items];
    const left = int(random, 0, candidate.length - 2);
    [candidate[left], candidate[left + 1]] = [candidate[left + 1], candidate[left]];
    const rendered = candidate.join(' → ');
    if (!seen.has(rendered)) {
      seen.add(rendered);
      options.push(rendered);
    }
  }
  return finish(random, tool, level, {
    prompt: `اختر الترتيب الذي يحقق القيود: ${items.slice(0, -1).map((item, index) => `${item} قبل ${items[index + 1]}`).join('؛ ')}.`,
    answer,
    options,
    rationale: `الترتيب «${answer}» وحده يحافظ على سلسلة علاقات «قبل» كاملة كما عُرضت.`,
    difficultyDescriptor: `المستوى ${level}: ${itemCount} عناصر و${itemCount - 1} قيود ترتيب مترابطة`,
  });
}

function errorDetectionTrial(random, tool, level) {
  const length = 4 + level;
  const start = int(random, 1, 9 + level);
  const step = int(random, 1, 2 + level);
  const expected = Array.from({ length }, (_, index) => start + index * step);
  const errorIndex = int(random, 1, length - 1);
  const observed = [...expected];
  const deviation = pick(random, [-2, -1, 1, 2].filter((value) => value !== 0));
  observed[errorIndex] += deviation;
  const answer = String(errorIndex + 1);
  return finish(random, tool, level, {
    prompt: `القاعدة: أضف ${step} في كل خطوة. التنفيذ: ${observed.join('، ')}. أين أول موضع يخالف القاعدة؟`,
    answer,
    options: Array.from({ length }, (_, index) => String(index + 1)),
    rationale: `الموضع ${errorIndex + 1} كان يجب أن يساوي ${expected[errorIndex]} لكنه ظهر ${observed[errorIndex]}.`,
    difficultyDescriptor: `المستوى ${level}: تسلسل من ${length} مواضع بخطوة ${step} وموقع خطأ متغير`,
  });
}

const HARDENED_MODES = new Set([
  'spatial_folding',
  'landmark_route_binding',
  'item_context_memory',
  'relational_memory',
  'category_learning',
  'transitive_inference',
  'causal_chain',
  'counterfactual_reasoning',
  'number_line',
  'constraint_planning',
  'error_detection',
]);

export { supportsExtensionMode };

export function makeExtensionTrial(tool, level, trialIndex, sessionSeed = 1) {
  const normalizedLevel = Math.min(5, Math.max(1, Math.trunc(Number(level) || 1)));
  const normalizedIndex = Math.max(0, Math.trunc(Number(trialIndex) || 0));
  if (!HARDENED_MODES.has(tool.mode)) {
    const trial = makeAuditedExtensionTrial(tool, normalizedLevel, normalizedIndex, sessionSeed);
    if (tool.mode === 'set_shifting_cued') {
      return {
        ...trial,
        difficultyDescriptor: `المستوى ${normalizedLevel}: ${trial.difficultyDescriptor}`,
      };
    }
    return trial;
  }

  const random = seededRandom(hashText(`${tool.slug}:${normalizedLevel}:${normalizedIndex}:${sessionSeed}:hardening-v1`));
  if (tool.mode === 'spatial_folding') return spatialTransformTrial(random, tool, normalizedLevel);
  if (tool.mode === 'landmark_route_binding') return landmarkRouteTrial(random, tool, normalizedLevel);
  if (tool.mode === 'item_context_memory') return itemContextTrial(random, tool, normalizedLevel);
  if (tool.mode === 'relational_memory') return relationalMemoryTrial(random, tool, normalizedLevel);
  if (tool.mode === 'category_learning') return categoryLearningTrial(random, tool, normalizedLevel);
  if (tool.mode === 'transitive_inference') return transitiveInferenceTrial(random, tool, normalizedLevel);
  if (tool.mode === 'causal_chain') return arithmeticChainTrial(random, tool, normalizedLevel, false);
  if (tool.mode === 'counterfactual_reasoning') return arithmeticChainTrial(random, tool, normalizedLevel, true);
  if (tool.mode === 'number_line') return numberLineTrial(random, tool, normalizedLevel);
  if (tool.mode === 'constraint_planning') return constraintPlanningTrial(random, tool, normalizedLevel);
  if (tool.mode === 'error_detection') return errorDetectionTrial(random, tool, normalizedLevel);

  return makeAuditedExtensionTrial(tool, normalizedLevel, normalizedIndex, sessionSeed);
}
