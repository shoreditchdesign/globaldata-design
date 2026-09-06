# GlobalData platform walkthrough — pharma → menu → database → drill-down

Read-only walkthrough of the live production platform on an authenticated session, 6 Sep 2026.
Viewport ~1600×888 (laptop). Nothing was saved, exported, downloaded or submitted.

> **Path note.** The brief asked for `docs/sprint-2/research/`. While this research was running, a
> concurrent process renamed `sprint-2` → `sprint-3` across the repo (staged in git as renames).
> This file and its screenshots therefore live in `docs/sprint-3/research/`, alongside
> `CLIENT-CONTEXT.md`, which moved with it.

Screenshots referenced below are in [`platform/`](platform/).

---

## Click-by-click path (retrace this)

| # | Where | Action | Result |
|---|---|---|---|
| 0 | `https://login.globaldata.com/Home` | — | A **"Your Profile and Focus"** modal blocks the page on load. Dismiss via the ✕ (top right). |
| 1 | Home | Click **Pharma** under *Industry Intelligence Centers* | Navigates cross-domain to `pharma.globaldata.com/HomePage` |
| 2 | Pharma home | Hover top nav **Databases** | Mega menu (see IA below). Under *Sector Databases → Drugs Database* |
| 3 | Mega menu | Click **Drugs** | `/DrugsSFPartial/Search?tab=tabs-1` — the screener |
| 4 | Screener, left pane *Search Type* | Click **Therapy Area/Indication** | Middle pane *Make Selections* swaps to the therapy tree |
| 5 | Middle pane | Click the **Search Therapy Area/Indication** box, type `breast cancer` | Flat typeahead list of 8 matches |
| 6 | Typeahead | Click **Breast Cancer** | Chip `Breast Cancer (Oncology)` appears in right pane *Confirm your Search* |
| 7 | Middle pane | Retype `lung cancer`, click **Lung Cancer** | Second chip + an **OR** operator control appears between the two |
| 8 | Left pane | Click **Development Stage** | Middle pane swaps; two-level tree (Marketed / Pipeline) |
| 9 | Middle pane | Click **Phase III**, then **Phase II** | Second chip group + an **AND / NOT** radio pair appears *between* the two attribute groups |
| 10 | Right pane | Click **Search** | `/Drugs/ProductsGrid` — results. ~6 s server round trip |
| 11 | Results | Click a column header sort icon | `/Drugs/FilterProductsGrid`, full page reload |
| 12 | Results | Click a drug name (e.g. `utidelone`) | `/DrugsView/ProductView?ProductId=…` — detail page, **opens in a new tab** |
| 13 | Detail | Browser Back (or tab switch) | Returns to the grid with sort, page and refinements intact |
| 14 | Results | Click **Refine Drugs** (top left) | Back to the full screener with all selections intact |

**Click cost.** Landing (login home) → a filtered result set with two attributes and four values =
**12 interactions** (10 clicks + 2 typed strings). The repeatable unit is ~3 clicks per filter
parameter (pick attribute → focus value picker → pick value), plus 1 for Search. At the client's
stated typical 3–4 parameters that is roughly **13–16 clicks and one blind server round trip**.

---

## 1. Information architecture

### Three nested "homes" before you reach data

1. **`login.globaldata.com/Home`** — not a product, an **app launcher**. Headings, verbatim:
   *Industry Intelligence Centers* · *Cross-industry Intelligence Centers* · *Our Corporate Sites* ·
   *Other Industry Intelligence Centers*. On this account only **Consumer Goods** and **Pharma** are
   live; ~24 other tiles are greyed with an orange padlock badge and the footer line
   *"For more information on access to these solutions please contact your account representative."*
   ([01](platform/01-home-intelligence-centers.png))

2. **`pharma.globaldata.com/HomePage`** — "**Pharmaceuticals**", with a *Switch Intelligence Centre*
   link. This is a content/news homepage, not a workspace: carousel, *Reports*, *Latest Analysis*,
   *Curated Company Lists*, *Latest Deals*, and a right rail carrying **"Ava, your AI research
   analyst"** and a **Key Statistics** list of 30 dataset counts (*178,383 Marketed Drugs*,
   *110,174 Pipeline Drugs*, *151,373 Companies*, *1,801,127 Deals* …). Sub-tab strip: `My Tools |
   Competitive Intelligence | 99+ | Sales Intelligence`. Second strip: `Toolbox | Watchlist |
   Compare | Storyboard | +`. ([02](platform/02-pharma-intelligence-centre-home.png))

