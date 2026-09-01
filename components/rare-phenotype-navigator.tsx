'use client';

import { useMemo, useState } from 'react';

type Term = {
  id: string;
  english: string;
  arabic: string;
  layArabic: string;
  definition: string;
  source: string;
};

type SelectedTerm = Term & { excluded: boolean; onsetYears: string };

type Entity = { id?: string; name?: string; label?: string; uri?: string };
type TermInfo = { id?: string; label?: string };
type Similarity = {
  object_termset?: Record<string, TermInfo>;
  subject_termset?: Record<string, TermInfo>;
  object_best_matches?: Record<string, { score?: number; match_target?: string; match_target_label?: string }>;
  subject_best_matches?: Record<string, { score?: number; match_target?: string; match_target_label?: string }>;
};
type RankResult = { subject?: Entity; score?: number; similarity?: Similarity };

type RankPayload = {
  results?: RankResult[];
  error?: string;
  source?: string;
};

type SearchPayload = { results?: Term[]; error?: string };

const STORAGE_KEY = 'rawafid:rare-phenotype-navigator:v1';

function displayTerm(term: Term) {
  return term.arabic || term.layArabic || term.english || term.id;
}

function entityName(result: RankResult) {
  return result.subject?.name || result.subject?.label || result.subject?.id || 'نتيجة غير مسماة';
}

function formatScore(score: number | undefined) {
  if (!Number.isFinite(score)) return '—';
  return Number(score).toFixed(3);
}

