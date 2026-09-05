const DEFAULT_QUICK = ['علامات التوحد', 'طفلي لا يتكلم', 'القلق الاجتماعي', 'صعوبات القراءة'];
const CONTEXT_QUICK = [
  { match: /social-work/, values: ['أخلاقيات العمل الاجتماعي', 'تقرير المصير', 'السرية المهنية', 'اتخاذ القرار الأخلاقي'] },
  { match: /addiction/, values: ['علاج الإدمان', 'سلامة الانسحاب', 'دعم الأسرة', 'منع الانتكاس'] },
  { match: /pediatric-oncology/, values: ['دعم الطفل نفسيًا', 'آثار العلاج', 'التغذية أثناء العلاج', 'المتابعة بعد العلاج'] },
  { match: /autism/, values: ['علامات التوحد', 'تقييم التوحد', 'AAC للتوحد', 'التوحد في المدرسة'] },
  { match: /assessment-lab/, values: ['اختبارات نفسية', 'مقاييس التوحد', 'اختبارات الذكاء', 'كيف أفهم نتيجة المقياس؟'] },
  { match: /rare-disease/, values: ['مرض نادر علاج جيني', 'الفحوص الجينية', 'التاريخ الطبيعي للأمراض النادرة', 'كيف أجد خبيرًا؟'] },
];

const RISK_PATTERN = /(انتحار|اقتل نفسي|قتل نفسي|أقتل نفسي|اذي نفسي|أؤذي نفسي|ايذاء النفس|إيذاء النفس|خطر مباشر|لا استطيع التنفس|لا أستطيع التنفس|فقد الوعي|نزيف شديد|جرعة زائدة)/i;

