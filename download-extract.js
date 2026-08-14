/* Author: Shonibare Akanni */

const urlInput = document.getElementById('urlInput');
const fetchBtn = document.getElementById('fetchBtn');
const clearBtn = document.getElementById('clearBtn');
const linksList = document.getElementById('linksList');
const rawHtml = document.getElementById('rawHtml');
const notice = document.getElementById('notice');
const exportBtn = document.getElementById('exportBtn');
const exportDomainsBtn = document.getElementById('exportDomainsBtn');

let extractedLinks = [];

function normalizeUrl(value) {
  const candidate = value.trim();
  if (!candidate) throw new Error('Enter a website URL first.');
  return new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 16000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHtml(targetUrl) {
  const endpoint = `/.netlify/functions/fetch-html?url=${encodeURIComponent(targetUrl)}`;
  try {
    const response = await fetchWithTimeout(endpoint);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Server returned HTTP ${response.status}`);
    return { html: result.html, source: 'secure server-side fetch', finalUrl: result.finalUrl };
  } catch (serverError) {
    try {
      const response = await fetchWithTimeout(targetUrl, { headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error(`Direct request returned HTTP ${response.status}`);
      return { html: await response.text(), source: 'direct request', finalUrl: response.url || targetUrl };
    } catch (directError) {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetchWithTimeout(proxyUrl);
      if (!response.ok) throw new Error(`All available fetch methods failed (HTTP ${response.status})`);
      return { html: await response.text(), source: 'AllOrigins fallback proxy', finalUrl: targetUrl };
    }
  }
}

function extractLinks(html, baseUrl) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return [...document.querySelectorAll('a[href]')]
    .map(anchor => anchor.getAttribute('href').trim())
    .filter(href => href && !/^(javascript:|mailto:|tel:|#)/i.test(href))
    .map(href => {
      try { return new URL(href, baseUrl).href; } catch { return null; }
    })
    .filter((href, index, links) => href && links.indexOf(href) === index);
}

function renderLinks() {
  linksList.innerHTML = '';
  if (!extractedLinks.length) {
    linksList.textContent = 'No links found.';
    exportBtn.disabled = true;
    exportDomainsBtn.disabled = true;
    return;
  }
  const fragment = document.createDocumentFragment();
  extractedLinks.forEach(link => {
    const item = document.createElement('div');
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link;
    item.appendChild(anchor);
    fragment.appendChild(item);
  });
  linksList.appendChild(fragment);
  exportBtn.disabled = false;
  exportDomainsBtn.disabled = false;
}

function saveText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

fetchBtn.addEventListener('click', async () => {
  let target;
  try { target = normalizeUrl(urlInput.value); } catch (error) {
    notice.textContent = error.message;
    notice.className = 'small error';
    return;
  }

  fetchBtn.disabled = true;
  fetchBtn.textContent = 'Downloading…';
  notice.className = 'small loading';
  notice.textContent = 'Downloading HTML and extracting links…';
  try {
    const result = await fetchHtml(target.href);
    rawHtml.value = result.html;
    extractedLinks = extractLinks(result.html, result.finalUrl || target.href);
    renderLinks();
    notice.className = 'small';
    notice.textContent = `Downloaded ${result.html.length.toLocaleString()} characters via ${result.source}. Found ${extractedLinks.length} unique links.`;
  } catch (error) {
    extractedLinks = [];
    renderLinks();
    notice.className = 'small error';
    notice.textContent = `Unable to download this page: ${error.message}`;
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = 'Download & Extract Links';
  }
});

clearBtn.addEventListener('click', () => {
  urlInput.value = '';
  rawHtml.value = '';
  extractedLinks = [];
  notice.className = 'small';
  notice.textContent = 'Enter a URL to download its HTML and extract links.';
  renderLinks();
});

exportBtn.addEventListener('click', () => saveText('links.txt', extractedLinks.join('\n')));
exportDomainsBtn.addEventListener('click', () => {
  const domains = extractedLinks.map(link => new URL(link).hostname)
    .filter((domain, index, all) => all.indexOf(domain) === index);
  saveText('domains.txt', domains.join('\n'));
});

renderLinks();
