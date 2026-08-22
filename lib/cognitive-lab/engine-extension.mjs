const SYMBOLS = ['●', '▲', '■', '◆', '★', '⬟', '✚', '⬢'];
const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
const DIRECTIONS = ['↑', '→', '↓', '←'];
const COLORS = ['أحمر', 'أزرق', 'أخضر', 'ذهبي'];

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
function unique(values) { return [...new Set(values.map(String))]; }
const option = (value, label = String(value)) => ({ value: String(value), label: String(label) });

function finalize(random, tool, level, raw) {
  const answer = String(raw.answer);
  const options = shuffle(random, unique(raw.options).map((value) => option(value)));
  if (!options.some((item) => item.value === answer)) options.push(option(answer));
  const deduped = [...new Map(options.map((item) => [item.value, item])).values()];
  const semantic = [tool.slug, level, raw.study ?? '', raw.prompt, raw.display ?? '', answer, deduped.map((item) => item.value).sort().join('|'), raw.difficultySignature].join('::');
  return {
    kind: raw.kind ?? 'choice',
    prompt: raw.prompt,
    ...(raw.display ? { display: raw.display } : {}),
    ...(raw.study ? { study: raw.study } : {}),
    answer,
    options: deduped,
    rationale: raw.rationale,
    level,
    difficultyDescriptor: raw.difficultyDescriptor,
    difficultySignature: raw.difficultySignature,
    fingerprint: hashText(semantic).toString(16).padStart(8, '0'),
  };
}

function conflictTask(random, level, mode, index) {
  if (mode === 'numerical_stroop') {
    const a = int(random, 2, 8 + level * 3);
    let b = int(random, 2, 8 + level * 3);
    if (b === a) b += 1;
    const askValue = (index + level) % 2 === 0;
    const answer = askValue ? String(Math.max(a, b)) : (a < b ? 'الأول' : 'الثاني');
    return {
      prompt: askValue ? `تجاهل الحجم البصري المفترض واختر القيمة العددية الأكبر: ${a} أم ${b}.` : `أي موضع يحمل القيمة الأصغر: الأول (${a}) أم الثاني (${b})؟`,
      answer,
      options: askValue ? [String(a), String(b)] : ['الأول', 'الثاني'],
      rationale: askValue ? `${Math.max(a, b)} هي القيمة العددية الأكبر.` : `${Math.min(a, b)} هي الأصغر وتقع في ${answer}.`,
      difficultyDescriptor: `تعارض عددي موجّه بدرجة ${level}`,
      difficultySignature: `numerical-conflict:${level}`,
    };
  }
  const left = pick(random, SYMBOLS.slice(0, 4));
  const right = pick(random, SYMBOLS.slice(4));
  const target = (index + level) % 2 === 0 ? left : right;
  const position = (index + level) % 3 === 0 ? 'يسار' : 'يمين';
  if (mode === 'conflict_monitoring') {
    const expected = target === left ? 'يسار' : 'يمين';
    const answer = expected === position ? 'متوافق' : 'متعارض';
    return {
      prompt: `قاعدة الاستجابة: ${left}=يسار، ${right}=يمين. ظهر ${target} في موضع ${position}. هل المعلومتان متوافقتان؟`,
      answer,
      options: ['متوافق', 'متعارض'],
      rationale: `الرمز ${target} يستدعي ${expected} بينما موضعه ${position}، لذا الحالة ${answer}.`,
      difficultyDescriptor: `مراقبة تعارض هوية/موضع بدرجة ${level}`,
      difficultySignature: `conflict-monitor:${level}`,
    };
  }
  const answer = target === left ? 'يسار' : 'يمين';
  return {
    prompt: `قاعدة الرمز: ${left}=يسار، ${right}=يمين. تجاهل موضع الظهور (${position}) واستجب لهوية الرمز ${target}.`,
    answer,
    options: ['يسار', 'يمين'],
    rationale: `وفق قاعدة الهوية، ${target} يرتبط باستجابة ${answer} بغض النظر عن موقعه.`,
    difficultyDescriptor: `تعارض موقع/استجابة بدرجة ${level}`,
    difficultySignature: `simon:${level}`,
  };
}

