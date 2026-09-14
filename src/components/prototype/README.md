# Prototype components

Two kinds of thing live here.

**Harness** — `Explorer`, `SprintTable`, `CompareView`, `PrototypeScreen`. The review scaffolding
around a prototype. Not part of the product being designed; you should not need to touch it.

**Shared product surface** — `ProductChrome`, `StageBadge`, `FilterPill`, `OperatorWord`,
`product-areas`, `motion`. These are the parts of the *product* that every Sprint 3 direction shows.
They are shared because four directions get reviewed in one session, and anything that drifts
between two of them reads to the client as four different products rather than four proposals for
one. `motion` is the same argument applied to time rather than colour.

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
changes. The active tab is `text-foreground` with a `brand` underline, not a filled or coloured
label — an underline tab is one of the selected states the repo-wide colour law washes rather than
fills solid; see `CLAUDE.md`.

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
```

A development stage. Used by the results grids in Ideas 2, 3 and 4.

**Stage is an ordering, not a label.** The colour encodes position in the pipeline — one hue, the
product's accent, deepening as the drug advances — so maturity is scannable down a column without
anyone learning a key. Two values leave the ramp because they mean something it cannot say.

| Rung | Stages | Reads as |
|---|---|---|
| `pre` | Discovery, Preclinical | grey — not in the clinic |
| `early` | Phase I | palest blue |
| `mid` | Phase II | |
| `late` | Phase III | |
| `final` | Phase IV, Pre-registration | deepest blue |
| `live` | Approved, Marketed | green — it arrived |
| `stopped` | Withdrawn, Discontinued, Suspended | rose — it stopped |
| `dormant` | Archived | grey, quieter than `pre` |

Phase IV and Pre-registration share the last rung on purpose: five steps of one hue is more than an
eleven-pixel badge can hold apart, and both mean *late* to the ordering. An unknown stage falls back
to `pre` rather than to an error state.

Every fill is under 0.06 chroma. The badges are tints; the accent proper is solid. They appear
within a few pixels of each other in three directions and must not compete.

This ramp sits outside the repo-wide selected-state colour law in `CLAUDE.md`: it is data
encoding, not a selection, so it keeps its own tinted rungs at the brand hue regardless of whether
a checked control or a selected tab nearby is filled solid or washed that sprint.

`stageTone(stage)` is exported for anything that has to match a badge without being one — a legend,
a count, a group header.

Deliberately one size. If your grid needs it tighter, pass spacing through `className`; do not add a
variant. Idea 1's incumbent table shows the stage as a plain cell rather than a badge, which is
correct — it is a faithful port of the design being argued against, and the live product has no
status colour at all.

## Disabled buttons

`button.tsx`'s disabled state is a pale step of the brand itself, not flat grey and not the accent at
reduced opacity: `brand-disabled` (`oklch(0.915 0.03 264)`) for the fill, `brand-disabled-foreground`
(`oklch(0.57 0.08 264)`) for the label, no shadow, no press nudge, cursor `not-allowed`. Outline,
ghost and secondary variants keep their resting fill and only drop the label, to neutral
`control-disabled-foreground` (`oklch(0.63 0.01 258)`) — there's no solid fill on those for a grey
label to clash with. Every direction inherits both from the one component rather than picking its
own opacity value. Idea 1's hand-rolled send button in `AiPane.tsx` matches it locally for the same
reason `FilterPill` variants exist here: a control that looks different between two directions reads
as inconsistency, not variety.

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
| `variant` | `"applied" \| "excluded" \| "muted"` | `"applied"` |
| `removable` | `boolean` | `true` |
| `removeLabel` | `string` | `"Remove filter"` |
| `className` | `string` | — |

The variants say what the pill *means*, not what it looks like.

- `applied` — a condition that is on. Carries the accent — `brand-tint` fill, `brand-border` edge,
  `brand-ink` text — because that is what "on" looks like everywhere in this product, chips
  included: the repo-wide colour law spends solid brand on primary buttons, checked controls and
  links, but a chip stays the tinted, bordered shape it always was.
- `excluded` — a condition that takes rows away. It cannot look identical to one that keeps them; a
  bar of grey chips where half are `is not` is a bar you have to read word by word.
- `muted` — the incumbent's plainer chip, filled, no border, larger type. Idea 1 uses it so it can
  read as the current product without forking the component.

`OperatorWord` is a plain-language connective — `is`, `and`, `or`, `is not`. Muted and unstyled on
purpose: the values are the objects you grab, the words are the grammar holding them together.

**Idea 3's operator words are a different animal** and stay local to Idea 3. They are interactive
dropdowns carrying that direction's entire argument, they sit inline in running prose at 22px with
baseline alignment and dotted underlines, and flattening them into this one would destroy the
direction. Same for Idea 1's `OperatorPill` (the incumbent's `AND`/`OR`/`NOT` Boolean chip) and Idea
4's `ValuePills` (multi-value cells in a grid lane, not filters).

## `motion`

```ts
import {
  motion, resolveMarks, settleClass, liftClass, tintClass,
  staggerDelay, useStagedSequence, useSettle, usePrefersReducedMotion,
} from "@/components/prototype/motion"
```

The timing vocabulary, lifted out of Idea 3's resolve — the transition where the typed request
lights up phrase by phrase, hardens into pills and dissolves into the sentence. That was the piece
of motion the client singled out, and what makes it work is not the effect, it is the beat: a short
pause before anything moves, a stagger small enough to read as one gesture rather than a queue, and
a curve that decelerates hard so things *arrive* rather than slide.

If Idea 2 ticks a value at one speed and Idea 4 accepts a proposal at another, the set reads as
three products. So the numbers live here and the directions spend them.

| Export | What it is |
|---|---|
| `motion` | `quick` 160, `settle` 300, `reflow` 420, `handover` 150, `stagger` 70, `staggerCap` 8, `hold` 900 (ms) |
| `resolveMarks` | `highlight` 180, `structure` 760, `done` 1400 — Idea 3's timeline, from mount |
| `settleClass` / `liftClass` / `tintClass` | className fragments pairing a duration with a curve |
| `staggerDelay(i)` | inline `transitionDelay` for item `i`, capped at `staggerCap` |
| `useStagedSequence({ marks, done, onDone })` | returns how many marks have passed |
| `useSettle(signal, hold)` | true for a beat after `signal` changes — the "that just happened" flag |
| `usePrefersReducedMotion()` | for the rare case where reduction has to change behaviour, not just transitions |

Two curves, `ease-settle` and `ease-lift`, are Tailwind utilities defined in `globals.css`.

Spent so far: Idea 3's resolve (the source), Idea 2's Miller rows lighting as the agent ticks them,
Idea 4's proposal card lighting as it lands on the grid, Idea 4's thinking progress bar climbing on
`resolveMarks`' own timings as a turn runs, and the stagger across a plan card's step rows as they
tick from pending to done.

**Reduced motion.** The three class fragments all carry `motion-reduce:transition-none`, so a reader
who has asked for less motion gets the end state with no interpolation and never a half-drawn one.
`useSettle` deliberately does *not* gate rendering — the value, the column and the count are correct
whether or not the flash is drawn. Reach for `usePrefersReducedMotion` only when the reduction has
to change what a component does.

---

## Adding to this directory

The test is: **would a client notice if this looked different between two directions?** If yes,
share it. If it is used once, it belongs to its idea. A component with a `variant` per idea is a
sign it should have stayed local.