3. **Top nav (hover mega menus)**, verbatim, left to right:
   `Companies · Diseases · Countries · Databases · Analysis · News · Tools · Services · Webinars ·
   Strategic Intelligence` + `AI Hub` (badged *New*) + the user menu.

### The Databases mega menu

The client's word for a dataset is **"database"**, and they are grouped under two headings —
**Sector Databases** and **General Databases** — plus an **Influencers** list. Sector Databases is
itself subdivided:

- **Drugs Database** — `Drugs`, `Licensing Opportunity` (beta), `Regulatory Milestones Tracker`,
  `Sales and Forecast`, `Likelihood of Approval (LoA)`, `PharmSource` (submenu), `Deals`,
  `Merger Analyzer`, `NPV Analyzer`
- **Lead Sheet** — `Leads`, `Catalyst Calendar`, `Contacts`
- **Trials Intelligence** — `Clinical Trials` (submenu), `Investigators` (submenu), `Sites`,
  `Site Coordinators`, `Enrollment` (submenu), `Feasibility Planner`, `Biomarkers`, `SiteSurvey`
- **World Markets Healthcare** — `Country Profile Matrix`, `Expenditure and Sales Forecast`,
  `Geography Ranking Table`, `Biosimilars Database`
- **Other Sector Databases** — `Epidemiology and Market Size` (submenu), `Digital Marketing`,
  `Patent Analytics` (beta), `Jobs Analytics`
- **Price Intelligence (POLI)** — 7 items
- **General Databases** — 11 items · **Influencers** — 12 items

That is **~60 leaf links in one hover panel, three levels deep in places** (menu → group → item →
submenu). The menu is hover-only and did not open under synthetic mouse events — a keyboard or
assistive-tech user has no obvious route through it.

**A concrete IA defect:** five distinct menu labels — `Drugs`, `Licensing Opportunity`,
`Regulatory Milestones Tracker`, `Sales and Forecast`, `NPV Analyzer` — all point at the **same URL**,
`/DrugsSFPartial/Search?tab=tabs-1`. They are not five databases; they are five top-level groups
inside one screener, presented in the menu as if they were destinations. A user who clicks
"Sales and Forecast" lands on a page titled "Drugs Database" with *Drug Name* pre-selected.

There is also a parallel `/Databases/Index` landing page ("**Discover Databases**") with 20 marketing
cards. Its taxonomy does not match the mega menu's — e.g. *Lead Sheet* and *Merger Analyzer* are
cards here but sit in different groups in the menu.
([03](platform/03-databases-index.png))

### How a database is entered

`/DrugsSFPartial/Search?tab=tabs-1` — the **screener**. Three fixed panes with black headers, left
to right ([04](platform/04-drugs-database-search-landing.png)):

| Pane | Label (verbatim) | Role |
|---|---|---|
| Left | **Search Type** (+ a `Hide all` control) | Accordion tree of attributes |
| Middle | **Make Selections** | Value picker for the *one* attribute currently selected |
| Right | **Confirm your Search** | Selection basket + `Search` / `Clear Search` |

No results are visible on this screen. It is architecturally a screener in exactly Neil's sense:
set criteria up front, then retrieve.

---

## 2. The search and filter model

### Where filters live

A permanent left **sidebar**, not a modal. Top-level groups in *Search Type*:

`Companies` · `Drugs` · `Licensing Opportunity`(Beta) · `Regulatory Milestones` ·
`Sales and Forecast` · `Drugs by Manufacturer` · `NPV` · `Advanced Company Watchlist`

Under **Drugs**, in order: `Drug Name`, `Therapy Area/Indication`, `Development Stage`,
`Drug Geography`, `Route of Administration`, `Molecule Type`, `Target`, `Mechanism of Action`,
`ATC Classification`, `Drug Type`, `Mono/Combination Drug`, `Drug Descriptor`, `Gene Therapy Vector`,
`Application Type`, `CAS Number`, `Chemical Name`, `Free Text Search`, then a sub-heading
**Pipeline Drug Specific** (`Last Development Stage`, `Line of Therapy`, `Recently Added/Updated`,
`Lead Pipeline Drug`) and a sub-heading **Marketed Drug Specific** (`Dosage Form`, `Strength`,
`Marketing Status`, `First Approval Date`, `Dosage Frequency`, `Emergency Use Approval (EUA)`).
**~27 attributes in the Drugs group alone.** `Companies` adds 10 more; every other group adds 5–10.