function executiveRuleTask(random, level, mode, index) {
  const n = int(random, 2, 9 + level * 2);
  const symbol = pick(random, SYMBOLS);
  const parity = n % 2 === 0 ? 'زوجي' : 'فردي';
  const size = n >= 5 + level ? 'كبير' : 'صغير';
  if (mode === 'context_maintenance') {
    const cue = (index + level) % 2 === 0 ? 'عدد' : 'رمز';
    const answer = cue === 'عدد' ? parity : (SYMBOLS.indexOf(symbol) % 2 === 0 ? 'الفئة أ' : 'الفئة ب');
    return { kind: 'memory', study: `السياق: إذا كانت الإشارة «عدد» صنّف العدد زوجي/فردي؛ وإذا كانت «رمز» صنّف الرموز ذات الفهرس الزوجي فئة أ والباقي فئة ب. الإشارة الحالية: ${cue}.`, prompt: `المثير: ${n} ${symbol}. ما الاستجابة الصحيحة؟`, answer, options: ['زوجي','فردي','الفئة أ','الفئة ب'], rationale: `الإشارة الحالية هي ${cue}، لذلك نطبق قاعدتها فقط وتكون الإجابة ${answer}.`, difficultyDescriptor: `صيانة سياق مع ${1 + level} عناصر مشتتة ضمنيًا`, difficultySignature: `context-maintenance:${level}` };
  }
  if (mode === 'rule_maintenance' || mode === 'set_shifting_cued') {
    const cue = (index + level) % 2 === 0 ? 'تكافؤ' : 'حجم';
    const answer = cue === 'تكافؤ' ? parity : size;
    return { prompt: `إشارة القاعدة: ${cue}. العدد ${n}.`, answer, options: ['زوجي','فردي','كبير','صغير'], rationale: `قاعدة ${cue} تعطي الاستجابة ${answer}.`, difficultyDescriptor: `${mode === 'set_shifting_cued' ? 'تحول موجّه' : 'صيانة قواعد'} بدرجة ${level}`, difficultySignature: `${mode}:${level}` };
  }
  const first = n + level;
  const second = first % 2 === 0 ? first / 2 : first + 1;
  return { kind: 'memory', study: `ابدأ من ${n}. القاعدة 1: أضف ${level}. القاعدة 2: إذا كان الناتج زوجيًا اقسمه على 2، وإلا أضف 1.`, prompt: 'ما الناتج النهائي بعد تطبيق القاعدتين؟', answer: String(second), options: [String(second), String(first), String(second + 1), String(Math.max(0, second - 1))], rationale: `بعد القاعدة الأولى يصبح العدد ${first}، وبعد الثانية يصبح ${second}.`, difficultyDescriptor: `قاعدتان متتاليتان وحمل تنفيذي ${level}`, difficultySignature: `dual-rule:${level}` };
}

