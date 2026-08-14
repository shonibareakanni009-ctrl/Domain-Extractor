# 🔗 Domain Extractor

A zero-dependency, client-side domain extractor that runs entirely in your browser.  
Paste raw text, drop a file, or paste a whole document dump — it pulls out every domain, cleans duplicates, filters by TLD, and exports to TXT/CSV/JSON in seconds.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Pure HTML](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-orange)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Instant Extraction** | Regex + line-scanning dual engine catches domains in URLs, emails, logs, and plain text. |
| **Privacy First** | Everything runs locally. No data leaves your machine. |
| **File Upload** | Choose a file or drag and drop `.txt`, `.csv`, `.html`, `.json`, or `.md` files directly onto the page. |
| **Website HTML Download** | Open **Download Website HTML**, enter a URL, download its HTML, extract unique links, and export links or domains. |
| **Smart Deduplication** | Case-insensitive unique filter with optional lowercase normalization. |
| **Subdomain Control** | Toggle to strip `www.` and subdomains to get root domains only. |
| **TLD Filtering** | Dynamically shows all TLDs found; click to filter the list in real time. |
| **Sort & Search** | Alphabetical sort + live search/filter on the output list. |
| **Export Formats** | **TXT** (newline), **CSV** (`domain,tld,length`), **JSON** (structured array). |
| **Stats Dashboard** | Live count + top-TLD bar chart generated with pure CSS. |
| **Themes** | Light / Dark / System mode toggle. |
| **Responsive** | Works on mobile, tablet, and desktop. |

---

## 🚀 Quick Start

1. **Download** `domain-extractor.html` (single file).
2. **Double-click** to open in any modern browser.
3. **Paste** text or **drag & drop** a file.
4. Click **Extract** and export your results.
5. To scrape a public page, click **Download Website HTML**, enter its URL, and export the extracted links or domains.

No build step or npm install is required. The downloader uses a Netlify serverless function for reliable fetching, with direct and AllOrigins fallbacks when necessary. Requests have a timeout and display a clear error if all methods fail.

---

## 📸 Screenshot

*(Not Available)*

---

## 🛠️ Advanced Usage

### Custom Regex
Enable **Advanced Mode** to edit the extraction regex live. Useful for catching internal hostnames, `.local` domains, or IP:port combos.

### Batch Workflow
1. Drop a folder of logs.
2. Set **Remove subdomains** → `ON`.
3. Filter by `.com` only.
4. Export CSV → import into your CRM / scanner.

---

## 📁 File Structure

- `index.html` — main domain extractor with working file selection and drag-and-drop upload.
- `download-extract.html`, `download-extract.css`, `download-extract.js` — website HTML downloader and link scraper.

domain-extractor/
├── domain-extractor.html   # The entire app
├── README.md
└── LICENSE

---

## 🧪 Supported Inputs

- Raw clipboard dumps (e.g., Shopify store lists, WHOIS data)
- Email headers
- Server access logs
- HTML source code
- CSV columns mixed with other data

---

## 📝 License

MIT — use it freely, fork it, embed it, sell it.
