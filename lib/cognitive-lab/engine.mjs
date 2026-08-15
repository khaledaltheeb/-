const SYMBOLS = ['●', '▲', '■', '◆', '★', '⬟', '✚', '⬢'];
const ARROWS = ['↑', '→', '↓', '←'];
const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
const LOCATIONS = ['أعلى اليمين', 'أعلى الوسط', 'أعلى اليسار', 'الوسط يمين', 'الوسط', 'الوسط يسار', 'أسفل اليمين', 'أسفل الوسط', 'أسفل اليسار'];
const COLORS = [
  { value: 'red', label: 'أحمر', tone: '#b83838' },
  { value: 'blue', label: 'أزرق', tone: '#2769b2' },
  { value: 'green', label: 'أخضر', tone: '#21825b' },
  { value: 'gold', label: 'ذهبي', tone: '#9b6d00' },
];

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

function randomInt(random, minimum, maximum) {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function shuffle(random, values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function unique(values) {
  return [...new Set(values)];
}

function option(value, label = String(value), tone) {
  return { value: String(value), label: String(label), ...(tone ? { tone } : {}) };
}

function textOptions(values) {
  return values.map((value) => option(value));
}

function numericDistractors(answer, spread = 2) {
  const value = Number(answer);
  return unique([value, value + 1, value - 1, value + spread, value - spread])
    .filter((candidate) => Number.isFinite(candidate))
    .slice(0, 4)
    .map(String);
}

function sequenceVariants(sequence) {
  const base = [...sequence];
  const reversed = [...base].reverse();
  const rotated = [...base.slice(1), base[0]];
  const swapped = [...base];
  if (swapped.length > 2) [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
  return unique([base.join(' – '), reversed.join(' – '), rotated.join(' – '), swapped.join(' – ')]);
}

function finish(random, raw, tool, level) {
  const deduped = [];
  const seen = new Set();
  for (const item of raw.options ?? []) {
    const normalized = typeof item === 'object' ? item : option(item);
    if (!seen.has(String(normalized.value))) {
      seen.add(String(normalized.value));
      deduped.push({ ...normalized, value: String(normalized.value), label: String(normalized.label) });
    }
  }
  const answer = String(raw.answer);
  if (!seen.has(answer)) deduped.push(option(answer));
  const options = raw.kind === 'reaction' ? deduped : shuffle(random, deduped);
  if (options.filter((item) => item.value === answer).length !== 1) {
    throw new Error(`Invalid answer cardinality for ${tool.slug}`);
  }
  if (raw.kind !== 'reaction' && options.length < 2) {
    throw new Error(`Insufficient choices for ${tool.slug}`);
  }
  const semantic = [
    tool.slug,
    level,
    raw.study ?? '',
    raw.prompt,
    raw.display ?? '',
    answer,
    [...options].map((item) => item.value).sort().join('|'),
    raw.difficultySignature,
    raw.audioCount ?? '',
    raw.reactionDelay ?? '',
  ].join('::');
  return {
    kind: raw.kind ?? 'choice',
    prompt: String(raw.prompt),
    ...(raw.display ? { display: String(raw.display) } : {}),
    ...(raw.displayTone ? { displayTone: String(raw.displayTone) } : {}),
    ...(raw.study ? { study: String(raw.study) } : {}),
    answer,
    options,
    rationale: String(raw.rationale),
    level,
    difficultyDescriptor: String(raw.difficultyDescriptor ?? `المستوى ${level} من 5`),
    difficultySignature: String(raw.difficultySignature ?? `level:${level}`),
    fingerprint: hashText(semantic).toString(16).padStart(8, '0'),
    ...(raw.audioCount ? { audioCount: raw.audioCount } : {}),
    ...(raw.reactionDelay ? { reactionDelay: raw.reactionDelay } : {}),
  };
}

function colorOptions() {
  return COLORS.map((color) => option(color.value, color.label, color.tone));
}

function makeChoiceReaction(random, level, index) {
  const targetIndex = randomInt(random, 0, 3);
  const target = ARROWS[targetIndex];
  const flankers = Array.from({ length: 2 + level }, () => pick(random, ARROWS)).join(' ');
  const inverted = level >= 3 && (index + level) % 3 === 0;
  const answer = inverted ? ARROWS[(targetIndex + 2) % 4] : target;
  const allowed = level === 1 ? unique([answer, ARROWS[(ARROWS.indexOf(answer) + 2) % 4]]) : ARROWS;
  return {
    prompt: inverted ? 'اختر الاتجاه المعاكس للسهم المركزي.' : 'اختر اتجاه السهم المركزي.',
    display: `${flankers} 〔 ${target} 〕 ${shuffle(random, flankers.split(' ')).join(' ')}`,
    answer,
    options: textOptions(allowed),
    rationale: inverted ? `القاعدة تطلب العكس؛ الاتجاه المقابل لـ${target} هو ${answer}.` : `اتجاه الهدف هو ${answer}.`,
    difficultyDescriptor: ['بديلان واتجاه مباشر', 'أربعة اتجاهات مباشرة', 'إضافة قاعدة العكس', 'مشتتات أكثر مع تبديل القاعدة', 'حمولة بصرية أعلى وتبديل متكرر'][level - 1],
    difficultySignature: `choices:${allowed.length};inverse:${Number(level >= 3)};flankers:${2 + level}`,
  };
}

function makeVisualReaction(random, level) {
  const families = [
    ['●', '○', '◉', '◎'],
    ['▲', '△', '▴', '▵'],
    ['■', '□', '▪', '▫'],
    ['◆', '◇', '◈', '⬖'],
  ];
  const family = pick(random, families);
  const answer = pick(random, family);
  const distractor = pick(random, family.filter((symbol) => symbol !== answer));
  const length = 5 + level * 3;
  const row = shuffle(random, [answer, ...Array.from({ length: length - 1 }, () => distractor)]);
  return {
    prompt: 'أي رمز يظهر مرة واحدة داخل الصف؟',
    display: row.join('  '),
    answer,
    options: textOptions(family),
    rationale: `الرمز ${answer} هو الوحيد المختلف عن المشتت المتكرر ${distractor}.`,
    difficultyDescriptor: `صف من ${length} عنصرًا وتقارب بصري بدرجة ${level}`,
    difficultySignature: `items:${length};similarity:${level}`,
  };
}

function makeAuditorySymbol(random, level) {
  const maximum = Math.min(4 + Math.floor(level / 2), 6);
  const count = randomInt(random, 1, maximum);
  const symbols = shuffle(random, SYMBOLS).slice(0, maximum);
  return {
    kind: 'audio',
    prompt: `استمع إلى النغمات ثم استخدم المفتاح: ${symbols.slice(0, maximum).map((symbol, index) => `${index + 1}=${symbol}`).join('، ')}`,
    answer: symbols[count - 1],
    options: textOptions(symbols.slice(0, maximum)),
    rationale: `عُرضت ${count} نغمات؛ الرمز المقابل للعدد ${count} هو ${symbols[count - 1]}.`,
    audioCount: count,
    difficultyDescriptor: `مفتاح يضم ${maximum} روابط سمعية بصرية`,
    difficultySignature: `audio-map:${maximum}`,
  };
}

function makeGoNoGo(random, level, index) {
  const targetCount = level < 3 ? 1 : level < 5 ? 2 : 3;
  const targets = shuffle(random, SYMBOLS).slice(0, targetCount);
  const shouldGo = index % 2 === 0;
  const stimulus = shouldGo ? pick(random, targets) : pick(random, SYMBOLS.filter((symbol) => !targets.includes(symbol)));
  return {
    prompt: `الأهداف: ${targets.join('، ')}. المثير الحالي:`,
    display: stimulus,
    answer: shouldGo ? 'go' : 'stop',
    options: [option('go', 'استجب'), option('stop', 'امتنع')],
    rationale: shouldGo ? 'المثير ضمن مجموعة الأهداف، لذلك الاستجابة مناسبة.' : 'المثير خارج مجموعة الأهداف، لذلك الامتناع مناسب.',
    difficultyDescriptor: `تمييز ${targetCount} ${targetCount === 1 ? 'هدف' : 'أهداف'} بين ${4 + level} رموز محتملة`,
    difficultySignature: `targets:${targetCount};pool:${4 + level}`,
  };
}

function makeStroop(random, level, index, advanced) {
  const word = pick(random, COLORS);
  const congruent = level === 1 ? index % 2 === 0 : index % (level === 2 ? 3 : 5) === 0;
  const ink = congruent ? word : pick(random, COLORS.filter((color) => color.value !== word.value));
  const useInk = !advanced || (index + level) % 2 === 0;
  const answer = useInk ? ink.value : word.value;
  return {
    kind: 'stroop',
    prompt: advanced ? `القاعدة الحالية: اختر ${useInk ? 'لون الحبر' : 'معنى الكلمة'}.` : 'اختر لون الحبر، لا معنى الكلمة.',
    display: word.label,
    answer,
    options: colorOptions(),
    rationale: `معنى الكلمة «${word.label}»، ولون الحبر «${ink.label}». القاعدة تطلب ${useInk ? 'الحبر' : 'المعنى'}.`,
    displayTone: ink.tone,
    difficultyDescriptor: advanced ? `تبديل قاعدة اللون والمعنى مع تعارض بدرجة ${level}` : `زيادة نسبة التعارض البصري إلى الدرجة ${level}`,
    difficultySignature: `advanced:${Number(advanced)};conflict:${level};switch:${Number(advanced && level > 1)}`,
  };
}

function makeResponseInhibition(random, level, index) {
  const centerIndex = randomInt(random, 0, 3);
  const center = ARROWS[centerIndex];
  const invert = level >= 4 && index % 3 === 0;
  const answer = invert ? ARROWS[(centerIndex + 2) % 4] : center;
  const congruent = index % Math.max(2, 6 - level) === 0;
  const leftFlanker = congruent ? center : pick(random, ARROWS.filter((arrow) => arrow !== center));
  const rightFlanker = congruent ? center : pick(random, ARROWS.filter((arrow) => arrow !== center && arrow !== leftFlanker));
  const flankCount = 2 + level;
  return {
    prompt: invert ? 'اختر عكس اتجاه السهم الأوسط وتجاهل المحيط.' : 'اختر اتجاه السهم الأوسط وتجاهل المحيط.',
    display: `${Array(flankCount).fill(leftFlanker).join(' ')}  ${center}  ${Array(flankCount).fill(rightFlanker).join(' ')}`,
    answer,
    options: textOptions(ARROWS),
    rationale: invert ? `السهم الأوسط ${center} والقاعدة تطلب عكسه، أي ${answer}.` : `اتجاه السهم الأوسط هو ${answer}.`,
    difficultyDescriptor: `عدد المشتتات ${flankCount * 2} وتعقيد القاعدة ${level}`,
    difficultySignature: `flankers:${flankCount * 2};inverse:${Number(level >= 4)};conflict:${level}`,
  };
}

function makeSpan(random, level, mode) {
  const isLetter = mode === 'letter_span';
  const isBackward = mode === 'digit_span_backward';
  const length = 2 + level + (isBackward ? 0 : 1);
  const pool = isLetter ? LETTERS : ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const sequence = shuffle(random, pool).slice(0, length);
  const answerSequence = isBackward ? [...sequence].reverse() : sequence;
  return {
    kind: 'memory',
    study: sequence.join(' – '),
    prompt: isBackward ? 'اختر التسلسل بترتيب معكوس.' : 'اختر التسلسل بالترتيب نفسه.',
    answer: answerSequence.join(' – '),
    options: textOptions(sequenceVariants(answerSequence)),
    rationale: `التسلسل المطلوب هو ${answerSequence.join(' – ')}.`,
    difficultyDescriptor: `تسلسل من ${length} ${isLetter ? 'حروف' : 'أرقام'}`,
    difficultySignature: `span:${length};reverse:${Number(isBackward)}`,
  };
}

function makeSpatialSpan(random, level) {
  const length = 2 + level;
  const sequence = shuffle(random, Array.from({ length: 9 }, (_, index) => index + 1)).slice(0, length);
  const values = sequenceVariants(sequence);
  return {
    kind: 'memory',
    study: `مسار المواقع: ${sequence.map((value) => `${value}(${LOCATIONS[value - 1]})`).join(' ← ')}`,
    prompt: 'اختر ترتيب المواقع الذي عُرض.',
    answer: sequence.join(' – '),
    options: textOptions(values),
    rationale: `المسار بدأ من ${sequence[0]} وانتهى عند ${sequence.at(-1)} بهذا الترتيب.`,
    difficultyDescriptor: `مسار من ${length} انتقالات على شبكة 3×3`,
    difficultySignature: `spatial-span:${length}`,
  };
}

function makeNBack(random, level, distance, index) {
  const length = distance + 2 + level;
  const sequence = Array.from({ length }, () => pick(random, SYMBOLS.slice(0, 4 + Math.min(level, 4))));
  const targetPosition = length - 1 - distance;
  const match = index % 2 === 0;
  sequence[length - 1] = match ? sequence[targetPosition] : pick(random, SYMBOLS.filter((symbol) => symbol !== sequence[targetPosition]));
  return {
    kind: 'memory',
    study: sequence.join('  '),
    prompt: `هل الرمز الأخير يطابق الرمز قبله بـ${distance === 1 ? 'خطوة واحدة' : `${distance} خطوات`}؟`,
    answer: match ? 'yes' : 'no',
    options: [option('yes', 'نعم'), option('no', 'لا')],
    rationale: `رمز المقارنة هو ${sequence[targetPosition]} والرمز الأخير ${sequence.at(-1)}؛ لذا الإجابة ${match ? 'نعم' : 'لا'}.`,
    difficultyDescriptor: `مسافة ${distance}-Back وسجل من ${length} رموز`,
    difficultySignature: `n:${distance};history:${length};pool:${4 + Math.min(level, 4)}`,
  };
}

function makeMemoryUpdate(random, level) {
  const start = randomInt(random, 3, 12);
  const count = 1 + level;
  const changes = Array.from({ length: count }, () => {
    const amount = randomInt(random, 1, 3);
    return random() > 0.45 ? amount : -amount;
  });
  const result = changes.reduce((value, change) => value + change, start);
  return {
    kind: 'memory',
    study: `ابدأ من ${start}. التحديثات: ${changes.map((change) => (change > 0 ? `+${change}` : String(change))).join('، ')}`,
    prompt: 'ما القيمة النهائية بعد تطبيق التحديثات بالترتيب؟',
    answer: String(result),
    options: textOptions(numericDistractors(result, 3)),
    rationale: `بعد تطبيق التحديثات على ${start} تصبح القيمة ${result}.`,
    difficultyDescriptor: `${count} عمليات تحديث متتابعة`,
    difficultySignature: `updates:${count}`,
  };
}

function makeVisualGrid(random, level) {
  const count = 2 + level;
  const cells = shuffle(random, Array.from({ length: 9 }, (_, index) => index + 1)).slice(0, count).sort((a, b) => a - b);
  const variants = [
    cells,
    [...cells.slice(0, -1), ((cells.at(-1) ?? 1) % 9) + 1],
    [((cells[0] + 1) % 9) + 1, ...cells.slice(1)],
    cells.map((cell, index) => (index === 1 ? ((cell + 2) % 9) + 1 : cell)),
  ].map((values) => unique(values).sort((a, b) => a - b).join('، '));
  return {
    kind: 'memory',
    study: `الخلايا المميزة: ${cells.map((cell) => `${cell} (${LOCATIONS[cell - 1]})`).join('، ')}`,
    prompt: 'اختر مجموعة أرقام الخلايا المطابقة.',
    answer: cells.join('، '),
    options: textOptions(unique(variants)),
    rationale: `المواضع المحفوظة هي ${cells.join('، ')}.`,
    difficultyDescriptor: `${count} خلايا داخل شبكة من تسع خلايا`,
    difficultySignature: `grid-cells:${count}`,
  };
}

function makeSequenceMemory(random, level) {
  const length = 3 + level;
  const sequence = shuffle(random, SYMBOLS).slice(0, length);
  return {
    kind: 'memory',
    study: sequence.join('  '),
    prompt: 'اختر ترتيب الرموز المطابق كاملًا.',
    answer: sequence.join(' – '),
    options: textOptions(sequenceVariants(sequence)),
    rationale: `الترتيب الصحيح هو ${sequence.join(' – ')}.`,
    difficultyDescriptor: `ترتيب من ${length} رموز`,
    difficultySignature: `sequence:${length}`,
  };
}

const WORD_PAIRS = [
  ['قمر', 'ليل'], ['مفتاح', 'باب'], ['قلم', 'ورق'], ['شجرة', 'ظل'], ['بحر', 'موج'], ['كتاب', 'رف'],
  ['طائر', 'عش'], ['ساعة', 'وقت'], ['نافذة', 'ضوء'], ['سحابة', 'مطر'], ['جسر', 'نهر'], ['مصباح', 'غرفة'],
];

function makePairedAssociates(random, level) {
  const count = 2 + level;
  const pairs = shuffle(random, WORD_PAIRS).slice(0, count);
  const target = pick(random, pairs);
  return {
    kind: 'memory',
    study: pairs.map(([first, second]) => `${first} ↔ ${second}`).join('  |  '),
    prompt: `ما الكلمة التي ارتبطت بكلمة «${target[0]}»؟`,
    answer: target[1],
    options: textOptions(unique([target[1], ...shuffle(random, WORD_PAIRS.map((pair) => pair[1])).filter((word) => word !== target[1]).slice(0, 3)])),
    rationale: `في قائمة الدراسة ظهر الزوج ${target[0]} ↔ ${target[1]}.`,
    difficultyDescriptor: `${count} أزواج للدراسة`,
    difficultySignature: `pairs:${count}`,
  };
}

function makeSymbolMemory(random, level) {
  const count = 2 + level;
  const studied = shuffle(random, SYMBOLS).slice(0, count);
  const answer = pick(random, studied);
  return {
    kind: 'memory',
    study: studied.join('  '),
    prompt: 'أي رمز كان موجودًا في مجموعة الدراسة؟',
    answer,
    options: textOptions(unique([answer, ...shuffle(random, SYMBOLS.filter((symbol) => !studied.includes(symbol))).slice(0, 3)])),
    rationale: `الرمز ${answer} ظهر ضمن مجموعة الدراسة.`,
    difficultyDescriptor: `مجموعة دراسة من ${count} رموز`,
    difficultySignature: `symbol-memory:${count}`,
  };
}

function makeVisualSearch(random, level) {
  const target = pick(random, SYMBOLS);
  const distractorPool = level < 3
    ? SYMBOLS.filter((symbol) => symbol !== target)
    : ['○', '△', '□', '◇', '☆', '⬡', '✕', '⬣'];
  const length = 6 + level * 4;
  const position = randomInt(random, 0, length - 1);
  const row = Array.from({ length }, () => pick(random, distractorPool));
  row[position] = target;
  const groups = [];
  const groupCount = Math.min(4, 2 + Math.floor(level / 2));
  const groupSize = Math.ceil(length / groupCount);
  for (let start = 0; start < row.length; start += groupSize) groups.push(row.slice(start, start + groupSize).join(' '));
  return {
    prompt: `ابحث عن الرمز ${target}. في أي مجموعة يظهر؟`,
    display: groups.map((group, index) => `${index + 1}) ${group}`).join('   '),
    answer: String(Math.floor(position / groupSize) + 1),
    options: textOptions(groups.map((_, index) => String(index + 1))),
    rationale: `ظهر الهدف في المجموعة ${Math.floor(position / groupSize) + 1}.`,
    difficultyDescriptor: `${length} مثيرًا موزعة على ${groups.length} ${groups.length === 1 ? 'مجموعة' : 'مجموعات'}`,
    difficultySignature: `search-items:${length};groups:${groups.length};similarity:${level}`,
  };
}

function makeSymbolSearch(random, level, index) {
  const pool = SYMBOLS.slice(0, 4 + Math.min(level, 4));
  const target = pick(random, pool);
  const present = index % 2 === 0;
  const count = 3 + level;
  const row = shuffle(random, [
    ...(present ? [target] : []),
    ...Array.from({ length: count - Number(present) }, () => pick(random, pool.filter((symbol) => symbol !== target))),
  ]);
  return {
    prompt: `هل الرمز الهدف ${target} موجود في المجموعة؟`,
    display: row.join('  '),
    answer: present ? 'yes' : 'no',
    options: [option('yes', 'نعم'), option('no', 'لا')],
    rationale: present ? `الرمز ${target} موجود في المجموعة.` : `الرمز ${target} غير موجود في المجموعة.`,
    difficultyDescriptor: `مجموعة من ${count} رموز وحجم قاموس ${pool.length}`,
    difficultySignature: `symbol-search:${count};pool:${pool.length}`,
  };
}

function makeSustainedAttention(random, level, index) {
  const targetCount = level >= 4 ? 2 : 1;
  const targets = shuffle(random, SYMBOLS).slice(0, targetCount);
  const isTarget = index % Math.max(2, 5 - Math.floor(level / 2)) === 0;
  const stimulus = isTarget ? pick(random, targets) : pick(random, SYMBOLS.filter((symbol) => !targets.includes(symbol)));
  return {
    prompt: `استجب فقط ${targetCount === 1 ? 'للهدف' : 'للهدفين'} ${targets.join(' أو ')}.`,
    display: stimulus,
    answer: isTarget ? 'target' : 'other',
    options: [option('target', 'هدف'), option('other', 'ليس هدفًا')],
    rationale: isTarget ? 'المثير يطابق قاعدة الهدف.' : 'المثير لا يطابق قاعدة الهدف.',
    difficultyDescriptor: `${targetCount} هدف مع ندرة هدف بدرجة ${level}`,
    difficultySignature: `sustained-targets:${targetCount};rarity:${level}`,
  };
}

function makeDividedAttention(random, level) {
  const shapes = ['دائرة', 'مربع', 'مثلث', 'معين'];
  const shapePool = shapes.slice(0, 2 + Math.ceil(level / 2));
  const shape = pick(random, shapePool);
  const number = randomInt(random, 1, 9 + level * 2);
  const parity = number % 2 === 0 ? 'زوجي' : 'فردي';
  const answer = `${shape}:${parity}`;
  const alternatives = [
    option(answer, `${shape} · ${parity}`),
    option(`${shape}:${parity === 'زوجي' ? 'فردي' : 'زوجي'}`, `${shape} · ${parity === 'زوجي' ? 'فردي' : 'زوجي'}`),
    ...shapePool.filter((candidate) => candidate !== shape).slice(0, 2).map((candidate) => option(`${candidate}:${parity}`, `${candidate} · ${parity}`)),
  ];
  return {
    prompt: 'اختر الوصف الذي يجمع الشكل ونوع العدد.',
    display: `${shape} بداخله العدد ${number}`,
    answer,
    options: alternatives,
    rationale: `الشكل ${shape} والعدد ${number} ${parity}.`,
    difficultyDescriptor: `دمج خاصيتين مع ${shapePool.length} أشكال محتملة`,
    difficultySignature: `divided-shapes:${shapePool.length};range:${9 + level * 2}`,
  };
}

function makeSelectiveAttention(random, level, index) {
  const targetCount = level >= 4 ? 2 : 1;
  const targets = shuffle(random, SYMBOLS).slice(0, targetCount);
  const match = index % 3 === 0;
  const shown = match ? pick(random, targets) : pick(random, SYMBOLS.filter((symbol) => !targets.includes(symbol)));
  return {
    prompt: `استجب فقط عند ظهور ${targets.join(' أو ')}.`,
    display: `${shuffle(random, SYMBOLS).slice(0, level).join(' ')} 〔${shown}〕 ${shuffle(random, SYMBOLS).slice(0, level).join(' ')}`,
    answer: match ? 'respond' : 'ignore',
    options: [option('respond', 'استجب'), option('ignore', 'تجاهل')],
    rationale: match ? `${shown} هدف وفق القاعدة.` : `${shown} مشتت وليس هدفًا.`,
    difficultyDescriptor: `${targetCount} هدف و${level * 2} مشتتات محيطة`,
    difficultySignature: `selective-targets:${targetCount};flankers:${level * 2}`,
  };
}

function makeAttentionSwitch(random, level, index) {
  const shapes = ['دائرة', 'مربع', 'مثلث', 'معين'];
  const color = pick(random, COLORS);
  const shape = pick(random, shapes);
  const rules = level >= 4 ? ['color', 'shape', 'parity'] : ['color', 'shape'];
  const rule = rules[(index + randomInt(random, 0, rules.length - 1)) % rules.length];
  const number = randomInt(random, 1, 9);
  const answer = rule === 'color' ? color.value : rule === 'shape' ? shape : number % 2 === 0 ? 'even' : 'odd';
  return {
    prompt: `القاعدة الحالية: اختر ${rule === 'color' ? 'اللون' : rule === 'shape' ? 'الشكل' : 'نوع العدد'}.`,
    display: `${shape} ${color.label} · ${number}`,
    answer,
    options: [
      ...colorOptions(),
      ...textOptions(shapes),
      option('even', 'زوجي'),
      option('odd', 'فردي'),
    ],
    rationale: `القاعدة تطلب ${rule === 'color' ? color.label : rule === 'shape' ? shape : number % 2 === 0 ? 'زوجي' : 'فردي'}.`,
    difficultyDescriptor: `تبديل بين ${rules.length} قواعد وحمولة مثير بدرجة ${level}`,
    difficultySignature: `attention-rules:${rules.length};load:${level}`,
  };
}

function makeNumberSeries(random, level) {
  const start = randomInt(random, 1, 12);
  const step = randomInt(random, 1, 3 + level);
  const length = 3 + Math.min(level, 3);
  let sequence;
  let answer;
  let rule;
  if (level <= 2) {
    sequence = Array.from({ length }, (_, index) => start + index * step);
    answer = start + length * step;
    rule = `إضافة ${step}`;
  } else if (level <= 4) {
    sequence = [start];
    for (let index = 1; index < length; index += 1) sequence.push(sequence[index - 1] + step + index - 1);
    answer = sequence.at(-1) + step + length - 1;
    rule = `زيادات تبدأ من ${step} وتزداد واحدًا`;
  } else {
    const multiplier = randomInt(random, 2, 3);
    sequence = Array.from({ length: 4 }, (_, index) => start * multiplier ** index);
    answer = sequence.at(-1) * multiplier;
    rule = `الضرب في ${multiplier}`;
  }
  return {
    prompt: 'ما العدد التالي في السلسلة؟',
    display: `${sequence.join('، ')}، ؟`,
    answer: String(answer),
    options: textOptions(numericDistractors(answer, step + 1)),
    rationale: `القاعدة هي ${rule}، لذلك الحد التالي ${answer}.`,
    difficultyDescriptor: `نمط عددي من الدرجة ${level}`,
    difficultySignature: `series-rule:${level};length:${sequence.length}`,
  };
}

function makeMatrixPatterns(random, level) {
  const first = randomInt(random, 1, 8);
  const second = randomInt(random, 1, 8);
  const offset = level >= 4 ? randomInt(random, 1, level) : 0;
  const operation = level >= 3 && level % 2 === 1 ? 'multiply' : 'add';
  const apply = (a, b) => operation === 'multiply' ? a * b + offset : a + b + offset;
  const rowA = [first, second, apply(first, second)];
  const nextA = first + randomInt(random, 1, 3);
  const nextB = second + randomInt(random, 1, 3);
  const answer = apply(nextA, nextB);
  return {
    prompt: 'طبّق قاعدة الصف الأول لإكمال الصف الثاني.',
    display: `[ ${rowA.join(' | ')} ]   [ ${nextA} | ${nextB} | ؟ ]`,
    answer: String(answer),
    options: textOptions(numericDistractors(answer, Math.max(2, offset + 1))),
    rationale: `القاعدة: ${operation === 'add' ? 'جمع الأول والثاني' : 'ضرب الأول في الثاني'}${offset ? ` ثم إضافة ${offset}` : ''}؛ الناتج ${answer}.`,
    difficultyDescriptor: `قاعدة ${operation === 'add' ? 'جمع' : 'ضرب'}${offset ? ' مع ثابت إضافي' : ''}`,
    difficultySignature: `matrix:${operation};offset:${Number(offset > 0)};level:${level}`,
  };
}

const ODD_GROUPS = [
  [['تفاح', 'برتقال', 'موز'], 'كرسي', 'الفاكهة'],
  [['قلم', 'دفتر', 'كتاب'], 'بحر', 'أدوات الدراسة'],
  [['أحمر', 'أزرق', 'أخضر'], 'مطر', 'الألوان'],
  [['حصان', 'قطة', 'نمر'], 'نافذة', 'الحيوانات'],
  [['مطرقة', 'منشار', 'مفك'], 'قمر', 'الأدوات'],
  [['حافلة', 'قطار', 'سيارة'], 'وسادة', 'وسائل النقل'],
  [['دائرة', 'مربع', 'مثلث'], 'صوت', 'الأشكال'],
  [['ربيع', 'صيف', 'شتاء'], 'مكتبة', 'الفصول'],
];

function makeOddOneOut(random, level) {
  const [members, outsider, category] = pick(random, ODD_GROUPS);
  const extras = level >= 4 ? members.concat([members[0]]) : members;
  return {
    prompt: 'أي عنصر لا ينتمي إلى الفئة المشتركة؟',
    display: shuffle(random, [...extras, outsider]).join(' · '),
    answer: outsider,
    options: textOptions(unique([...members, outsider])),
    rationale: `${members.join(' و')} تنتمي إلى ${category}، أما ${outsider} فلا ينتمي إليها.`,
    difficultyDescriptor: `تصنيف دلالي بدرجة تقارب ${level}`,
    difficultySignature: `odd-level:${level};members:${extras.length}`,
  };
}

const ANALOGIES = [
  ['طبيب', 'مريض', 'معلم', 'طالب', 'صاحب مهنة ومن يتلقى خدمته'],
  ['مفتاح', 'باب', 'كلمة مرور', 'حساب', 'وسيلة وصول وما تفتحه'],
  ['قلم', 'كتابة', 'فرشاة', 'رسم', 'أداة وفعلها'],
  ['عين', 'رؤية', 'أذن', 'سمع', 'عضو ووظيفته'],
  ['كتاب', 'مكتبة', 'لوحة', 'معرض', 'عنصر ومكان جمعه'],
  ['بذرة', 'نبات', 'بيضة', 'طائر', 'بداية نمو ونتيجته'],
  ['شتاء', 'برد', 'صيف', 'حر', 'فصل وصفته الغالبة'],
  ['قاضٍ', 'محكمة', 'معلم', 'مدرسة', 'مهنة ومكان عمل'],
  ['سؤال', 'إجابة', 'مشكلة', 'حل', 'مدخل واستجابته'],
  ['خريطة', 'طريق', 'فهرس', 'كتاب', 'دليل وما يرشد إليه'],
  ['دقيقة', 'ساعة', 'سنتيمتر', 'متر', 'وحدة صغيرة ووحدة أكبر'],
  ['همس', 'صوت', 'وميض', 'ضوء', 'درجة ضعيفة من ظاهرة'],
  ['مقدمة', 'خاتمة', 'بداية', 'نهاية', 'طرفان متقابلان'],
  ['قبطان', 'سفينة', 'طيار', 'طائرة', 'قائد ووسيلة يقودها'],
  ['جفاف', 'ماء', 'جوع', 'طعام', 'حاجة وما يسدها'],
  ['ميزان', 'وزن', 'ساعة', 'وقت', 'أداة وما تقيسه'],
  ['قشرة', 'ثمرة', 'غلاف', 'كتاب', 'غطاء وما يحيط به'],
  ['تجربة', 'فرضية', 'اختبار', 'مهارة', 'إجراء وما يفحصه'],
  ['أساس', 'بناء', 'جذر', 'شجرة', 'جزء داعم للكل'],
  ['عدسة', 'تكبير', 'مرشح', 'تنقية', 'أداة وأثرها'],
  ['بوصلة', 'اتجاه', 'تقويم', 'تاريخ', 'مرجع وما يحدده'],
  ['حرارة', 'تمدد', 'ضغط', 'انضغاط', 'سبب وأثر فيزيائي مبسط'],
  ['تدريب', 'إتقان', 'مراجعة', 'تذكر', 'ممارسة ونتيجتها المتوقعة'],
  ['مخطط', 'تنفيذ', 'وصفة', 'طهي', 'تعليمات وتطبيقها'],
];

function makeVerbalAnalogy(random, level) {
  const tierStart = (level - 1) * 4;
  const row = ANALOGIES[(tierStart + randomInt(random, 0, 7)) % ANALOGIES.length];
  const [a, b, c, answer, relation] = row;
  const distractors = shuffle(random, ANALOGIES.map((candidate) => candidate[3]).filter((word) => word !== answer)).slice(0, 3);
  return {
    prompt: `${a} بالنسبة إلى ${b}، مثل ${c} بالنسبة إلى …`,
    answer,
    options: textOptions([answer, ...distractors]),
    rationale: `العلاقة هي «${relation}»، لذلك يكتمل الزوج بـ«${answer}».`,
    difficultyDescriptor: `علاقة لفظية من المستوى الدلالي ${level}`,
    difficultySignature: `analogy-tier:${level}`,
  };
}

function makeLogicalRules(random, level) {
  const value = randomInt(random, 1, 18);
  const threshold = randomInt(random, 5, 10);
  const addition = randomInt(random, 2, 5);
  const evenRule = level >= 2;
  const highRule = level >= 3;
  let result = value;
  const applied = [];
  if (evenRule && value % 2 === 0) { result += addition; applied.push(`إضافة ${addition} للزوجي`); }
  if (highRule && value > threshold) { result -= 2; applied.push(`طرح 2 لما فوق ${threshold}`); }
  if (level >= 5 && result % 3 === 0) { result *= 2; applied.push('مضاعفة الناتج القابل للقسمة على 3'); }
  if (!applied.length) applied.push('لا ينطبق شرط يغير القيمة');
  const rules = [
    ...(evenRule ? [`إذا كان العدد زوجيًا أضف ${addition}`] : [`أضف ${addition} إلى العدد`]),
    ...(highRule ? [`إذا كان العدد أكبر من ${threshold} اطرح 2`] : []),
    ...(level >= 5 ? ['إذا أصبح الناتج قابلًا للقسمة على 3 فضاعفه'] : []),
  ];
  if (!evenRule) result = value + addition;
  return {
    prompt: `القواعد بالترتيب: ${rules.join('؛ ')}. طبّقها على ${value}.`,
    answer: String(result),
    options: textOptions(numericDistractors(result, addition)),
    rationale: `${applied.join('، ')}؛ الناتج النهائي ${result}.`,
    difficultyDescriptor: `${rules.length} ${rules.length === 1 ? 'قاعدة' : 'قواعد'} مشروطة`,
    difficultySignature: `logic-rules:${rules.length};level:${level}`,
  };
}

function makeConditionalReasoning(random, level) {
  const names = ['ليان', 'سليم', 'نور', 'مريم', 'رامي', 'هدى', 'آدم', 'جود'];
  const subjects = [
    ['راجع الخطة', 'اكتشف الخطأ'],
    ['شحن الجهاز', 'عمل الجهاز'],
    ['سقى النبتة', 'بقيت تربتها رطبة'],
    ['فعّل التنبيه', 'ظهر الإشعار'],
    ['حفظ الملف', 'ظهر في المجلد'],
    ['أغلق النافذة', 'انخفض الضجيج'],
  ];
  const name = pick(random, names);
  const [condition, consequence] = pick(random, subjects);
  let prompt;
  let answer;
  let options;
  let rationale;
  if (level === 1) {
    prompt = `إذا ${condition} فإن ${consequence}. ${name} ${condition}. ما النتيجة اللازمة؟`;
    answer = 'consequence';
    options = [option('consequence', `${name} ${consequence}`), option('not-consequence', `${name} لم ${consequence}`), option('unknown', 'لا يمكن الجزم'), option('impossible', 'الشرط مستحيل')];
    rationale = 'تحقق الشرط المذكور، لذلك تلزم النتيجة المباشرة.';
  } else if (level === 2) {
    prompt = `إذا ${condition} فإن ${consequence}. ${name} لم ${consequence}. ماذا يلزم؟`;
    answer = 'not-condition';
    options = [option('not-condition', `${name} لم ${condition}`), option('condition', `${name} ${condition}`), option('unknown', 'لا يمكن معرفة أي شيء'), option('both', 'حدث الشرط ونقيضه')];
    rationale = 'هذه صورة النقيض المنطقي: نفي النتيجة يستلزم نفي الشرط في العبارة المعطاة.';
  } else if (level === 3) {
    prompt = `إذا ${condition} فإن ${consequence}. ${name} ${consequence}. هل يلزم أنه ${condition}؟`;
    answer = 'unknown';
    options = [option('yes', 'نعم، يلزم'), option('no', 'لا، يستحيل'), option('unknown', 'لا يمكن الجزم من العبارة'), option('both', 'يلزم الأمران معًا')];
    rationale = 'تحقق النتيجة لا يثبت وحده أن هذا الشرط المحدد هو سببها؛ قد توجد أسباب أخرى.';
  } else if (level === 4) {
    const third = pick(random, ['اكتملت المهمة', 'أصبح السجل جاهزًا', 'انخفض التأخير', 'تمت المراجعة']);
    prompt = `إذا ${condition} فإن ${consequence}، وإذا ${consequence} فإن ${third}. ${name} ${condition}. ما النتيجة البعيدة؟`;
    answer = 'third';
    options = [option('third', `${name} ${third}`), option('not-third', `${name} لم ${third}`), option('unknown', 'لا يمكن الجزم'), option('reverse', `لا بد أن ${name} بدأ من ${third}`)];
    rationale = 'سلسلة الشرطين تنقلنا من الشرط الأول إلى النتيجة الأولى ثم إلى النتيجة البعيدة.';
  } else {
    const alternative = pick(random, ['طلب مساعدة', 'استخدم طريقة بديلة', 'أعاد المحاولة', 'راجع التعليمات']);
    prompt = `إذا ${condition} فإن ${consequence}. وإذا لم ${consequence} فإن ${alternative}. ${name} لم ${consequence}. ما الذي يلزم مباشرة؟`;
    answer = 'alternative';
    options = [option('alternative', `${name} ${alternative}`), option('condition', `${name} ${condition}`), option('consequence', `${name} ${consequence}`), option('unknown', 'لا توجد نتيجة')];
    rationale = `القاعدة الثانية تنطبق مباشرة على نفي النتيجة، فتقود إلى أن ${name} ${alternative}.`;
  }
  return {
    prompt,
    answer,
    options,
    rationale,
    difficultyDescriptor: ['استلزام مباشر', 'نقيض منطقي', 'منع إثبات التالي', 'سلسلة شرطين', 'اختيار قاعدة من سلسلتين'][level - 1],
    difficultySignature: `inference-tier:${level}`,
  };
}

function makeMentalArithmetic(random, level) {
  const a = randomInt(random, 4, 18 + level * 3);
  const b = randomInt(random, 2, 9);
  const c = randomInt(random, 2, 7);
  let expression;
  let result;
  if (level === 1) { expression = `${a} + ${b}`; result = a + b; }
  else if (level === 2) { expression = `${a} - ${b}`; result = a - b; }
  else if (level === 3) { expression = `(${a} + ${b}) - ${c}`; result = a + b - c; }
  else if (level === 4) { expression = `${b} × ${c} + ${a}`; result = b * c + a; }
  else { expression = `(${a} - ${b}) × ${c}`; result = (a - b) * c; }
  return {
    prompt: 'احسب الناتج ذهنيًا.',
    display: `${expression} = ؟`,
    answer: String(result),
    options: textOptions(numericDistractors(result, Math.max(2, c))),
    rationale: `باتباع ترتيب العمليات يصبح الناتج ${result}.`,
    difficultyDescriptor: `${level <= 2 ? 'عملية واحدة' : level <= 4 ? 'عمليتان' : 'عمليتان مع أقواس'} ونطاق عددي ${level}`,
    difficultySignature: `arithmetic-tier:${level}`,
  };
}

function makeEstimation(random, level) {
  const factor = level <= 2 ? 10 : level <= 4 ? 25 : 100;
  const a = randomInt(random, 18, 170 + level * 50);
  const b = randomInt(random, 13, 140 + level * 35);
  const operation = level >= 4 && random() > 0.5 ? 'difference' : 'sum';
  const exact = operation === 'sum' ? a + b : Math.abs(a - b);
  const answer = Math.round(exact / factor) * factor;
  return {
    prompt: `اختر أقرب تقدير إلى ${factor === 10 ? 'أقرب عشرة' : factor === 25 ? 'أقرب 25' : 'أقرب مئة'}.`,
    display: `${a} ${operation === 'sum' ? '+' : '−'} ${b}`,
    answer: String(answer),
    options: textOptions(unique([answer, answer + factor, Math.max(0, answer - factor), answer + factor * 2]).map(String)),
    rationale: `القيمة الدقيقة ${exact}، وأقرب تقدير وفق الوحدة المطلوبة هو ${answer}.`,
    difficultyDescriptor: `تقدير ${operation === 'sum' ? 'مجموع' : 'فرق'} إلى وحدة ${factor}`,
    difficultySignature: `estimate:${factor};operations:${level >= 4 ? 'sum-or-difference' : 'sum'};level:${level}`,
  };
}

function makeMentalRotation(random, level) {
  const startIndex = randomInt(random, 0, 3);
  const clockwise = level < 3 || random() > 0.5;
  const turns = 1 + ((randomInt(random, 0, 5) + level) % Math.min(4, level + 1));
  const direction = clockwise ? 1 : -1;
  const answer = ARROWS[(startIndex + direction * turns + 8) % 4];
  return {
    prompt: `أدر السهم ${turns} ${turns === 1 ? 'ربع دورة' : 'أرباع دورة'} ${clockwise ? 'مع' : 'عكس'} عقارب الساعة.`,
    display: ARROWS[startIndex],
    answer,
    options: textOptions(ARROWS),
    rationale: `بعد ${turns} أرباع دورة يصبح الاتجاه ${answer}.`,
    difficultyDescriptor: `${turns} أرباع دورة ${clockwise ? 'مع' : 'عكس'} الساعة`,
    difficultySignature: `rotation-turns:${Math.min(level, 4)};counter:${Number(level >= 3)}`,
  };
}

function makeSpatialRelations(random, level) {
  const names = shuffle(random, ['أ', 'ب', 'ج', 'د', 'هـ']).slice(0, Math.min(3 + level, 5));
  const horizontal = random() > 0.5 ? 'يمين' : 'يسار';
  const vertical = random() > 0.5 ? 'فوق' : 'تحت';
  const answer = `${vertical === 'فوق' ? 'أعلى' : 'أسفل'} ${horizontal === 'يمين' ? 'اليمين' : 'اليسار'}`;
  const chain = [`${names[0]} ${vertical} ${names[1]}`, `${names[1]} ${horizontal} ${names[2]}`];
  if (level >= 4) chain.push(`${names[3]} بجوار ${names[2]} من جهة ${horizontal}`);
  return {
    prompt: `${chain.join('، ')}. أين يقع ${names[0]} بالنسبة إلى ${names[2]}؟`,
    answer,
    options: textOptions(['أعلى اليمين', 'أعلى اليسار', 'أسفل اليمين', 'أسفل اليسار']),
    rationale: `${names[0]} ${vertical} ${names[1]}، و${names[1]} ${horizontal} ${names[2]}؛ إذن العلاقة ${answer}.`,
    difficultyDescriptor: `${chain.length} علاقات مكانية مترابطة`,
    difficultySignature: `spatial-links:${chain.length};level:${level}`,
  };
}

function makeTrailSwitching(random, level) {
  const start = randomInt(random, 1, 4);
  const categories = level >= 4 ? 3 : 2;
  const letters = LETTERS.slice(start - 1, start + 3);
  const sequence = categories === 2
    ? [`${start}`, letters[0], `${start + 1}`, letters[1], `${start + 2}`]
    : [`${start}`, letters[0], SYMBOLS[start], `${start + 1}`, letters[1], SYMBOLS[start + 1]];
  const answer = categories === 2 ? letters[2] : `${start + 2}`;
  return {
    prompt: `أكمل المسار المتناوب بين ${categories === 2 ? 'الأرقام والحروف' : 'الأرقام والحروف والرموز'}.`,
    display: `${sequence.join(' ← ')} ← ؟`,
    answer,
    options: textOptions(unique([answer, letters[1], `${start + 1}`, SYMBOLS[start + 2]])),
    rationale: `بعد الحفاظ على دورة الفئات يأتي ${answer}.`,
    difficultyDescriptor: `تناوب بين ${categories} فئات وطول ${sequence.length}`,
    difficultySignature: `trail-categories:${categories};length:${sequence.length};level:${level}`,
  };
}

function makeTaskSwitching(random, level, index) {
  const number = randomInt(random, 1, 12);
  const color = pick(random, COLORS);
  const shape = pick(random, ['دائرة', 'مربع', 'مثلث', 'معين']);
  const rules = level >= 4 ? ['parity', 'size', 'color', 'shape'] : ['parity', 'size'];
  const rule = rules[(index + randomInt(random, 0, rules.length - 1)) % rules.length];
  let answer;
  let labels;
  if (rule === 'parity') { answer = number % 2 ? 'odd' : 'even'; labels = [option('odd', 'فردي'), option('even', 'زوجي')]; }
  else if (rule === 'size') { answer = number > 6 ? 'large' : 'small'; labels = [option('large', 'أكبر من 6'), option('small', '6 أو أصغر')]; }
  else if (rule === 'color') { answer = color.value; labels = colorOptions(); }
  else { answer = shape; labels = textOptions(['دائرة', 'مربع', 'مثلث', 'معين']); }
  return {
    prompt: `القاعدة: ${rule === 'parity' ? 'زوجي أم فردي' : rule === 'size' ? 'أكبر من 6 أم لا' : rule === 'color' ? 'اللون' : 'الشكل'}.`,
    display: `${number} · ${shape} ${color.label}`,
    answer,
    options: labels,
    rationale: `وفق القاعدة الحالية الإجابة هي ${labels.find((item) => item.value === answer)?.label ?? answer}.`,
    difficultyDescriptor: `تبديل بين ${rules.length} قواعد`,
    difficultySignature: `task-rules:${rules.length};level:${level}`,
  };
}

const PLANS = [
  ['إعداد تقرير', ['تحديد المطلوب', 'جمع المصادر', 'كتابة المسودة', 'مراجعة الأدلة', 'تسليم النسخة']],
  ['الذهاب إلى موعد', ['تأكيد الموعد', 'تجهيز الوثائق', 'حساب وقت الطريق', 'الانطلاق', 'الوصول والتسجيل']],
  ['تنظيم ورشة', ['تحديد الهدف', 'حصر المشاركين', 'حجز المكان', 'إرسال الدعوات', 'تأكيد التجهيزات']],
  ['نسخ الملفات احتياطيًا', ['تحديد الملفات', 'اختيار الوجهة', 'بدء النسخ', 'التحقق من الاكتمال', 'تجربة الاستعادة']],
  ['إعداد وجبة', ['اختيار الوصفة', 'مراجعة المكونات', 'تجهيز الأدوات', 'الطهي', 'فحص النضج']],
  ['نشر صفحة', ['تحديد نية البحث', 'إعداد المسودة', 'مراجعة المصادر', 'فحص الروابط', 'النشر والمراقبة']],
  ['حل عطل جهاز', ['وصف العطل', 'حفظ العمل', 'اختبار السبب الأبسط', 'تطبيق إصلاح واحد', 'التحقق من النتيجة']],
  ['التسجيل في دورة', ['مراجعة الشروط', 'تجهيز البيانات', 'تعبئة الطلب', 'مراجعة الطلب', 'إرساله وحفظ التأكيد']],
];

function makePlanningSteps(random, level) {
  const [task, fullSteps] = pick(random, PLANS);
  const owner = pick(random, ['ليان', 'سليم', 'فريق المحتوى', 'فريق الدعم', 'نور', 'مريم', 'متطوع جديد', 'مدير المشروع']);
  const constraint = pick(random, ['قبل نهاية اليوم', 'مع ضرورة حفظ نسخة قابلة للمراجعة', 'مع وقت محدود', 'بمشاركة شخص آخر', 'مع نقطة تحقق قبل التسليم']);
  const count = Math.min(fullSteps.length, 2 + level);
  const steps = fullSteps.slice(0, count);
  const answer = steps.join(' ← ');
  const reverse = [...steps].reverse().join(' ← ');
  const swapped = [...steps];
  if (swapped.length > 2) [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const rotated = [...steps.slice(1), steps[0]];
  return {
    prompt: `يساعد ${owner} في مهمة «${task}» ${constraint}. اختر الترتيب العملي الأنسب.`,
    answer,
    options: textOptions(unique([answer, reverse, swapped.join(' ← '), rotated.join(' ← ')])),
    rationale: `الترتيب يراعي الاعتماد بين الخطوات: ${answer}.`,
    difficultyDescriptor: `خطة من ${count} خطوات واعتمادات من المستوى ${level}`,
    difficultySignature: `planning-steps:${count};tier:${level}`,
  };
}

function makeRuleDiscovery(random, level) {
  const multiplier = level >= 4 ? randomInt(random, 2, 4) : 1;
  const addition = randomInt(random, 1, 3 + level);
  const offset = level >= 5 ? randomInt(random, 1, 4) : 0;
  const apply = (value) => value * multiplier + addition - offset;
  const inputs = shuffle(random, [2, 3, 4, 5, 6, 7]).slice(0, 2 + Math.min(level, 2));
  const target = randomInt(random, 8, 12);
  const answer = apply(target);
  return {
    prompt: `اكتشف القاعدة من الأمثلة: ${inputs.map((value) => `${value} ← ${apply(value)}`).join('، ')}. ما ناتج ${target}؟`,
    answer: String(answer),
    options: textOptions(numericDistractors(answer, multiplier + addition)),
    rationale: `القاعدة هي الضرب في ${multiplier} ثم إضافة ${addition}${offset ? ` وطرح ${offset}` : ''}؛ الناتج ${answer}.`,
    difficultyDescriptor: `قاعدة من ${1 + Number(multiplier > 1) + Number(offset > 0)} عمليات`,
    difficultySignature: `rule-ops:${1 + Number(multiplier > 1) + Number(offset > 0)};level:${level}`,
  };
}

function makePriorityPlanning(random, level) {
  const urgentMinutes = randomInt(random, 25, 90);
  const importantHours = randomInt(random, 3, 12);
  const dependencyCount = level >= 4 ? 2 : 1;
  const tasks = [
    `تسليم متفق عليه خلال ${urgentMinutes} دقيقة ويمنع عمل ${dependencyCount} ${dependencyCount === 1 ? 'شخص' : 'أشخاص'}`,
    `تحضير مهم موعده بعد ${importantHours} ساعات`,
    'رسالة غير عاجلة يمكن الرد عليها غدًا',
    ...(level >= 3 ? ['مهمة قصيرة بلا موعد ولا أثر لاحق'] : []),
    ...(level >= 5 ? ['طلب جديد يحتاج توضيحًا قبل البدء'] : []),
  ];
  const answer = tasks[0];
  return {
    prompt: 'أي مهمة تبدأ بها وفق الموعد والأثر والاعتماد؟',
    display: shuffle(random, tasks).map((task, index) => `${index + 1}. ${task}`).join('   '),
    answer,
    options: textOptions(tasks),
    rationale: `المهمة الأولى أقرب موعدًا وتمنع عمل آخرين؛ لذلك تتقدم مع توثيق ما سيليها.`,
    difficultyDescriptor: `${tasks.length} مهام و${level} أبعاد مفاضلة`,
    difficultySignature: `priority-tasks:${tasks.length};dependencies:${dependencyCount};tier:${level}`,
  };
}

const PROBLEM_PHASES = [
  ['وصف المشكلة غامض وتختلف روايات الفريق', 'definition', 'صياغة المشكلة والحدود بلغة قابلة للفحص', 'مرحلة التعريف'],
  ['لا نعرف متى بدأ الخلل أو أين يظهر', 'evidence', 'جمع سجل زمني وأمثلة قابلة لإعادة الإنتاج', 'مرحلة جمع الدليل'],
  ['يوجد سبب محتمل واحد فقط في النقاش', 'alternatives', 'توليد فرضيات بديلة قبل اختيار الحل', 'مرحلة توليد البدائل'],
  ['لدينا ثلاثة حلول ولم نقارن آثارها', 'criteria', 'تحديد معايير المقارنة والمخاطر قبل الاختيار', 'مرحلة المفاضلة'],
  ['طُبق إصلاح لكن النتيجة غير معروفة', 'verification', 'قياس النتيجة ومقارنتها بخط الأساس', 'مرحلة التحقق'],
  ['نجح الحل مرة واحدة في بيئة مختلفة', 'replication', 'إعادة الاختبار في الظروف المقصودة', 'مرحلة التثبيت'],
];

function makeProblemSolving(random, level) {
  const offset = randomInt(random, 0, PROBLEM_PHASES.length - 1);
  const row = PROBLEM_PHASES[(offset + level - 1) % PROBLEM_PHASES.length];
  const [situation, answer, answerLabel, phase] = row;
  const distractors = shuffle(random, PROBLEM_PHASES.filter((candidate) => candidate[1] !== answer)).slice(0, 3);
  return {
    prompt: `${situation}. ما الخطوة المنظمة التالية؟`,
    answer,
    options: [option(answer, answerLabel), ...distractors.map((candidate) => option(candidate[1], candidate[2]))],
    rationale: `${phase}: ${answerLabel}.`,
    difficultyDescriptor: `تمييز مرحلة حل مشكلة من الدرجة ${level}`,
    difficultySignature: `problem-phase:${level}`,
  };
}

const EMOTION_SCENARIOS = [
  ['فقد ملفًا عمل عليه طويلًا وبقي صامتًا ينظر إلى الشاشة', 'sad', 'حزن', 'فقد شيء مهم وتباطؤ الاستجابة'],
  ['تلقى خبر قبول انتظره أسابيع وابتسم واتصل بأسرته', 'joy', 'فرح', 'تحقق نتيجة مرغوبة وإشارات السرور'],
  ['سمع صوتًا مفاجئًا في ممر مظلم فتوقف وتسارع تنفسه', 'fear', 'خوف', 'تهديد غير متوقع واستعداد للحماية'],
  ['تكرر تجاوز حدٍ طلب احترامه فشد صوته واعترض', 'anger', 'غضب', 'انتهاك حد متكرر واعتراض واضح'],
  ['دخل غرفة لا يعرف فيها أحدًا وتردد قبل تقديم نفسه', 'anxiety', 'قلق', 'توقع اجتماعي غير مؤكد وتردد'],
  ['قرأ رسالة تقدير لعمله وخفض رأسه مبتسمًا', 'pride', 'اعتزاز', 'تقدير إنجاز شخصي'],
  ['اكتشف أن توقعه السلبي لم يحدث وتنفس بعمق وأرخى كتفيه', 'relief', 'ارتياح', 'زوال خطر متوقع'],
  ['شاهد صديقًا يحصل على فرصة كان يتمناها وشعر بضيق مع تمنيه له الخير', 'envy', 'حسد عابر', 'مقارنة بين رغبة شخصية ومكسب الآخر'],
  ['وصل متأخرًا رغم اتفاقه فاعتذر وحاول إصلاح الأثر', 'guilt', 'شعور بالذنب', 'تقييم فعل محدد ومحاولة إصلاحه'],
  ['تعثر أمام مجموعة فضحك بعض الحاضرين وتجنب النظر إليهم', 'embarrassment', 'إحراج', 'انكشاف اجتماعي غير مرغوب'],
  ['رأى شخصًا يتألم فتوقف وسأله كيف يمكن أن يساعد', 'compassion', 'تعاطف', 'ملاحظة ألم الآخر ودافع للمساعدة'],
  ['تغير الموعد للمرة الثالثة ولم يعد يعرف أي خطة يعتمد', 'frustration', 'إحباط', 'عائق متكرر أمام هدف واضح'],
  ['وصل إلى مكان جديد وبدأ يسأل عن تفاصيله بحماس', 'curiosity', 'فضول', 'توجه للاستكشاف وجمع المعرفة'],
  ['انتهى ضغط طويل وجلس بهدوء من دون رغبة في الكلام', 'fatigue', 'إرهاق', 'استنزاف بعد جهد ممتد'],
  ['وجد هدية غير متوقعة باسمه ورفع حاجبيه واتسعت عيناه', 'surprise', 'دهشة', 'حدث مفاجئ يخالف التوقع'],
  ['رفض المشاركة في تصرف يراه مؤذيًا وابتعد عنه', 'disapproval', 'استنكار', 'تقييم أخلاقي سلبي لسلوك'],
  ['انتظر نتيجة فحص مهمة وكان يعيد فتح هاتفه باستمرار', 'worry', 'انشغال قلِق', 'انتظار نتيجة مهمة مع مراقبة متكررة'],
  ['عاد إلى مكان ارتبط بذكريات قديمة وتوقف يتأمل التفاصيل', 'nostalgia', 'حنين', 'استدعاء خبرات ماضية ذات معنى'],
  ['تلقى مساعدة في وقت صعب وكتب رسالة شكر طويلة', 'gratitude', 'امتنان', 'تقدير منفعة قدمها آخر'],
  ['تجاوز مشكلة كان يظنها صعبة وشعر أنه قادر على متابعة الخطوة التالية', 'confidence', 'ثقة', 'نجاح سابق يرفع توقع القدرة'],
  ['لم يفهم التعليمات بعد محاولتين وبدأ يقارن الأمثلة', 'confusion', 'حيرة', 'تعارض معلومات والحاجة إلى توضيح'],
  ['لاحظ خطرًا صغيرًا قبل وقوعه ونبه الآخرين بسرعة', 'alertness', 'تيقظ', 'رصد إشارة خطر والاستجابة لها'],
  ['ألغيت فعالية كان ينتظرها وأغلق التقويم بهدوء', 'disappointment', 'خيبة أمل', 'توقع إيجابي لم يتحقق'],
  ['أنهى مهمة مرهقة وشطب آخر بند من قائمته', 'satisfaction', 'رضا', 'اكتمال هدف بعد جهد'],
];

function makeEmotionRecognition(random, level) {
  const row = EMOTION_SCENARIOS[(randomInt(random, 0, EMOTION_SCENARIOS.length - 1) + level - 1) % EMOTION_SCENARIOS.length];
  const [scenario, answer, label, clue] = row;
  const distractors = shuffle(random, EMOTION_SCENARIOS.filter((candidate) => candidate[1] !== answer)).slice(0, 3);
  return {
    prompt: `${scenario}. ما الانفعال الأكثر اتساقًا مع القرائن المكتوبة؟`,
    answer,
    options: [option(answer, label), ...distractors.map((candidate) => option(candidate[1], candidate[2]))],
    rationale: `القرينة الأساسية: ${clue}. هذا مثال تعليمي، وقد تختلف خبرة الشخص الواقعية.`,
    difficultyDescriptor: `سياق انفعالي بقرائن ودرجة تداخل ${level}`,
    difficultySignature: `emotion-tier:${level}`,
  };
}

function makePerspectiveTaking(random, level) {
  const people = shuffle(random, ['ليلى', 'سامر', 'نور', 'آدم', 'هدى', 'رامي']);
  const places = shuffle(random, ['الدرج', 'الرف', 'الحقيبة', 'الصندوق', 'المكتب', 'الخزانة']);
  const object = pick(random, ['الكتاب', 'المفتاح', 'الكوب', 'الرسالة', 'اللعبة', 'الدفتر']);
  const moves = Math.min(1 + Math.floor(level / 2), 3);
  const story = [`وضعت ${people[0]} ${object} في ${places[0]} ثم خرجت.`];
  for (let index = 0; index < moves; index += 1) story.push(`نقل ${people[index + 1]} ${object} إلى ${places[index + 1]}.`);
  if (level >= 4) story.push(`${people[0]} لم ترَ عمليات النقل.`);
  return {
    prompt: `${story.join(' ')} أين ستبحث ${people[0]} أولًا؟`,
    answer: places[0],
    options: textOptions(unique(places.slice(0, Math.max(3, moves + 1)))),
    rationale: `${people[0]} تعرف الموقع الأول فقط، لذلك ستبحث في ${places[0]} حتى لو كان الموقع الحقيقي قد تغير.`,
    difficultyDescriptor: `${moves} ${moves === 1 ? 'نقلة' : 'نقلات'} و${level >= 4 ? 'تأكيد منظور من الدرجة الثانية' : 'منظور مباشر'}`,
    difficultySignature: `perspective-moves:${moves};order:${level >= 4 ? 2 : 1};tier:${level}`,
  };
}

const SOCIAL_SCENARIOS = [
  ['رفض شخص مشاركة معلومة شخصية', 'respect', 'احترام الرفض وتغيير الموضوع', 'الإلحاح حتى يجيب', 'الموافقة والحدود'],
  ['قال زميل إنه يحتاج وقتًا قبل الرد', 'wait', 'تأكيد استلام رسالته ومنحه الوقت', 'إرسال رسائل متتابعة كل دقيقة', 'احترام الوقت والضغط'],
  ['أخطأت في اسم شخص وصحح لك الاسم', 'correct', 'الاعتذار المختصر واستخدام الاسم الصحيح', 'مجادلته في الاسم الذي يفضله', 'الهوية والتصحيح'],
  ['لم تفهم تعليمات مهمة مشتركة', 'clarify', 'طلب مثال محدد قبل البدء', 'التظاهر بالفهم ثم التخمين', 'التوضيح قبل التنفيذ'],
  ['شاركك شخص خبرًا صعبًا ولم يطلب نصيحة', 'listen', 'الاستماع وسؤاله عما يحتاجه', 'إعطاؤه حلولًا فورية من دون سؤال', 'الاستماع وطلب الإذن'],
  ['وصلت دعوة لا تناسب وقتك', 'decline', 'الاعتذار بوضوح واقتراح بديل إن أمكن', 'عدم الرد وترك الطرف ينتظر', 'الوضوح واحترام الوقت'],
  ['لاحظت خطأ قد يؤثر في عمل الفريق', 'private', 'تنبيه المعني مباشرة وباحترام مع دليل', 'السخرية منه أمام المجموعة', 'التصحيح الآمن'],
  ['طلب منك شخص استعارة غرض لا تريد إعارته', 'boundary', 'رفض واضح ولطيف من دون تبرير طويل', 'الموافقة رغم عدم رغبتك ثم لومه', 'الحدود الشخصية'],
  ['قاطعك أحدهم مرارًا في اجتماع', 'assert', 'طلب إكمال فكرتك ثم منحه الدور', 'رفع الصوت وإهانته', 'الحزم المتوازن'],
  ['اختلف شخصان على تفسير رسالة قصيرة', 'context', 'طلب توضيح النية والسياق من صاحب الرسالة', 'افتراض أسوأ نية ونشرها', 'منع القفز إلى الاستنتاج'],
  ['طلب طفل التوقف عن المزاح الجسدي', 'stop', 'التوقف فورًا والاعتذار', 'القول إنه مزاح ومتابعته', 'الموافقة الجسدية'],
  ['سمعت إشاعة عن زميل', 'verify', 'عدم نشرها والرجوع إلى مصدر مناسب عند الحاجة', 'إرسالها إلى المجموعة للتأكد', 'الخصوصية والتحقق'],
  ['احتاج عضو جديد إلى معرفة طريقة العمل', 'orient', 'شرح الخطوات الأساسية وتحديد شخص للسؤال', 'تركه يكتشف كل شيء تحت الضغط', 'الدمج والإرشاد'],
  ['لم يستطع شخص حضور لقاء بسبب إتاحة المكان', 'access', 'سؤاله عن الترتيب الملائم وتعديله', 'اعتبار الغياب عدم اهتمام', 'الإتاحة وعدم الافتراض'],
  ['أرسل شخص رسالة غاضبة في وقت متأخر', 'pause', 'الانتظار حتى الهدوء والرد على الموضوع بوضوح', 'الرد بإهانة أكبر فورًا', 'تنظيم التصعيد'],
  ['تحتاج إلى نقد عمل زميل', 'feedback', 'ذكر ملاحظة محددة وأثرها واقتراح قابل للتنفيذ', 'وصف الشخص بأنه فاشل', 'نقد السلوك لا الشخص'],
  ['عرض شخص مساعدة لا تحتاجها', 'thank', 'شكره ورفضها بلطف أو تحديد ما يفيد', 'تجاهله تمامًا', 'الامتنان والاستقلالية'],
  ['تأخر طرف عن موعد من دون معرفة السبب', 'check', 'السؤال عن سلامته وتحديد أثر التأخير قبل الحكم', 'اتهامه بعدم الاحترام فورًا', 'التحقق قبل الحكم'],
  ['طلب منك مدير قرارًا وأنت تفتقد معلومة حاسمة', 'disclose', 'توضيح المعلومة الناقصة وطلب وقت أو بديل', 'اختلاق معلومة لتبدو واثقًا', 'الشفافية المهنية'],
  ['شارك شخص صورة جماعية ويريد نشرها', 'consent', 'طلب موافقة الظاهرين فيها قبل النشر', 'نشرها ثم حذفها إن اشتكوا', 'الموافقة والخصوصية'],
  ['استخدم شخص كلمة قد تكون مؤذية دون قصد', 'impact', 'شرح الأثر بهدوء واقتراح تعبير أدق', 'افتراض قصد الأذى وقطع الحوار مباشرة', 'النية والأثر'],
  ['اختلفتم على قرار لا يملك أحد فيه كل المعلومات', 'criteria', 'تحديد معايير مشتركة وجمع الناقص ثم المراجعة', 'التصويت الفوري بلا معايير', 'المفاضلة المنصفة'],
  ['قال شخص إنه لا يريد مناقشة موضوع الآن', 'later', 'احترام التوقف والاتفاق على وقت مناسب إن لزم', 'متابعته حتى يقتنع بالكلام', 'حق إيقاف الحوار'],
  ['لاحظت أن شخصًا هادئًا لم يحصل على فرصة للكلام', 'invite', 'دعوتُه للمشاركة من دون الضغط عليه', 'الحديث نيابة عنه بلا سؤال', 'المشاركة الاختيارية'],
];

function makeSocialScenario(random, level) {
  const row = SOCIAL_SCENARIOS[(randomInt(random, 0, SOCIAL_SCENARIOS.length - 1) + level - 1) % SOCIAL_SCENARIOS.length];
  const [situation, answer, good, poor, principle] = row;
  const distractors = shuffle(random, SOCIAL_SCENARIOS.filter((candidate) => candidate[1] !== answer)).slice(0, 2).map((candidate) => candidate[3]);
  return {
    prompt: `${situation}. ما الاستجابة الأكثر احترامًا للسياق؟`,
    answer,
    options: [option(answer, good), option(`poor:${hashText(poor)}`, poor), ...distractors.map((label) => option(`poor:${hashText(label)}`, label))],
    rationale: `المبدأ التعليمي هنا هو ${principle}. قد يحتاج الواقع إلى سؤال أو تكييف إضافي.`,
    difficultyDescriptor: `موقف اجتماعي بدرجة غموض وحدود ${level}`,
    difficultySignature: `social-nuance:${level}`,
  };
}

const CONTEXT_WORDS = [
  ['زلق', 'غير ثابت وقد يسبب الانزلاق', 'كان الممر زلقًا بعد انسكاب الماء، فمشى الجميع ببطء'],
  ['منهك', 'شديد التعب', 'بعد ساعات من حمل الصناديق كان العامل منهكًا ويحتاج إلى الراحة'],
  ['شحيح', 'قليل ونادر', 'كان المطر شحيحًا هذا الموسم فلم تمتلئ الخزانات'],
  ['متين', 'قوي يتحمل الاستخدام', 'اختار حبلًا متينًا لأنه سيحمل وزنًا كبيرًا'],
  ['غامض', 'غير واضح المعنى', 'كان الرد غامضًا فطلبت منه مثالًا يوضح قصده'],
  ['دؤوب', 'مواظب لا يترك العمل بسهولة', 'واصل الباحث عمله الدؤوب يومًا بعد يوم حتى اكتملت البيانات'],
  ['هش', 'سهل الكسر أو الضرر', 'حمل الوعاء الهش بكلتا يديه ووضعه برفق'],
  ['مقتضب', 'قصير يكتفي بالقليل', 'كان التقرير مقتضبًا لا يتجاوز فقرتين'],
  ['متباين', 'مختلف بوضوح', 'أظهرت المجموعتان نتائج متباينة؛ ارتفعت إحداهما وانخفضت الأخرى'],
  ['متأني', 'غير متعجل', 'اتخذ قرارًا متأنيًا بعد مراجعة الخيارات والآثار'],
  ['عابر', 'قصير المدة وغير دائم', 'كان الانزعاج عابرًا واختفى بعد دقائق'],
  ['راسخ', 'ثابت وقوي', 'بنى الفريق تعاونًا راسخًا استمر رغم تغير الظروف'],
  ['محايد', 'لا ينحاز إلى طرف', 'اختار وسيطًا محايدًا ليستمع إلى الطرفين'],
  ['متواتر', 'يتكرر على فترات متقاربة', 'وصلت تنبيهات متواترة طوال الساعة'],
  ['جوهري', 'أساسي يؤثر في النتيجة', 'اكتشفوا فرقًا جوهريًا غيّر قرار المشروع كله'],
  ['هامشي', 'ثانوي قليل الأثر', 'كان التغيير هامشيًا ولم يبدل النتيجة النهائية'],
  ['متسق', 'منسجم لا يتناقض', 'جاءت النتائج متسقة مع القياسات السابقة'],
  ['مبهم', 'يحتمل أكثر من تفسير', 'كانت العبارة مبهمة ففهمها كل شخص بطريقة مختلفة'],
  ['مرن', 'قابل للتكيف مع التغيير', 'استخدم جدولًا مرنًا يسمح بتعديل المواعيد'],
  ['محدود', 'له نطاق أو مقدار صغير', 'كان الوقت محدودًا فاختار المهمة الأعلى أثرًا'],
  ['متدرج', 'ينتقل خطوة بعد خطوة', 'اتبع تدريبًا متدرجًا يبدأ بالسهل ثم يزيد الصعوبة'],
  ['موثوق', 'يمكن الاعتماد عليه', 'رجع إلى مصدر موثوق يذكر المؤلف وتاريخ المراجعة'],
  ['ضمني', 'مفهوم من السياق دون تصريح مباشر', 'كان الاتفاق ضمنيًا رغم أن أحدًا لم يكتبه'],
  ['صريح', 'معلن وواضح مباشرة', 'أعطى موافقة صريحة بكلمات واضحة قبل البدء'],
];

function makeContextClues(random, level) {
  const row = CONTEXT_WORDS[(randomInt(random, 0, CONTEXT_WORDS.length - 1) + level - 1) % CONTEXT_WORDS.length];
  const [word, answer, sentence] = row;
  const distractors = shuffle(random, CONTEXT_WORDS.filter((candidate) => candidate[1] !== answer)).slice(0, 3);
  return {
    prompt: `في الجملة: «${sentence}». ما معنى كلمة «${word}»؟`,
    answer,
    options: [option(answer), ...distractors.map((candidate) => option(candidate[1]))],
    rationale: `قرائن الجملة تدل على أن «${word}» تعني: ${answer}.`,
    difficultyDescriptor: `قرائن سياق من الدرجة ${level} مع مشتتات دلالية متقاربة`,
    difficultySignature: `context-tier:${level}`,
  };
}

const WORD_CATEGORIES = [
  ['تفاح', 'فاكهة', 'طعام'], ['نسر', 'طائر', 'حيوان'], ['مطرقة', 'أداة يدوية', 'أداة'], ['حافلة', 'نقل عام', 'مركبة'],
  ['ياسمين', 'زهرة', 'نبات'], ['عدس', 'بقول', 'طعام'], ['محيط', 'مسطح مائي', 'مكان طبيعي'], ['كمان', 'آلة وترية', 'آلة موسيقية'],
  ['مستطيل', 'شكل رباعي', 'شكل هندسي'], ['نحاس', 'فلز', 'مادة'], ['زحل', 'كوكب', 'جرم سماوي'], ['رواية', 'سرد طويل', 'نص أدبي'],
  ['مقياس حرارة', 'أداة قياس', 'أداة'], ['بطريق', 'طائر بحري', 'حيوان'], ['قطار', 'نقل سككي', 'مركبة'], ['ريحان', 'عشب عطري', 'نبات'],
  ['ياقوت', 'حجر كريم', 'معدن طبيعي'], ['خريطة', 'تمثيل مكاني', 'وثيقة'], ['مكتبة', 'مؤسسة معرفية', 'مكان عام'], ['متر', 'وحدة طول', 'وحدة قياس'],
  ['فعل', 'كلمة حدث', 'قسم كلام'], ['مثلث', 'مضلع ثلاثي', 'شكل هندسي'], ['شعير', 'حبوب', 'نبات غذائي'], ['قنديل بحر', 'لافقاري بحري', 'حيوان'],
  ['مرساة', 'أداة بحرية', 'أداة'], ['مجرة', 'نظام نجمي', 'بنية كونية'], ['ميزان', 'أداة قياس كتلة', 'أداة قياس'], ['برمجة', 'مهارة تقنية', 'نشاط معرفي'],
  ['صنوبر', 'شجرة مخروطية', 'نبات'], ['بوصلة', 'أداة اتجاه', 'أداة قياس'],
];

function makeWordCategories(random, level) {
  const row = WORD_CATEGORIES[(randomInt(random, 0, WORD_CATEGORIES.length - 1) + level - 1) % WORD_CATEGORIES.length];
  const [word, specific, broad] = row;
  const requireSpecific = level >= 3;
  const answer = requireSpecific ? specific : broad;
  const distractors = shuffle(random, WORD_CATEGORIES.flatMap((candidate) => requireSpecific ? [candidate[1]] : [candidate[2]]).filter((category) => category !== answer)).slice(0, 3);
  return {
    prompt: `اختر ${requireSpecific ? 'الفئة الأكثر تحديدًا' : 'الفئة العامة'} لكلمة «${word}».`,
    answer,
    options: textOptions([answer, ...distractors]),
    rationale: `${word} تنتمي إلى «${specific}» ضمن الفئة الأوسع «${broad}».`,
    difficultyDescriptor: `${requireSpecific ? 'تصنيف محدد' : 'تصنيف عام'} مع ${2 + level} إشارات فئوية`,
    difficultySignature: `category-specific:${Number(requireSpecific)};closeness:${level}`,
  };
}

const SEMANTIC_GROUPS = [
  ['الحيوانات', ['أسد', 'حصان', 'قطة', 'حوت', 'نسر', 'غزال', 'سلحفاة']],
  ['الأطعمة', ['خبز', 'أرز', 'تفاح', 'عدس', 'جبن', 'تمر', 'شوربة']],
  ['وسائل النقل', ['حافلة', 'قطار', 'دراجة', 'سيارة', 'قارب', 'طائرة', 'مترو']],
  ['أدوات الكتابة', ['قلم', 'قلم رصاص', 'طبشور', 'حبر', 'ممحاة', 'مسطرة', 'دفتر']],
  ['المشاعر', ['فرح', 'حزن', 'خوف', 'غضب', 'دهشة', 'امتنان', 'ارتياح']],
  ['النباتات', ['زيتون', 'صنوبر', 'نعناع', 'ورد', 'نخيل', 'ريحان', 'قمح']],
  ['أجزاء المنزل', ['مطبخ', 'غرفة', 'شرفة', 'مدخل', 'سقف', 'نافذة', 'باب']],
  ['المهن', ['معلم', 'مهندس', 'طبيب', 'نجار', 'مزارع', 'مترجم', 'محاسب']],
];

function makeSemanticFluency(random, level) {
  const [category, members] = pick(random, SEMANTIC_GROUPS);
  const size = Math.min(2 + level, 6);
  const answerWords = shuffle(random, members).slice(0, size);
  const outsiders = shuffle(random, SEMANTIC_GROUPS.filter((group) => group[0] !== category).flatMap((group) => group[1]));
  const wrongSets = Array.from({ length: 3 }, (_, index) => {
    const base = shuffle(random, members).slice(0, Math.max(1, size - 1));
    return [...base, outsiders[index]].slice(0, size).join('، ');
  });
  const answer = answerWords.join('، ');
  return {
    prompt: `اختر المجموعة التي تنتمي جميع عناصرها إلى فئة «${category}».`,
    answer,
    options: textOptions([answer, ...wrongSets]),
    rationale: `كل عناصر «${answer}» تنتمي إلى ${category}، بينما تحتوي البدائل على عنصر من فئة أخرى.`,
    difficultyDescriptor: `مجموعة من ${size} كلمات وتقارب مشتتات بدرجة ${level}`,
    difficultySignature: `semantic-size:${size};closeness:${level}`,
  };
}

function makeAssociativeBinding(random, level) {
  const count = 2 + level;
  const objects = shuffle(random, ['كتاب', 'مفتاح', 'كوب', 'قلم', 'كرة', 'مصباح', 'رسالة', 'ساعة']).slice(0, count);
  const contexts = shuffle(random, [...LOCATIONS, ...COLORS.map((color) => color.label)]).slice(0, count);
  const pairs = objects.map((objectName, index) => [objectName, contexts[index]]);
  const target = pick(random, pairs);
  return {
    kind: 'memory',
    study: pairs.map(([objectName, context]) => `${objectName} ↔ ${context}`).join('  |  '),
    prompt: `ما السياق الذي ارتبط بـ«${target[0]}»؟`,
    answer: target[1],
    options: textOptions(contexts),
    rationale: `ظهر ${target[0]} مرتبطًا بـ${target[1]} في مشهد الدراسة.`,
    difficultyDescriptor: `${count} روابط بين عنصر وسياق`,
    difficultySignature: `binding-pairs:${count}`,
  };
}

function makeWorkingMemoryUpdating(random, level) {
  const slots = Math.min(2 + Math.floor((level - 1) / 2), 4);
  const values = Array.from({ length: slots }, () => randomInt(random, 2, 9));
  const current = [...values];
  const updateCount = 1 + level;
  const updates = Array.from({ length: updateCount }, () => {
    const slot = randomInt(random, 0, slots - 1);
    const change = random() > 0.45 ? randomInt(random, 1, 3) : -randomInt(random, 1, 2);
    current[slot] += change;
    return `${LETTERS[slot]} ${change > 0 ? '+' : ''}${change}`;
  });
  const answer = current.map((value, index) => `${LETTERS[index]}=${value}`).join('، ');
  const alternatives = [answer];
  for (let offset = 1; offset <= 3; offset += 1) {
    alternatives.push(current.map((value, index) => `${LETTERS[index]}=${value + (index === offset % slots ? offset : 0)}`).join('، '));
  }
  return {
    kind: 'memory',
    study: `القيم: ${values.map((value, index) => `${LETTERS[index]}=${value}`).join('، ')}. التحديثات: ${updates.join('؛ ')}`,
    prompt: 'اختر الحالة النهائية لجميع الخانات.',
    answer,
    options: textOptions(alternatives),
    rationale: `بعد تطبيق كل تحديث على خانته تصبح الحالة: ${answer}.`,
    difficultyDescriptor: `${slots} خانات و${updateCount} تحديثات`,
    difficultySignature: `wm-slots:${slots};updates:${updateCount}`,
  };
}

function makeProspectiveMemory(random, level, index) {
  const cues = shuffle(random, SYMBOLS).slice(0, Math.min(1 + Math.floor(level / 2), 3));
  const actions = ['اضغط تذكّر', 'اختر المربع', 'اختر اللون الأخضر'];
  const current = index % 2 === 0 ? pick(random, cues) : pick(random, SYMBOLS.filter((symbol) => !cues.includes(symbol)));
  const action = cues.includes(current) ? actions[cues.indexOf(current)] : 'تابع المهمة العادية';
  return {
    kind: 'memory',
    study: `نية الجلسة: ${cues.map((cue, cueIndex) => `عند ${cue}: ${actions[cueIndex]}`).join('؛ ')}. في غير ذلك تابع المهمة العادية.`,
    prompt: `ظهرت الإشارة ${current}. ما الفعل الذي يجب تذكره الآن؟`,
    answer: action,
    options: textOptions(unique([...actions.slice(0, cues.length), 'تابع المهمة العادية'])),
    rationale: cues.includes(current) ? `${current} إشارة نية مرتبطة بالفعل «${action}».` : `${current} ليست من إشارات النية، لذلك تستمر المهمة العادية.`,
    difficultyDescriptor: `${cues.length} ${cues.length === 1 ? 'نية مستقبلية' : 'نوايا مستقبلية'} متزامنة`,
    difficultySignature: `prospective-cues:${cues.length};level:${level}`,
  };
}

function makeTemporalOrderMemory(random, level) {
  const length = 3 + level;
  const sequence = shuffle(random, SYMBOLS).slice(0, length);
  const askPosition = randomInt(random, 1, Math.min(length, 1 + level));
  const answer = sequence[askPosition - 1];
  return {
    kind: 'memory',
    study: sequence.join('  ←  '),
    prompt: `أي رمز ظهر في الموضع ${askPosition}؟`,
    answer,
    options: textOptions(sequence.slice(0, Math.max(4, askPosition))),
    rationale: `ترتيب الدراسة يضع ${answer} في الموضع ${askPosition}.`,
    difficultyDescriptor: `تسلسل من ${length} رموز وسؤال عن موضع حتى ${1 + level}`,
    difficultySignature: `temporal-length:${length};position-range:${1 + level}`,
  };
}

function makeVisualChangeDetection(random, level) {
  const length = 3 + level;
  const before = shuffle(random, SYMBOLS).slice(0, length);
  const changedIndex = randomInt(random, 0, length - 1);
  const after = [...before];
  after[changedIndex] = pick(random, SYMBOLS.filter((symbol) => !before.includes(symbol)));
  return {
    kind: 'memory',
    study: before.map((symbol, index) => `${index + 1}:${symbol}`).join('  '),
    prompt: `النمط اللاحق: ${after.map((symbol, index) => `${index + 1}:${symbol}`).join('  ')}. أي موضع تغير؟`,
    answer: String(changedIndex + 1),
    options: textOptions(Array.from({ length }, (_, index) => String(index + 1))),
    rationale: `الموضع ${changedIndex + 1} تغير من ${before[changedIndex]} إلى ${after[changedIndex]}.`,
    difficultyDescriptor: `مقارنة نمط من ${length} مواقع`,
    difficultySignature: `change-items:${length}`,
  };
}

function makeSimpleReaction(random, level) {
  const delay = randomInt(random, 550, 1200 + level * 180);
  return {
    kind: 'reaction',
    prompt: 'انتظر حتى يصبح الزر نشطًا، ثم اضغطه مرة واحدة.',
    answer: 'respond',
    options: [option('respond', 'اضغط الآن')],
    rationale: 'سُجّل الزمن بعد ظهور الإشارة. قارن هذه الجلسة بجلساتك أنت فقط.',
    reactionDelay: delay,
    difficultyDescriptor: `نافذة انتظار متغيرة حتى ${1200 + level * 180} مللي ثانية`,
    difficultySignature: `reaction-window:${level}`,
  };
}

export function makeCognitiveTrial(tool, level, trialIndex, sessionSeed = 1) {
  const normalizedLevel = Math.min(5, Math.max(1, Math.trunc(Number(level) || 1)));
  const normalizedIndex = Math.max(0, Math.trunc(Number(trialIndex) || 0));
  const seed = hashText(`${tool.slug}:${normalizedLevel}:${normalizedIndex}:${sessionSeed}`);
  const random = seededRandom(seed);
  let raw;
  switch (tool.mode) {
    case 'simple_reaction': raw = makeSimpleReaction(random, normalizedLevel); break;
    case 'choice_reaction': raw = makeChoiceReaction(random, normalizedLevel, normalizedIndex); break;
    case 'visual_reaction': raw = makeVisualReaction(random, normalizedLevel); break;
    case 'auditory_symbol': raw = makeAuditorySymbol(random, normalizedLevel); break;
    case 'go_no_go': raw = makeGoNoGo(random, normalizedLevel, normalizedIndex); break;
    case 'stroop_basic': raw = makeStroop(random, normalizedLevel, normalizedIndex, false); break;
    case 'stroop_advanced': raw = makeStroop(random, normalizedLevel, normalizedIndex, true); break;
    case 'response_inhibition': raw = makeResponseInhibition(random, normalizedLevel, normalizedIndex); break;
    case 'digit_span_forward':
    case 'digit_span_backward':
    case 'letter_span': raw = makeSpan(random, normalizedLevel, tool.mode); break;
    case 'spatial_span': raw = makeSpatialSpan(random, normalizedLevel); break;
    case 'one_back': raw = makeNBack(random, normalizedLevel, 1, normalizedIndex); break;
    case 'two_back': raw = makeNBack(random, normalizedLevel, 2, normalizedIndex); break;
    case 'three_back': raw = makeNBack(random, normalizedLevel, 3, normalizedIndex); break;
    case 'memory_update': raw = makeMemoryUpdate(random, normalizedLevel); break;
    case 'visual_grid': raw = makeVisualGrid(random, normalizedLevel); break;
    case 'sequence_memory': raw = makeSequenceMemory(random, normalizedLevel); break;
    case 'paired_associates': raw = makePairedAssociates(random, normalizedLevel); break;
    case 'symbol_memory': raw = makeSymbolMemory(random, normalizedLevel); break;
    case 'visual_search': raw = makeVisualSearch(random, normalizedLevel); break;
    case 'symbol_search': raw = makeSymbolSearch(random, normalizedLevel, normalizedIndex); break;
    case 'sustained_attention': raw = makeSustainedAttention(random, normalizedLevel, normalizedIndex); break;
    case 'divided_attention': raw = makeDividedAttention(random, normalizedLevel); break;
    case 'selective_attention': raw = makeSelectiveAttention(random, normalizedLevel, normalizedIndex); break;
    case 'attention_switch': raw = makeAttentionSwitch(random, normalizedLevel, normalizedIndex); break;
    case 'number_series': raw = makeNumberSeries(random, normalizedLevel); break;
    case 'matrix_patterns': raw = makeMatrixPatterns(random, normalizedLevel); break;
    case 'odd_one_out': raw = makeOddOneOut(random, normalizedLevel); break;
    case 'verbal_analogy': raw = makeVerbalAnalogy(random, normalizedLevel); break;
    case 'logical_rules': raw = makeLogicalRules(random, normalizedLevel); break;
    case 'conditional_reasoning': raw = makeConditionalReasoning(random, normalizedLevel); break;
    case 'mental_arithmetic': raw = makeMentalArithmetic(random, normalizedLevel); break;
    case 'estimation': raw = makeEstimation(random, normalizedLevel); break;
    case 'mental_rotation': raw = makeMentalRotation(random, normalizedLevel); break;
    case 'spatial_relations': raw = makeSpatialRelations(random, normalizedLevel); break;
    case 'trail_switching': raw = makeTrailSwitching(random, normalizedLevel); break;
    case 'task_switching': raw = makeTaskSwitching(random, normalizedLevel, normalizedIndex); break;
    case 'planning_steps': raw = makePlanningSteps(random, normalizedLevel); break;
    case 'rule_discovery': raw = makeRuleDiscovery(random, normalizedLevel); break;
    case 'priority_planning': raw = makePriorityPlanning(random, normalizedLevel); break;
    case 'problem_solving': raw = makeProblemSolving(random, normalizedLevel); break;
    case 'emotion_recognition': raw = makeEmotionRecognition(random, normalizedLevel); break;
    case 'perspective_taking': raw = makePerspectiveTaking(random, normalizedLevel); break;
    case 'social_scenarios': raw = makeSocialScenario(random, normalizedLevel); break;
    case 'context_clues': raw = makeContextClues(random, normalizedLevel); break;
    case 'word_categories': raw = makeWordCategories(random, normalizedLevel); break;
    case 'semantic_fluency': raw = makeSemanticFluency(random, normalizedLevel); break;
    case 'associative_binding': raw = makeAssociativeBinding(random, normalizedLevel); break;
    case 'working_memory_updating': raw = makeWorkingMemoryUpdating(random, normalizedLevel); break;
    case 'prospective_memory': raw = makeProspectiveMemory(random, normalizedLevel, normalizedIndex); break;
    case 'temporal_order_memory': raw = makeTemporalOrderMemory(random, normalizedLevel); break;
    case 'visual_change_detection': raw = makeVisualChangeDetection(random, normalizedLevel); break;
    default: throw new Error(`Unsupported cognitive mode: ${tool.mode}`);
  }
  return finish(random, raw, tool, normalizedLevel);
}

export function isCognitiveAnswerCorrect(trial, value) {
  return String(value) === String(trial.answer);
}

export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
