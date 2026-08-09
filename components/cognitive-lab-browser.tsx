'use client';

import { useMemo, useState } from 'react';
import type { CognitiveTool } from '@/lib/cognitive-lab/catalog';

type Props = {
  tools: CognitiveTool[];
  categories: string[];
};

export default function CognitiveLabBrowser({ tools, categories }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<'all' | 'verified' | 'review'>('all');

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ar');
    return tools.filter((tool) => {
      const matchesQuery = !normalizedQuery || `${tool.title} ${tool.category} ${tool.summary}`.toLocaleLowerCase('ar').includes(normalizedQuery);
      const matchesCategory = category === 'all' || tool.category === category;
      const matchesStatus = status === 'all' || tool.difficultyStatus === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, query, status, tools]);

  return (
    <section className="cognitive-directory" aria-labelledby="cognitive-directory-title">
      <div className="cognitive-section-heading">
        <div>
          <span>اختر حسب الهدف</span>
          <h2 id="cognitive-directory-title">دليل الأنشطة المعرفية</h2>
        </div>
        <p aria-live="polite">{visibleTools.length} من أصل {tools.length} نشاطًا</p>
      </div>

      <div className="cognitive-filters" role="search" aria-label="تصفية الأنشطة المعرفية">
        <label className="cognitive-search-field">
          <span>ابحث بالمهارة أو اسم النشاط</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="مثال: الذاكرة، الانتباه، الاستدلال"
          />
        </label>
        <label>
          <span>المجال</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">كل المجالات</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>حالة التدرج</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="all">كل الأنشطة</option>
            <option value="verified">تدرج مختبر</option>
            <option value="review">تدرج قيد المراجعة</option>
          </select>
        </label>
      </div>

      {visibleTools.length ? (
        <div className="cognitive-tool-grid">
          {visibleTools.map((tool, index) => (
            <article className="cognitive-tool-card" key={tool.slug}>
              <div className="cognitive-tool-card__top">
                <span className="cognitive-tool-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className={`cognitive-status cognitive-status--${tool.difficultyStatus}`}>
                  {tool.difficultyStatus === 'verified' ? 'تدرج مختبر' : 'قيد مراجعة التدرج'}
                </span>
              </div>
              <span className="cognitive-tool-category">{tool.category}</span>
              <h3><a href={`/cognitive-lab/${tool.slug}`}>{tool.title}</a></h3>
              <p>{tool.summary}</p>
              <div className="cognitive-tool-card__footer">
                <span>5 مستويات · 10 محاولات</span>
                <a href={`/cognitive-lab/${tool.slug}`} aria-label={`فتح ${tool.title}`}>فتح النشاط <span aria-hidden="true">←</span></a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="cognitive-empty" role="status">
          <strong>لا توجد نتيجة بهذه المرشحات</strong>
          <p>جرّب كلمة أقصر، أو اختر «كل المجالات».</p>
          <button type="button" onClick={() => { setQuery(''); setCategory('all'); setStatus('all'); }}>مسح المرشحات</button>
        </div>
      )}
    </section>
  );
}
