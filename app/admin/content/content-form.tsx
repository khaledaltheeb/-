import Link from 'next/link';
import BlockEditor from './block-editor';

type Sector = { id: string; name_ar: string };
type Category = { id: string; sector_id: string | null; name_ar: string };

type ContentRecord = {
  id?: string;
  content_type?: string;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  body_json?: unknown;
  body_text?: string | null;
  sector_id?: string | null;
  category_id?: string | null;
  audience?: string[] | null;
  search_aliases?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  robots_index?: boolean;
  robots_follow?: boolean;
  featured_image_url?: string | null;
  featured_image_alt?: string | null;
};

const TYPES = [
  ['article', 'مقال'], ['guide', 'دليل'], ['condition', 'حالة'], ['research', 'بحث/دراسة'], ['comparison', 'مقارنة'],
  ['tool', 'أداة'], ['assessment', 'تقييم'], ['intervention', 'تدخل'], ['protocol', 'بروتوكول'], ['course', 'دورة'],
  ['learning_path', 'مسار تعلم'], ['resource', 'مورد'], ['calendar', 'تقويم'], ['glossary_term', 'مصطلح'], ['faq', 'أسئلة شائعة'],
  ['directory_page', 'صفحة دليل'], ['news', 'خبر'], ['sector_page', 'صفحة قطاع'], ['landing_page', 'صفحة هبوط'],
];

export default function ContentForm({ action, sectors, categories, record, submitLabel, allowedTypes, initialType, mediaLibraryHref='/admin/media' }: {
  action: (formData: FormData) => void | Promise<void>;
  sectors: Sector[];
  categories: Category[];
  record?: ContentRecord;
  submitLabel: string;
  allowedTypes?: string[];
  initialType?: string;
  mediaLibraryHref?: string;
}) {
  const typeOptions = allowedTypes?.length ? TYPES.filter(([value]) => allowedTypes.includes(value)) : TYPES;
  const requestedType = initialType && typeOptions.some(([value]) => value === initialType) ? initialType : undefined;
  const defaultType = record?.content_type && typeOptions.some(([value]) => value === record.content_type) ? record.content_type : requestedType ?? typeOptions[0]?.[0] ?? 'article';
  return (
    <form action={action} className="cms-form">
      {record?.id && <input type="hidden" name="id" value={record.id} />}
      <ol className="cms-editor-steps" aria-label="خطوات إعداد الصفحة">
        <li><a href="#content-basics"><span>1</span>هوية الصفحة</a></li>
        <li><a href="#content-media"><span>2</span>الصورة والإتاحة</a></li>
        <li><a href="#content-body"><span>3</span>بناء المحتوى</a></li>
        <li><a href="#content-seo"><span>4</span>البحث والنشر</a></li>
      </ol>

      <section className="cms-editor-section" id="content-basics" aria-labelledby="content-basics-title">
        <div className="cms-editor-section-heading"><span>01</span><div><h2 id="content-basics-title">هوية الصفحة</h2><p>حدد النوع والعنوان ومكان الصفحة والجمهور قبل بدء الكتابة.</p></div></div>
        <div className="cms-grid">
          <label>نوع الصفحة<select name="content_type" required defaultValue={defaultType}>{typeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>العنوان<input name="title" required minLength={3} maxLength={300} defaultValue={record?.title ?? ''} /></label>
          <label>Slug<input name="slug" required dir="ltr" maxLength={140} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={record?.slug ?? ''} placeholder="clear-stable-slug" /></label>
          <label>القطاع<select name="sector_id" defaultValue={record?.sector_id ?? ''}><option value="">بدون قطاع</option>{sectors.map((sector) => <option value={sector.id} key={sector.id}>{sector.name_ar}</option>)}</select></label>
          <label>القسم الأساسي<select name="category_id" defaultValue={record?.category_id ?? ''}><option value="">بدون قسم</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name_ar}</option>)}</select></label>
          <label>الجمهور<input name="audience" defaultValue={(record?.audience ?? []).join(', ')} placeholder="الفرد، الأسرة، المختص" /></label>
          <label className="cms-wide">الملخص<textarea name="excerpt" rows={3} maxLength={1200} defaultValue={record?.excerpt ?? ''} /></label>
        </div>
      </section>

      <details className="cms-details cms-editor-section" id="content-media" open>
        <summary>الصورة البارزة والإتاحة</summary>
        <div className="cms-grid cms-details-grid">
          <label className="cms-wide">رابط الصورة البارزة<input name="featured_image_url" type="url" dir="ltr" maxLength={2000} defaultValue={record?.featured_image_url ?? ''} placeholder="https://..." /><small>استخدم صورة من <Link href={mediaLibraryHref}>مكتبة الوسائط</Link> أو رابط HTTPS موثوقًا. يمكن تركه فارغًا.</small></label>
          <label className="cms-wide">Alt Text للصورة<input name="featured_image_alt" maxLength={500} minLength={3} defaultValue={record?.featured_image_alt ?? ''} placeholder="صف الصورة بدقة لقارئات الشاشة ومحركات البحث" /><small>إلزامي فقط عند وجود صورة بارزة، ويُحفظ مع نفس نسخة المحتوى.</small></label>
        </div>
      </details>

      <section className="cms-editor-section cms-body-section" id="content-body" aria-labelledby="content-body-title">
        <div className="cms-editor-section-heading"><span>03</span><div><h2 id="content-body-title">بناء المحتوى</h2><p>استخدم الوحدات المنظمة لتكوين صفحة سهلة القراءة ومتسقة بصريًا.</p></div></div>
        <BlockEditor bodyJson={record?.body_json} bodyText={record?.body_text} />
      </section>

      <details className="cms-details cms-editor-section" id="content-seo" open>
        <summary>SEO والبحث الأساسي</summary>
        <div className="cms-grid cms-details-grid">
          <label>SEO Title الأساسي<input name="seo_title" maxLength={47} defaultValue={record?.seo_title ?? ''} /><small>حتى 47 حرفًا؛ يضاف «منصة روافد» آليًا ليبقى Title Tag النهائي ضمن 60 حرفًا.</small></label>
          <label>Canonical URL<input name="canonical_url" dir="ltr" maxLength={500} defaultValue={record?.canonical_url ?? ''} placeholder="/content/example" /></label>
          <label className="cms-wide">Meta Description<textarea name="seo_description" rows={3} minLength={150} maxLength={160} defaultValue={record?.seo_description ?? ''} /><small>إذا كُتب الوصف فالمعيار 150–160 حرفًا. يمكن تركه فارغًا أثناء المسودة المبكرة.</small></label>
          <label className="cms-wide">مرادفات البحث<input name="search_aliases" defaultValue={(record?.search_aliases ?? []).join(', ')} placeholder="مرادف، اسم آخر، مصطلح إنجليزي" /></label>
          <label className="check-field"><input type="checkbox" name="robots_index" defaultChecked={record?.robots_index ?? true} /> Index عند النشر</label>
          <label className="check-field"><input type="checkbox" name="robots_follow" defaultChecked={record?.robots_follow ?? true} /> Follow عند النشر</label>
        </div>
      </details>

      <div className="cms-actions"><button className="primary-action" type="submit">{submitLabel}</button><span>الحفظ هنا ينشئ نسخة جديدة ولا ينشر الصفحة؛ النشر يمر عبر Workflow المؤسسي.</span></div>
    </form>
  );
}
