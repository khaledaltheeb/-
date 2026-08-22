import { makeExtensionTrial as makeFinalExtensionTrial, supportsExtensionMode } from './engine-extension-final.mjs';

const SYMBOLS = ['●', '▲', '■', '◆', '★', '⬟', '✚', '⬢'];
const DIRECTIONS = ['↑', '→', '↓', '←'];
const FEATURES = ['أحمر', 'أزرق', 'أخضر', 'ذهبي', 'مخطط', 'منقط', 'فاتح', 'داكن'];
const OBJECTS = ['كتاب', 'مفتاح', 'كوب', 'قلم', 'كرة', 'مصباح', 'ساعة', 'دفتر', 'مظلة', 'جرس', 'خاتم', 'مرآة', 'صندوق', 'كرسي', 'باب', 'نافذة'];

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
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function unique(values) {
  return [...new Set(values.map(String))];
}

function finish(random, tool, level, raw) {
  const answer = String(raw.answer);
  const options = shuffle(random, unique(raw.options));
  if (!options.includes(answer)) options.push(answer);
  const semantic = [
    tool.slug,
    level,
    raw.study ?? '',
    raw.prompt,
    raw.display ?? '',
    answer,
    [...options].sort().join('|'),
    raw.difficultySignature,
  ].join('::');
  return {
    kind: raw.kind ?? 'choice',
    prompt: String(raw.prompt),
    ...(raw.display ? { display: String(raw.display) } : {}),
    ...(raw.study ? { study: String(raw.study) } : {}),
    answer,
    options: options.map((value) => ({ value, label: value })),
    rationale: String(raw.rationale),
    level,
    difficultyDescriptor: String(raw.difficultyDescriptor),
    difficultySignature: String(raw.difficultySignature),
    fingerprint: hashText(semantic).toString(16).padStart(8, '0'),
  };
}

function numericComparisonTrial(random, tool, level) {
  const digits = 1 + Math.floor((level - 1) / 2);
  const minimum = digits === 1 ? 2 : 10 ** (digits - 1);
  const maximum = digits === 1 ? 19 : (10 ** digits) - 1;
  const a = int(random, minimum, maximum);
  const gap = int(random, 1, Math.max(2, 8 - level));
  const b = a + (random() < 0.5 ? gap : -gap);
  const askLargest = random() < 0.5;
  const answer = String(askLargest ? Math.max(a, b) : Math.min(a, b));
  return finish(random, tool, level, {
    prompt: `اختر العدد ${askLargest ? 'الأكبر' : 'الأصغر'}: ${a} أم ${b}.`,
    answer,
    options: [String(a), String(b)],
    rationale: `${answer} هو العدد ${askLargest ? 'الأكبر' : 'الأصغر'} وفق قاعدة هذه المحاولة.`,
    difficultyDescriptor: `${digits} ${digits === 1 ? 'خانة' : 'خانات'} مع فرق عددي حتى ${Math.max(2, 8 - level)}`,
    difficultySignature: `numeric-comparison:digits-${digits}:gap-${Math.max(2, 8 - level)}:level-${level}`,
  });
}

function approximateNumberTrial(random, tool, level) {
  const small = int(random, 8 + level, 12 + level * 3);
  const relativeGap = [0.65, 0.5, 0.38, 0.28, 0.2][level - 1];
  const large = small + Math.max(2, Math.round(small * relativeGap));
  const largerOnLeft = random() < 0.5;
  const left = largerOnLeft ? large : small;
  const right = largerOnLeft ? small : large;
  const answer = largerOnLeft ? 'أ' : 'ب';
  const dots = (count) => Array.from({ length: count }, () => '●').join(' ');
  return finish(random, tool, level, {
    prompt: 'أي مجموعة تبدو أكبر؟ قدّر الكمية ولا تعتمد على أن جهة محددة هي الإجابة.',
    display: `أ: ${dots(left)}   |   ب: ${dots(right)}`,
    answer,
    options: ['أ', 'ب'],
    rationale: `المجموعة ${answer} تحتوي ${Math.max(left, right)} عنصرًا مقابل ${Math.min(left, right)} في المجموعة الأخرى.`,
    difficultyDescriptor: `نسبة تقارب تقريبية ${relativeGap.toFixed(2)} مع موازنة موضع المجموعة الأكبر`,
    difficultySignature: `approx-number:gap-${relativeGap}:level-${level}`,
  });
}