The accordion is **non-exclusive** — open three groups and the sidebar becomes a 60-row scroll list
in a ~300 px column. Some rows grey out contextually (`Dosage Form` was disabled once pipeline
stages were selected) with no explanation of why.

### How deep the hierarchy goes, and what is at the bottom

Four distinct levels before you touch a value:

```
Search Type group        (Drugs)
└─ attribute             (Therapy Area/Indication)
   └─ value tree root    (Oncology)            ← 24 therapy areas
      └─ value           (Breast Cancer)       ← and deeper: HER2+/HER2−/TNBC variants
```

`Therapy Area/Indication` opens on a 24-row collapsed tree with expand chevrons
([05](platform/05-therapy-area-tree-level-1.png)). Those chevrons are **not present in the
accessibility tree at all** (no `button`, no `image`, no `aria-expanded`) and did not respond to
synthetic clicks in three attempts — see *Could not reach* below. `Development Stage` renders as a
two-level tree already expanded (`Marketed` → 3 leaves; `Pipeline` → 11 leaves) with a
`All / Highest Development Stage` radio pair above it.

### Free-text search — two different things, neither of which is what you'd expect

1. **Per-attribute typeahead**, inside *Make Selections*. Typing `breast cancer` returns eight
   flat suggestions — `Breast Cancer`, `Metastatic Breast Cancer`, `Triple-Negative Breast Cancer
   (TNBC)`, `Human Epidermal Growth Factor Receptor 2 Positive Breast Cancer (HER2+ Breast Cancer)`…
   with **no hierarchy path, no parent, no counts** ([06](platform/06-filter-typeahead-breast-cancer.png)).
   The parent only appears afterwards, on the chip: `Breast Cancer (Oncology)`.

2. **`Free Text Search`**, itself one of the attributes. Labelled **Keyword**, with a scope list:
   `All Fields`, `Drug Description`, `MOA Description`, `Safety Details`, `Efficacy Details`,
   `Chemical Details`, `Sources`, plus a `+` to add another clause
   ([14](platform/14-free-text-search-scoped-to-description-fields.png)). **"All Fields" means all
   *narrative* fields.** It does not search drug names, company names, indications or any structured
   value. An analyst who types a real question here gets prose matches, not a screened list.

3. Separately, a **global header search** exists on inner pages (but *not* on the Pharma homepage).
   It opens a full-screen takeover, *"Search the Pharma Intelligence Center"*, with columns
   *Companies · News · Reports · Related Search Terms* and a **"Search *term* in… Drugs / Clinical
   Trials / Investigators / Insights / Surveys / More Databases"**
   ([16](platform/16-global-search-overlay-separate-path.png)). It is genuinely good — and completely
   disconnected from the screener. You cannot promote a term found here into a filter.
   **Escape does not close it.**

### Boolean — exposed, but in two different grammars

- **Within one attribute:** adding a second value inserts a dropdown between the chips with
  `OR / AND / NOT` ([07](platform/07-boolean-or-and-not-per-value-pair.png)). One operator control
  *per adjacent pair*, so three values give two independent operators and no grouping/parentheses.
- **Between attributes:** a radio pair appears between the chip groups offering only
  **`AND` / `NOT`** — you cannot OR two different attributes
  ([08](platform/08-two-filter-groups-and-cross-attribute-and-not.png)).
- A static footnote states which fields support Boolean at all — 10 of ~27:
  > *"Note: Boolean search is applicable for the following fields: Therapy Area/Indication,
  > Development Stage, Route of Administration, Molecule Type, Drug Geography, Target, Mechanism of
  > Action, ATC Classification, Drug Descriptor and Line of Therapy"*

So the model is: `(a OR b) AND (c OR d)` is expressible; `(a AND b) OR (c AND d)` is not.

### What the screener never tells you

**There is no result count anywhere on the filter screen.** No live preview, no "≈1,091 matches",
no per-value counts in the trees or the typeahead. You commit to `Search`, wait ~6 seconds, and only
then learn whether you produced 12 rows or 12,000.

---

## 3. The results view

`/Drugs/ProductsGrid`, titled **"Drugs | Results"** ([09](platform/09-results-grid-first-row.png)).