function speedTask(random, level, mode, index) {
  if (mode === 'symbol_coding') {
    const symbols = shuffle(random, SYMBOLS).slice(0, Math.min(3 + level, 7));
    const target = pick(random, symbols);
    const map = symbols.map((s, i) => `${s}=${i + 1}`).join('، ');
    const answer = String(symbols.indexOf(target) + 1);
    return { prompt: `المفتاح: ${map}. ما رقم الرمز ${target}؟`, answer, options: symbols.map((_, i) => String(i + 1)), rationale: `وفق المفتاح، ${target} يقابل الرقم ${answer}.`, difficultyDescriptor: `مفتاح ترميز من ${symbols.length} روابط`, difficultySignature: `symbol-code:${level}` };
  }
  if (mode === 'numeric_comparison_speed') {
    const a = int(random, 10 ** Math.min(level, 3), 10 ** Math.min(level, 3) + 200 + level * 40);
    const b = a + (index % 2 === 0 ? int(random, 1, 9 + level) : -int(random, 1, 9 + level));
    const askLargest = index % 2 === 0;
    const answer = String(askLargest ? Math.max(a,b) : Math.min(a,b));
    return { prompt: `اختر العدد ${askLargest ? 'الأكبر' : 'الأصغر'}: ${a} أم ${b}.`, answer, options: [String(a), String(b)], rationale: `${answer} هو العدد ${askLargest ? 'الأكبر' : 'الأصغر'}.`, difficultyDescriptor: `تقارب عددي بدرجة ${level}`, difficultySignature: `numeric-speed:${level}` };
  }
  const length = 3 + level;
  const pool = mode === 'letter_comparison' ? LETTERS : SYMBOLS;
  const first = Array.from({ length }, () => pick(random, pool));
  const second = [...first];
  const same = index % Math.max(2, 6 - level) === 0;
  if (!same) {
    const at = int(random, 0, length - 1);
    second[at] = pick(random, pool.filter((x) => x !== second[at]));
  }
  return { prompt: `هل السلسلتان متطابقتان؟`, display: `${first.join(' ')}   |   ${second.join(' ')}`, answer: same ? 'متطابقتان' : 'مختلفتان', options: ['متطابقتان','مختلفتان'], rationale: same ? 'كل العناصر متطابقة في المواضع نفسها.' : 'يوجد اختلاف واحد على الأقل بين المواضع.', difficultyDescriptor: `سلسلة بطول ${length} وتشابه مرتفع`, difficultySignature: `${mode}:${level}` };
}

function memoryBindingTask(random, level, mode) {
  if (mode === 'route_memory') {
    const length = 2 + level;
    const route = Array.from({length}, () => pick(random, DIRECTIONS));
    const answer = route.join(' ');
    const wrong = [...route]; wrong[Math.min(length - 1, level - 1)] = pick(random, DIRECTIONS.filter((d) => d !== wrong[Math.min(length - 1, level - 1)]));
    return { kind:'memory', study: route.join(' → '), prompt:'اختر المسار الذي عُرض بالترتيب نفسه.', answer, options:[answer, wrong.join(' '), [...route].reverse().join(' '), [...route.slice(1),route[0]].join(' ')], rationale:`المسار الأصلي هو ${answer}.`, difficultyDescriptor:`مسار من ${length} خطوات`, difficultySignature:`route-memory:${level}` };
  }
  if (mode === 'serial_position_memory') {
    const length = 3 + level;
    const seq = shuffle(random, SYMBOLS).slice(0,length);
    const target = pick(random, seq);
    const answer = String(seq.indexOf(target)+1);
    return { kind:'memory', study:seq.join(' – '), prompt:`ما موضع الرمز ${target}؟`, answer, options:Array.from({length},(_,i)=>String(i+1)), rationale:`ظهر ${target} في الموضع ${answer}.`, difficultyDescriptor:`سلسلة من ${length} عناصر`, difficultySignature:`serial-position:${level}` };
  }
  if (mode === 'lure_discrimination') {
    const bases = [['●','○','◉'],['▲','△','▴'],['■','□','▪'],['◆','◇','◈']];
    const family = pick(random,bases); const studied = pick(random,family); const lure = pick(random,family.filter(x=>x!==studied));
    return { kind:'memory', study:`العنصر المدروس: ${studied}`, prompt:'أي عنصر ظهر فعلًا في مرحلة الدراسة؟', answer:studied, options:[studied,lure,pick(random,SYMBOLS.filter(x=>!family.includes(x)))], rationale:`العنصر المدروس كان ${studied}، أما ${lure} فمشابه جديد.`, difficultyDescriptor:`تشابه إدراكي بدرجة ${level}`, difficultySignature:`lure:${level}` };
  }
  const objects = shuffle(random,['كتاب','قلم','مفتاح','كوب','ساعة','كرة','مصباح','دفتر']).slice(0,2+Math.min(level,4));
  const contexts = shuffle(random,[...COLORS,'مكتب','نافذة','باب','رف']).slice(0,objects.length);
  const pairs = objects.map((o,i)=>[o,contexts[i]]);
  const target = pick(random,pairs);
  const study = pairs.map(([o,c])=>`${o} ↔ ${c}`).join(' | ');
  if (mode === 'landmark_route_binding') {
    const step = pairs.indexOf(target)+1;
    return {kind:'memory',study:pairs.map(([o,c],i)=>`${i+1}:${o}/${c}`).join(' | '),prompt:`ما المعلم المرتبط بالمحطة ${step}؟`,answer:target[0],options:objects,rationale:`المحطة ${step} ارتبطت بالمعلم ${target[0]}.`,difficultyDescriptor:`${pairs.length} محطات ومعالم`,difficultySignature:`landmark-route:${level}`};
  }
  const answer = target[1];
  return {kind:'memory',study,prompt:`ما السياق المرتبط بـ«${target[0]}»؟`,answer,options:contexts,rationale:`ارتبط ${target[0]} بالسياق ${answer}.`,difficultyDescriptor:`${pairs.length} روابط عنصر/سياق`,difficultySignature:`${mode}:${level}`};
}