function numericInterferenceTrial(random, tool, level) {
  let valueA = int(random, 2, 9);
  let valueB = int(random, 2, 9);
  while (valueB === valueA) valueB = int(random, 2, 9);
  let countA = int(random, 2, Math.min(4 + level, 7));
  let countB = int(random, 2, Math.min(4 + level, 7));
  while (countB === countA) countB = int(random, 2, Math.min(4 + level, 7));

  const makeConflict = level >= 2 && random() < Math.min(0.85, 0.45 + level * 0.08);
  const valueALarger = valueA > valueB;
  const countALarger = countA > countB;
  if (makeConflict && valueALarger === countALarger) {
    [countA, countB] = [countB, countA];
  }
  if (!makeConflict && valueALarger !== (countA > countB)) {
    [countA, countB] = [countB, countA];
  }

  const askValue = random() < 0.5;
  const answer = askValue
    ? (valueA > valueB ? 'أ' : 'ب')
    : (countA > countB ? 'أ' : 'ب');
  return finish(random, tool, level, {
    prompt: askValue
      ? 'اختر البطاقة ذات قيمة الرقم الأكبر، وتجاهل عدد مرات تكرار الرقم.'
      : 'اختر البطاقة ذات عدد الرموز الأكبر، وتجاهل قيمة الرقم المكتوب.',
    display: `أ: ${Array.from({ length: countA }, () => String(valueA)).join(' ')}   |   ب: ${Array.from({ length: countB }, () => String(valueB)).join(' ')}`,
    answer,
    options: ['أ', 'ب'],
    rationale: askValue
      ? `قيمة الرقم في أ هي ${valueA} وفي ب هي ${valueB}؛ المطلوب هو القيمة العددية لا عدد التكرارات.`
      : `عدد الرموز في أ هو ${countA} وفي ب هو ${countB}؛ المطلوب هو عدد الرموز لا قيمة الرقم.`,
    difficultyDescriptor: `${makeConflict ? 'تعارض' : 'توافق'} بين القيمة وعدد الرموز مع مستوى ${level}`,
    difficultySignature: `numeric-interference:conflict-${Number(makeConflict)}:pool-${Math.min(4 + level, 7)}:level-${level}`,
  });
}

function symbolCodingTrial(random, tool, level) {
  const symbols = shuffle(random, SYMBOLS).slice(0, Math.min(3 + level, 8));
  const code = shuffle(random, Array.from({ length: symbols.length }, (_, index) => String(index + 1)));
  const mapping = symbols.map((symbol, index) => [symbol, code[index]]);
  const target = pick(random, mapping);
  const reverse = level >= 2 && random() < 0.5;
  return finish(random, tool, level, {
    prompt: reverse
      ? `المفتاح: ${mapping.map(([symbol, number]) => `${symbol}=${number}`).join('، ')}. أي رمز يقابل الرقم ${target[1]}؟`
      : `المفتاح: ${mapping.map(([symbol, number]) => `${symbol}=${number}`).join('، ')}. ما الرقم المقابل للرمز ${target[0]}؟`,
    answer: reverse ? target[0] : target[1],
    options: reverse ? symbols : code,
    rationale: `وفق المفتاح، ${target[0]} مرتبط بالرمز العددي ${target[1]}.`,
    difficultyDescriptor: `مفتاح من ${symbols.length} روابط ${reverse ? 'باتجاه عكسي' : 'باتجاه مباشر'}`,
    difficultySignature: `symbol-coding:pairs-${symbols.length}:reverse-${Number(reverse)}:level-${level}`,
  });
}