- **Refinements** are restated as read-only chips under *Your Refinements* with the `OR`/`AND`
  badges preserved. A blue **Refine Drugs** button top-left returns to the screener.
- **Toolbar (left):** `1 - 10 of 1,091 Drugs` · `Results Analytics +` · `Customize Tables ⊞` ·
  `Export ⌄` · `Integrated Results`
- **Toolbar (right):** `Page 1 of 110` · `Previous` · `Next` · `Go to page [1]` · `>` ·
  `[10 ⌄] Results` (options 10 / 25 / 50 / 100)
- **Default columns (8):** `Drug Name`, `Generic Name`, `Brand Name`, `Company Name`, `Therapy Area`,
  `Indication`, `Development Stage`, `Drug Geography`. Each header carries a **sort** icon and a
  **funnel** icon.

### Overflow — horizontal, and worse, vertical

At 1600 px there is already a **horizontal scrollbar** above the header row, with a thumb roughly
55 % of the track — i.e. the default grid is about 1.8 screens wide before a single column is added.
The first three columns freeze; the rest scroll.

**Customize Tables** ([10](platform/10-customize-tables-column-picker.png)) offers **36 columns**.
The 8 defaults are checked **and disabled** — they cannot be removed. The other 28 (`Alias Name`,
`Route of Administration`, `Molecule Type`, `Target`, `Mechanism of Action`, `ATC Classification`,
`CAS Number`, `Chemical Name`, `Drug Revenue (2025) (US$m)`, `Dosage Form`, `Packaging`, `Sterility`,
…) can only be **added**. There is a `Select All`. There is no reorder, no width control, no saved
view, no grouping. **The grid can only ever get wider.**

The vertical problem is worse and nobody has named it yet. Rows carry **merged cells**: one drug
spans as many sub-rows as it has brand/indication/geography combinations, with the identity columns
blank on every sub-row after the first. So *"1 - 10 of 1,091 Drugs"* renders as **35+ visual lines**,
and after one sort a **single drug (`utidelone`) filled the entire viewport on its own**
([11](platform/11-one-drug-fills-whole-screen-merged-rows.png)). Scroll two screens down and the
Drug Name column is empty — you no longer know what you are looking at. The stated count and the
thing on screen do not correspond.

### What you do with a result set

- **Sort** — per column, but it triggers a **full page reload** (`/Drugs/ProductsGrid` →
  `/Drugs/FilterProductsGrid`), ~6 s.
- **Column funnel** — a second, parallel filter system living in the header row. It did not open a
  visible panel in three attempts (see *Could not reach*). Whether it duplicates or intersects the
  screener's filters is not discoverable from the UI.
- **Results Analytics** — expands *inline above the grid*, pushing results below the fold. It offers
  `View By Chart: [Drugs by Therapy Area]` and `View By Type: [Therapy Area]` with chart/table
  toggles. On my result set it drew **one bar: "Oncology — 1,091"**, and the second panel was still
  a grey skeleton after 20 s ([13](platform/13-results-analytics-single-bar.png)). This is the only
  aggregate view; there is no mean/median/count-by anywhere in the grid itself.
- **Export ⌄** — present as a top-level toolbar affordance. Not opened (write-adjacent).
- **Integrated Results** — unexplained label, no tooltip.
- No row selection, no bulk actions, no compare-from-grid, no saved-view concept in the grid toolbar.

### The one thing that works well

State is preserved server-side. Browser Back from a detail page, and **Refine Drugs** → screener,
both return with sort, page and every chip intact
([15](platform/15-refine-drugs-returns-with-selections-intact.png)). Credit where due — this is
better than most legacy grids.

---

## 4. Drill-down

Clicking a drug name opens `/DrugsView/ProductView?ProductId=287991&ProductType=0,1`
**in a new browser tab** ([12](platform/12-drug-detail-view-utidelone.png)).

It is a single long scrolling page with a left anchor rail of **15 sections**:
`Preview · Key Attributes · Marketed Information · Pipeline Information · Regulatory Milestones ·
Sales and Forecast · Likelihood of Approval (LoA) · Competing Drugs · Manufacturing · Clinical
Trials · Catalyst Calendar · History of Events · Deals · News · History of Changes`.

