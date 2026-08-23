import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PrintPageButton from '@/components/print-page-button';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'أوراق عمل قابلة للطباعة | لنرتقي بقدراتهم',
  description: 'أوراق عملية قابلة للطباعة لتسجيل خط الأساس، تجربة التكييف، الأمان، التواصل، الطاقة، التقدم ونقل المهارة ضمن قطاع لنرتقي بقدراتهم.',
  path: '/capabilities/printables/',
  index: true,
  keywords: ['أوراق عمل', 'اكتشاف القدرات', 'التكييفات', 'التربية الخاصة', 'التأهيل', 'قياس التقدم'],
});

const sheets = [
  {
    title: '1. ورقة خط الأساس الوظيفي',
    purpose: 'لرؤية الأداء كما هو قبل تغيير البيئة أو الأداة.',
    fields: ['المهمة ذات المعنى:', 'أين ومتى نُفذت؟', 'ما الذي استطاع الشخص فعله دون مساعدة؟', 'نوع المساعدة المستخدمة:', 'الوقت أو عدد المحاولات:', 'الدقة أو جودة الأداء:', 'التعب/الألم/الضيق من 0–10:', 'ما الذي يبدو أنه أعاق الأداء؟'],
  },
  {
    title: '2. بطاقة تجربة تكييف واحدة',
    purpose: 'لمقارنة المهمة نفسها قبل تعديل واحد وبعده بدل تغيير أشياء كثيرة دفعة واحدة.',
    fields: ['المهارة التي نريد قياسها:', 'الحاجز المرصود:', 'التعديل الواحد الذي سنجربه:', 'ما الذي سيبقى ثابتًا؟', 'نتيجة قبل التعديل:', 'نتيجة بعد التعديل:', 'الاستقلال قبل/بعد:', 'الجهد أو التعب قبل/بعد:', 'قرارنا: نحتفظ / نعدّل / نتوقف'],
  },
  {
    title: '3. ورقة صوت الشخص واختياره',
    purpose: 'لمنع تحويل نجاح الأداء إلى هدف مفروض لا يريده الشخص.',
    fields: ['ما الذي يريد الشخص أن يصبح أسهل؟', 'ما النشاط الذي يهمه؟', 'ما الذي لا يريد العمل عليه؟', 'كيف يعبّر عن نعم؟', 'كيف يعبّر عن لا أو توقف؟', 'ما طريقة التواصل الأكثر راحة؟', 'ما الهدف الذي وافق عليه؟'],
  },
  {
    title: '4. بطاقة الأمان وقاعدة التوقف',
    purpose: 'لتحديد متى يجب إيقاف التجربة والعودة إلى التقييم المهني.',
    fields: ['مخاطر معروفة مرتبطة بالحالة أو النشاط:', 'علامات تستدعي التوقف فورًا:', 'من نتواصل معه عند ظهور علامة خطر؟', 'حد الألم/التعب المقبول المتفق عليه:', 'هل ظهرت أعراض جديدة أو تدهور؟', 'قرار اليوم: آمن للاستمرار / يحتاج تعديل / يحتاج تقييمًا'],
  },
  {
    title: '5. خريطة التواصل والوصول',
    purpose: 'لفصل صعوبة إظهار المعرفة عن المعرفة نفسها.',
    fields: ['ما الذي نريد أن يفهمه أو يعبّر عنه الشخص؟', 'أفضل قناة للفهم: كلام / كتابة / صور / إشارة / لمس / غير ذلك', 'أفضل قناة للاستجابة:', 'الوقت اللازم للاستجابة:', 'ما الذي يساعد الشريك على الفهم؟', 'ما الذي يزيد سوء الفهم؟', 'كيف نتحقق من أن الرسالة فُهمت؟'],
  },
  {
    title: '6. ميزانية الطاقة والجهد',
    purpose: 'للحالات التي يتذبذب فيها الأداء مع التعب أو الألم أو الأعراض.',
    fields: ['النشاط:', 'الطاقة قبل النشاط 0–10:', 'الطاقة بعد النشاط 0–10:', 'الألم/الضيق قبل وبعد:', 'مدة التعافي:', 'هل أمكن تكرار النشاط دون تدهور؟', 'تعديل مقترح للمرة القادمة:'],
  },
  {
    title: '7. سجل التقدم الذي يهم الحياة اليومية',
    purpose: 'لمنع الاكتفاء بدرجة اختبار لا تنتقل إلى الواقع.',
    fields: ['الهدف الوظيفي:', 'السياق الأول:', 'السياق الثاني:', 'مقدار المساعدة في كل سياق:', 'هل بادر الشخص من تلقاء نفسه؟', 'هل استمرت المهارة بعد أيام؟', 'هل تحسن الرضا أو المشاركة؟', 'الخطوة التالية:'],
  },
  {
    title: '8. ورقة قرار الفريق',
    purpose: 'لتحويل البيانات إلى قرار واضح بدل استمرار التدخل تلقائيًا.',
    fields: ['ما الذي تحسن فعلًا؟', 'ما الذي لم يتحسن؟', 'هل تغيرت المهارة أم فقط طريقة الوصول إليها؟', 'هل كانت الفائدة أكبر من العبء؟', 'ما رأي الشخص؟', 'هل توجد حاجة لمختص؟', 'القرار: استمرار / تعديل / إيقاف / إحالة', 'موعد المراجعة التالية:'],
  },
];

