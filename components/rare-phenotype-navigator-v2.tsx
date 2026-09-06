'use client';

import { useMemo, useState } from 'react';

type Term = { id: string; english: string; arabic: string; layArabic: string; definition: string; source: string };
type SelectedTerm = Term & { excluded: boolean; onsetYears: string };
type Entity = { id?: string; name?: string; label?: string };
type TermInfo = { id?: string; label?: string };
type Similarity = {
  object_termset?: Record<string, TermInfo>;
  object_best_matches?: Record<string, { score?: number; match_target?: string; match_target_label?: string }>;
};
type RankResult = { subject?: Entity; score?: number; similarity?: Similarity };
type PAVSCase = { id: string; gene: string; disease: string; suggestedDisease: string; source: string; score: number; isSaudi: boolean };
type SearchPayload = { results?: Term[]; error?: string };
type RankPayload = { results?: RankResult[]; error?: string };
type PAVSPayload = { items?: PAVSCase[]; error?: string };

const STORAGE_KEY = 'rawafid:rare-phenotype-navigator:v2';
const HPO = /^HP:\d{7}$/;

function displayTerm(term: Term) { return term.arabic || term.layArabic || term.english || term.id; }
function entityName(result: RankResult) { return result.subject?.name || result.subject?.label || result.subject?.id || 'نتيجة غير مسماة'; }
function compact(value: string) { return value.trim().toLocaleUpperCase('en-US').replace(/[^A-Z0-9-]/g, ''); }
function scoreText(score: number | undefined) { return Number.isFinite(score) ? Number(score).toFixed(3) : '—'; }

