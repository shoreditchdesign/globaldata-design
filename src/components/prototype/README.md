# Prototype components

Two kinds of thing live here.

**Harness** — `Explorer`, `SprintTable`, `CompareView`, `PrototypeScreen`. The review scaffolding
around a prototype. Not part of the product being designed; you should not need to touch it.

**Shared product surface** — `ProductChrome`, `StageBadge`, `FilterPill`, `OperatorWord`,
`product-areas`. These are the parts of the *product* that every Sprint 3 direction shows. They are
shared because four directions get reviewed in one session, and anything that drifts between two of
them reads to the client as four different products rather than four proposals for one.

Everything below is presentational and static. No handlers, no data fetching, no state beyond an
active-state prop. If you need interaction, build it inside your idea.

---

## `ProductChrome`

The product shell: wordmark, area tabs, global search, notifications, account. Every screen in every
direction sits inside it. There is no per-idea header any more — the four local `AppChrome`
components were deleted.

```tsx
import { ProductChrome } from "@/components/prototype/ProductChrome"

export function MyScreen() {
  return (
    <ProductChrome activeArea="Drugs" body="column">
      {/* your screen */}
    </ProductChrome>
  )
}
```

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `children` | `ReactNode` | — | The screen, rendered under the chrome. |
| `activeArea` | `ProductArea` | `"Drugs"` | Which area tab reads as current. Must be one of the eight canonical areas. |
| `search` | `ReactNode` | — | The global search slot. Omit for the shared placeholder; pass a node to make the field real. |
| `searchPlaceholder` | `string` | `"Search all of GlobalData"` | Text of the placeholder field. Ignored when `search` is set. |
| `actions` | `ReactNode` | — | Extra header controls, rendered between the search and the notification/account cluster. |
| `user` | `string` | `"ND"` | Initials in the account avatar. Leave it alone unless a screen needs a named persona. |
| `body` | `"column" \| "row" \| "scroll"` | `"column"` | How the region under the chrome lays out. See below. |
| `className` | `string` | — | Passed to the outer full-height wrapper. |

### `body`

The chrome owns the top of the viewport; this says what the rest does.

- `"column"` — `flex min-h-0 flex-1 flex-col`. Full-height regions stacked vertically, each
  scrolling itself. The page never scrolls. **Ideas 3 and 4.**
- `"row"` — `flex min-h-0 flex-1`. Full-height regions side by side, e.g. a filter panel next to
  results. **Idea 2.**
- `"scroll"` — `relative min-h-0 flex-1 overflow-y-auto`. The whole body scrolls as one page, the
  way the incumbent product does. `relative`, so an absolutely-positioned popover inside the body
  anchors to the top of the content area rather than the page. **Idea 1.**

### The search slot

`search` is a real slot, not decoration. The live platform ships a good cross-entity
natural-language search in the header, and the fact that nothing found in it can be carried into a
screener is an argument at least one direction is going to make on screen. When that happens, it
gets made by putting a working control in this slot — not by drawing a second header.

The slot is `SEARCH_SLOT_WIDTH` (exported, currently `w-[264px]`) and expects an `h-8` control.

```tsx
<ProductChrome search={<MyLiveSearch />} />
```

### The area tabs

Two rows on purpose. `Advanced Company Watchlist` is twenty-six characters and will not sit inline
beside a wordmark and a search field without being shortened into something the product does not
call it. So identity, search and account own the first row; the eight areas own the second, at full
length. All eight fit above roughly 1000px; below that the row scrolls sideways with the scrollbar
hidden.

The tabs are not links. Every screen is one fixed state, so `activeArea` is the only thing that
changes.

## `product-areas`

```ts
import { productAreas, type ProductArea } from "@/components/prototype/product-areas"
```

The canonical eight, in the order the live platform lists them:

> Companies · Drugs · Licensing Opportunities · Regulatory Milestones · Sales and Forecast ·
> Drugs by Manufacturer · NPV · Advanced Company Watchlist

Drugs is one of eight peers, not a parent. This is the same list a filter can be built against, so
Idea 1's manual-filter pane and Idea 2's first Miller column read from it too — the header and the
filter surface cannot say different things about what the product contains.

**Do not invent a shorter list.** Every direction had one before this was shared, and no two of them
agreed. If a direction genuinely needs a different vocabulary, that is a conversation, not a local
constant.

## `StageBadge`

```tsx
<StageBadge stage={row.stage} />
<StageBadge stage={row.stage} className="h-[18px] px-1.5" />  // Idea 4's dense grid
```

A development stage — Discovery, Preclinical, Phase I/II/III/IV, Marketed, Withdrawn. Used by the
results grids in Ideas 2, 3 and 4.

Deliberately one size. If your grid needs it tighter, pass spacing through `className`; do not add a
variant. Idea 1's incumbent table shows the stage as a plain cell rather than a badge, which is
correct — it is a faithful port of the design being argued against.

## `FilterPill` and `OperatorWord`

```tsx
import { FilterPill, OperatorWord } from "@/components/prototype/FilterPill"

<OperatorWord>Therapy area is</OperatorWord>
<FilterPill removeLabel="Remove Dermatology">Dermatology</FilterPill>
<OperatorWord>or</OperatorWord>
<FilterPill removeLabel="Remove Cardiovascular">Cardiovascular</FilterPill>
```

`FilterPill` is an applied filter with its own remove control. It takes children rather than a
label, because what goes inside differs by direction: a bare value in Idea 2, a whole
subject–operator–value phrase in Idea 4, a value and its count in Idea 1.

| Prop | Type | Default |
|---|---|---|
| `children` | `ReactNode` | — |
| `variant` | `"outline" \| "muted"` | `"outline"` |
| `removable` | `boolean` | `true` |
| `removeLabel` | `string` | `"Remove filter"` |
| `className` | `string` | — |

`variant="muted"` is the incumbent's plainer chip — filled, no border, larger type. Idea 1 uses it
so it can read as the current product without forking the component. Everything else uses
`"outline"`.

`OperatorWord` is a plain-language connective — `is`, `and`, `or`, `is not`. Muted and unstyled on
purpose: the values are the objects you grab, the words are the grammar holding them together.

**Idea 3's operator words are a different animal** and stay local to Idea 3. They are interactive
dropdowns carrying that direction's entire argument, they sit inline in running prose at 22px with
baseline alignment and dotted underlines, and flattening them into this one would destroy the
direction. Same for Idea 1's `OperatorPill` (the incumbent's `AND`/`OR`/`NOT` Boolean chip) and Idea
4's `ValuePills` (multi-value cells in a grid lane, not filters).

---

## Adding to this directory

The test is: **would a client notice if this looked different between two directions?** If yes,
share it. If it is used once, it belongs to its idea. A component with a `variant` per idea is a
sign it should have stayed local.