function visualSpatialTask(random, level, mode) {
  if (mode === 'symmetry_detection') {
    const half = Array.from({length:2+level},()=>pick(random,SYMBOLS.slice(0,5)));
    const symmetric = int(random,0,1)===1;
    const right = symmetric ? [...half].reverse() : [...half].reverse().map((v,i)=>i===level?pick(random,SYMBOLS.filter(x=>x!==v)):v);
    return {prompt:'هل النمط متناظر حول المحور | ؟',display:`${half.join(' ')} | ${right.join(' ')}`,answer:symmetric?'نعم':'لا',options:['نعم','لا'],rationale:symmetric?'النصف الثاني يعكس الأول تمامًا.':'يوجد عنصر لا يطابق انعكاس نظيره.',difficultyDescriptor:`نصف بطول ${half.length}`,difficultySignature:`symmetry:${level}`};
  }
  if (mode === 'spatial_folding') {
    const turns = 1+level; let dir=int(random,0,3); const ops=[];
    for(let i=0;i<turns;i++){const right=int(random,0,1)===1;ops.push(right?'يمين 90°':'يسار 90°');dir=(dir+(right?1:3))%4;}
    return {kind:'memory',study:`ابدأ من ↑ ثم نفّذ: ${ops.join('، ')}`,prompt:'ما الاتجاه النهائي؟',answer:DIRECTIONS[dir],options:DIRECTIONS,rationale:`بعد تطبيق الدورانات بالتتابع يصبح الاتجاه ${DIRECTIONS[dir]}.`,difficultyDescriptor:`${turns} تحولات مكانية`,difficultySignature:`folding:${level}`};
  }
  if (mode === 'embedded_pattern') {
    const target=shuffle(random,SYMBOLS).slice(0,2+Math.min(level,2)); const answer=target.join(' '); const distractor=shuffle(random,SYMBOLS).slice(0,target.length).join(' ');
    return {prompt:`ابحث عن التسلسل المستهدف: ${answer}`,display:`${shuffle(random,[...target,...SYMBOLS.slice(0,2+level)]).join(' ')}`,answer,options:[answer,distractor,[...target].reverse().join(' ')],rationale:`البديل ${answer} يحافظ على عناصر الهدف وعلاقتها.`,difficultyDescriptor:`هدف بطول ${target.length} داخل مشتتات`,difficultySignature:`embedded:${level}`};
  }
  const seq=Array.from({length:3+level},()=>pick(random,SYMBOLS.slice(0,5))); const missing=int(random,0,seq.length-1); const answer=seq[missing]; const shown=seq.map((x,i)=>i===missing?'؟':x).join(' ');
  return {prompt:'أي عنصر يكمل النمط الناقص؟',display:shown,answer,options:SYMBOLS.slice(0,5),rationale:`العنصر الناقص في النسخة الأصلية هو ${answer}.`,difficultyDescriptor:`إغلاق بصري لنمط بطول ${seq.length}`,difficultySignature:`visual-closure:${level}`};
}

