# SmartWorker Codebase Documentation
> For Claude Code terminal handoff — project context and architecture

## Repository
- **Repo:** `haktanplays/smartworker`
- **Branch:** `main`
- **Type:** Single-page HTML apps for hotel butler operations (Raffles Istanbul)
- **Constraint:** No build tools, no Node.js — all files work by double-click (file:// protocol)

## File Structure

| File | Lines | Purpose |
|------|-------|---------|
| **SmartWorker3.html** | ~6,100 | Main app — Letters, Traces, Equipment, PY, Butler Did It, Inspector Radar, Butler Alert, Shift Handoff, Settings |
| **EmailCenter.html** | ~1,700 | Post-Departure + Pre-Arrival email — EML generator, templates, PDF attachments |
| **Minibar.html** | ~1,980 | Standalone minibar tracking — data entry, analytics, targets, prices, PDF import, XLSX export |
| **NoteStandardizer.html** | ~1,500 | Note parsing — preference forms, web notes standardization, issue tracking, learning system |
| **Expense.html** | ~1,020 | Standalone expense manager — budget, receipts, invoice PDF parsing, XLSX export |
| **Itinerary.html** | ~390 | Standalone itinerary builder — day planner, PPTX export |
| **SmartWorkerHub.html** | ~80 | Landing page with links to all apps |
| **SMARTWORKER_MAP (1).md** | ~250 | Original codebase map (outdated — refers to pre-split monolith) |

## Architecture

### Data Storage
- **All data in localStorage** — no backend, no database
- Each module uses prefixed keys (e.g., `bdi_2026-03-25`, `alert_2026-03-25`, `mb_data_3_2026`)
- Shared keyword settings: `kw_butler`, `kw_equip`, `kw_amenity`, `kw_deco`, `kw_action`, `kw_bdiaction`
- Butler keywords (`kw_butler`) shared between main app and Expense module

### Code Structure (SmartWorker3.html)
```
Lines 1-16:     CDN scripts (pdf.js, xlsx-js-style inline, jszip, pptxgen, jspdf)
Lines 17-88:    CSS (shared across all apps)
Lines 89-886:   HTML (topbar, nav, all page divs, settings)
Lines 887-6160: JavaScript inside IIFE (function(){...})()
  - 887-940:    Shared helpers (Store, setupDrop, dlFile, fmtDateDMY, createTemplateManager, etc.)
  - 941-1010:   Core utilities (esc, cap, fmtDate, getTomorrow, getKW, setKW, showPage, drag-drop)
  - 1010-1300:  Letters module (PDF parsing, guest table, letter generation, downloads)
  - 1300-1500:  Traces, Equipment, PY modules
  - 1500-3200:  Butler Did It (full CRM: entry, logs, date ranges, filters, performance, guest library, coverage, memory management)
  - 3200-3700:  Shared Res Detail Parser + Central Module Feed (feedAllModules)
  - 3700-4700:  Inspector Radar (scoring engine, Forbes model, UI, Mind Tree PDF)
  - 4700-5900:  Butler Alert (detection, persistence, analytics, workload, upsell tracking, backup/import/archive)
  - 5900-6000:  Shift Handoff
  - 6000-6050:  Expense/Minibar settings stubs
  - 6050-6160:  Window aliases (IIFE → global scope bridge for onclick handlers)
```

### IIFE + Window Aliases Pattern
All JS is wrapped in `(function(){ "use strict"; ... })()`. Functions needed by `onclick` HTML attributes are aliased to `window` via:
```js
[showPage, handleArrPDF, renderGuestTable, ...].forEach(function(fn){
  if(fn && fn.name) window[fn.name] = fn
});
```
**Critical:** If any function in this array is undefined, the entire forEach breaks and NO function becomes global — all onclick handlers stop working.

### Module Dependencies (SmartWorker3.html)
```
feedAllModules() ← Central hub, distributes parsed PDF data
├── Letters (guests[], b2bMap)
├── Traces (traces[])
├── Equipment (filters from traces[])
├── PY - Passionately Yours (pyGuests[])
├── Inspector Radar (radarResults[])
└── Butler Alert (alertList[])

Butler Did It ← Independent (own localStorage, VAC PDF for room names)
Shift Handoff ← Reads all module state for export
```

### Standalone Modules (Separate HTML Files)
Each has its own CSS (copied from main), CDN scripts, and JS. No dependency on SmartWorker3.html except shared localStorage keys for butler keywords.

## Key Features by Module

### Butler Did It (BDI)
- **Tabbed layout:** Kayit Girisi | Log & Rapor | Kapsam | Misafir Kutuphanesi
- **Date ranges:** Gun/Hafta/Ay/Yil/Ozel with date range scanning from localStorage
- **Filters:** Butler/Action/Room dropdowns, work across all views
- **Performance dashboard:** Butler cards, action heatmap, daily trend bars, top rooms
- **Guest CRM:** Search by name/room/date, expandable profiles, editable notes, profile merging
- **Guest timeline:** Shows room service history when entering a room number
- **Period comparison:** Current vs previous period with green/red arrows
- **Coverage rate:** Occupied rooms input, served/total %, untouched rooms list
- **PM rooms:** Persistent room-guest list for long-stay guests not in VAC PDF
- **Memory management:** Backup (JSON export), multi-file import with dedup, auto-archive (3+ months)
- **Storage meter:** Visual bar + per-category breakdown

### Butler Alert
- **Auto-detection:** 6 reasons (4+ nights, children, RSSRAF, OTA, special occasion, transfer)
- **Visit tracking:** Butler assignment per visit, pending/visited/not-visited status
- **Persistence:** Daily snapshots in localStorage, auto-restore on page load
- **Analytics tab:** Completion rate trend, reason distribution, not-visited reason breakdown
- **Date ranges:** Week/Month/Year/Custom for analytics
- **Period comparison:** Same as BDI
- **Workload view:** Per-butler room count with visited/pending/not-visited breakdown
- **Completion target:** Configurable % with progress bar
- **Configurable keywords:** Transfer, OTA, exclude keywords editable in Settings
- **CON transfer detection:** Prioritizes Concierge department traces
- **Upsell outcome tracking:** Predefined product dropdown (Room Upgrade, Spa, etc.) — tracks accepted/declined
- **Backup/import/archive:** Same pattern as BDI

### Note Standardizer
- **Web Notes tab:** Paste messy Opera notes → standardized output
- **PA/PD mail parser:** 6 patterns (sent, no-mail, mismatch × PA/PD)
- **Pre-2023 stacking:** Old dates compressed into one line per type
- **2023+ formatting:** Individual lines with DD.MM.YY format + initials
- **Learning system:** Click wrong output line → teach correct category → rule saved permanently
- **Manual rule editor:** Add/remove rules in Settings, export/import for sharing
- **Preference form parser:** PDF upload, checkbox detection, department-based trace generation

## Known Issues / Watch Out For
1. **IIFE alias array** — if a function is listed but undefined, ALL aliases break. Always verify after adding/removing functions.
2. **Duplicate `<style>` tags** — extraction script sometimes creates double `<style>`. Check all new HTML files.
3. **Missing `<script>` tags** — extraction script sometimes forgets to wrap JS in `<script>`. Verify in every new file.
4. **localStorage 5-10MB limit** — BDI and Alert have archive systems to manage this. Email PDFs (in EmailCenter) are the biggest consumers.
5. **file:// protocol** — IndexedDB, File System API, Cache API don't work reliably. Only localStorage + Blob export/import.

## How to Test
1. Open any `.html` file by double-clicking in browser
2. SmartWorker3.html: Click nav buttons to switch modules
3. BDI: Add entries → switch views → check performance dashboard
4. Alert: Upload arrival PDF → mark visits → check analytics
5. NoteStandardizer: Paste notes → click Duzenle → verify output
6. F12 console: Check for errors — if onclick doesn't work, likely an alias issue

## localStorage Key Prefixes
| Prefix | Module |
|--------|--------|
| `bdi_YYYY-MM-DD` | Butler Did It daily logs |
| `bdi_archive_YYYYMM` | BDI monthly archives |
| `bdi_guest_notes` | Guest CRM notes |
| `bdi_guest_merges` | Guest profile merges |
| `bdi_pm_rooms` | PM room list |
| `bdi_occ_YYYY-MM-DD` | Occupied room count per day |
| `alert_YYYY-MM-DD` | Butler Alert daily snapshots |
| `alert_archive_YYYYMM` | Alert monthly archives |
| `alert_target` | Alert completion target % |
| `alert_kw_*` | Alert detection keywords |
| `alert_upsell_products` | Upsell product list |
| `alertReasons` | Not-visited reason list |
| `kw_*` | Shared keywords (butler, equip, amenity, etc.) |
| `ir_*` | Inspector Radar settings |
| `mb_*` | Minibar data |
| `exp_*` | Expense data |
| `pd_templates` / `pa_templates` | Email templates |
| `email_pdfs` / `email_images` | Email attachments (EmailCenter) |
| `note_learned_rules` | Note Standardizer learned rules |
| `subcatTemplates` | Note Standardizer sentence templates |
