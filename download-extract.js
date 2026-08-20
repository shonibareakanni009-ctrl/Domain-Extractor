(() => {
  const urlInput = document.getElementById('urlInput');
  const fetchBtn = document.getElementById('fetchBtn');
  const clearBtn = document.getElementById('clearBtn');
  const linksList = document.getElementById('linksList');
  const rawHtml = document.getElementById('rawHtml');
  const exportBtn = document.getElementById('exportBtn');
  const exportDomainsBtn = document.getElementById('exportDomainsBtn');
  const notice = document.getElementById('notice');

  const PROXY_RAW = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  async function tryFetch(url) {
    try {
      const resp = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!resp.ok) throw new Error('Network response not ok: ' + resp.status);
      const text = await resp.text();
      return { html: text, usedProxy: false };
    } catch (err) {
      console.warn('Direct fetch failed:', err);
    }

    try {
      const proxyUrl = PROXY_RAW(url);
      const resp = await fetch(proxyUrl, { method: 'GET' });
      if (!resp.ok) throw new Error('Proxy response not ok: ' + resp.status);
      const text = await resp.text();
      return { html: text, usedProxy: true, proxyUrl: proxyUrl };
    } catch (err) {
      throw new Error('Both direct fetch and proxy failed: ' + err.message);
    }
  }

  function extractLinks(htmlText, baseUrl) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    const links = anchors.map(a => a.getAttribute('href')).filter(Boolean);

    const absoluteLinks = links.map(href => {
      if (/^\s*(javascript:|#|mailto:)/i.test(href)) return null;
      try {
        return new URL(href, baseUrl).toString();
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    const seen = new Set();
    const dedup = [];
    for (const l of absoluteLinks) {
      if (!seen.has(l)) {
        seen.add(l);
        dedup.push(l);
      }
    }
    return dedup;
  }

  function extractDomains(linkList) {
    const domains = [];
    const seen = new Set();
    for (const l of linkList) {
      try {
        const host = new URL(l).hostname;
        if (!seen.has(host)) {
          seen.add(host);
          domains.push(host);
        }
      } catch (e) {  }
    }
    return domains;
  }

  function showLinks(links) {
    linksList.innerHTML = '';
    if (!links.length) {
      linksList.textContent = '(no links found)';
      exportBtn.disabled = true;
      exportDomainsBtn.disabled = true;
      return;
    }
    const ul = document.createElement('ul');
    for (const l of links) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = l;
      a.textContent = l;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
      ul.appendChild(li);
    }
    linksList.appendChild(ul);
    exportBtn.disabled = false;
    exportDomainsBtn.disabled = false;
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setNoticeDefault() {
    notice.textContent = 'Note: Direct fetching is attempted first. If blocked by CORS, a public proxy (AllOrigins) will be used as a fallback.';
  }

  document.addEventListener('DOMContentLoaded', () => {
    setNoticeDefault();

    fetchBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      if (!url) return alert('Enter a URL, e.g. https://example.com');

      const normalizedUrl = url.match(/^https?:\/\//) ? url : 'https://' + url;

      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Downloading...';
      try {
        const result = await tryFetch(normalizedUrl);
        rawHtml.value = result.html.slice(0, 200000);
        if (result.usedProxy) {
          notice.textContent = 'Loaded via public proxy: ' + result.proxyUrl + ' — this sends the target URL to that proxy service.';
        } else {
          notice.textContent = 'Loaded directly from the site (no proxy used).';
        }

        const links = extractLinks(result.html, normalizedUrl);
        showLinks(links);

        exportBtn.onclick = () => {
          downloadText('links.txt', links.join('\n'));
        };
        const domains = extractDomains(links);
        exportDomainsBtn.onclick = () => {
          downloadText('domains.txt', domains.join('\n'));
        };

      } catch (err) {
        linksList.innerHTML = '';
        rawHtml.value = '';
        notice.textContent = 'Error: ' + err.message;
        alert('Could not download page: ' + err.message);
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Download & Extract Links';
      }
    });

    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      linksList.innerHTML = '';
      rawHtml.value = '';
      setNoticeDefault();
      exportBtn.disabled = true;
      exportDomainsBtn.disabled = true;
    });
  });
})();