function learningTask(random, level, mode) {
  if (mode === 'sequence_learning') {
    const step=int(random,1,2+level); const start=int(random,1,6); const seq=Array.from({length:4+Math.min(level,3)},(_,i)=>start+i*step); const answer=String(seq.at(-1)+step);
    return {prompt:`اكتشف الانتظام: ${seq.join('، ')}، ؟`,answer,options:[answer,String(Number(answer)+step),String(Number(answer)-1),String(Number(answer)+1)],rationale:`يزداد التسلسل بمقدار ${step} كل مرة، لذا التالي ${answer}.`,difficultyDescriptor:`تسلسل بطول ${seq.length} وخطوة ${step}`,difficultySignature:`sequence-learning:${level}`};
  }
  const threshold=4+level; const examples=[2,threshold,threshold+2,threshold+4]; const target=int(random,1,threshold+5); const inClass=target>=threshold; const label=inClass?'الفئة أ':'الفئة ب';
  return {kind:'memory',study:`أمثلة معلّمة: ${examples.map(n=>`${n}=${n>=threshold?'أ':'ب'}`).join('، ')}.`,prompt:`صنّف العدد ${target}.`,answer:label,options:['الفئة أ','الفئة ب'],rationale:`القاعدة المستنتجة: الأعداد من ${threshold} فأعلى في الفئة أ؛ لذلك ${target} في ${label}.`,difficultyDescriptor:`استقراء قاعدة من ${examples.length} أمثلة`,difficultySignature:`${mode}:${level}`};
}

function reasoningTask(random, level, mode) {
  if (mode === 'transitive_inference') {
    const vals=shuffle(random,LETTERS).slice(0,3+Math.min(level,3)); const rel=vals.slice(0,-1).map((x,i)=>`${x}>${vals[i+1]}`).join('، '); return {prompt:`إذا كان ${rel}، فما العلاقة بين ${vals[0]} و${vals.at(-1)}؟`,answer:`${vals[0]}>${vals.at(-1)}`,options:[`${vals[0]}>${vals.at(-1)}`,`${vals.at(-1)}>${vals[0]}`,'متساويان','لا يمكن الاستنتاج'],rationale:'العلاقات مرتبة انتقالياً؛ الطرف الأول أكبر من كل ما يليه.',difficultyDescriptor:`سلسلة من ${vals.length-1} علاقات`,difficultySignature:`transitive:${level}`};
  }
  if (mode === 'syllogistic_reasoning') {
    const valid=int(random,0,1)===1; const conclusion=valid?'كل عناصر الفئة أ من الفئة ج':'كل عناصر الفئة ج من الفئة أ'; return {prompt:`المقدمات: كل عناصر الفئة أ من الفئة ب. كل عناصر الفئة ب من الفئة ج. النتيجة المقترحة: ${conclusion}.`,answer:valid?'تتبع منطقيًا':'لا تتبع منطقيًا',options:['تتبع منطقيًا','لا تتبع منطقيًا'],rationale:valid?'الاشتمال ينتقل من أ إلى ب ثم ج.':'المقدمات لا تسمح بعكس اتجاه الاشتمال.',difficultyDescriptor:`قياس منطقي بدرجة ${level}`,difficultySignature:`syllogism:${level}`};
  }
  if (mode === 'causal_chain' || mode === 'counterfactual_reasoning') {
    const a=int(random,1,5), b=a+level, c=b+2; const counter=mode==='counterfactual_reasoning'; const answer=counter?String(c-level):String(c); return {prompt:counter?`قاعدة مبسطة: أ=${a}، ب=أ+${level}، ج=ب+2. افترض أن الزيادة من أ إلى ب أصبحت 0. ما ج؟`:`قاعدة سببية مبسطة: أ=${a} يؤدي إلى ب=أ+${level}، ثم ج=ب+2. ما ج؟`,answer,options:[answer,String(c),String(c+1),String(Math.max(0,c-level-1))],rationale:counter?`بعد إلغاء الزيادة يصبح ب=${a} ثم ج=${answer}.`:`ب=${b} ثم ج=${c}.`,difficultyDescriptor:`سلسلة سببية من خطوتين بدرجة ${level}`,difficultySignature:`${mode}:${level}`};
  }
  const favorable=int(random,2,5+level), total=favorable+int(random,2,6+level); const pct=Math.round((favorable/total)*100); const answer=`${favorable}/${total}`; return {prompt:`صندوق فيه ${total} عناصر، منها ${favorable} مستهدفة. أي وصف يمثل الاحتمال؟`,answer,options:[answer,`${total-favorable}/${total}`,`${favorable}/${total+1}`,`${pct}/10`],rationale:`الاحتمال = الحالات المستهدفة ÷ جميع الحالات = ${answer}.`,difficultyDescriptor:`نسبة احتمال بأعداد حتى ${total}`,difficultySignature:`${mode}:${level}`};
}