function setShiftingTrial(random, tool, level, index) {
  const number = int(random, 2, 18 + level * 3);
  const symbol = pick(random, SYMBOLS);
  const rules = level >= 4 ? ['تكافؤ', 'حجم', 'رمز'] : ['تكافؤ', 'حجم'];
  const previousRule = rules[index % rules.length];
  const shouldSwitch = index % 2 === 1;
  const currentRule = shouldSwitch ? rules[(rules.indexOf(previousRule) + 1) % rules.length] : previousRule;
  let answer;
  if (currentRule === 'تكافؤ') answer = number % 2 === 0 ? 'زوجي' : 'فردي';
  else if (currentRule === 'حجم') answer = number >= 10 + level ? 'كبير' : 'صغير';
  else answer = SYMBOLS.indexOf(symbol) < 4 ? 'مجموعة 1' : 'مجموعة 2';
  return finish(random, tool, level, {
    prompt: `القاعدة السابقة: ${previousRule}. القاعدة الحالية: ${currentRule}. المثير: ${number} ${symbol}. طبّق القاعدة الحالية فقط.`,
    answer,
    options: level >= 4
      ? ['زوجي', 'فردي', 'كبير', 'صغير', 'مجموعة 1', 'مجموعة 2']
      : ['زوجي', 'فردي', 'كبير', 'صغير'],
    rationale: `${shouldSwitch ? 'حدث تبديل للقاعدة؛' : 'استمرت القاعدة؛'} القاعدة الحالية هي ${currentRule} ولذلك الإجابة ${answer}.`,
    difficultyDescriptor: `${shouldSwitch ? 'محاولة تبديل' : 'محاولة بقاء'} ضمن ${rules.length} ${rules.length === 2 ? 'قاعدتين' : 'قواعد'}`,
    difficultySignature: `set-shift:rules-${rules.length}:switch-${Number(shouldSwitch)}:level-${level}`,
  });
}

function featureBindingTrial(random, tool, level) {
  const count = Math.min(2 + level, 7);
  const symbols = shuffle(random, SYMBOLS).slice(0, count);
  const features = shuffle(random, FEATURES).slice(0, count);
  const pairs = symbols.map((symbol, index) => [symbol, features[index]]);
  const target = pick(random, pairs);
  return finish(random, tool, level, {
    kind: 'memory',
    study: pairs.map(([symbol, feature]) => `${symbol} ↔ ${feature}`).join(' | '),
    prompt: `ما السمة التي كانت مرتبطة بالرمز ${target[0]}؟`,
    answer: target[1],
    options: features,
    rationale: `خلال مرحلة الدراسة ارتبط الرمز ${target[0]} بالسمة «${target[1]}».`,
    difficultyDescriptor: `${count} روابط بين رمز وسمة بصرية`,
    difficultySignature: `feature-binding:pairs-${count}:level-${level}`,
  });
}

function sourceMemoryTrial(random, tool, level) {
  const count = Math.min(3 + level, 8);
  const items = shuffle(random, OBJECTS).slice(0, count);
  const sourceCount = level >= 4 ? 3 : 2;
  const sources = shuffle(random, ['المصدر أ', 'المصدر ب', 'المصدر ج']).slice(0, sourceCount);
  const assignments = items.map((item, index) => [item, sources[index % sources.length]]);
  const target = pick(random, assignments);
  return finish(random, tool, level, {
    kind: 'memory',
    study: assignments.map(([item, source]) => `${source}: ${item}`).join(' | '),
    prompt: `في أي مصدر ظهر «${target[0]}»؟`,
    answer: target[1],
    options: sources,
    rationale: `العنصر «${target[0]}» قُدّم ضمن ${target[1]}.`,
    difficultyDescriptor: `${count} عناصر موزعة على ${sourceCount} مصادر`,
    difficultySignature: `source-memory:items-${count}:sources-${sourceCount}:level-${level}`,
  });
}

function relationalMemoryTrial(random, tool, level) {
  const pairCount = Math.min(2 + level, 6);
  const items = shuffle(random, OBJECTS).slice(0, pairCount * 2);
  const pairs = Array.from({ length: pairCount }, (_, index) => [items[index * 2], items[index * 2 + 1]]);
  const target = pick(random, pairs);
  const askLeft = random() < 0.5;
  const cue = askLeft ? target[0] : target[1];
  const answer = askLeft ? target[1] : target[0];
  const candidateSide = pairs.map((pair) => askLeft ? pair[1] : pair[0]);
  return finish(random, tool, level, {
    kind: 'memory',
    study: pairs.map(([left, right]) => `${left} ↔ ${right}`).join(' | '),
    prompt: `ما العنصر الذي ارتبط بـ«${cue}»؟`,
    answer,
    options: candidateSide,
    rationale: `العلاقة المدروسة كانت ${target[0]} ↔ ${target[1]}.`,
    difficultyDescriptor: `${pairCount} علاقات ثنائية مستقلة`,
    difficultySignature: `relational-memory:pairs-${pairCount}:level-${level}`,
  });
}