function nextPhenotypeQuestions(results: RankResult[], selectedIds: Set<string>) {
  const counts = new Map<string, { id: string; label: string; count: number; score: number }>();
  for (const result of results.slice(0, 8)) {
    const objectTerms = result.similarity?.object_termset ?? {};
    const bestMatches = result.similarity?.object_best_matches ?? {};
    for (const [id, info] of Object.entries(objectTerms)) {
      if (!HPO.test(id) || selectedIds.has(id)) continue;
      const current = counts.get(id) ?? { id, label: info?.label || id, count: 0, score: 0 };
      current.count += 1;
      current.score += Number(bestMatches[id]?.score ?? 0);
      counts.set(id, current);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || b.score - a.score).slice(0, 12);
}

function phenopacket(selected: SelectedTerm[], caseId: string, sex: string) {
  const id = caseId.trim() || `rawafid-case-${Date.now()}`;
  return {
    id,
    subject: { id, ...(sex ? { sex } : {}) },
    phenotypicFeatures: selected.map((term) => ({
      type: { id: term.id, label: term.english || displayTerm(term) },
      excluded: term.excluded,
      ...(term.onsetYears.trim() ? { onset: { age: { iso8601Duration: `P${Math.max(0, Number(term.onsetYears) || 0)}Y` } } } : {}),
    })),
    metaData: {
      created: new Date().toISOString(),
      createdBy: 'Rawafid Rare Phenotype Navigator',
      phenopacketSchemaVersion: '2.0',
      resources: [{ id: 'hp', name: 'Human Phenotype Ontology', url: 'https://hpo.jax.org/', version: 'current-at-export', namespacePrefix: 'HP', iriPrefix: 'http://purl.obolibrary.org/obo/HP_' }],
    },
  };
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export default function RarePhenotypeNavigatorV2() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Term[]>([]);
  const [selected, setSelected] = useState<SelectedTerm[]>([]);
  const [diseases, setDiseases] = useState<RankResult[]>([]);
  const [genes, setGenes] = useState<RankResult[]>([]);
  const [cases, setCases] = useState<PAVSCase[]>([]);
  const [ranking, setRanking] = useState(false);
  const [status, setStatus] = useState('');
  const [caseId, setCaseId] = useState('');
  const [sex, setSex] = useState('');

  const presentIds = useMemo(() => selected.filter((term) => !term.excluded).map((term) => term.id), [selected]);
  const selectedIds = useMemo(() => new Set(selected.map((term) => term.id)), [selected]);
  const questions = useMemo(() => nextPhenotypeQuestions(diseases, selectedIds), [diseases, selectedIds]);
  const pavsGenes = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of cases.slice(0, 40)) {
      const key = compact(row.gene);
      if (key) map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [cases]);
  const convergentGenes = useMemo(() => new Set(genes.filter((result) => {
    const name = compact(entityName(result));
    return name && pavsGenes.has(name);
  }).map((result) => compact(entityName(result)))), [genes, pavsGenes]);

  async function search() {
    const q = query.trim();
    if (q.length < 2) return setStatus('اكتب حرفين على الأقل بالعربية أو الإنجليزية أو HPO ID.');
    setSearching(true); setStatus('');
    try {
      const response = await fetch(`/api/rare-phenotype/terms?q=${encodeURIComponent(q)}`);
      const payload = await response.json() as SearchPayload;
      if (!response.ok) throw new Error(payload.error || 'search');
      setSearchResults(payload.results ?? []);
      if (!(payload.results ?? []).length) setStatus('لا يوجد تطابق حاليًا. جرّب المصطلح الإنجليزي أو HPO ID.');
    } catch { setSearchResults([]); setStatus('تعذر تحميل قاموس HPO العربي مؤقتًا.'); }
    finally { setSearching(false); }
  }

  function add(term: Term) {
    setSelected((current) => current.some((item) => item.id === term.id) ? current : [...current, { ...term, excluded: false, onsetYears: '' }]);
    setQuery(''); setSearchResults([]); setDiseases([]); setGenes([]); setCases([]);
  }
  function patch(id: string, values: Partial<SelectedTerm>) { setSelected((current) => current.map((item) => item.id === id ? { ...item, ...values } : item)); setDiseases([]); setGenes([]); setCases([]); }
  function remove(id: string) { setSelected((current) => current.filter((item) => item.id !== id)); setDiseases([]); setGenes([]); setCases([]); }

  async function monarch(group: 'Human Diseases' | 'Human Genes') {
    const response = await fetch('/api/rare-phenotype/rank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phenotypes: presentIds, group, limit: 15 }) });
    const payload = await response.json() as RankPayload;
    if (!response.ok) throw new Error(payload.error || 'rank');
    return payload.results ?? [];
  }
  async function pavs() {
    const response = await fetch('/api/rare-phenotype/pavs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hpoIds: presentIds, method: 'lin', limit: 100, includeSaudi: true, includeDDD: true, includeLiterature: true, onlyDiagnosed: false }) });
    const payload = await response.json() as PAVSPayload;
    if (!response.ok) throw new Error(payload.error || 'pavs');
    return payload.items ?? [];
  }

  async function analyze() {
    if (!presentIds.length) return setStatus('أضف phenotype حاضرًا واحدًا على الأقل. الصفات المنفية تُحفظ في Phenopacket ولا تدخل المطابقة الحالية.');
    setRanking(true); setStatus('');
    const results = await Promise.allSettled([monarch('Human Diseases'), monarch('Human Genes'), pavs()]);
    const [diseaseResult, geneResult, caseResult] = results;
    setDiseases(diseaseResult.status === 'fulfilled' ? diseaseResult.value : []);
    setGenes(geneResult.status === 'fulfilled' ? geneResult.value : []);
    setCases(caseResult.status === 'fulfilled' ? caseResult.value : []);
    const failed = results.filter((item) => item.status === 'rejected').length;
    setStatus(failed === 0 ? 'اكتملت ثلاث طبقات مستقلة من المطابقة. النتائج فرضيات للمراجعة وليست تشخيصًا.' : `اكتملت المطابقة جزئيًا؛ ${failed.toLocaleString('ar')} من 3 مصادر تحليلية لم تستجب. النتائج المتاحة ما زالت قابلة للمراجعة.`);
    setRanking(false);
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ caseId, sex, selected, savedAt: new Date().toISOString() })); setStatus('حُفظ الملف محليًا على هذا الجهاز فقط.'); }
    catch { setStatus('تعذر الحفظ المحلي. استخدم تصدير Phenopacket.'); }
  }
  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return setStatus('لا توجد نسخة محلية محفوظة.');
      const data = JSON.parse(raw) as { caseId?: string; sex?: string; selected?: SelectedTerm[] };
      setSelected(Array.isArray(data.selected) ? data.selected.filter((term) => HPO.test(term.id)) : []); setCaseId(data.caseId || ''); setSex(data.sex || ''); setDiseases([]); setGenes([]); setCases([]); setStatus('تمت استعادة النسخة المحلية.');
    } catch { setStatus('تعذر استعادة النسخة المحلية.'); }
  }
  function exportPacket() {
    if (!selected.length) return setStatus('أضف phenotype واحدًا على الأقل قبل التصدير.');
    const packet = phenopacket(selected, caseId, sex); downloadJson(`${packet.id}-phenopacket.json`, packet); setStatus('تم إنشاء Phenopacket v2 JSON محليًا.');
  }

  return <div className="rare-nav-workspace">
    <section className="rare-nav-panel rare-nav-intro">
      <div><span className="rare-nav-kicker">Phenotype-first workflow</span><h2>ابدأ بما نراه، لا باسم مرض متوقع</h2><p>ابحث بالعربية أو الإنجليزية، اختر HPO ID الصحيح، وسجّل الموجود والمنفي وعمر البداية. لا تُدخل اسمًا كاملًا أو رقم هوية.</p></div>
      <div className="rare-nav-case-fields"><label><span>معرّف محلي اختياري</span><input value={caseId} onChange={(e) => setCaseId(e.target.value.slice(0, 80))} placeholder="case-001" /></label><label><span>الجنس في Phenopacket</span><select value={sex} onChange={(e) => setSex(e.target.value)}><option value="">غير محدد</option><option value="MALE">ذكر</option><option value="FEMALE">أنثى</option><option value="OTHER_SEX">آخر</option><option value="UNKNOWN_SEX">غير معروف</option></select></label></div>
    </section>

    <section className="rare-nav-panel"><div className="rare-nav-section-head"><div><span>1</span><h2>ابحث عن phenotype</h2></div><small>PAVS Arabic HPO · HPO IDs</small></div><div className="rare-nav-search-row"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void search(); } }} placeholder="صغر الرأس، نوبات، Microcephaly، HP:0000252" /><button type="button" onClick={() => void search()} disabled={searching}>{searching ? 'جارٍ البحث…' : 'بحث'}</button></div>{searchResults.length > 0 && <div className="rare-nav-search-results">{searchResults.map((term) => <button type="button" key={term.id} onClick={() => add(term)}><strong>{displayTerm(term)}</strong><span>{term.id} · {term.english}</span>{term.definition && <small>{term.definition}</small>}</button>)}</div>}</section>

    <section className="rare-nav-panel"><div className="rare-nav-section-head"><div><span>2</span><h2>ملف phenotype</h2></div><small>{selected.length.toLocaleString('ar')} مصطلحًا</small></div>{!selected.length ? <p className="rare-nav-empty">لم تُضف أي phenotype بعد.</p> : <div className="rare-nav-selected">{selected.map((term) => <article key={term.id} className={term.excluded ? 'is-excluded' : ''}><div><strong>{displayTerm(term)}</strong><span>{term.id} · {term.english}</span></div><label><span>الحالة</span><select value={term.excluded ? 'absent' : 'present'} onChange={(e) => patch(term.id, { excluded: e.target.value === 'absent' })}><option value="present">موجودة</option><option value="absent">منفية</option></select></label><label><span>عمر البداية</span><input inputMode="decimal" value={term.onsetYears} onChange={(e) => patch(term.id, { onsetYears: e.target.value.replace(/[^0-9.]/g, '').slice(0, 6) })} placeholder="سنوات" /></label><button type="button" onClick={() => remove(term.id)}>حذف</button></article>)}</div>}<div className="rare-nav-actions"><button type="button" onClick={save}>حفظ محلي</button><button type="button" onClick={restore}>استعادة</button><button type="button" onClick={exportPacket}>تصدير Phenopacket</button></div></section>

    <section className="rare-nav-panel"><div className="rare-nav-section-head"><div><span>3</span><h2>حلّل بثلاث نوافذ مستقلة</h2></div><small>Monarch + PAVS</small></div><p>تُرسل HPO IDs الموجودة فقط؛ لا تُرسل الأسماء أو معرّف الحالة أو الصفات المنفية.</p><button type="button" className="rare-nav-primary" disabled={ranking || !presentIds.length} onClick={() => void analyze()}>{ranking ? 'جارٍ التحليل…' : 'مطابقة الأمراض والجينات والحالات'}</button>
      {(diseases.length > 0 || genes.length > 0 || cases.length > 0) && <div className="rare-nav-triangulation">
        <ResultList title="الأمراض المرشحة · Monarch" rows={diseases.map((row) => ({ key: row.subject?.id || entityName(row), title: entityName(row), meta: row.subject?.id || '', score: scoreText(row.score) }))} />
        <ResultList title="الجينات المرشحة · Monarch" rows={genes.map((row) => { const name = entityName(row); const convergent = convergentGenes.has(compact(name)); return { key: row.subject?.id || name, title: name, meta: `${row.subject?.id || ''}${convergent ? ' · إشارة متقاطعة مع حالات PAVS' : ''}`, score: scoreText(row.score), convergent }; })} />
        <ResultList title="الحالات المشابهة · PAVS" rows={cases.slice(0, 20).map((row) => ({ key: row.id, title: row.gene || row.disease || row.id, meta: `${row.disease || row.suggestedDisease || 'مرض غير مسمى'} · ${row.source || 'PAVS'}${row.isSaudi ? ' · سعودي' : ''}`, score: scoreText(row.score) }))} />
      </div>}
    </section>

    {questions.length > 0 && <section className="rare-nav-panel rare-nav-next"><div className="rare-nav-section-head"><div><span>4</span><h2>ما phenotype التالي الذي يستحق التحقق؟</h2></div><small>ليس طلب فحوص جديدة تلقائيًا</small></div><p>هذه صفات تظهر بين أعلى فرضيات Monarch ولم تُسجل في ملفك. تحقق منها سريريًا فقط إذا كانت ذات معنى للحالة.</p><div className="rare-nav-question-grid">{questions.map((item) => <div key={item.id}><strong>{item.label}</strong><span>{item.id} · ظهر في {item.count.toLocaleString('ar')} من أعلى الفرضيات</span></div>)}</div></section>}

    <section className="rare-nav-panel rare-nav-method"><h2>كيف تقرأ النتائج؟</h2><ul><li><strong>Monarch:</strong> semantic similarity للأمراض والجينات؛ الدرجة ليست احتمال تشخيص.</li><li><strong>PAVS:</strong> حالات phenotype مشابهة من cohorts منشورة؛ التشابه بين حالتين لا يثبت نفس السبب الجيني.</li><li><strong>الإشارة المتقاطعة:</strong> تكرار اسم الجين في نتائج Monarch والحالات الشبيهة فقط؛ لا تتحول إلى تشخيص أو توصية علاج.</li><li><strong>الصفات المنفية:</strong> تُحفظ في Phenopacket لكنها لا تدخل المطابقة في هذا الإصدار.</li><li><strong>العربية:</strong> PAVS Arabic HPO طبقة مستقلة وليست الترجمة العربية الرسمية الكاملة لـHPO.</li></ul></section>
    <p className="rare-nav-status" aria-live="polite">{status}</p>
  </div>;
}

function ResultList({ title, rows }: { title: string; rows: Array<{ key: string; title: string; meta: string; score: string; convergent?: boolean }> }) {
  return <section className="rare-nav-result-list"><h3>{title}</h3>{rows.length ? <ol>{rows.map((row) => <li key={row.key} className={row.convergent ? 'is-convergent' : ''}><div><strong>{row.title}</strong><b>{row.score}</b></div><small>{row.meta}</small></li>)}</ol> : <p className="rare-nav-empty">لا توجد نتائج من هذا المصدر في هذه الجولة.</p>}</section>;
}
