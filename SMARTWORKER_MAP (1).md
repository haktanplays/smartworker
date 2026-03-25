# SmartWorker Codebase Map
> Auto-generated map for efficient Claude context usage.
> **Total: 9181 lines** | File: `smartworker.html`

---

## FILE STRUCTURE OVERVIEW

| Section | Lines | Description |
|---------|-------|-------------|
| External Libs | 1-16 | pdf.js, xlsx-js-style (inline), jszip, pptxgenjs, jspdf |
| CSS | 17-96 | Global styles |
| Nav Bar | 97-115 | Module navigation buttons |
| HTML Pages | 117-1010 | All module UI/HTML |
| Settings HTML | 1010-1431 | Settings page (templates, keywords, etc.) |
| JavaScript | 1432-9179 | All application logic |

---

## HTML PAGES (UI)

| Module | Lines | Page ID |
|--------|-------|---------|
| Letters (Mektuplar) | 117-160 | `page-letters` |
| Traces Board | 162-178 | `page-traces` |
| Equipment Tracking | 180-187 | `page-equipment` |
| Passionately Yours | 189-212 | `page-py` |
| Butler Did It | 214-274 | `page-didit` |
| Itinerary | 276-313 | `page-itinerary` |
| Note Standardizer (PreArr Takip) | 315-427 | `page-preArr` |
| Inspector Radar | 429-486 | `page-radar` |
| Post-Departure | 488-526 | `page-postdep` |
| Pre-Arrival | 528-566 | `page-prearr` |
| Minibar | 568-799 | `page-minibar` |
| Expense | 803-907 | `page-expense` |
| Butler Alert | 911-964 | `page-alert` |
| Shift Handoff | 966-1008 | `page-handoff` |
| Settings | 1010-1431 | `page-settings` |

---

## SETTINGS HTML (inside page-settings)

| Section | Lines | Description |
|---------|-------|-------------|
| Traces Board settings | 1018-1054 | Keyword categories for trace parsing |
| Butler Did It settings | 1056-1078 | BDI keywords |
| Inspector Radar settings | 1080-1189 | Scoring weights, Forbes model toggles |
| Note Standardizer settings | 1191-1229 | Template editing for preference form |
| General settings | 1231-1395 | Butler names, PY keywords, signature |
| Expense settings | 1396-1431 | Categories, budget, vendors |

---

## JAVASCRIPT MODULES

### Core / Shared (1432-1598)

| Section | Lines | Key Functions / State |
|---------|-------|----------------------|
| Inline XLSX lib | 8-13 | `XLSX` global (minified, ~1400 lines) |
| State variables | 1444-1458 | `guests[]`, `traces[]`, `pyGuests[]`, `b2bMap{}`, `SIG`, `DEF_KW` |
| Utility functions | 1460-1468 | `getTomorrow()`, `fmtDate()`, `cap()`, `esc()`, `getKW()`, `setKW()` |
| Navigation | 1470-1503 | `showPage(p)` |
| Letter tab switching | 1505-1512 | `switchLetterTab(t)` |
| Drag & Drop | 1514-1526 | Generic drag-drop setup |

### Letters Module (1527-2390)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Arrival PDF parsing | 1527-1568 | `handleArrPDF()`, `processArrEntries()` |
| Excel import | 1570-1573 | `handleXLS()`, `parseExcel()` |
| Manual entry | 1574-1578 | `loadSample()`, `parseManualAndRender()` |
| Letter generation | 1579-1581 | `genLetter(g, ds)` |
| Guest table | 1582-1597 | `renderGuestTable()`, `setAllType()`, `removeGuest()`, `updGF()` |
| Download letters/envelopes | 2383-2390 | `downloadLetters()`, `downloadEnvelopes()` |

### Traces Module (1599-1782)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Trace PDF parsing | 1599-1681 | `handleTracePDF()`, `parseTracePDF()` |
| Categorization | 1682-1703 | `normTR()`, `categorizeTraces()` |
| Trace table render | 1704-1763 | `renderTraceTable()` |

### Equipment Module (1765-1782)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Equipment table | 1765-1782 | `renderEquipTable()` |

### Passionately Yours (PY) Module (1784-2055)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| PY keyword tags | 1784-1792 | `renderPyKWTags()` |
| Res Detail PDF parser | 1793-1938 | `handleResDetailPDF()` |
| PY table render | 1939-1968 | `renderPYTable()` |
| PY download (PPTX) | 1969-2055 | `downloadPY()` |

### Butler Did It (BDI) Module (2056-2381)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| VAC PDF parsing | 2056-2109 | `handleVacPDF()` |
| VAC guest display | 2110-2261 | `showVacGuest()` |
| BDI log render | 2262-2339 | `renderBdiLog()` |
| BDI downloads | 2340-2381 | `downloadDidIt()`, `downloadDidItXlsx()` |

### Itinerary Module (2392-2640)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| State & tab switch | 2392-2423 | `switchItinTab()`, `handleItPhoto()` |
| Room/day rendering | 2424-2505 | `renderItRooms()`, `renderItDays()`, `renderItPreview()` |
| PPTX export | 2557-2640 | `exportItPPTX()` |

### Shared Res Detail Parser (2641-2991)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Core parser | 2641-2991 | `parseResDetail(buf)` — extracts guest data from Opera Res Detail PDF |

### Central Module Feed (2992-3190)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Feed orchestrator | 2992-3190 | `feedAllModules()` — distributes parsed data to Letters, Traces, PY, Radar, Alert |

