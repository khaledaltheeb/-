const bootstrap = String.raw`
(function () {
  var context = document.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;
  if (window.__rawafidWebMcpImperativeRegistered) return;
  window.__rawafidWebMcpImperativeRegistered = true;

  var lifecycle = new AbortController();
  var IMMEDIATE_RISK_PATTERN = /(انتحار|اقتل نفسي|قتل نفسي|أقتل نفسي|اذي نفسي|أؤذي نفسي|ايذاء النفس|إيذاء النفس|خطر مباشر|لا استطيع التنفس|لا أستطيع التنفس|فقد الوعي|نزيف شديد|جرعة زائدة|suicid|kill myself|self[- ]?harm|cannot breathe|can't breathe|unconscious|severe bleeding|overdose)/i;

  function normalizeText(value, maxLength) {
    return String(value == null ? '' : value).trim().replace(/\s+/g, ' ').slice(0, maxLength);
  }

  function boundedResults(data, limit) {
    var rows = Array.isArray(data && data.results) ? data.results.slice(0, limit) : [];
    return rows.map(function (row) {
      return {
        title: normalizeText(row && row.title, 180),
        destination: normalizeText(row && row.destination, 500),
        subtitle: row && row.subtitle ? normalizeText(row.subtitle, 180) : null,
        excerpt: row && row.excerpt ? normalizeText(row.excerpt, 320) : null,
        score: Number.isFinite(Number(row && row.score)) ? Number(row.score) : null
      };
    }).filter(function (row) { return row.title && row.destination; });
  }

  async function requestSearch(query, limit, contextItems, options) {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 6500);
    var externalSignal = options && options.signal;
    var abortFromExternal = function () { controller.abort(); };

    if (externalSignal && typeof externalSignal.addEventListener === 'function') {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener('abort', abortFromExternal, { once: true });
    }

    try {
      var contextParam = contextItems && contextItems.length
        ? '&context=' + encodeURIComponent(contextItems.join(' || '))
        : '';
      var response = await fetch('/api/search/v3?q=' + encodeURIComponent(query) + '&limit=' + limit + contextParam, {
        method: 'GET',
        cache: 'no-store',
        headers: { accept: 'application/json' },
        signal: controller.signal
      });

      if (!response.ok) {
        return { ok: false, error: 'search_unavailable', status: response.status };
      }

      return { ok: true, data: await response.json() };
    } catch (error) {
      var aborted = controller.signal.aborted || (error && error.name === 'AbortError');
      return {
        ok: false,
        error: aborted ? (externalSignal && externalSignal.aborted ? 'search_cancelled' : 'search_timeout') : 'search_unavailable'
      };
    } finally {
      window.clearTimeout(timeout);
      if (externalSignal && typeof externalSignal.removeEventListener === 'function') {
        externalSignal.removeEventListener('abort', abortFromExternal);
      }
    }
  }

  var searchEvidenceTool = {
    name: 'search_rawafid_evidence',
    title: 'Search Rawafid evidence',
    description: 'Search Rawafid published Arabic and English health, psychology, special-education, inclusion, addiction, social-work, and evidence resources. Use this read-only tool when the user needs relevant Rawafid pages, evidence, or references.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          minLength: 2,
          maxLength: 220,
          description: 'Arabic or English search query describing the information, evidence, topic, condition, or resource the user needs.'
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          default: 6,
          description: 'Maximum number of ranked Rawafid results to return.'
        }
      },
      required: ['query'],
      additionalProperties: false
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true
    },
    execute: async function (input, options) {
      var query = normalizeText(input && input.query, 220);
      var requestedLimit = input && Number.isInteger(input.limit) ? input.limit : 6;
      var limit = Math.min(10, Math.max(1, requestedLimit));

      if (query.length < 2) {
        return { ok: false, error: 'query_too_short', message: 'Provide at least two characters.' };
      }

      var response = await requestSearch(query, limit, [], options);
      if (!response.ok) return response;

      var data = response.data || {};
      var results = boundedResults(data, limit);
      var summary = data && data.answer && data.answer.summary
        ? normalizeText(data.answer.summary, 600)
        : null;

      return {
        ok: true,
        query: data && data.query ? normalizeText(data.query, 220) : query,
        resolvedQuery: data && data.resolved_query ? normalizeText(data.resolved_query, 320) : query,
        mode: data && data.mode ? normalizeText(data.mode, 160) : null,
        summary: summary,
        count: results.length,
        results: results
      };
    }
  };

  var askAssistantTool = {
    name: 'ask_rawafid_assistant',
    title: 'Ask Rawafid assistant',
    description: 'Ask a health, psychology, disability, special-education, inclusion, addiction, social-work, rehabilitation, or related question and receive a concise answer grounded in Rawafid published content with ranked source links. This tool is informational and read-only; it does not diagnose, prescribe, or replace emergency or professional care.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          minLength: 2,
          maxLength: 220,
          description: 'The user question in Arabic or English.'
        },
        context: {
          type: 'array',
          maxItems: 3,
          items: {
            type: 'string',
            minLength: 1,
            maxLength: 220
          },
          description: 'Optional prior user turns that materially clarify this question, oldest to newest. Maximum three short items.'
        }
      },
      required: ['question'],
      additionalProperties: false
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true
    },
    execute: async function (input, options) {
      var question = normalizeText(input && input.question, 220);
      if (question.length < 2) {
        return { ok: false, error: 'question_too_short', message: 'Provide at least two characters.' };
      }

      if (IMMEDIATE_RISK_PATTERN.test(question)) {
        return {
          ok: false,
          error: 'immediate_risk',
          requiresImmediateHelp: true,
          message: 'If there may be immediate danger, loss of consciousness, severe bleeding, breathing difficulty, overdose, or risk of self-harm, do not rely on website search. Contact local emergency services or go to the nearest emergency department now.'
        };
      }

      var rawContext = input && Array.isArray(input.context) ? input.context : [];
      var contextItems = rawContext.slice(-3).map(function (item) {
        return normalizeText(item, 220);
      }).filter(Boolean);

      var response = await requestSearch(question, 6, contextItems, options);
      if (!response.ok) return response;

      var data = response.data || {};
      var answer = data && data.answer && typeof data.answer === 'object' ? data.answer : {};
      var analysis = data && data.analysis && typeof data.analysis === 'object' ? data.analysis : {};
      var results = boundedResults(data, 6);
      var followUps = Array.isArray(answer.follow_ups)
        ? answer.follow_ups.slice(0, 4).map(function (item) { return normalizeText(item, 180); }).filter(Boolean)
        : [];
      var clarification = analysis.clarifying_question || answer.clarifying_question || null;

      return {
        ok: true,
        question: question,
        contextual: Boolean(data && data.contextual),
        clarification: clarification ? normalizeText(clarification, 320) : null,
        understood: answer.understood ? normalizeText(answer.understood, 360) : null,
        lead: answer.lead ? normalizeText(answer.lead, 500) : null,
        summary: answer.summary ? normalizeText(answer.summary, 900) : null,
        note: answer.note ? normalizeText(answer.note, 500) : null,
        followUps: followUps,
        count: results.length,
        results: results
      };
    }
  };

  function register(tool) {
    var registration = context.registerTool(tool, { signal: lifecycle.signal });
    if (registration && typeof registration.catch === 'function') {
      registration.catch(function () {
        window.__rawafidWebMcpImperativeRegistered = false;
        lifecycle.abort();
      });
    }
  }

  try {
    register(searchEvidenceTool);
    register(askAssistantTool);
    window.addEventListener('pagehide', function (event) {
      if (!event.persisted) lifecycle.abort();
    }, { once: true });
  } catch (_) {
    lifecycle.abort();
    window.__rawafidWebMcpImperativeRegistered = false;
  }
})();
`;

export default function WebMcpImperativeTools() {
  return <script id="rawafid-webmcp-imperative" dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