function numericTask(random, level, mode) {
  if (mode === 'approximate_number') {
    const a=int(random,5+level,12+level*4), b=a+int(random,2,5+level); return {prompt:'أي مجموعة أكبر تقريبًا؟',display:`أ: ${'●'.repeat(a)}   |   ب: ${'●'.repeat(b)}`,answer:'ب',options:['أ','ب'],rationale:`المجموعة ب تضم ${b} عنصرًا مقابل ${a} في أ.`,difficultyDescriptor:`تقارب كمي بدرجة ${level}`,difficultySignature:`approx-number:${level}`};
  }
  if (mode === 'number_line') {
    const max=100*level; const percent=pick(random,[25,40,50,60,75]); const answer=String(Math.round(max*percent/100)); return {prompt:`على خط من 0 إلى ${max}، ما القيمة الواقعة عند ${percent}% من المسافة؟`,answer,options:[answer,String(Math.round(max*(percent+10)/100)),String(Math.round(max*(percent-10)/100)),String(percent)],rationale:`${percent}% من ${max} = ${answer}.`,difficultyDescriptor:`مدى عددي حتى ${max}`,difficultySignature:`number-line:${level}`};
  }
  if (mode === 'fraction_magnitude') {
    const d1=4+level, d2=d1+1; const n1=int(random,1,d1-1), n2=int(random,1,d2-1); const f1=n1/d1, f2=n2/d2; if (Math.abs(f1-f2)<0.02) return numericTask(random,level,mode); const answer=f1>f2?`${n1}/${d1}`:`${n2}/${d2}`; return {prompt:`أي الكسرين أكبر: ${n1}/${d1} أم ${n2}/${d2}؟`,answer,options:[`${n1}/${d1}`,`${n2}/${d2}`],rationale:`بالمقارنة العددية، ${answer} هو الأكبر.`,difficultyDescriptor:`مقارنة كسور بمقامات ${d1} و${d2}`,difficultySignature:`fraction:${level}`};
  }
  const base=int(random,2,5+level), factor=int(random,2,4+Math.floor(level/2)), next=base*factor; return {prompt:`إذا كانت النسبة ${base}:${next}، فما القيمة الموافقة لـ${base*2} مع النسبة نفسها؟`,answer:String(next*2),options:[String(next*2),String(next+base),String(next*factor),String(base*2)],rationale:`مضاعفة الطرف الأول تتطلب مضاعفة الطرف الثاني؛ النتيجة ${next*2}.`,difficultyDescriptor:`تناسب مباشر بعامل ${factor}`,difficultySignature:`ratio:${level}`};
}