function embeddedPatternTrial(random, tool, level) {
  const targetLength = int(random, 2, Math.min(5, 2 + level));
  const target = shuffle(random, SYMBOLS).slice(0, targetLength);
  const beforeLength = int(random, 1, 2 + level);
  const afterLength = int(random, 1, 2 + level);
  const before = Array.from({ length: beforeLength }, () => pick(random, SYMBOLS));
  const after = Array.from({ length: afterLength }, () => pick(random, SYMBOLS));
  const display = [...before, ...target, ...after];
  const start = beforeLength + 1;
  const end = beforeLength + targetLength;
  const answer = `${start}–${end}`;
  const candidateStarts = unique([
    start,
    Math.max(1, start - 1),
    Math.min(display.length - targetLength + 1, start + 1),
    1,
    Math.max(1, display.length - targetLength + 1),
  ]).map(Number);
  const options = candidateStarts.map((candidateStart) => `${candidateStart}–${candidateStart + targetLength - 1}`);
  return finish(random, tool, level, {
    prompt: `المستهدف: ${target.join(' ')}. في أي نطاق متتالٍ يظهر داخل السلسلة؟`,
    display: display.join(' '),
    answer,
    options,
    rationale: `يبدأ النمط عند الموضع ${start} وينتهي عند الموضع ${end}.`,
    difficultyDescriptor: `هدف بطول ${targetLength} داخل ${display.length} عنصرًا`,
    difficultySignature: `embedded-pattern:target-${targetLength}:context-${beforeLength + afterLength}:level-${level}`,
  });
}

function meansEndTrial(random, tool, level) {
  const blockedFirst = random() < 0.5 ? 1 : 2;
  const answer = blockedFirst === 1 ? '+2' : '+1';
  const goal = int(random, 6 + level, 11 + level * 2);
  return finish(random, tool, level, {
    prompt: `ابدأ من 0 وهدفك ${goal}. يمكنك التحرك +1 أو +2، لكن يمنع الوقوف على النقطة ${blockedFirst}. ما الخطوة الأولى الوحيدة المسموح بها؟`,
    answer,
    options: ['+1', '+2', 'توقف', '-1'],
    rationale: `الخطوة ${blockedFirst === 1 ? '+1' : '+2'} تهبط مباشرة على النقطة المحظورة ${blockedFirst}؛ لذا الخطوة الأولى المسموح بها هي ${answer}.`,
    difficultyDescriptor: `هدف ${goal} مع قيد أولي يوازن اتجاه الإجابة`,
    difficultySignature: `means-end:block-${blockedFirst}:level-${level}`,
  });
}

