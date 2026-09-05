import styles from './rawafid-assistant-launcher.module.css';

const STORAGE_KEY = 'rawafid-assistant-auto-open-v1';
const AUTO_OPEN_AFTER_MS = 12000;
const AUTO_OPEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const assistantBootstrap = String.raw`
(function () {
  var root = document.querySelector('[data-rawafid-assistant-root]');
  if (!root || root.getAttribute('data-bootstrap-ready') === 'true') return;
  root.setAttribute('data-bootstrap-ready', 'true');

  var launcher = root.querySelector('[data-rawafid-assistant-launcher]');
  if (!launcher) return;

  var api = null;
  var loading = false;
  var autoTimer = 0;

  function setLoading(value) {
    loading = value;
    launcher.disabled = value;
    if (value) {
      launcher.setAttribute('aria-busy', 'true');
      launcher.setAttribute('aria-label', 'جارٍ فتح مساعد روافد');
    } else {
      launcher.removeAttribute('aria-busy');
      launcher.setAttribute('aria-label', 'فتح مساعد روافد');
    }
  }

  function activate(autoOpened) {
    if (!autoOpened && autoTimer) {
      window.clearTimeout(autoTimer);
      autoTimer = 0;
    }
    if (api) {
      api.open();
      return;
    }
    if (loading) return;
    setLoading(true);

    import('/rawafid-assistant.js').then(function (module) {
      if (!module || typeof module.createRawafidAssistant !== 'function') {
        throw new Error('Rawafid assistant module is unavailable');
      }
      return module.createRawafidAssistant(root, { launcher: launcher });
    }).then(function (nextApi) {
      api = nextApi;
      setLoading(false);
      api.open();
      if (autoOpened) {
        try { window.localStorage.setItem('${STORAGE_KEY}', String(Date.now())); } catch (_) {}
      }
    }).catch(function () {
      setLoading(false);
      launcher.setAttribute('aria-label', 'تعذر فتح مساعد روافد، حاول مرة أخرى');
    });
  }

  launcher.addEventListener('click', function () { activate(false); });

  var lastAutoOpen = 0;
  try { lastAutoOpen = Number(window.localStorage.getItem('${STORAGE_KEY}') || 0); } catch (_) {}
  if (Date.now() - lastAutoOpen >= ${AUTO_OPEN_TTL_MS}) {
    autoTimer = window.setTimeout(function () { activate(true); }, ${AUTO_OPEN_AFTER_MS});
  }

  window.addEventListener('pagehide', function () {
    if (autoTimer) window.clearTimeout(autoTimer);
  }, { once: true });
})();
`;

export default function RawafidAssistantLoader() {
  return (
    <>
      <div className={styles.root} dir="rtl" data-rawafid-assistant-root="true">
        <button
          type="button"
          className={styles.launcher}
          aria-label="فتح مساعد روافد"
          aria-expanded="false"
          aria-controls="rawafid-assistant-panel"
          data-rawafid-assistant-launcher="true"
        >
          <span className={styles.launcherIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m15 15 4.5 4.5" />
              <path d="M18 3v4M16 5h4" />
            </svg>
          </span>
          <span className={styles.launcherLabel}>اسأل</span>
        </button>
      </div>
      <script id="rawafid-assistant-bootstrap" dangerouslySetInnerHTML={{ __html: assistantBootstrap }} />
    </>
  );
}
