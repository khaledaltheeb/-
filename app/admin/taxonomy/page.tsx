import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createCategory, createSector, deleteCategory, deleteSector, updateCategory, updateSector } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ ok?: string; error?: string }>;

function AdvancedFields({ item }: { item?: { seo_title?: string | null; seo_description?: string | null; visibility?: string | null; audience?: string[] | null; icon_key?: string | null } }) {
  return (
    <details className="advanced-fields wide-field">
      <summary>SEO والظهور والجمهور</summary>
      <div className="advanced-fields-grid">
        <label>SEO Title<input name="seo_title" maxLength={180} defaultValue={item?.seo_title ?? ''} /></label>
        <label>Icon key<input name="icon_key" maxLength={80} dir="ltr" defaultValue={item?.icon_key ?? ''} placeholder="brain" /></label>
        <label>الظهور<select name="visibility" defaultValue={item?.visibility ?? 'public'}><option value="public">عام</option><option value="authenticated">للمسجلين</option><option value="hidden">مخفي</option></select></label>
        <label>الجمهور<input name="audience" defaultValue={(item?.audience ?? []).join(', ')} placeholder="الفرد، الأسرة، المختص" /></label>
        <label className="wide-field">SEO Description<textarea name="seo_description" rows={2} maxLength={500} defaultValue={item?.seo_description ?? ''} /></label>
      </div>
    </details>
  );
}