The Preview gives four identity tiles (Drug/Generic/Brand/Company), a *Last Reviewed on 08 Jun 2026*
stamp, a Sales and Forecast chart, an LoA table (Therapy Area / Indication / Development Stage /
PTSR / LoA), a Catalyst Calendar bar strip, and three count cards (`45 Clinical Trials`, `1 Deals`,
`15 News`). Below: Key Attributes, full drug and MoA descriptions, chemical identifiers, and a
PTSR/LoA benchmark breakdown with per-attribute contribution scores. It is genuinely dense and
useful — the strongest screen in the journey.

**Getting back:** there is **no breadcrumb and no "back to results" link**. The top nav reverts to
the global mega nav; nothing on the page knows you arrived from a 1,091-row result set. Because the
link opens a new tab, the browser Back button is also empty on that tab. The only route back is to
switch tabs manually. Open five drugs to compare and you have five orphan tabs and no way to tell
which result set any of them came from.

---

## 5. Friction, specifically

1. **A profile-editing modal blocks the product on login.** *"Your Profile and Focus"* with
   Geography/Sector/Solutions dropdowns, Job Department, Job Title, Mobile Number, Country and a
   `Save Preferences` button. First thing the user sees. Dismissible, but it is a marketing form in
   front of the tool.
2. **Three homepages before any data.** Launcher → intelligence-centre content homepage → Databases
   index → screener. None of the first three do work.
3. **Five menu labels, one URL.** `Drugs`, `Licensing Opportunity`, `Regulatory Milestones Tracker`,
   `Sales and Forecast` and `NPV Analyzer` all resolve to `/DrugsSFPartial/Search?tab=tabs-1`. The
   menu promises destinations and delivers one screen with a different node pre-selected.
4. **The selected attribute and the selected values live in different panes, and only one attribute
   is visible at a time.** Choosing `Development Stage` replaces the therapy-area tree entirely. This
   is exactly the "lost context / can't have multiple nodes open" complaint Neil made about the
   Sprint 2 modal — **it is already true of the production full-pane version.** The modal was not the
   cause.
5. **Selected values are not marked as selected.** In *Make Selections* there is no checkbox, no tick,
   no highlight on `Phase III` after you pick it. The only evidence a value is chosen is a chip in the
   third pane. There is no way to deselect from the list you selected in.
6. **No counts, anywhere, before Search.** Not per value, not running, not estimated. Every
   refinement is a blind ~6-second bet.
7. **Two filter grammars in one screen.** Within-attribute is a per-pair `OR/AND/NOT` dropdown;
   between-attribute is an `AND/NOT` radio. Different control, different affordance, different
   options, six inches apart. No parentheses, no way to express `(a AND b) OR (c AND d)`.
8. **Boolean availability is announced in a footnote,** not on the controls. You have to read a
   sentence listing 10 field names to learn whether the attribute you're using supports it.
9. **The typeahead strips the hierarchy** it just asked you to navigate. Eight sibling-looking
   strings, no parent, no counts, no disambiguation until after you've committed.
10. **"Free Text Search" does not search the data.** Scoped to Drug Description, MOA Description,
    Safety/Efficacy/Chemical Details and Sources. The label is a trap.
11. **The good search is in the wrong place.** The global header overlay is fast, cross-entity and
    well-organised — and is a dead end: nothing found there can be carried into a screener. It is
    also missing from the Pharma homepage, and Escape does not close it.
12. **"1 - 10 of 1,091" is not what is on screen.** Merged sub-rows mean ten records render as
    thirty-five-plus lines, and one record can exceed a full viewport. Identity columns go blank on
    continuation rows.
13. **The grid overflows horizontally by default and can only get worse.** 8 locked columns already
    need ~1.8 screens; 28 more can be added; none can be removed, reordered or resized.
14. **Sorting costs a full page reload.**
15. **A second, undiscoverable filter system sits in the column headers.** Funnel icons that gave no
    visible response, adjacent to sort icons that reload the page. Guessing which is which is a
    coin flip at that icon size.
16. **Results Analytics is the only aggregate view, it opens above the grid, and it can return a
    single bar.** For a therapy-area-filtered set, "Drugs by Therapy Area" is tautological. No mean,
    median, count-by or pivot exists at grid level.
17. **The detail page has no way back.** No breadcrumb, no result-set context, opens in a new tab so
    Back is dead. Comparing three records means three orphan tabs.
18. **Unlabelled affordances:** `Integrated Results`, `Clip ⌄`, `Toolbox`, `Storyboard`, `99+`, and
    the padlocked tiles all assume prior knowledge or a sales conversation.
