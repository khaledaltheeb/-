type ContractAction = (formData: FormData) => void | Promise<void>;
type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function string(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sourceVersionLines(value: unknown) {
  return array(value).map(object).map((row) => [row.path, row.sha256, row.decision].map(string).join(' | ')).filter(Boolean).join('\n');
}

function claimLines(value: unknown) {
  return array(value).map(object).map((row) => {
    const ids = array(row.reference_ids).map(string).filter(Boolean).join(', ');
    return `${string(row.claim)} | ${ids}`.trim();
  }).filter(Boolean).join('\n');
}

export default function ContentContractV6Panel({
  action,
  id,
  slug,
  schemaJson,
  editable,
}: {
  action: ContractAction;
  id: string;
  slug: string;
  schemaJson: unknown;
  editable: boolean;
}) {
  const schema = object(schemaJson);
  const mechanism = object(schema.page_mechanism);
  const originality = object(schema.originality_report);
  const interactive = object(schema.interactive_quality);
  const questions = array(schema.search_intent_questions).map(string).filter(Boolean).join('\n');

  return (
    <section className="seo-authority-panel content-contract-panel" aria-labelledby="content-contract-v6-title">
      <div className="section-mini-heading">
        <div><span className="eyebrow">Content Contract V6</span><h2 id="content-contract-v6-title">ملف الجودة والمنهج العلمي</h2></div>
        <span>يُحفظ مع سجل النسخ، وتتحقق منه قاعدة البيانات قبل الاعتماد.</span>
      </div>
      {editable ? (
        <form className="admin-form" action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="slug" value={slug} />
          <div className="admin-form-grid seo-authority-grid">
            <label>نوع الصفحة
              <select name="page_kind" defaultValue={string(schema.page_kind) || 'editorial'}>
                <option value="editorial">صفحة تحريرية</option>
                <option value="interactive">أداة/اختبار تفاعلي</option>
              </select>
            </label>
            <label>القيمة العلمية الاستراتيجية
              <select name="strategic_scientific_value" defaultValue={string(schema.strategic_scientific_value) || 'standard'}>
                <option value="standard">قياسية</option>
                <option value="high">مرتفعة/طفرة علمية</option>
              </select>
            </label>
            <label className="wide-field">أسئلة نوايا البحث — سؤال في كل سطر
              <textarea name="search_intent_questions" rows={9} maxLength={12000} defaultValue={questions} placeholder="ما التعريف الرسمي للموضوع؟&#10;كيف يختلف عن المفاهيم القريبة؟" />
              <small>الصفحة التحريرية تحتاج ثمانية أسئلة حقيقية على الأقل، إضافة إلى وحدة الأسئلة الشائعة الظاهرة في المتن.</small>
            </label>
            <label className="wide-field">نسخ المصدر التي تمت قراءتها
              <textarea name="source_versions" rows={8} maxLength={50000} dir="ltr" defaultValue={sourceVersionLines(schema.source_versions_reviewed)} placeholder="legacy/path.json | SHA-256 | قرار الاستفادة من النسخة" />
              <small>سطر لكل نسخة: المسار | بصمة SHA-256 | ما الذي حُفظ أو دُمج أو استُبعد ولماذا.</small>
            </label>
            <label className="wide-field">خريطة الادعاءات والمراجع
              <textarea name="claim_source_map" rows={10} maxLength={50000} defaultValue={claimLines(schema.claim_source_map)} placeholder="الادعاء العلمي الكامل | who-2026, nice-2025" />
              <small>سطر لكل ادعاء: النص | معرّفات المراجع المفصولة بفاصلة. صيغة المصدر في لوحة SEO: المعرّف | العنوان | الرابط | الجهة | السنة | نوع المصدر | مستوى السلطة | ISBN.</small>
            </label>
          </div>

          <fieldset className="admin-form-grid seo-authority-grid">
            <legend>فهم آلية الصفحة قبل إعادة الكتابة</legend>
            <label className="wide-field">الغرض<textarea name="mechanism_purpose" rows={3} maxLength={2000} defaultValue={string(mechanism.purpose)} /></label>
            <label className="wide-field">الجمهور<textarea name="mechanism_audience" rows={3} maxLength={2000} defaultValue={string(mechanism.audience)} /></label>
            <label className="wide-field">نموذج التفاعل<textarea name="mechanism_interaction" rows={3} maxLength={2000} defaultValue={string(mechanism.interaction_model)} /></label>
            <label className="wide-field">نموذج المحتوى<textarea name="mechanism_content" rows={3} maxLength={2000} defaultValue={string(mechanism.content_model)} /></label>
          </fieldset>

          <fieldset className="admin-form-grid seo-authority-grid">
            <legend>مراجعة التصنيف والأصالة</legend>
            <label className="check-field"><input type="checkbox" name="taxonomy_reviewed" defaultChecked={schema.taxonomy_reviewed === true} /> راجعتُ القطاع والقسم يدويًا</label>
            <label>ثقة التصنيف (0–1)<input name="classification_confidence" type="number" min="0" max="1" step="0.01" defaultValue={number(schema.classification_confidence, 0.9)} /></label>
            <label className="wide-field">مبرر التصنيف<textarea name="classification_rationale" rows={5} maxLength={5000} defaultValue={string(schema.classification_rationale)} /></label>
            <label className="check-field"><input type="checkbox" name="originality_passed" defaultChecked={originality.passed === true} /> اجتازت إعادة الصياغة فحص الأصالة</label>
            <label>أطول تطابق حرفي<input name="longest_verbatim_run_words" type="number" min="0" max="999" step="1" defaultValue={number(originality.longest_verbatim_run_words)} /></label>
            <label>نسبة إعادة استخدام الجمل<input name="legacy_sentence_reuse_ratio" type="number" min="0" max="1" step="0.001" defaultValue={number(originality.legacy_sentence_reuse_ratio)} /></label>
            <label className="wide-field">مبرر التفرد للصفحة الاستراتيجية<textarea name="uniqueness_rationale" rows={6} maxLength={6000} defaultValue={string(schema.uniqueness_rationale)} /></label>
          </fieldset>

          <details className="cms-details" open={string(schema.page_kind) === 'interactive'}>
            <summary>اختبارات الأداة أو اللعبة أو المقياس</summary>
            <div className="admin-form-grid seo-authority-grid cms-details-grid">
              <label className="check-field"><input type="checkbox" name="engine_tested" defaultChecked={interactive.engine_tested === true} /> اختُبر المحرك</label>
              <label>الجولات المولدة<input name="generated_trials" type="number" min="0" step="1" defaultValue={number(interactive.generated_trials)} /></label>
              <label>إجابات صحيحة مقبولة<input name="accepted_correct_answers" type="number" min="0" step="1" defaultValue={number(interactive.accepted_correct_answers)} /></label>
              <label>إجابات خاطئة مرفوضة<input name="rejected_wrong_answers" type="number" min="0" step="1" defaultValue={number(interactive.rejected_wrong_answers)} /></label>
              <label>عدد الأخطاء<input name="error_count" type="number" min="0" step="1" defaultValue={number(interactive.error_count)} /></label>
              <label>الخصوصية<select name="privacy_mode" defaultValue={string(interactive.privacy_mode) || 'local-only'}><option value="local-only">محلي فقط</option><option value="anonymous-no-storage">مجهول بلا تخزين</option></select></label>
            </div>
          </details>

          <details className="cms-details">
            <summary>قفل مرحلة الموسوعة</summary>
            <div className="admin-form-grid seo-authority-grid cms-details-grid">
              <label>مرحلة النقل<select name="migration_phase" defaultValue={string(schema.migration_phase) || 'standard'}><option value="standard">الدفعات الأساسية</option><option value="encyclopedia-last">الموسوعة — المرحلة الأخيرة</option></select></label>
              <label className="check-field"><input type="checkbox" name="encyclopedia_release_authorized" defaultChecked={schema.encyclopedia_release_authorized === true} /> تفويض صريح لإصدار الموسوعة</label>
            </div>
          </details>

          <div className="cms-actions"><button className="primary-action" type="submit">حفظ ملف الجودة</button><span>الحفظ لا يعتمد الصفحة؛ بوابة V6 تعيد فحصها عند الانتقال إلى الاعتماد.</span></div>
        </form>
      ) : (
        <div className="locked-content"><strong>ملف الجودة مقفل مع هذه الحالة.</strong><p>أعد الصفحة إلى مرحلة تحرير لإنشاء نسخة جديدة قبل تغيير أدلة الجودة.</p></div>
      )}
    </section>
  );
}
