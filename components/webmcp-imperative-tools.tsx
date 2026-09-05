const bootstrap = String.raw`
(function () {
  var context = document.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;
  if (window.__rawafidWebMcpImperativeRegistered) return;
  window.__rawafidWebMcpImperativeRegistered = true;

  var tool = {
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
      var rawQuery = input && typeof input.query === 'string' ? input.query : '';
      var query = rawQuery.trim().replace(/\s+/g, ' ').slice(0, 220);
      var requestedLimit = input && Number.isInteger(input.limit) ? input.limit : 6;
      var limit = Math.min(10, Math.max(1, requestedLimit));

      if (query.length < 2) {
        return { ok: false, error: 'query_too_short', message: 'Provide at least two characters.' };
      }

      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 6500);
      var externalSignal = options && options.signal;
      if (externalSignal && typeof externalSignal.addEventListener === 'function') {
        if (externalSignal.aborted) controller.abort();
        else externalSignal.addEventListener('abort', function () { controller.abort(); }, { once: true });
      }

      try {
        var response = await fetch('/api/search/v3?q=' + encodeURIComponent(query) + '&limit=' + limit, {
          method: 'GET',
          cache: 'no-store',
          headers: { accept: 'application/json' },
          signal: controller.signal
        });

        if (!response.ok) {
          return { ok: false, error: 'search_unavailable', status: response.status };
        }

        var data = await response.json();
        var rows = Array.isArray(data.results) ? data.results.slice(0, limit) : [];
        var results = rows.map(function (row) {
          return {
            title: String(row && row.title ? row.title : '').slice(0, 180),
            destination: String(row && row.destination ? row.destination : '').slice(0, 500),
            subtitle: row && row.subtitle ? String(row.subtitle).slice(0, 180) : null,
            excerpt: row && row.excerpt ? String(row.excerpt).replace(/\s+/g, ' ').slice(0, 320) : null,
            score: Number.isFinite(Number(row && row.score)) ? Number(row.score) : null
          };
        }).filter(function (row) { return row.title && row.destination; });

        var summary = data && data.answer && data.answer.summary
          ? String(data.answer.summary).replace(/\s+/g, ' ').slice(0, 600)
          : null;

        return {
          ok: true,
          query: data && data.query ? String(data.query).slice(0, 220) : query,
          resolvedQuery: data && data.resolved_query ? String(data.resolved_query).slice(0, 320) : query,
          mode: data && data.mode ? String(data.mode).slice(0, 160) : null,
          summary: summary,
          count: results.length,
          results: results
        };
      } catch (error) {
        var aborted = controller.signal.aborted || (error && error.name === 'AbortError');
        return {
          ok: false,
          error: aborted ? 'search_timeout' : 'search_unavailable'
        };
      } finally {
        window.clearTimeout(timeout);
      }
    }
  };

  try {
    var registration = context.registerTool(tool);
    if (registration && typeof registration.catch === 'function') {
      registration.catch(function () {
        window.__rawafidWebMcpImperativeRegistered = false;
      });
    }
  } catch (_) {
    window.__rawafidWebMcpImperativeRegistered = false;
  }
})();
`;

export default function WebMcpImperativeTools() {
  return <script id="rawafid-webmcp-imperative" dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
