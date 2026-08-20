
const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') return response(204, {});
  if (event.httpMethod !== 'GET') return response(405, { error: 'Only GET is supported.' });

  const rawUrl = event.queryStringParameters?.url;
  if (!rawUrl) return response(400, { error: 'A url query parameter is required.' });

  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return response(400, { error: 'Enter a valid website URL.' });
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return response(400, { error: 'Only HTTP and HTTPS URLs are supported.' });
  }
  if (BLOCKED_HOSTS.has(target.hostname.toLowerCase())) {
    return response(403, { error: 'Local network URLs are not allowed.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(target.href, {
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'DomainExtractor/1.0 (+https://domain-extractorr.netlify.app/)'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    if (!upstream.ok) return response(upstream.status, { error: `Target returned HTTP ${upstream.status}.` });
    const html = await upstream.text();
    return response(200, { html, finalUrl: upstream.url || target.href });
  } catch (error) {
    const message = error.name === 'AbortError' ? 'The target took too long to respond.' : 'The target could not be fetched.';
    return response(502, { error: message });
  } finally {
    clearTimeout(timeout);
  }
};