function ensureStyles() {
  if (window.__rawafidAssistantStylesPromise) return window.__rawafidAssistantStylesPromise;
  window.__rawafidAssistantStylesPromise = new Promise((resolve) => {
    const existing = document.getElementById('rawafid-assistant-styles');
    if (existing) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.id = 'rawafid-assistant-styles';
    link.rel = 'stylesheet';
    link.href = '/rawafid-assistant.css';
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
  return window.__rawafidAssistantStylesPromise;
}

function safeExcerpt(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > 170 ? `${text.slice(0, 167)}…` : text;
}

function safeDestination(value) {
  try {
    const url = new URL(String(value ?? ''), window.location.origin);
    if (url.origin !== window.location.origin) return '/search';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/search';
  }
}

function textElement(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = String(value ?? '');
  return node;
}

function internalLink(className, href, label, onNavigate) {
  const link = document.createElement('a');
  if (className) link.className = className;
  link.href = safeDestination(href);
  link.textContent = String(label ?? '');
  if (onNavigate) link.addEventListener('click', onNavigate, { once: true });
  return link;
}

function buildPanel() {
  const panel = document.createElement('section');
  panel.id = 'rawafid-assistant-panel';
  panel.className = 'rawafid-assistant-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'rawafid-assistant-title');
  panel.innerHTML = `
    <header class="rawafid-assistant-header">
      <div class="rawafid-assistant-identity">
        <span class="rawafid-assistant-mark" aria-hidden="true">ر</span>
        <div>
          <h2 class="rawafid-assistant-title" id="rawafid-assistant-title">مساعد روافد</h2>
          <p class="rawafid-assistant-subtitle">يفهم السؤال والسياق ثم يبحث داخل محتوى روافد — دون نموذج خارجي مدفوع.</p>
        </div>
      </div>
      <button class="rawafid-assistant-close" type="button" aria-label="إغلاق مساعد روافد">×</button>
    </header>
    <div class="rawafid-assistant-body">
      <p class="rawafid-assistant-intro">صف ما تريد بطريقتك، حتى لو كان السؤال مركبًا. أستخرج الموضوع والعمر والسياق والهدف، ثم أبحث في أكثر من مسار وأربط سؤالك بما سبق.</p>
      <div class="rawafid-assistant-quick-grid" aria-label="اقتراحات سريعة"></div>
      <form class="rawafid-assistant-form" role="search" toolname="askRawafidAssistant" tooldescription="Ask Rawafid's on-site assistant to analyze an Arabic or English question and search Rawafid's published content for relevant evidence and resources.">
        <textarea class="rawafid-assistant-input" name="query" required minlength="2" maxlength="220" rows="1" aria-label="سؤالك لمساعد روافد" toolparamdescription="The user's Arabic or English question for Rawafid's on-site evidence and resource search assistant." placeholder="مثال: طفلي عمره 4 سنوات يفهم الكلام لكنه لا يتكلم جيدًا، ماذا أفعل؟"></textarea>
        <button class="rawafid-assistant-submit" type="submit">اسأل</button>
      </form>
      <div class="rawafid-assistant-safety" role="alert" hidden></div>
      <div class="rawafid-assistant-status" role="status" aria-live="polite"></div>
      <div class="rawafid-assistant-clarification" hidden></div>
      <section class="rawafid-assistant-answer" aria-label="خلاصة من محتوى روافد" hidden></section>
      <div class="rawafid-assistant-results" aria-label="نتائج مساعد روافد" hidden></div>
      <div class="rawafid-assistant-notice">الإجابة مبنية على محتوى روافد المنشور وتُظهر مصادرها. ليست تشخيصًا فرديًا أو وصفة علاجية، وعند نقص معلومة أساسية يطلبها المساعد بدل التخمين.</div>
    </div>
    <footer class="rawafid-assistant-footer">يحفظ المساعد سياقًا قصيرًا داخل جلسة الصفحة فقط. لا يرسل سؤالك إلى نموذج ذكاء اصطناعي خارجي مدفوع.</footer>
  `;
  return panel;
}

export async function createRawafidAssistant(root, options = {}) {
  if (!root) throw new Error('Assistant root is required');
  if (root.__rawafidAssistantApi) return root.__rawafidAssistantApi;

  await ensureStyles();

  const launcher = options.launcher || root.querySelector('[data-rawafid-assistant-launcher]');
  const panel = buildPanel();
  root.appendChild(panel);

  const closeButton = panel.querySelector('.rawafid-assistant-close');
  const quickGrid = panel.querySelector('.rawafid-assistant-quick-grid');
  const form = panel.querySelector('.rawafid-assistant-form');
  const input = panel.querySelector('.rawafid-assistant-input');
  const submit = panel.querySelector('.rawafid-assistant-submit');
  const safety = panel.querySelector('.rawafid-assistant-safety');
  const status = panel.querySelector('.rawafid-assistant-status');
  const clarification = panel.querySelector('.rawafid-assistant-clarification');
  const answerBox = panel.querySelector('.rawafid-assistant-answer');
  const resultsBox = panel.querySelector('.rawafid-assistant-results');
  const notice = panel.querySelector('.rawafid-assistant-notice');
  const conversationContext = [];
  let openState = false;
  let loading = false;
  let requestController = null;

  const contextualQuick = CONTEXT_QUICK.find((item) => item.match.test(window.location.pathname))?.values || DEFAULT_QUICK;

  function close() {
    if (!openState) return;
    openState = false;
    panel.hidden = true;
    if (launcher) {
      launcher.hidden = false;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus({ preventScroll: true });
    }
  }

  function open() {
    openState = true;
    panel.hidden = false;
    if (launcher) {
      launcher.hidden = true;
      launcher.setAttribute('aria-expanded', 'true');
    }
    window.setTimeout(() => input?.focus({ preventScroll: true }), 80);
  }

  function clearDynamicOutput() {
    safety.hidden = true;
    safety.textContent = '';
    clarification.hidden = true;
    clarification.replaceChildren();
    answerBox.hidden = true;
    answerBox.replaceChildren();
    resultsBox.hidden = true;
    resultsBox.replaceChildren();
    notice.hidden = false;
    status.textContent = '';
  }

  function renderClarification(value) {
    const text = String(value ?? '').trim();
    if (!text) return;
    clarification.replaceChildren();
    clarification.append(
      textElement('strong', '', 'حتى أجيب بدقة:'),
      textElement('span', '', text),
    );
    clarification.hidden = false;
  }

  function renderAnswer(answer) {
    if (!answer || typeof answer !== 'object') return;
    answerBox.replaceChildren();

    if (answer.understood) {
      answerBox.append(textElement('div', 'rawafid-assistant-understood', `فهمت السؤال: ${answer.understood}`));
    }
    if (answer.lead) {
      answerBox.append(textElement('strong', 'rawafid-assistant-answer-lead', answer.lead));
    }

    const points = Array.isArray(answer.points) ? answer.points : [];
    const primarySource = answer.summary && points.length ? points[0] : null;
    const visiblePoints = answer.summary ? points.slice(1) : points;

    if (answer.summary) {
      const summary = document.createElement('div');
      summary.className = 'rawafid-assistant-answer-summary';
      summary.append(textElement('p', '', answer.summary));
      if (primarySource?.destination && primarySource?.title) {
        summary.append(internalLink('', primarySource.destination, `المصدر: ${primarySource.title}`, close));
      }
      answerBox.append(summary);
    }

    if (visiblePoints.length) {
      const list = document.createElement('div');
      list.className = 'rawafid-assistant-answer-points';
      visiblePoints.forEach((point) => {
        const item = document.createElement('div');
        item.className = 'rawafid-assistant-answer-point';
        if (point?.text) item.append(textElement('p', '', point.text));
        if (point?.destination && point?.title) item.append(internalLink('', point.destination, point.title, close));
        list.append(item);
      });
      answerBox.append(list);
    }

    if (answer.note) {
      answerBox.append(textElement('p', 'rawafid-assistant-answer-note', answer.note));
    }

    if (Array.isArray(answer.follow_ups) && answer.follow_ups.length) {
      const followUps = document.createElement('div');
      followUps.className = 'rawafid-assistant-follow-ups';
      followUps.setAttribute('aria-label', 'أسئلة متابعة مقترحة');
      answer.follow_ups.forEach((value) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = String(value);
        button.addEventListener('click', () => search(String(value)));
        followUps.append(button);
      });
      answerBox.append(followUps);
    }

    answerBox.hidden = false;
  }

  function renderResults(rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    resultsBox.replaceChildren();
    rows.forEach((item) => {
      if (!item?.title || !item?.destination) return;
      const link = internalLink('rawafid-assistant-result', item.destination, '', close);
      link.append(textElement('span', 'rawafid-assistant-result-title', item.title));
      if (item.subtitle) link.append(textElement('span', 'rawafid-assistant-result-meta', item.subtitle));
      if (item.excerpt) link.append(textElement('span', 'rawafid-assistant-result-excerpt', safeExcerpt(item.excerpt)));
      resultsBox.append(link);
    });
    resultsBox.hidden = resultsBox.childElementCount === 0;
  }

  async function search(rawQuery, resetContext = false) {
    const query = String(rawQuery ?? '').trim().replace(/\s+/g, ' ').slice(0, 220);
    if (resetContext) conversationContext.splice(0, conversationContext.length);
    input.value = query;
    clearDynamicOutput();

    if (RISK_PATTERN.test(query)) {
      safety.textContent = 'إذا كان هناك خطر مباشر على الحياة أو فقدان وعي أو نزيف شديد أو صعوبة تنفس أو احتمال إيذاء النفس، لا تعتمد على البحث داخل الموقع. اطلب خدمات الطوارئ المحلية أو توجّه لأقرب قسم طوارئ، وابقَ مع الشخص إن كان ذلك آمنًا.';
      safety.hidden = false;
      notice.hidden = true;
      return;
    }

    if (query.length < 2) {
      status.textContent = 'اكتب سؤالًا قصيرًا أو صف المشكلة بكلماتك.';
      return;
    }

    if (requestController) requestController.abort();
    requestController = new AbortController();
    loading = true;
    submit.disabled = true;
    submit.textContent = 'أحلل…';
    status.textContent = 'أفهم السؤال وأفككه ثم أبحث في أدلة روافد…';

    try {
      const history = conversationContext.slice(-3);
      const contextParam = history.length ? `&context=${encodeURIComponent(history.join(' || '))}` : '';
      const response = await fetch(`/api/search/v3?q=${encodeURIComponent(query)}&limit=6${contextParam}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { accept: 'application/json' },
        signal: requestController.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rows = Array.isArray(data?.results) ? data.results : [];
      const answer = data?.answer && typeof data.answer === 'object' ? data.answer : null;
      const nextClarification = data?.analysis?.clarifying_question || answer?.clarifying_question || '';

      conversationContext.splice(0, conversationContext.length, ...[...history, query]
        .filter((item, index, values) => values.lastIndexOf(item) === index)
        .slice(-3));

      renderClarification(nextClarification);
      renderAnswer(answer);
      renderResults(rows);

      if (nextClarification && rows.length === 0) {
        status.textContent = 'أحتاج معلومة واحدة إضافية حتى لا أخمّن.';
      } else if (rows.length) {
        status.textContent = data?.contextual
          ? 'ربطت السؤال بما سبق في المحادثة وأعدت ترتيب الأدلة وفق السياق.'
          : 'حللت السؤال وأعدت ترتيب الأدلة وفق الموضوع والنية والسياق.';
      } else {
        status.textContent = 'لم أجد نتيجة كافية بثقة. جرّب وصف المشكلة بتفصيل مختلف.';
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        status.textContent = 'تعذر تنفيذ البحث الآن. يمكنك استخدام صفحة البحث المتقدم.';
      }
    } finally {
      loading = false;
      submit.disabled = false;
      submit.textContent = 'اسأل';
      requestController = null;
    }
  }

  contextualQuick.forEach((value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rawafid-assistant-quick';
    button.textContent = value;
    button.addEventListener('click', () => search(value, true));
    quickGrid.append(button);
  });

  closeButton.addEventListener('click', close);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!loading) search(input.value);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openState) close();
  });

  const api = { open, close };
  root.__rawafidAssistantApi = api;
  return api;
}