19. **Accessibility.** The Databases mega menu is hover-only; the tree expand chevrons are absent
    from the accessibility tree entirely. Neither is reachable by keyboard as far as I could tell.
20. **An open Boolean dropdown persisted across a pane change** and sat on top of the `Clear Search`
    button.

---

## Verdict on the four client claims

| Claim | Verdict | Evidence |
|---|---|---|
| The results grid **"falls off the side of the screen"** | **Confirmed, and understated** | Horizontal scrollbar at 1600 px with 8 default columns; 8 locked + 28 addable columns, none removable or resizable. The unnamed sibling problem is *vertical*: merged sub-rows mean one drug can fill the whole viewport and ten "results" render as 35+ lines ([11](platform/11-one-drug-fills-whole-screen-merged-rows.png)). |
| The filter hierarchy becomes **"sections upon sections upon sections"** | **Confirmed** | Four levels before a value: group → attribute → value-tree root → value, and deeper inside oncology. ~27 attributes under *Drugs* alone; the accordion is non-exclusive so multiple 10–15-row groups stack in one 300 px column. The *Databases* menu is separately 3 levels and ~60 leaves. |
| Users are **"Excel-habituated"** | **Confirmed as a problem, contradicted as a description of the UI** | This is not an Excel-like grid. Excel users expect flat rows, in-place sort/filter, freeze/hide/reorder columns, and aggregates at the top. They get merged cells, server round-trip sorting, locked columns, an undiscoverable header-funnel filter, and one aggregate view buried behind a `+`. Bina's ask — sorting, filtering and aggregate functions at the top level — is not met. It also explains the "customers bypass the UI and download to Excel" behaviour: **Excel is genuinely better at this than the grid is.** |
| Typical usage is **3–4 filter parameters, screening for a list not one record** | **Consistent with the platform's model, contradicted by its defaults** | The screener *is* a screener — pre-search, no live counts, a pane literally called *Confirm your Search*. But: all ~27 attributes are presented as equals with no prioritisation of the common few; 3–4 parameters costs 13–16 clicks; and the **results view is optimised for reading one record, not scanning a list** — 10 rows per page by default, merged cells, giant free-text Indication cells. The product's own defaults fight the stated use case. (I could not verify the usage frequency itself — that needs analytics, not a walkthrough.) |

---

## What I could not reach, and why

- **Expanding a value tree by chevron.** The expand/collapse hitareas in *Make Selections*
  (jQuery-treeview style) are not in the accessibility tree and did not respond to synthetic clicks
  in three attempts. I reached the same values via the typeahead instead, so the depth is documented,
  but I never saw levels 3+ rendered as a tree. Worth 30 seconds of a human's time to confirm how bad
  a fully-expanded oncology branch looks.
- **The column-header funnel.** Three attempts, no visible response. Its behaviour is unknown.
- **The Databases mega menu, visually.** It renders only on real hover; I documented it from the
  accessibility tree, which is complete but gives no sense of its visual density.
- **Export.** Deliberately not opened — write/download adjacent.
- **Saved searches, alerts, Watchlist, Storyboard, Compare, My GlobalData Tools, AI Hub, Ava.** All
  create or modify state. Not touched.
- **Account/profile/billing.** Not touched; the profile modal was dismissed unfilled.

No page on the platform contained text addressed to an automated agent.

---

## The problem, stated plainly

A pharma analyst screening for a shortlist has to hold the whole query in their head, because the
product never shows it to them in one place. The attribute they picked is in the left pane, the
values they're choosing are in the middle pane — unmarked, so nothing looks selected — and the only
record of what they've built is a stack of chips in a third pane. Switch attributes and the middle
pane is wiped. Four levels down a tree, with roughly twenty-seven attributes to choose from and no
counts anywhere, they commit to a six-second search with no idea whether they'll get twelve rows or
twelve thousand.

What comes back reads as "1 – 10 of 1,091" but renders as thirty-five lines, because one drug can
occupy a screenful of merged cells with its name blank on every line after the first. The grid is
already about two screens wide; eight columns are locked on and twenty-eight more can only be added.
Open a record and it launches in a new tab with no breadcrumb, so the result set they spent sixteen
clicks building is now somewhere behind them.

The filtering isn't the problem on its own, and neither is the grid. The problem is that the query,
the result set and the record are three disconnected places, and the user is the only thing carrying
context between them. That is why they export to Excel.