### Note Standardizer (Pre-Arrival Takip) (3191-4155)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Field map | 3198-3328 | Static field definitions for preference form categories |
| Template settings | 3329-3405 | `renderTemplateSettings()` |
| Tab switching | 3406-3419 | `switchNoteTab()` |
| Pre-Arr PDF handler | 3420-3498 | `handlePreArrPDF()` |
| Tag/trace rendering | 3499-3599 | `renderNoteOutput()` |
| Web Notes parser | 3600-3774 | `parseNoteDate()`, web notes standardization logic |
| Preference text parser | 3775-3945 | `parsePrefText()` |
| Issue standardizer | 3946-4155 | `parseIssues()`, `renderIssueCards()` |

### Inspector Radar (4156-5205)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Date parsing | 4166-4170 | `parseDDMMYY()` |
| Radar engine | 4165-4450 | Scoring algorithm |
| Forbes model | 4451-4619 | Forbes inspection scoring |
| Radar UI | 4620-4841 | `renderRadarTable()`, `renderRadarCards()` |
| Radar settings | 4842-4877 | Settings rendering |
| Radar exports | 4878-4927 | Export functions |
| Mind Tree PDF | 4928-5205 | `renderMindTreePDF()` — Raffles Gold theme PDF |

### Post-Departure Module (5206-5626)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Full module | 5206-5626 | Post-departure email workflow, rendering, EML generation |

### Pre-Arrival Module (5627-5963)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Full module | 5627-5963 | Pre-arrival email workflow, rendering, EML generation |

### Email Templates & EML Generator (5964-6239)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Email templates | 5964-5980 | Base64 HTML templates |
| EML generator | 5981-6239 | `generateEML()`, `downloadEML()`, `buildAndDownloadEML()` |

### Butler Alert Module (6240-6784)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| State | 6240-6260 | `alertList[]`, `alertFilter`, `alertSortKey`, etc. |
| Core functions | 6260-6784 | Alert management, filtering, rendering, XLSX export |

### Shift Handoff Module (6785-6911)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| Summary builder | 6787-6800 | `getHandoffSummary()` |
| Full module | 6785-6911 | Handoff log, export, import |

### Minibar Module v2 (6912-8558)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| State & constants | 6914-6930 | `MB_CATS`, `MB_CAT_COLORS`, `mb_currentMonth`, `mb_currentYear` |
| Helpers | 7017-7068 | Range helpers, aggregated data |
| Range/Compare toggle | 7069-7127 | `mbToggleRange()`, `mbToggleCompare()` |
| Tab/Month switch | 7128-7166 | `mbShowTab()`, `mbSwitchMonth()` |
| Status/Stats/KPI | 7167-7188 | `mbRenderStatus()`, `mbRenderStats()`, `mbRenderQuickKpi()` |
| Data Entry table (4-cat) | 7189-7253 | `mbRenderTable()` |
| Qty update & save | 7244-7281 | `mbUpdQty()`, `mbSaveData()`, `mbClearMonth()` |
| Render all | 7282-7304 | `mbRenderAll()` |
| **Analytics** | **7305-7953** | `mbRenderAnalytics()` — KPI, MoM, Top sellers, Zero-sellers, Consistency, Heatmap, Category, Rebate, Trend, PAX, Monthly comparison |
| Targets | 7954-8015 | `mbGetTargets()`, `mbSaveTargets()`, `mbRenderTargetTable()` |
| Paste Grid (bulk import) | 8016-8119 | `mbParsePaste()`, `mbApplyPaste()`, `mbClearPaste()` |
| Price Editor | 8120-8194 | `mbRenderPrices()`, `mbPriceChanged()`, `mbSavePrices()` |
| PDF Parser | 8195-8324 | `mbHandlePdf()`, `mbParsePdfItems()` |
| XLSX Export | 8325-8546 | `mbDownloadXLSX()` |
| Init (IIFE) | 8547-8558 | Self-executing init block |

### Expense Module (8559-9175)

| Section | Lines | Key Functions |
|---------|-------|---------------|
| State & constants | 8559-8579 | `EXP_CATEGORIES_DEFAULT`, `expenseList[]`, etc. |
| Init & categories | 8580-8600 | `expInit()`, `expPopulateCategories()` |
| Tab/Month switch | 8601-8630 | `expShowTab()`, `expSwitchMonth()` |
| Save/Load/Render | 8631-8718 | `expSave()`, `expLoad()`, `expRenderAll()`, `expRenderBudget()`, `expRenderList()` |
| Invoice PDF parser | 8733-8922 | `expParseInvoicePdf()`, vendor detection |
| Receipt quick entry | 8923-8996 | `expAddReceipt()`, `expRepeatLast()` |
| Excel export | 8997-9135 | `expDownloadTemplate()`, `expDownloadXLSX()` |
| Settings | 9136-9170 | Settings rendering |
| Handoff integration | 9171-9175 | Handoff patch |

---

## STATE VARIABLES (Key globals)

| Variable | Type | Description |
|----------|------|-------------|
| `guests` | Array | Parsed guest list (Letters module) |
| `traces` | Array | Parsed traces (Traces module) |
| `pyGuests` | Array | Passionately Yours guest list |
| `b2bMap` | Object | Room → B2B note mapping |
| `alertList` | Array | Butler Alert entries |
| `expenseList` | Array | Expense entries |
| `SIG` | String | GM signature (base64) |
| `mb_currentMonth` | Number | Active minibar month |
| `mb_currentYear` | Number | Active minibar year |
| `exp_currentMonth` | Number | Active expense month |

---

## NOTES
- All data stored in `localStorage` (no backend)
- Single-file app — all HTML, CSS, JS in one file
- External libs loaded via CDN: pdf.js, jszip, pptxgenjs, jspdf
- XLSX lib is inline (minified, lines 8-13, ~1400 lines of minified code)