function nextPhenotypeQuestions(results: RankResult[], selectedIds: Set<string>) {
  const counts = new Map<string, { id: string; label: string; count: number; score: number }>();
  for (const result of results.slice(0, 8)) {
    const objectTerms = result.similarity?.object_termset ?? {};
    const bestMatches = result.similarity?.object_best_matches ?? {};
    for (const [id, info] of Object.entries(objectTerms)) {
      if (!/^HP:\d{7}$/.test(id) || selectedIds.has(id)) continue;
      const current = counts.get(id) ?? { id, label: info?.label || id, count: 0, score: 0 };
      current.count += 1;
      current.score += Number(bestMatches[id]?.score ?? 0);
      counts.set(id, current);
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 12);
}

function makePhenopacket(selected: SelectedTerm[], caseId: string, sex: string) {
  const now = new Date().toISOString();
  const cleanId = caseId.trim() || `rawafid-case-${Date.now()}`;
  return {
    id: cleanId,
    subject: {
      id: cleanId,
      ...(sex ? { sex } : {}),
    },
    phenotypicFeatures: selected.map((term) => ({
      type: { id: term.id, label: term.english || displayTerm(term) },
      excluded: term.excluded,
      ...(term.onsetYears.trim() ? { onset: { age: { iso8601Duration: `P${Math.max(0, Number(term.onsetYears) || 0)}Y` } } } : {}),
    })),
    metaData: {
      created: now,
      createdBy: 'Rawafid Rare Phenotype Navigator',
      phenopacketSchemaVersion: '2.0',
      resources: [
        {
          id: 'hp',
          name: 'Human Phenotype Ontology',
          url: 'https://hpo.jax.org/',
          version: 'current-at-export',
          namespacePrefix: 'HP',
          iriPrefix: 'http://purl.obolibrary.org/obo/HP_',
        },
      ],
    },
  };
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RarePhenotypeNavigator() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Term[]>([]);
  const [selected, setSelected] = useState<SelectedTerm[]>([]);
  const [diseases, setDiseases] = useState<RankResult[]>([]);
  const [genes, setGenes] = useState<RankResult[]>([]);
  const [ranking, setRanking] = useState(false);
  const [status, setStatus] = useState('');
  const [caseId, setCaseId] = useState('');
  const [sex, setSex] = useState('');

  const presentIds = useMemo(() => selected.filter((term) => !term.excluded).map((term) => term.id), [selected]);
  const selectedIds = useMemo(() => new Set(selected.map((term) => term.id)), [selected]);
  const nextQuestions = useMemo(() => nextPhenotypeQuestions(diseases, selectedIds), [diseases, selectedIds]);

  async function search() {
    const q = query.trim();
    if (q.length < 2) {
      setStatus('اكتب حرفين على الأقل، بالعربية أو الإنجليزية أو رقم HPO.');
      return;
    }
    setSearching(true);
    setStatus('');
    try {
      const response = await fetch(`/api/rare-phenotype/terms?q=${encodeURIComponent(q)}`);
      const payload = await response.json() as SearchPayload;
      if (!response.ok) throw new Error(payload.error || 'search failed');
      setSearchResults(payload.results ?? []);
      if (!(payload.results ?? []).length) setStatus('لم نجد تطابقًا في طبقة HPO العربية الحالية. جرّب المصطلح الإنجليزي أو HPO ID.');
    } catch {
      setSearchResults([]);
      setStatus('تعذر البحث في قاموس HPO العربي مؤقتًا.');
    } finally {
      setSearching(false);
    }
  }

  function addTerm(term: Term) {
    setSelected((current) => current.some((entry) => entry.id === term.id)
      ? current
      : [...current, { ...term, excluded: false, onsetYears: '' }]);
    setQuery('');
    setSearchResults([]);
  }

  function patchTerm(id: string, patch: Partial<SelectedTerm>) {
    setSelected((current) => current.map((term) => term.id === id ? { ...term, ...patch } : term));
  }

  function removeTerm(id: string) {
    setSelected((current) => current.filter((term) => term.id !== id));
    setDiseases([]);
    setGenes([]);
  }

  async function rankGroup(group: 'Human Diseases' | 'Human Genes') {
    const response = await fetch('/api/rare-phenotype/rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phenotypes: presentIds, group, limit: 12 }),
    });
    const payload = await response.json() as RankPayload;
    if (!response.ok) throw new Error(payload.error || 'rank failed');
    return payload.results ?? [];
  }

  async function rank() {
    if (!presentIds.length) {
      setStatus('أضف phenotype حاضرًا واحدًا على الأقل. الصفات المنفية تُحفظ في Phenopacket لكنها لا تدخل المطابقة الحالية.');
      return;
    }
    setRanking(true);
    setStatus('');
    try {
      const [diseaseResults, geneResults] = await Promise.all([
        rankGroup('Human Diseases'),
        rankGroup('Human Genes'),
      ]);
      setDiseases(diseaseResults);
      setGenes(geneResults);
      setStatus('اكتملت المطابقة الدلالية. النتائج فرضيات للمراجعة وليست تشخيصًا.');
    } catch {
      setStatus('تعذر تشغيل المطابقة الدلالية عبر Monarch مؤقتًا. احتفظ بملفك وأعد المحاولة لاحقًا.');
    } finally {
      setRanking(false);
    }
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ caseId, sex, selected, savedAt: new Date().toISOString() }));
      setStatus('حُفظ ملف phenotype محليًا على هذا الجهاز فقط.');
    } catch {
      setStatus('تعذر الحفظ المحلي في هذا المتصفح. يمكنك تصدير Phenopacket بدلًا منه.');
    }
  }

  function restoreLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return setStatus('لا توجد نسخة محلية محفوظة على هذا الجهاز.');
      const parsed = JSON.parse(raw) as { caseId?: string; sex?: string; selected?: SelectedTerm[] };
      if (Array.isArray(parsed.selected)) setSelected(parsed.selected.filter((term) => /^HP:\d{7}$/.test(term.id)));
      setCaseId(parsed.caseId ?? '');
      setSex(parsed.sex ?? '');
      setDiseases([]);
      setGenes([]);
      setStatus('تمت استعادة النسخة المحلية.');
    } catch {
      setStatus('تعذر استعادة النسخة المحلية.');
    }
  }

  function exportPhenopacket() {
    if (!selected.length) return setStatus('أضف phenotype واحدًا على الأقل قبل التصدير.');
    const packet = makePhenopacket(selected, caseId, sex);
    downloadJson(`${packet.id}-phenopacket.json`, packet);
    setStatus('تم إنشاء ملف Phenopacket v2 بصيغة JSON للمراجعة أو التبادل.');
  }

  return <div className="rare-nav-workspace">
    <section className="rare-nav-panel rare-nav-intro" aria-labelledby="rare-nav-start">
      <div>
        <span className="rare-nav-kicker">Phenotype-first workflow</span>
        <h2 id="rare-nav-start">ابدأ بوصف ما نراه، لا باسم مرض متوقع</h2>
        <p>ابحث بالعربية أو الإنجليزية، اختر مصطلح HPO الصحيح، وميّز بين الصفة الموجودة والصفة المنفية. لا تُدخل اسمًا كاملًا أو رقم هوية أو بيانات غير لازمة.</p>
      </div>
      <div className="rare-nav-case-fields">
        <label><span>معرّف حالة محلي اختياري</span><input value={caseId} onChange={(event) => setCaseId(event.target.value.slice(0, 80))} placeholder="case-001" /></label>
        <label><span>الجنس حسب Phenopacket (اختياري)</span><select value={sex} onChange={(event) => setSex(event.target.value)}><option value="">غير محدد</option><option value="MALE">ذكر</option><option value="FEMALE">أنثى</option><option value="OTHER_SEX">آخر</option><option value="UNKNOWN_SEX">غير معروف</option></select></label>
      </div>
    </section>

    <section className="rare-nav-panel" aria-labelledby="rare-nav-search-title">
      <div className="rare-nav-section-head"><div><span>1</span><h2 id="rare-nav-search-title">ابحث عن phenotype</h2></div><small>PAVS Arabic HPO + HPO IDs</small></div>
      <div className="rare-nav-search-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} placeholder="مثال: صغر الرأس، نوبات، Microcephaly، HP:0000252" aria-label="ابحث في مصطلحات HPO" />
        <button type="button" onClick={() => void search()} disabled={searching}>{searching ? 'جارٍ البحث…' : 'بحث'}</button>
      </div>
      {searchResults.length > 0 && <div className="rare-nav-search-results">{searchResults.map((term) => <button type="button" key={term.id} onClick={() => addTerm(term)}><strong>{displayTerm(term)}</strong><span>{term.id} · {term.english}</span>{term.definition && <small>{term.definition}</small>}</button>)}</div>}
    </section>

    <section className="rare-nav-panel" aria-labelledby="rare-nav-profile-title">
      <div className="rare-nav-section-head"><div><span>2</span><h2 id="rare-nav-profile-title">ملف phenotype الحالي</h2></div><small>{selected.length.toLocaleString('ar')} مصطلحًا</small></div>
      {!selected.length ? <p className="rare-nav-empty">لم تُضف أي phenotype بعد.</p> : <div className="rare-nav-selected">{selected.map((term) => <article key={term.id} className={term.excluded ? 'is-excluded' : ''}>
        <div><strong>{displayTerm(term)}</strong><span>{term.id} · {term.english}</span></div>
        <label><span>الحالة</span><select value={term.excluded ? 'absent' : 'present'} onChange={(event) => patchTerm(term.id, { excluded: event.target.value === 'absent' })}><option value="present">موجودة</option><option value="absent">غير موجودة / منفية</option></select></label>
        <label><span>عمر البداية بالسنوات</span><input inputMode="decimal" value={term.onsetYears} onChange={(event) => patchTerm(term.id, { onsetYears: event.target.value.replace(/[^0-9.]/g, '').slice(0, 6) })} placeholder="اختياري" /></label>
        <button type="button" onClick={() => removeTerm(term.id)} aria-label={`حذف ${displayTerm(term)}`}>حذف</button>
      </article>)}</div>}
      <div className="rare-nav-actions"><button type="button" onClick={saveLocal}>حفظ محلي</button><button type="button" onClick={restoreLocal}>استعادة</button><button type="button" onClick={exportPhenopacket}>تصدير Phenopacket</button></div>
    </section>

    <section className="rare-nav-panel" aria-labelledby="rare-nav-rank-title">
      <div className="rare-nav-section-head"><div><span>3</span><h2 id="rare-nav-rank-title">رتّب الفرضيات الدلالية</h2></div><small>Monarch semantic similarity</small></div>
      <p>تستخدم المطابقة صفات HPO الموجودة فقط، وتقارنها بالارتباطات المنشورة للأمراض والجينات. النتيجة ليست احتمالًا إحصائيًا ولا تشخيصًا.</p>
      <button className="rare-nav-primary" type="button" onClick={() => void rank()} disabled={ranking || !presentIds.length}>{ranking ? 'جارٍ حساب التشابه…' : 'تشغيل المطابقة الدلالية'}</button>
      {(diseases.length > 0 || genes.length > 0) && <div className="rare-nav-rank-grid">
        <ResultList title="أمراض مرشحة" results={diseases} />
        <ResultList title="جينات مرشحة" results={genes} />
      </div>}
    </section>

    {nextQuestions.length > 0 && <section className="rare-nav-panel rare-nav-next" aria-labelledby="rare-nav-next-title">
      <div className="rare-nav-section-head"><div><span>4</span><h2 id="rare-nav-next-title">ما الذي يستحق التحقق منه بعد ذلك؟</h2></div><small>Hypothesis-separating phenotypes</small></div>
      <p>هذه ظواهر تتكرر في أعلى الفرضيات الحالية ولم تُسجّل بعد. استخدمها كأسئلة فحص/مراجعة مع المختص، لا كصفات مفترضة لدى الشخص.</p>
      <div className="rare-nav-question-grid">{nextQuestions.map((item) => <div key={item.id}><strong>{item.label}</strong><span>{item.id}</span><small>ظهرت في {item.count.toLocaleString('ar')} من أعلى النتائج</small></div>)}</div>
    </section>}

    <section className="rare-nav-panel rare-nav-method" aria-labelledby="rare-nav-method-title">
      <h2 id="rare-nav-method-title">حدود الأداة ومنهجها</h2>
      <ul>
        <li>ترتيب الفرضيات يعتمد على جودة ودقة phenotype المدخلة، ولا يثبت السببية أو التشخيص.</li>
        <li>الصفات المنفية تُحفظ في Phenopacket لكنها لا تدخل محرك Monarch الحالي؛ يجب تفسيرها سريريًا.</li>
        <li>الطبقة العربية الحالية من PAVS مستقلة وليست الترجمة العربية الرسمية الكاملة لـHPO، ويظهر المصدر بوضوح.</li>
        <li>لا تُرسل الأداة معرّفات شخصية إلى Monarch؛ ترسل فقط HPO IDs عند تشغيل المطابقة.</li>
        <li>أي نتيجة جينية أو مرضية مهمة يجب تأكيدها عبر التقييم السريري/الجيني المناسب والمصادر الأصلية.</li>
      </ul>
    </section>

    <p className="rare-nav-status" aria-live="polite">{status}</p>
  </div>;
}

function ResultList({ title, results }: { title: string; results: RankResult[] }) {
  return <div className="rare-nav-result-list"><h3>{title}</h3>{results.length ? <ol>{results.map((result, index) => <li key={`${result.subject?.id ?? index}-${index}`}><div><strong>{entityName(result)}</strong><span>{result.subject?.id ?? ''}</span></div><small>درجة التشابه: {formatScore(result.score)}</small></li>)}</ol> : <p>لا توجد نتائج.</p>}</div>;
}
