# Sprint 1 deck notes — search-and-filter design approaches

Source: files listed in the task, all read in full (PDFs via page-image extraction,
HTML decks via markup/heading extraction). None modified; `globaldata-dev` is untouched.

## Headline answer

**No. The four Sprint 1 design approaches (including "Approach 1" — the side-nav
accordion tree with chips and live results, the one Neil Dodgson picked) do not
appear anywhere in these eight files.** There is no design content of any kind in
this file set — no wireframes, no approach names, no filter-rail layout, no results
grid, no competitor benchmarking, no scoring framework. Every one of the eight files
is dev-track: repository/tooling, the React component library, Storybook, CI/CD,
and (for Sprint 2) a "Modal Dialog" as a generic UI *component* — unrelated to a
search-and-filter modal design.

This is the single most useful finding: the four approaches must be recovered from
the Paper file or another source, not reconstructed from this deck set.

## Per-file findings

- **`Sprint 1 - Front-End Foundations.pdf`** (6 pp.) — Dev-track. Sprint 1 planning
  doc: React/Next.js architecture, monorepo layout, token pipeline, roadmap phases,
  decisions-scheduled table (Tailwind vs CSS Modules, versioning, data grid,
  deployment). No design/UX content.
- **`Sprint 1 - Recommendations.pdf`** (2 pp.) — Dev-track. Tailwind vs CSS Modules
  comparison table and a Playwright-vs-Chromatic visual-regression recommendation.
  No design/UX content.
- **`Sprint 1 - Walkthrough.md`** — Dev-track. Presenter notes for a repo/Storybook
  demo call (token pipeline, component verification, CI). No design/UX content.
- **`S1 - Final Walkthrough.html`** — Dev-track. The slide version of the walkthrough
  above: repository, tokens, component library foundation, verification, visual
  regression (Playwright/Chromatic), CI/CD. No design/UX content.
- **`S1 - React vs Stencil.html`** — Dev-track. Framework-choice deck: React/Next.js
  vs Stencil/Lit, abstraction-layer cost, and how Salesforce/Adobe/IBM/LSEG/Atlassian
  structure their component platforms. No design/UX content.
- **`SPRINT-2-WALKTHROUGH.md`** — Dev-track. Presenter notes for the Sprint 2 demo:
  Table/AG Grid, Modal Dialog (a generic dialog *component*, not a search-and-filter
  concept), Login Form, Carousel, CSS-only animation.
- **`Sprint 2 wrap-up.html`** — Dev-track. Matches the outline below; component
  library expansion.
- **`SPRINT-2-DECK-OUTLINE.md`** — Dev-track. Confirms Sprint 2 is a 10-slide deck
  entirely about the atomic-design component library (Table, Modal Dialog, Carousel,
  Login Form) — recap of Sprint 1 decisions, scope, build order, live-demo plan,
  accessibility, then dedicated Table/Modal Dialog/Carousel slides, closing with
  next steps (visual regression, CI/CD handover, continued Storybook coverage).

## Answers to the specific hunt items

1. **Four Sprint 1 approaches** — not present. Not named, not described, not implied.
2. **Approach 1 detail** (rail/results proportions, chip placement, tree depth,
   open/closed states) — not present.
3. **Results grid** — not present as a design proposal. The only "grid" in this set
   is AG Grid, a dev/data-table *implementation* detail (Sprint 2), unrelated to the
   search-results-grid concept from the sprint review.
4. **Evaluation criteria / scoring framework for the four approaches** — not present.
   The only comparison tables in this set score *tooling* decisions (Tailwind vs CSS
   Modules; Playwright vs Chromatic), not design approaches, and use a two-column
   pros/considerations format, not a weighted scorecard — this format is not
   evidence of a reusable scoring convention for design options.
5. **Competitor benchmarking** — not present in these files. The only outside-company
   references are in `S1 - React vs Stencil.html`, and they benchmark *engineering
   platform choices* (Salesforce Lightning Web Components, Adobe React Spectrum /
   Spectrum Web Components, IBM Carbon, LSEG Element Framework/Forge, Atlassian
   Atlaskit) — not products benchmarked for search-and-filter UX.
6. **How Sprint 2 was framed** — Sprint 2 is titled "Component Library Expansion"
   and is scoped entirely around atomic-design component delivery (atoms →
   molecules → organisms: Table, Modal Dialog, Carousel, Login Form, Navigation Bar,
   etc.), continuing directly from Sprint 1's dev-platform work. It does **not**
   pick up the search-and-filter direction, Approach 1, or any design exploration
   from the Sprint 1 review. "Modal Dialog" in Sprint 2 is a generic, reusable
   dialog UI component (demoed via a "Profile & Focus — Example Composition" story
   with chips, focus trap, and Escape handling) — a component-library deliverable,
   not the search-and-filter modal concept referenced in the project background, and
   no design alternatives are shown alongside it; it's presented as a single build,
   not a decision.

## Conclusion for the new designer

This eight-file set is exclusively the *dev* track (`globaldata-dev`'s engineering
deliverables: tooling, component library, Storybook, CI/CD). It contains nothing
about the search-and-filter design sprint, the four directional approaches, or
Approach 1's specifics. The rebuild of Approach 1 will need to be sourced from the
Paper file (or any other design-track artifact) and exported by hand, exactly as
flagged as a possibility in the task brief.