const LANGUAGE_BANK = {
  phoneme_discrimination: [
    ['أي زوج يختلف في الصوت الأول؟','باب – تاب',['باب – تاب','دار – دود','ليل – لون'],'باب – تاب'],
    ['أي زوج يبدأ بالصوت نفسه؟','سور – سمك',['سور – سمك','نور – دار','بيت – زيت'],'سور – سمك'],
  ],
  syllable_segmentation: [
    ['اختر التقسيم الأقرب لكلمة «مكتبة».','مك – ت – بة',['مك – ت – بة','م – كتبة','مكت – بة'],'مك – ت – بة'],
    ['اختر التقسيم الأقرب لكلمة «مدرسة».','مد – ر – سة',['مد – ر – سة','م – درسة','مدر – سة'],'مد – ر – سة'],
  ],
  rhyme_judgment: [
    ['أي زوج أقرب في القافية؟','نور – سور',['نور – سور','باب – قلم','بيت – شجر'],'نور – سور'],
    ['أي زوج يشترك في نهاية صوتية؟','كتاب – باب',['كتاب – باب','ورد – طريق','قمر – بيت'],'كتاب – باب'],
  ],
  lexical_decision: [
    ['أي سلسلة كلمة عربية مألوفة؟','نافذة',['نافذة','زافنة','درفوم'],'نافذة'],
    ['أي سلسلة كلمة عربية مألوفة؟','مفتاح',['مفتاح','حفمات','تربوص'],'مفتاح'],
  ],
  semantic_association: [
    ['ما الأكثر ارتباطًا بـ«مفتاح»؟','قفل',['قفل','غيمة','وسادة','شجرة'],'قفل'],
    ['ما الأكثر ارتباطًا بـ«بوصلة»؟','اتجاه',['اتجاه','مذاق','وسادة','نافذة'],'اتجاه'],
  ],
  verbal_inference: [
    ['قرأ سامر التعليمات قبل تشغيل الجهاز، ثم أعاد الخطوة التي أخطأ فيها. ما الاستنتاج المدعوم؟','راجع الإجراء قبل المحاولة الثانية',['راجع الإجراء قبل المحاولة الثانية','نجح من أول مرة','لم يقرأ التعليمات','تعطل الجهاز'],'راجع الإجراء قبل المحاولة الثانية'],
    ['وصلت الحافلة بعد بدء المطر بدقائق، وكان مع ليلى مظلة مغلقة. ما الذي يدعمه النص؟','كانت المظلة مع ليلى',['كانت المظلة مع ليلى','استخدمت المظلة قبل المطر','توقفت الحافلة بسبب المطر','لم تمطر'],'كانت المظلة مع ليلى'],
  ],
  ambiguity_resolution: [
    ['في جملة «جلس الطالب قرب عين الماء»، ما معنى «عين»؟','نبع',['نبع','عضو البصر','جاسوس','حرف'],'نبع'],
    ['في جملة «راجع المصرف قبل السفر»، ما معنى «المصرف»؟','البنك',['البنك','مكان تصريف الماء','اتجاه الطريق','النافذة'],'البنك'],
  ],
  morphological_reasoning: [
    ['كاتب : كتابة :: قارئ : ؟','قراءة',['قراءة','مقروء','كتاب','قارئ'],'قراءة'],
    ['تعليم : معلّم :: تدريب : ؟','مدرّب',['مدرّب','متدرّب','تدريب','درس'],'مدرّب'],
  ],
};

function languageTask(random, level, mode, index) {
  const bank=LANGUAGE_BANK[mode]; const row=bank[(index + int(random,0,99)) % bank.length];
  return {prompt:row[0],answer:row[1],options:row[2],rationale:`الإجابة الأقرب وفق البنية اللغوية والسياق في هذه المهمة هي «${row[3]}».`,difficultyDescriptor:`معالجة لغوية بدرجة ${level}`,difficultySignature:`${mode}:${level}`};
}

function planningTask(random, level, mode) {
  if (mode === 'error_detection') {
    const start=int(random,2,6); const step=level; const values=[start,start+step,start+2*step,start+3*step]; const bad=1+int(random,0,2); values[bad]+=1; return {prompt:`القاعدة: أضف ${step} كل مرة. السلسلة المنفذة: ${values.join('، ')}. أين أول خطأ؟`,answer:String(bad+1),options:['1','2','3','4'],rationale:`الموضع ${bad+1} هو أول موضع لا يساوي السابق + ${step}.`,difficultyDescriptor:`مراقبة إجراء من ${values.length} خطوات`,difficultySignature:`error-detection:${level}`};
  }
  if (mode === 'means_end_planning') {
    const distance=3+level; return {prompt:`أنت عند النقطة 0 وهدفك النقطة ${distance}. يمكنك التقدم +2 أو +1، لكن النقطة ${distance-1} محظورة. ما أول خطوة أنسب؟`,answer:'+2',options:['+2','+1','توقف','ارجع -1'],rationale:'البدء بـ+2 يقلل الفجوة ويحافظ على إمكانية تجاوز النقطة المحظورة.',difficultyDescriptor:`هدف يبعد ${distance} وحدات مع قيد واحد`,difficultySignature:`means-end:${level}`};
  }
  const answer='أ → ب → ج → د'; return {prompt:`رتّب العناصر إذا كان أ قبل ب، وب قبل ج، وج قبل د.`,answer,options:[answer,'ب → أ → ج → د','أ → ج → ب → د','د → ج → ب → أ'],rationale:'الترتيب الوحيد الذي يحقق القيود الثلاثة هو أ ثم ب ثم ج ثم د.',difficultyDescriptor:`${Math.min(3,1+level)} قيود ترتيب صريحة`,difficultySignature:`constraint-planning:${level}`};
}

