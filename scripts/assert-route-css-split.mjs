const base = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');

async function routeCss(pathname) {
  const response = await fetch(`${base}${pathname}`, { redirect: 'manual' });
  if (!response.ok) throw new Error(`${pathname} returned HTTP ${response.status}`);
  const html = await response.text();
  const hrefs = [...new Set([...html.matchAll(/href="([^"]+\.css(?:\?[^"]*)?)"/g)].map((match) => match[1].replaceAll('&amp;', '&')))];
  if (!hrefs.length) throw new Error(`${pathname} rendered without discoverable CSS links`);
  const chunks = await Promise.all(hrefs.map(async (href) => {
    const url = href.startsWith('http') ? href : new URL(href, base).toString();
    const cssResponse = await fetch(url);
    if (!cssResponse.ok) throw new Error(`${pathname} CSS ${url} returned HTTP ${cssResponse.status}`);
    return cssResponse.text();
  }));
  return { hrefs, css: chunks.join('\n') };
}

const home = await routeCss('/');
for (const selector of ['.dashboard-shell', '.admin-app-shell', '.media-library-grid', '.account-overview', '.join-shell', '.auth-shell']) {
  if (home.css.includes(selector)) throw new Error(`homepage CSS still contains protected selector ${selector}`);
}

const login = await routeCss('/login');
if (!login.css.includes('.auth-shell')) throw new Error('login route is missing route-scoped auth CSS');

const join = await routeCss('/join');
if (!join.css.includes('.join-shell')) throw new Error('join route is missing route-scoped join CSS');

console.log(`Route CSS split passed: homepage=${home.hrefs.length} stylesheet(s), login=${login.hrefs.length}, join=${join.hrefs.length}; protected selectors are absent from homepage CSS.`);
