import fs from 'node:fs';

const standard = JSON.parse(fs.readFileSync('data/assessment-lab/safety-branching-standard.v1.json', 'utf8'));
const banks = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.safety-hardening.v1.json', 'utf8'));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx', 'utf8');
const styles = fs.readFileSync('components/assessment-safety-alert.module.css', 'utf8');
const fail = (message) => { console.error(`ASSESSMENT LOCAL SAFETY BRANCHING FAILED: ${message}`); process.exitCode = 1; };

if (standard.status !== 'mandatory') fail('safety branching standard must remain mandatory');
if (standard.privacy?.processing !== 'client-memory-only') fail('safety answers must remain client-memory-only');
for (const key of ['server_transmission','persistent_storage','analytics_payload_from_answers']) {
  if (standard.privacy?.[key] !== false) fail(`privacy rule ${key} must remain false`);
}
for (const key of ['risk_score','diagnostic_claim','validated_risk_assessment_claim','infer_risk_from_total_score','infer_risk_from_unspecified_negative_answers']) {
  if (standard.interpretation_rules?.[key] !== false) fail(`interpretation rule ${key} must remain false`);
}
if (standard.interpretation_rules?.exact_item_trigger_required !== true) fail('safety branching must require exact item triggers');
if (standard.interpretation_rules?.trigger_values_must_be_explicit !== true) fail('safety trigger values must remain explicit');
if (standard.interpretation_rules?.alert_disappears_when_trigger_answer_is_removed !== true) fail('alerts must remain derived from current answers rather than persistent state');
if (!Array.isArray(standard.authoritative_sources) || standard.authoritative_sources.length < 3) fail('safety branching standard requires authoritative sources');
if (!standard.authoritative_sources.some((source) => source.url?.includes('who.int'))) fail('safety branching standard requires WHO grounding');
if (!standard.authoritative_sources.some((source) => source.url?.includes('acog.org'))) fail('postpartum safety branching requires an obstetric authority source');

const allowedAnswers = {
  'yes-no': new Set(['لا','إلى حد ما','نعم']),
  frequency: new Set(['أبدًا','نادرًا','أحيانًا','غالبًا','دائمًا تقريبًا']),
  degree: new Set(['إطلاقًا','بدرجة بسيطة','بدرجة متوسطة','بدرجة كبيرة','بدرجة كبيرة جدًا']),
};
const allowedLevels = new Set(['urgent','priority']);
const allowedKinds = new Set(['personal-safety','postpartum-urgent','health-evaluation','recovery-support']);
const signals = [];
for (const [slug, questions] of Object.entries(banks)) {
  for (const question of questions) {
    if (!question.safetySignal) continue;
    const signal = question.safetySignal;
    signals.push({ slug, question, signal });
    if (question.responseKind !== 'yes-no') fail(`${slug}: initial safety branching must remain restricted to explicit yes/no items`);
    if (!Array.isArray(signal.triggerValues) || signal.triggerValues.length < 1) fail(`${slug}: safety signal has no trigger values`);
    for (const value of signal.triggerValues ?? []) {
      if (!allowedAnswers[question.responseKind]?.has(value)) fail(`${slug}: invalid trigger value ${value}`);
    }
    if (!allowedLevels.has(signal.level)) fail(`${slug}: invalid safety level ${signal.level}`);
    if (!allowedKinds.has(signal.kind)) fail(`${slug}: invalid safety kind ${signal.kind}`);
    if (!signal.title?.trim() || signal.title.trim().length < 12) fail(`${slug}: safety title is too weak`);
    if (!signal.message?.trim() || signal.message.trim().length < 90) fail(`${slug}: safety message is too weak`);
    if (/درجة خطر|نسبة خطر|تشخيصك|مصاب/.test(signal.message)) fail(`${slug}: safety message makes a prohibited risk/diagnostic claim`);
  }
}

const expectedCounts = standard.initial_signal_scope ?? {};
for (const [slug, expected] of Object.entries(expectedCounts)) {
  if (slug === 'total') continue;
  const actual = signals.filter((entry) => entry.slug === slug).length;
  if (actual !== expected) fail(`${slug}: expected ${expected} initial safety signals, found ${actual}`);
}
if (signals.length !== expectedCounts.total) fail(`expected ${expectedCounts.total} initial safety signals, found ${signals.length}`);

const requiredSignals = [
  ['relationship-safety','هل خفت خلال الأسبوع الماضي من أن يؤذيك الطرف الآخر جسديًا؟',['نعم']],
  ['relationship-safety','هل تعرضت خلال الأسبوع الماضي لإكراه أو تماس جنسي لم توافق عليه؟',['نعم']],
  ['relationship-safety','هل ازداد التهديد أو المطاردة أو العنف مؤخرًا بطريقة تجعلك تحتاج خطة أمان عاجلة؟',['نعم']],
  ['trauma-recovery','هل يوجد خطر حقيقي قائم الآن يحتاج إلى معالجة مباشرة قبل التركيز على ذكريات الماضي؟',['نعم']],
  ['postpartum-support','هل ظهرت أفكار عن إيذاء نفسك أو الطفل تستدعي مساعدة عاجلة الآن؟',['نعم']],
  ['postpartum-support','هل يوجد عرض جسدي أو نفسي بعد الولادة ترى أنه يحتاج تقييمًا صحيًا الآن؟',['نعم']],
  ['recovery-safety','إذا كان الخطر فوريًا الآن، هل ستتوقف عن الأداة وتطلب مساعدة مباشرة؟',['لا','إلى حد ما']],
  ['panic-pattern','هل ظهر عرض جسدي جديد أو مختلف بوضوح عن نمطك المعتاد؟',['نعم']],
];
for (const [slug, text, triggerValues] of requiredSignals) {
  const question = banks[slug]?.find((item) => item.text === text);
  if (!question?.safetySignal) { fail(`${slug}: required safety signal is missing for ${text}`); continue; }
  if (JSON.stringify(question.safetySignal.triggerValues) !== JSON.stringify(triggerValues)) fail(`${slug}: trigger polarity drifted for ${text}`);
}

for (const token of ['AssessmentSafetySignal','safetySignal?: AssessmentSafetySignal','triggerValues','AssessmentSafetyLevel']) {
  if (!catalog.includes(token)) fail(`catalog safety typing missing ${token}`);
}
for (const token of ['role="alert"','aria-atomic="true"','activeSafetySignal','triggerValues.includes(selectedAnswer)','تنبيه احترازي محلي فقط','لا تحسب درجة تشخيصية أو درجة خطر']) {
  if (!runner.includes(token)) fail(`runner safety behavior missing ${token}`);
}
for (const forbidden of ['fetch(', 'localStorage.setItem', 'sessionStorage.setItem', 'navigator.sendBeacon']) {
  if (runner.includes(forbidden)) fail(`runner must not transmit/store safety answers via ${forbidden}`);
}
if (!runner.includes("const activeSafetySignal = question.safetySignal && selectedAnswer")) fail('alert visibility must be derived directly from the current selected answer');
if (!styles.includes('.urgent') || !styles.includes('.priority')) fail('safety alerts need visually distinct urgent and priority states');

if (!process.exitCode) console.log(`Assessment local safety branching passed: ${signals.length} explicit conservative triggers are local-only, accessible, non-diagnostic, non-scoring and evidence-bounded.`);