export default async function TaxonomyPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');

  const [{ data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('sectors').select('id,slug,name_ar,description,accent,sort_order,is_active,seo_title,seo_description,visibility,audience,icon_key').order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,parent_id,slug,name_ar,description,sort_order,is_active,seo_title,seo_description,visibility,audience,icon_key').order('sort_order').order('name_ar'),
  ]);

  const params = await searchParams;
  const sectorRows = sectors ?? [];
  const categoryRows = categories ?? [];
  const categoryName = new Map(categoryRows.map((category) => [category.id, category.name_ar]));

  return (
    <main className="dashboard-shell taxonomy-shell">
      <section className="dashboard-card taxonomy-card">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">Taxonomy Engine</span>
            <h1>إدارة القطاعات والأقسام</h1>
            <p>إنشاء وتعديل وترتيب وتعطيل وحذف البنية التحريرية بأمان، مع دعم تسلسل هرمي عميق للقطاعات الكبيرة مثل ذوي الاحتياجات الخاصة والدمج.</p>
          </div>
          <Link className="button" href="/admin">العودة للوحة الإدارة</Link>
        </div>

        {params.ok && <p className="system-message success">تم تنفيذ العملية بنجاح.</p>}
        {params.error && <p className="system-message error">تعذر تنفيذ العملية. الحذف النهائي مسموح فقط للعناصر الفارغة؛ ويمكن دائمًا تعطيل العنصر المستخدم بدل حذفه.</p>}

        <section className="taxonomy-section" aria-labelledby="new-sector-title">
          <div className="section-mini-heading"><h2 id="new-sector-title">إضافة قطاع</h2><span>{sectorRows.length} قطاع حالي</span></div>
          <form action={createSector} className="admin-form admin-form-grid">
            <label>اسم القطاع بالعربية<input name="name_ar" required minLength={2} maxLength={160} /></label>
            <label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="mental-health" dir="ltr" /></label>
            <label>لون Accent<input name="accent" type="color" defaultValue="#0f8f88" /></label>
            <label>الترتيب<input name="sort_order" type="number" defaultValue="0" min="-9999" max="9999" /></label>
            <label className="wide-field">الوصف<textarea name="description" rows={3} maxLength={1200} /></label>
            <AdvancedFields />
            <label className="check-field"><input name="is_active" type="checkbox" defaultChecked /> نشط</label>
            <button className="primary-action" type="submit">إضافة القطاع</button>
          </form>
        </section>

        <section className="taxonomy-section" aria-labelledby="sectors-title">
          <div className="section-mini-heading"><h2 id="sectors-title">القطاعات الحالية</h2><span>تعديل وتعطيل وحذف آمن</span></div>
          <div className="taxonomy-list">
            {sectorRows.map((sector) => (
              <form action={updateSector} className="taxonomy-row" key={sector.id}>
                <input type="hidden" name="id" value={sector.id} />
                <label>الاسم<input name="name_ar" defaultValue={sector.name_ar} required /></label>
                <label>Slug<input name="slug" defaultValue={sector.slug} dir="ltr" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
                <label>اللون<input name="accent" type="color" defaultValue={sector.accent && /^#[0-9a-f]{6}$/i.test(sector.accent) ? sector.accent : '#0f8f88'} /></label>
                <label>الترتيب<input name="sort_order" type="number" defaultValue={sector.sort_order} min="-9999" max="9999" /></label>
                <label className="wide-field">الوصف<textarea name="description" rows={2} defaultValue={sector.description ?? ''} /></label>
                <AdvancedFields item={sector} />
                <label className="check-field"><input name="is_active" type="checkbox" defaultChecked={sector.is_active} /> نشط</label>
                <div className="taxonomy-row-actions"><button className="secondary-action" type="submit">حفظ</button><button className="danger-action" type="submit" formAction={deleteSector}>حذف نهائي إذا كان فارغًا</button></div>
              </form>
            ))}
            {!sectorRows.length && <p className="empty-state">لا توجد قطاعات بعد.</p>}
          </div>
        </section>

        <section className="taxonomy-section" aria-labelledby="new-category-title">
          <div className="section-mini-heading"><h2 id="new-category-title">إضافة قسم أو قسم فرعي</h2><span>{categoryRows.length} قسم حالي</span></div>
          <form action={createCategory} className="admin-form admin-form-grid">
            <label>القطاع<select name="sector_id" required defaultValue=""><option value="" disabled>اختر القطاع</option>{sectorRows.map((sector) => <option value={sector.id} key={sector.id}>{sector.name_ar}</option>)}</select></label>
            <label>القسم الأب<select name="parent_id" defaultValue=""><option value="">بدون قسم أب</option>{categoryRows.map((category) => <option value={category.id} key={category.id}>{category.name_ar}</option>)}</select></label>
            <label>اسم القسم<input name="name_ar" required minLength={2} maxLength={160} /></label>
            <label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="anxiety" dir="ltr" /></label>
            <label>الترتيب<input name="sort_order" type="number" defaultValue="0" min="-9999" max="9999" /></label>
            <label className="wide-field">الوصف<textarea name="description" rows={3} maxLength={1200} /></label>
            <AdvancedFields />
            <label className="check-field"><input name="is_active" type="checkbox" defaultChecked /> نشط</label>
            <button className="primary-action" type="submit">إضافة القسم</button>
          </form>
        </section>

        <section className="taxonomy-section" aria-labelledby="categories-title">
          <div className="section-mini-heading"><h2 id="categories-title">الأقسام الحالية</h2><span>Hierarchical · محمية من الدورات</span></div>
          <div className="taxonomy-list">
            {categoryRows.map((category) => (
              <form action={updateCategory} className="taxonomy-row category-row" key={category.id}>
                <input type="hidden" name="id" value={category.id} />
                <label>القطاع<select name="sector_id" defaultValue={category.sector_id ?? ''} required><option value="" disabled>اختر القطاع</option>{sectorRows.map((sector) => <option value={sector.id} key={sector.id}>{sector.name_ar}</option>)}</select></label>
                <label>الأب<select name="parent_id" defaultValue={category.parent_id ?? ''}><option value="">بدون أب</option>{categoryRows.filter((candidate) => candidate.id !== category.id).map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.name_ar}</option>)}</select></label>
                <label>الاسم<input name="name_ar" defaultValue={category.name_ar} required /></label>
                <label>Slug<input name="slug" defaultValue={category.slug} dir="ltr" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
                <label>الترتيب<input name="sort_order" type="number" defaultValue={category.sort_order} min="-9999" max="9999" /></label>
                <label className="wide-field">الوصف<textarea name="description" rows={2} defaultValue={category.description ?? ''} /></label>
                <AdvancedFields item={category} />
                <div className="taxonomy-meta">الأب الحالي: {category.parent_id ? categoryName.get(category.parent_id) ?? 'غير معروف' : '—'}</div>
                <label className="check-field"><input name="is_active" type="checkbox" defaultChecked={category.is_active} /> نشط</label>
                <div className="taxonomy-row-actions"><button className="secondary-action" type="submit">حفظ</button><button className="danger-action" type="submit" formAction={deleteCategory}>حذف نهائي إذا كان فارغًا</button></div>
              </form>
            ))}
            {!categoryRows.length && <p className="empty-state">لا توجد أقسام بعد.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
