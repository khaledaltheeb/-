type JsonRecord = Record<string, unknown>;

type Props = {
  id: string;
  slug: string;
  schemaJson: unknown;
  contentType: string;
  action: (formData: FormData) => void | Promise<void>;
};

function object(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}
function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}
function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : typeof value === 'string' ? value : '';
}
function bool(value: unknown) {
  return value === true || value === 'true';
}
function stringLines(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').join('\n') : '';
}
function claimLines(value: unknown) {
  if (!Array.isArray(value)) return '';
  return value.flatMap((item) => {
    const row = object(item);
    const claim = text(row.claim).trim();
    const sources = Array.isArray(row.sources) ? row.sources.filter((source): source is string => typeof source === 'string').map((source) => source.trim()).filter(Boolean) : [];
    return claim && sources.length ? [`${claim} | ${sources.join('، ')}`] : [];
  }).join('\n');
}

export default function ReleaseContractForm({ id, slug, schemaJson, contentType, action }: Props) {
  const schema = object(schemaJson);
  const mechanism = object(schema.page_mechanism);
  const originality = object(schema.originality_report);
  const interactiveQuality = object(schema.interactive_quality);
  const interactiveEligible = ['assessment','resource','tool'].includes(contentType);
  const contractVersion = Number(schema.content_contract_version) || 0;

  return (
    <section className="seo-authority-panel" aria-labelledby="release-contract-title">
      <div className="section-mini-heading">
        <div><span className="eyebrow">Release Contract V6</span><h2 id="release-contract-title">عقد الجاهزية للنشر</h2></div>
        <span>حفظ هذه البيانات ينشئ نسخة جديدة؛ الاعتماد النهائي يبقى بيد Release Gate V6.</span>
      </div>

      <div className="workflow-panel">
        <div><strong>نسخة العقد الحالية: V{contractVersion}</strong><p>عند الحفظ تُثبت V6 ويُربط المحتوى تلقائياً بصفحة إخلاء المسؤولية المركزية دون تنبيه خاص داخل الصفحة.</p></div>
        <div><strong>الإخلاء المركزي</strong><p dir="ltr">/disclaimer</p><p>إخلاء المسؤولية والتنبيهات</p></div>
      </div>

      <form className="admin-form" action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="slug" value={slug} />

        <div className="admin-form-grid seo-authority-grid">
          <label className="wide-field">أسئلة نية البحث
            <textarea name="search_intent_questions" rows={9} maxLength={50000} defaultValue={stringLines(schema.search_intent_questions)} placeholder={'سؤال بحث واضح في كل سطر\nيحتاج المحتوى التحريري إلى 8 أسئلة على الأقل قبل الاعتماد'} />
            <small>سؤال واحد في كل سطر. Release Gate يتطلب 8 أسئلة صريحة للصفحات التحريرية.</small>
          </label>

          <label className="wide-field">خريطة الادعاءات إلى المصادر
            <textarea name="claim_source_map" rows={10} maxLength={50000} defaultValue={claimLines(schema.claim_source_map)} placeholder="الادعاء المحدد | مرجع 1، مرجع 3 أو رابط المصدر" />
            <small>سطر لكل ادعاء: نص الادعاء | مرجع واحد أو أكثر. الادعاء بلا مصدر لا يُحفظ.</small>
          </label>

          <label className="wide-field">إصدارات/نسخ المصادر التي تمت مراجعتها
            <textarea name="source_versions_reviewed" rows={5} maxLength={30000} defaultValue={stringLines(schema.source_versions_reviewed)} placeholder={'WHO guideline 2025\nNICE NG87 — reviewed 2026-08-21'} />
            <small>سطر واحد لكل إصدار أو نسخة مصدر تمت مراجعتها فعلياً.</small>
          </label>

          <label className="check-field"><input type="checkbox" name="taxonomy_reviewed" defaultChecked={bool(schema.taxonomy_reviewed)} /> تم تدقيق القطاع والقسم يدوياً</label>
          <label>ثقة التصنيف
            <input name="classification_confidence" type="number" min="0" max="1" step="0.01" defaultValue={numberValue(schema.classification_confidence)} placeholder="0.95" />
            <small>الاعتماد يتطلب 0.90 أو أعلى.</small>
          </label>
          <label className="wide-field">مبرر التصنيف
            <textarea name="classification_rationale" rows={6} maxLength={8000} defaultValue={text(schema.classification_rationale)} />
            <small>الاعتماد يتطلب 25 كلمة عربية مفيدة على الأقل.</small>
          </label>

          <label className="check-field"><input type="checkbox" name="evidence_led_rewrite" defaultChecked={schema.rewrite_method === 'evidence-led-rewrite'} /> تمت إعادة الصياغة بمنهج evidence-led-rewrite</label>
          <label className="check-field"><input type="checkbox" name="originality_passed" defaultChecked={bool(originality.passed)} /> اجتاز المحتوى مراجعة الأصالة</label>
          <label className="wide-field">ملاحظات مراجعة الأصالة
            <textarea name="originality_notes" rows={4} maxLength={4000} defaultValue={text(originality.notes)} />
          </label>

          <label className="wide-field">آلية الصفحة — الغرض
            <textarea name="mechanism_purpose" rows={3} maxLength={4000} defaultValue={text(mechanism.purpose)} />
            <small>5 كلمات عربية مفيدة على الأقل.</small>
          </label>
          <label className="wide-field">آلية الصفحة — الجمهور
            <textarea name="mechanism_audience" rows={3} maxLength={4000} defaultValue={text(mechanism.audience)} />
            <small>اشرح لمن صُممت الصفحة وكيف تخدمه.</small>
          </label>
          <label className="wide-field">آلية الصفحة — نموذج التفاعل
            <textarea name="mechanism_interaction_model" rows={3} maxLength={4000} defaultValue={text(mechanism.interaction_model)} />
          </label>
          <label className="wide-field">آلية الصفحة — نموذج المحتوى
            <textarea name="mechanism_content_model" rows={3} maxLength={4000} defaultValue={text(mechanism.content_model)} />
          </label>

          <label>القيمة العلمية الاستراتيجية
            <select name="strategic_scientific_value" defaultValue={schema.strategic_scientific_value === 'high' ? 'high' : 'standard'}>
              <option value="standard">قياسية</option>
              <option value="high">عالية — Strategic</option>
            </select>
          </label>
          <label className="wide-field">مبرر التفرد للمحتوى الاستراتيجي
            <textarea name="uniqueness_rationale" rows={5} maxLength={8000} defaultValue={text(schema.uniqueness_rationale)} />
            <small>عند اختيار القيمة العالية يتطلب Gate مبرراً لا يقل عن 40 كلمة عربية مفيدة.</small>
          </label>

          {interactiveEligible && <>
            <label>نوع الصفحة
              <select name="page_kind" defaultValue={schema.page_kind === 'interactive' ? 'interactive' : 'editorial'}>
                <option value="editorial">تحريرية</option>
                <option value="interactive">تفاعلية</option>
              </select>
            </label>
            <label className="check-field"><input type="checkbox" name="engine_tested" defaultChecked={bool(interactiveQuality.engine_tested)} /> تم اختبار محرك الصفحة التفاعلية</label>
            <label>عدد التجارب المولدة<input name="generated_trials" type="number" min="0" step="1" defaultValue={numberValue(interactiveQuality.generated_trials)} /></label>
            <label>إجابات صحيحة مقبولة<input name="accepted_correct_answers" type="number" min="0" step="1" defaultValue={numberValue(interactiveQuality.accepted_correct_answers)} /></label>
            <label>إجابات خاطئة مرفوضة<input name="rejected_wrong_answers" type="number" min="0" step="1" defaultValue={numberValue(interactiveQuality.rejected_wrong_answers)} /></label>
            <label>عدد الأخطاء<input name="error_count" type="number" min="0" step="1" defaultValue={numberValue(interactiveQuality.error_count)} /></label>
            <label>نمط الخصوصية
              <select name="privacy_mode" defaultValue={text(interactiveQuality.privacy_mode)}>
                <option value="">غير محدد</option>
                <option value="local-only">Local only</option>
                <option value="anonymous-no-storage">Anonymous — no storage</option>
              </select>
            </label>
          </>}
        </div>

        {!interactiveEligible && <input type="hidden" name="page_kind" value="editorial" />}
        <button className="primary-action" type="submit">حفظ عقد V6 كنسخة جديدة</button>
      </form>
    </section>
  );
}
