# Sprint 2 — flow notes

Reading of the source flow in Paper (`Globaldata` → `Sprint 2` → `V2 - 25/8/26 - AG`).
The product is a drug database — 285,529 rows — with a filter model deep enough that the
filter builder, not the table, is the real interface.

## The screen

1440×900. Thin app header with the GlobalData wordmark. Below it either the **results table** or,
once filters exist, a **filter bar** above the table. Filter construction happens in a modal.

## The modal

Two panes, split roughly 60/40.

- **Left — construction.** A segmented control at the top switches `AI filter` / `Manual filter`.
- **Right — Filter builder.** Always present. Empty state reads "Any filters applied will appear
  here. Add a filter manually or using AI." Footer carries `Clear filters` and `Apply filters`.

Both tabs write into the same filter builder. That is the whole idea of the design: AI and manual
are two ways to author one object.

## AI tab

| # | State | What's on screen |
|---|-------|------------------|
| 1 | Empty | "Drug Search / Start typing to create a filter". Suggestion chips: *Phase II drugs*, *Phase III drugs*, *Drugs produced by Northvale Theraputics*, *Oncology drugs with an NPV over $55M*. Input: "Ask anything to create a filter" with a circular submit. |
| 2 | Typed | The query fills the input and it grows to three lines. Chips stay. |
| 3 | Parsed | The exchange becomes a transcript — user message in a tinted bubble, assistant reply restating the query in prose, then `✓ Filters updated`, both timestamped. The filter builder fills with grouped cards. |

Worked example from the file: *"Find generic anti-inflammatory therapies targeting Actin Gamma
Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs
that are withdrawn or archived"* resolves to:

```
DEVELOPMENTAL STAGE   Withdrawn (Marketed) AND Archived (Marketed)
        NOT
DRUG GEOGRAPHY        Austria OR Italy
        AND
TARGET                Actin Gamma Enteric Smooth Muscle
DRUG TYPE             Generic
        AND
DRUG DESCRIPTOR       Antiinflammatory Therapy
```

Operators sit between cards as their own pills and are editable dropdowns, as are the operators
between chips inside a card. Every chip has a remove `×`. So the AI's output is not a black box —
it is the same editable object the manual path produces.

## Manual tab

Progressive disclosure, three levels deep, in a popover anchored to the pill you clicked.

1. **Areas** — pills: Companies, Drugs, Licensing Opportunities, Regulatory Milestones, Sales and
   Forecast, Drugs by Manufacturer, NPV, Advanced Company Watchlist.
2. **Attributes** — a titled panel with its own search: Drug Name, Therapy Area / Indication,
   Development Stage, Drug Geography, Route of Administration, Molecule Type, Target, Mechanism of
   Action, ATC Classification, Drug Type, Mono/Combination Drug, Drug Descriptor, Gene Therapy
   Vector, Application Type, CAS Number. Each row has a `>` into the next level. Longer areas group
   their attributes under non-clickable section labels (*Drug Expiry*, *Constraining Patent*,
   *Review Designation*).
3. **Values** — breadcrumb `‹ DRUGS → THERAPY AREA / INDICATION`, scoped search, checkbox rows each
   with a result count and a `>` for deeper nesting. Footer: `0 SELECTED` / `DONE ✓`.

Selecting a value writes the chip into the filter builder immediately — the popover does not have to
be dismissed first. On dismiss, the area pill gains a count badge.

## Applied state

Modal closes. The filter bar renders the same groups horizontally, with vertical rules between
clusters, a `+` to add another, the result count (`245 Drugs`), `Clear filters` and `Edit filters`.

- **Dropdowns in filter bar** — clicking a group in the bar reopens the value popover inline, so
  filters are editable without going back into the modal.
- **10+ filters** — the bar wraps to a second row and overflows into a `+2` pill. Date filters carry
  a leading operator chip (`between`) followed by the range.
- **Group by** — a `GROUP BY` bar above the table (`Developmental stage ×`, `+`), rows collapse into
  groups with counts, a second grouping can be added from a dropdown (Company / Therapy Area /
  Indication), and groups expand into nested tables.

Table columns: Drug Name, Generic Name, Company, Therapy Area, Indication, Developmental Stage,
Drug Geography. Headers carry a `⋮` menu and, where a filter touches that column, a count badge.

## Screens to build for Idea 1

`results` → `ai-empty` → `ai-typed` → `ai-parsed` → `manual-areas` → `manual-attributes` →
`manual-values` → `manual-selected` → `applied` → `filter-bar-dropdown` → `many-filters` → `group-by`

## Note on Idea 3

The source AI tab already renders as a transcript, so conversational refinement is closer to the
port than first assumed. Idea 3 has to earn its place on what the source does *not* do: multiple
turns that narrow a live result set, a reversible stack rather than a one-shot parse, and branching.
Recorded in DECISIONS.md.