export default function CapabilityPrintablesPage() {
  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell capability-printables">
        <nav className="breadcrumbs no-print" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/capabilities">لنرتقي بقدراتهم</Link><span>/</span><span aria-current="page">أوراق قابلة للطباعة</span>
        </nav>

        <header style={{ maxWidth: 900, margin: '0 auto 2rem' }}>
          <span className="eyebrow">أدوات عملية</span>
          <h1>أوراق عمل قابلة للطباعة</h1>
          <p style={{ fontSize: '1.12rem', lineHeight: 2 }}>
            هذه الأوراق لا تمنح درجة ذكاء ولا تشخّص حالة. وظيفتها أن تجعل الملاحظة أدق: ما المهمة؟ ما الحاجز؟ ما التعديل؟ ماذا تغير؟ وما كلفة النتيجة على الاستقلال والجهد والرضا؟ استخدم ورقة واحدة عند الحاجة بدل ملء نماذج لا تخدم قرارًا واضحًا.
          </p>
          <div className="no-print" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <PrintPageButton />
            <Link className="button button-secondary" href="/capabilities/protocol/">راجع البروتوكول قبل التطبيق</Link>
          </div>
        </header>

        <aside className="medical-disclaimer" style={{ maxWidth: 900, margin: '0 auto 2rem' }}>
          <strong>قبل الاستخدام</strong>
          <p>لا تُستخدم الأوراق لتأخير تقييم طبي أو نفسي أو تأهيلي مطلوب. أي نشاط يتداخل مع مخاطر صحية، نوبات، ألم، بلع، تنفس، حركة غير آمنة أو تدهور مفاجئ يحتاج توجيه المختص المناسب أولًا.</p>
        </aside>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
          {sheets.map((sheet) => (
            <section key={sheet.title} className="print-sheet" style={{ breakInside: 'avoid', border: '1px solid rgba(7,95,97,.2)', borderRadius: 18, padding: '1.5rem', background: '#fff' }}>
              <h2 style={{ marginTop: 0 }}>{sheet.title}</h2>
              <p style={{ lineHeight: 1.8 }}>{sheet.purpose}</p>
              <div style={{ display: 'grid', gap: '.9rem' }}>
                {sheet.fields.map((field) => (
                  <div key={field} style={{ minHeight: 54, borderBottom: '1px solid #9aa', paddingBottom: '.45rem' }}>
                    <strong>{field}</strong>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section style={{ maxWidth: 900, margin: '3rem auto 0', lineHeight: 1.9 }}>
          <h2>الأساس الذي بُنيت عليه الأوراق</h2>
          <p>تعتمد الأوراق على مبادئ الوظيفة والمشاركة، القرار المشترك، التقييم في السياق الحقيقي، مقارنة التغيير على هدف محدد، وقياس العبء إلى جانب الإنجاز. وهي مبادئ متوافقة مع إطار الوظيفة الدولي لمنظمة الصحة العالمية، وممارسات التأهيل المتمحورة حول الشخص، والتصميم الشامل للتعلم، ومنهجيات القياس الفردي.</p>
          <ul>
            <li><a href="https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health" target="_blank" rel="noreferrer">منظمة الصحة العالمية — ICF</a></li>
            <li><a href="https://www.who.int/news-room/fact-sheets/detail/rehabilitation" target="_blank" rel="noreferrer">منظمة الصحة العالمية — Rehabilitation</a></li>
            <li><a href="https://www.nice.org.uk/guidance/ng197" target="_blank" rel="noreferrer">NICE — Shared decision making</a></li>
            <li><a href="https://udlguidelines.cast.org/" target="_blank" rel="noreferrer">CAST — Universal Design for Learning Guidelines</a></li>
            <li><a href="https://ies.ed.gov/ncee/wwc/handbooks" target="_blank" rel="noreferrer">Institute of Education Sciences — Design and evidence standards</a></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
      <style>{`
        @media print {
          header.site-header, footer.site-footer, .mobile-bottom-nav, .no-print { display: none !important; }
          body { background: #fff !important; }
          .capability-printables { max-width: none !important; padding: 0 !important; }
          .print-sheet { page-break-after: always; border: 1px solid #555 !important; box-shadow: none !important; }
          .print-sheet:last-of-type { page-break-after: auto; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>
    </>
  );
}