function constraintPlanningTrial(random, tool, level) {
  const itemCount = Math.min(3 + level, 6);
  const items = shuffle(random, ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز']).slice(0, itemCount);
  const answer = items.join(' → ');
  const alternatives = [answer];
  for (let offset = 1; offset <= 4; offset += 1) {
    const candidate = [...items];
    const left = Math.min(candidate.length - 2, offset % (candidate.length - 1));
    [candidate[left], candidate[left + 1]] = [candidate[left + 1], candidate[left]];
    alternatives.push(candidate.join(' → '));
  }
  return finish(random, tool, level, {
    prompt: `رتّب العناصر وفق القيود: ${items.slice(0, -1).map((item, index) => `${item} قبل ${items[index + 1]}`).join('؛ ')}.`,
    answer,
    options: alternatives,
    rationale: `الترتيب ${answer} هو الوحيد بين البدائل الذي يحافظ على جميع علاقات «قبل» المعطاة.`,
    difficultyDescriptor: `${itemCount} عناصر و${itemCount - 1} قيود ترتيب`,
    difficultySignature: `constraint-planning:items-${itemCount}:constraints-${itemCount - 1}:level-${level}`,
  });
}

function categoryLearningTrial(random, tool, level) {
  const threshold = 5 + level;
  const classify = (value) => {
    if (level === 1) return value >= threshold;
    if (level === 2) return value % 2 === 0;
    if (level === 3) return value >= threshold && value % 2 === 0;
    if (level === 4) return value >= threshold - 2 && value <= threshold + 3;
    return value % 3 === threshold % 3;
  };
  const values = shuffle(random, Array.from({ length: 16 + level * 2 }, (_, index) => index + 1));
  const positives = values.filter(classify).slice(0, 3);
  const negatives = values.filter((value) => !classify(value)).slice(0, 3);
  if (positives.length < 2 || negatives.length < 2) return categoryLearningTrial(random, tool, level);
  const examples = shuffle(random, [
    ...positives.map((value) => `${value}=أ`),
    ...negatives.map((value) => `${value}=ب`),
  ]).slice(0, Math.min(4 + level, 6));
  const targetPool = values.filter((value) => !examples.some((example) => example.startsWith(`${value}=`)));
  const target = pick(random, targetPool);
  const answer = classify(target) ? 'الفئة أ' : 'الفئة ب';
  const ruleLabel = [
    `القيم من ${threshold} فأعلى`,
    'الأعداد الزوجية',
    `الأعداد الزوجية من ${threshold} فأعلى`,
    `القيم من ${threshold - 2} إلى ${threshold + 3}`, 
    `الأعداد التي تعطي باقي ${threshold % 3} عند القسمة على 3`,
  ][level - 1];
  return finish(random, tool, level, {
    kind: 'memory',
    study: `أمثلة معلّمة: ${examples.join('، ')}.`,
    prompt: `استنتج القاعدة وصنّف العدد ${target}.`,
    answer,
    options: ['الفئة أ', 'الفئة ب'],
    rationale: `القاعدة المقصودة في هذا المستوى هي: ${ruleLabel}. وفقها ينتمي ${target} إلى ${answer}.`,
    difficultyDescriptor: `استقراء قاعدة ${level === 1 ? 'أحادية' : level <= 3 ? 'منطقية' : 'مجردة'} من ${examples.length} أمثلة`,
    difficultySignature: `category-learning:rule-${level}:examples-${examples.length}`,
  });
}

const LANGUAGE_BANKS = {
  phoneme_discrimination: [
    ['أي زوج يبدأ بالصوت نفسه؟', 'سور – سمك', ['سور – سمك', 'باب – تاب', 'نور – دار', 'قلم – جبل']],
    ['أي زوج يبدأ بالصوت نفسه؟', 'باب – بيت', ['باب – بيت', 'دار – نار', 'نور – سور', 'قلم – علم']],
    ['أي زوج يختلف في الصوت الأول مع بقاء النهاية متقاربة؟', 'نور – سور', ['نور – سور', 'دار – دور', 'باب – بيت', 'ليل – لون']],
    ['أي زوج يبدأ بالصوت نفسه؟', 'دار – دود', ['دار – دود', 'سور – نور', 'بيت – زيت', 'قمر – عمر']],
    ['أي زوج يبدأ بالصوت نفسه؟', 'قلم – قمر', ['قلم – قمر', 'باب – تاب', 'سور – نور', 'دار – نار']],
    ['أي زوج يختلف في البداية الصوتية؟', 'باب – تاب', ['باب – تاب', 'دار – دود', 'سور – سمك', 'قلم – قمر']],
    ['أي زوج يبدأ بالصوت نفسه؟', 'ليل – لون', ['ليل – لون', 'نور – سور', 'بيت – زيت', 'دار – نار']],
    ['أي زوج يختلف في البداية الصوتية؟', 'بيت – زيت', ['بيت – زيت', 'دار – دود', 'سور – سمك', 'ليل – لون']],
  ],
  syllable_segmentation: [
    ['اختر التقسيم الأقرب لنطق «كاتب».', 'كا – تب', ['كا – تب', 'ك – اتب', 'كات – ب', 'كاتب']],
    ['اختر التقسيم الأقرب لنطق «سافر».', 'سا – فر', ['سا – فر', 'س – افر', 'ساف – ر', 'سافر']],
    ['اختر التقسيم الأقرب لنطق «دارس».', 'دا – رس', ['دا – رس', 'د – ارس', 'دار – س', 'دارس']],
    ['اختر التقسيم الأقرب لنطق «شارك».', 'شا – رك', ['شا – رك', 'ش – ارك', 'شار – ك', 'شارك']],
    ['اختر التقسيم الأقرب لنطق «لاعب».', 'لا – عب', ['لا – عب', 'ل – اعب', 'لاع – ب', 'لاعب']],
    ['اختر التقسيم الأقرب لنطق «قادر».', 'قا – در', ['قا – در', 'ق – ادر', 'قاد – ر', 'قادر']],
    ['اختر التقسيم الأقرب لنطق «ناصر».', 'نا – صر', ['نا – صر', 'ن – اصر', 'ناص – ر', 'ناصر']],
    ['اختر التقسيم الأقرب لنطق «سالم».', 'سا – لم', ['سا – لم', 'س – الم', 'سال – م', 'سالم']],
  ],
  rhyme_judgment: [
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'نور – سور', ['نور – سور', 'باب – قلم', 'بيت – شجر', 'قمر – طريق']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'كتاب – باب', ['كتاب – باب', 'ورد – طريق', 'قمر – بيت', 'نور – قلم']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'دار – نار', ['دار – نار', 'بيت – باب', 'سور – قلم', 'علم – طريق']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'جميل – قليل', ['جميل – قليل', 'كتاب – شجر', 'باب – نور', 'قمر – طريق']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'طويل – قليل', ['طويل – قليل', 'باب – نهر', 'ورد – قلم', 'بيت – دار']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'سعيد – بعيد', ['سعيد – بعيد', 'نور – قلم', 'باب – شجر', 'دار – بيت']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'حكيم – كريم', ['حكيم – كريم', 'نور – طريق', 'باب – شجر', 'دار – بيت']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'زمان – مكان', ['زمان – مكان', 'باب – نور', 'بيت – قلم', 'ورد – طريق']],
  ],
  lexical_decision: [
    ['أي سلسلة كلمة عربية مألوفة؟', 'نافذة', ['نافذة', 'زافنة', 'درفوم', 'حفمات']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'مفتاح', ['مفتاح', 'حفمات', 'تربوص', 'سرفاج']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'مدرسة', ['مدرسة', 'درمسة', 'مسرود', 'ترداس']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'طريق', ['طريق', 'طراغ', 'ضريق', 'تروغ']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'كتاب', ['كتاب', 'بتاك', 'كبوب', 'رتاف']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'حديقة', ['حديقة', 'دحيقة', 'حريقا', 'تديحة']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'مصباح', ['مصباح', 'صبماح', 'مرتاح', 'تسباح']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'مكتبة', ['مكتبة', 'تمكبة', 'مبتكة', 'ركتبة']],
  ],
  semantic_association: [
    ['ما الأكثر ارتباطًا بـ«مفتاح»؟', 'قفل', ['قفل', 'غيمة', 'وسادة', 'شجرة']],
    ['ما الأكثر ارتباطًا بـ«بوصلة»؟', 'اتجاه', ['اتجاه', 'مذاق', 'وسادة', 'نافذة']],
    ['ما الأكثر ارتباطًا بـ«مظلة»؟', 'مطر', ['مطر', 'مفتاح', 'كتاب', 'مرآة']],
    ['ما الأكثر ارتباطًا بـ«ميزان»؟', 'وزن', ['وزن', 'لون', 'صوت', 'سرعة']],
    ['ما الأكثر ارتباطًا بـ«محراث»؟', 'تربة', ['تربة', 'نافذة', 'ساعة', 'قلم']],
    ['ما الأكثر ارتباطًا بـ«بوصلة»؟', 'شمال', ['شمال', 'حلو', 'صامت', 'ثقيل']],
    ['ما الأكثر ارتباطًا بـ«فرشاة»؟', 'طلاء', ['طلاء', 'مطر', 'ساعة', 'باب']],
    ['ما الأكثر ارتباطًا بـ«سماعة»؟', 'صوت', ['صوت', 'لون', 'وزن', 'مسافة']],
  ],
  verbal_inference: [
    ['قرأ سامر التعليمات قبل تشغيل الجهاز، ثم أعاد الخطوة التي أخطأ فيها. ما الاستنتاج المدعوم؟', 'راجع الإجراء قبل المحاولة الثانية', ['راجع الإجراء قبل المحاولة الثانية', 'نجح من أول مرة', 'لم يقرأ التعليمات', 'تعطل الجهاز']],
    ['وصلت الحافلة بعد بدء المطر بدقائق، وكان مع ليلى مظلة مغلقة. ما الذي يدعمه النص؟', 'كانت المظلة مع ليلى', ['كانت المظلة مع ليلى', 'استخدمت المظلة قبل المطر', 'توقفت الحافلة بسبب المطر', 'لم تمطر']],
    ['وضع فهد الملف على المكتب ثم أغلق الغرفة بالمفتاح. ما الذي يدعمه النص؟', 'كان الملف على المكتب قبل إغلاق الغرفة', ['كان الملف على المكتب قبل إغلاق الغرفة', 'أخذ فهد الملف معه', 'ضاع المفتاح', 'بقيت الغرفة مفتوحة']],
    ['أنهت مريم الصفحة الأولى قبل أن تبدأ الثانية. ما الاستنتاج المدعوم؟', 'بدأت الصفحة الثانية بعد إنهاء الأولى', ['بدأت الصفحة الثانية بعد إنهاء الأولى', 'قرأت الصفحتين معًا', 'لم تنه الصفحة الأولى', 'تجاوزت الصفحة الثانية']],
    ['وضع سالم البطاقة في الدرج ثم خرج من المكتب. ما المدعوم؟', 'كانت البطاقة في الدرج قبل خروجه', ['كانت البطاقة في الدرج قبل خروجه', 'أخذ البطاقة معه', 'فتح الدرج بعد خروجه', 'لم يدخل المكتب']],
    ['أغلق نادر النافذة بعد أن اشتد الهواء. ما المدعوم؟', 'اشتد الهواء قبل إغلاق النافذة', ['اشتد الهواء قبل إغلاق النافذة', 'أغلق النافذة قبل الهواء', 'لم يكن هناك هواء', 'فتح النافذة لاحقًا']],
    ['شحن الجهاز ثم شغله بعد اكتمال الشحن. ما المدعوم؟', 'اكتمل الشحن قبل التشغيل', ['اكتمل الشحن قبل التشغيل', 'شغله قبل الشحن', 'تعطل الجهاز', 'لم يستخدم الشاحن']],
    ['رتبت هدى الكتب ثم وضعت القلم فوقها. ما المدعوم؟', 'وضع القلم حدث بعد ترتيب الكتب', ['وضع القلم حدث بعد ترتيب الكتب', 'وضعت القلم أولًا', 'لم ترتب الكتب', 'أزالت القلم']],
  ],
  ambiguity_resolution: [
    ['في جملة «جلس الطالب قرب عين الماء»، ما معنى «عين»؟', 'نبع', ['نبع', 'عضو البصر', 'جاسوس', 'حرف']],
    ['في جملة «راجع المصرف قبل السفر»، ما معنى «المصرف»؟', 'البنك', ['البنك', 'مكان تصريف الماء', 'اتجاه الطريق', 'النافذة']],
    ['في جملة «رفع اللاعب رأس الحربة»، ما المقصود بـ«رأس» هنا؟', 'مقدمة الحربة', ['مقدمة الحربة', 'عضو الجسم', 'مدير المؤسسة', 'قمة الجبل']],
    ['في جملة «فتح الباحث باب النقاش»، ما معنى «باب»؟', 'مدخل موضوع', ['مدخل موضوع', 'باب منزل', 'قطعة أثاث', 'طريق مغلق']],
    ['في جملة «بلغ الخبر أذن المسؤول»، ما معنى «أذن»؟', 'عضو السمع', ['عضو السمع', 'سمح', 'وقت الصلاة', 'أعلن']],
    ['في جملة «كان قلب المدينة مزدحمًا»، ما معنى «قلب»؟', 'وسط المدينة', ['وسط المدينة', 'عضو الجسم', 'قلب الصفحة', 'غيّر القرار']],
    ['في جملة «وصل إلى قمة العمل بعد سنوات»، ما معنى «قمة»؟', 'أعلى مستوى', ['أعلى مستوى', 'رأس جبل فقط', 'قاعدة البناء', 'بداية الطريق']],
    ['في جملة «أضاءت الفكرة طريق الحل»، ما معنى «طريق»؟', 'مسار مجازي للحل', ['مسار مجازي للحل', 'شارع فعلي', 'مركبة', 'باب']],
  ],
  morphological_reasoning: [
    ['كاتب : كتابة :: قارئ : ؟', 'قراءة', ['قراءة', 'مقروء', 'كتاب', 'قارئ']],
    ['تعليم : معلّم :: تدريب : ؟', 'مدرّب', ['مدرّب', 'متدرّب', 'تدريب', 'درس']],
    ['زرع : زارع :: صنع : ؟', 'صانع', ['صانع', 'مصنوع', 'صناعة', 'زرع']],
    ['بحث : باحث :: رسم : ؟', 'راسم', ['راسم', 'مرسوم', 'رسم', 'لوحة']],
    ['كتب : كاتب :: لعب : ؟', 'لاعب', ['لاعب', 'ملعب', 'لعبة', 'مكتوب']],
    ['حفظ : حافظ :: عمل : ؟', 'عامل', ['عامل', 'عمل', 'معمول', 'حافظ']],
    ['علم : عالم :: شعر : ؟', 'شاعر', ['شاعر', 'شعور', 'مشعور', 'علم']],
    ['سبح : سابح :: ركض : ؟', 'راكض', ['راكض', 'ركضة', 'مرْكض', 'سابح']],
  ],
};