const SUPPORTED = new Set([
  'simon_conflict','context_maintenance','conflict_monitoring','rule_maintenance','set_shifting_cued','dual_rule_inference',
  'pattern_comparison','symbol_coding','letter_comparison','numeric_comparison_speed','feature_binding','visual_closure','symmetry_detection','embedded_pattern','spatial_folding',
  'route_memory','landmark_route_binding','source_memory','item_context_memory','lure_discrimination','serial_position_memory','relational_memory',
  'category_learning','sequence_learning','feedback_rule_learning','transitive_inference','syllogistic_reasoning','causal_chain','counterfactual_reasoning','probability_judgment','evidence_updating','numerical_stroop',
  'approximate_number','number_line','fraction_magnitude','ratio_reasoning','phoneme_discrimination','syllable_segmentation','rhyme_judgment','lexical_decision','semantic_association','verbal_inference','ambiguity_resolution','morphological_reasoning','constraint_planning','means_end_planning','error_detection'
]);

export function supportsExtensionMode(mode) { return SUPPORTED.has(mode); }

export function makeExtensionTrial(tool, level, trialIndex, sessionSeed = 1) {
  const normalizedLevel=Math.min(5,Math.max(1,Math.trunc(Number(level)||1)));
  const normalizedIndex=Math.max(0,Math.trunc(Number(trialIndex)||0));
  const random=seededRandom(hashText(`${tool.slug}:${normalizedLevel}:${normalizedIndex}:${sessionSeed}:v2`));
  let raw;
  if (['simon_conflict','conflict_monitoring','numerical_stroop'].includes(tool.mode)) raw=conflictTask(random,normalizedLevel,tool.mode,normalizedIndex);
  else if (['context_maintenance','rule_maintenance','set_shifting_cued','dual_rule_inference'].includes(tool.mode)) raw=executiveRuleTask(random,normalizedLevel,tool.mode,normalizedIndex);
  else if (['pattern_comparison','symbol_coding','letter_comparison','numeric_comparison_speed'].includes(tool.mode)) raw=speedTask(random,normalizedLevel,tool.mode,normalizedIndex);
  else if (['feature_binding','route_memory','landmark_route_binding','source_memory','item_context_memory','lure_discrimination','serial_position_memory','relational_memory'].includes(tool.mode)) raw=memoryBindingTask(random,normalizedLevel,tool.mode);
  else if (['visual_closure','symmetry_detection','embedded_pattern','spatial_folding'].includes(tool.mode)) raw=visualSpatialTask(random,normalizedLevel,tool.mode);
  else if (['category_learning','sequence_learning','feedback_rule_learning'].includes(tool.mode)) raw=learningTask(random,normalizedLevel,tool.mode);
  else if (['transitive_inference','syllogistic_reasoning','causal_chain','counterfactual_reasoning','probability_judgment','evidence_updating'].includes(tool.mode)) raw=reasoningTask(random,normalizedLevel,tool.mode);
  else if (['approximate_number','number_line','fraction_magnitude','ratio_reasoning'].includes(tool.mode)) raw=numericTask(random,normalizedLevel,tool.mode);
  else if (LANGUAGE_BANK[tool.mode]) raw=languageTask(random,normalizedLevel,tool.mode,normalizedIndex);
  else if (['constraint_planning','means_end_planning','error_detection'].includes(tool.mode)) raw=planningTask(random,normalizedLevel,tool.mode);
  else throw new Error(`Unsupported extension cognitive mode: ${tool.mode}`);
  return finalize(random,tool,normalizedLevel,raw);
}