function languageTrial(random, tool, level, index) {
  const bank = LANGUAGE_BANKS[tool.mode];
  const row = bank[(index + int(random, 0, 63)) % bank.length];
  return finish(random, tool, level, {
    prompt: row[0],
    answer: row[1],
    options: row[2],
    rationale: `الإجابة «${row[1]}» تحقق القاعدة المطلوبة في السؤال ضمن هذه المهمة التعليمية.`,
    difficultyDescriptor: `بنك لغوي من ${bank.length} بنود؛ المستوى ${level} ما زال تحت المراجعة الدلالية`,
    difficultySignature: `${tool.mode}:bank-${bank.length}:level-${level}`,
  });
}

const AUDITED = new Set([
  'numeric_comparison_speed',
  'approximate_number',
  'numerical_stroop',
  'symbol_coding',
  'set_shifting_cued',
  'feature_binding',
  'source_memory',
  'relational_memory',
  'embedded_pattern',
  'means_end_planning',
  'constraint_planning',
  'category_learning',
  ...Object.keys(LANGUAGE_BANKS),
]);

export { supportsExtensionMode };

export function makeExtensionTrial(tool, level, trialIndex, sessionSeed = 1) {
  if (!AUDITED.has(tool.mode)) return makeFinalExtensionTrial(tool, level, trialIndex, sessionSeed);
  const normalizedLevel = Math.min(5, Math.max(1, Math.trunc(Number(level) || 1)));
  const normalizedIndex = Math.max(0, Math.trunc(Number(trialIndex) || 0));
  const random = seededRandom(hashText(`${tool.slug}:${normalizedLevel}:${normalizedIndex}:${sessionSeed}:audit-v1`));

  if (tool.mode === 'numeric_comparison_speed') return numericComparisonTrial(random, tool, normalizedLevel);
  if (tool.mode === 'approximate_number') return approximateNumberTrial(random, tool, normalizedLevel);
  if (tool.mode === 'numerical_stroop') return numericInterferenceTrial(random, tool, normalizedLevel);
  if (tool.mode === 'symbol_coding') return symbolCodingTrial(random, tool, normalizedLevel);
  if (tool.mode === 'set_shifting_cued') return setShiftingTrial(random, tool, normalizedLevel, normalizedIndex);
  if (tool.mode === 'feature_binding') return featureBindingTrial(random, tool, normalizedLevel);
  if (tool.mode === 'source_memory') return sourceMemoryTrial(random, tool, normalizedLevel);
  if (tool.mode === 'relational_memory') return relationalMemoryTrial(random, tool, normalizedLevel);
  if (tool.mode === 'embedded_pattern') return embeddedPatternTrial(random, tool, normalizedLevel);
  if (tool.mode === 'means_end_planning') return meansEndTrial(random, tool, normalizedLevel);
  if (tool.mode === 'constraint_planning') return constraintPlanningTrial(random, tool, normalizedLevel);
  if (tool.mode === 'category_learning') return categoryLearningTrial(random, tool, normalizedLevel);
  if (LANGUAGE_BANKS[tool.mode]) return languageTrial(random, tool, normalizedLevel, normalizedIndex);

  return makeFinalExtensionTrial(tool, level, trialIndex, sessionSeed);
}
