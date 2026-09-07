# Idea 3 — Query as a sentence

Companion to `IDEA-3-EVIDENCE.md`, which holds the quotes this direction was built from. This
document is for walking a client through the prototype.

## In one sentence

You describe the drugs you want in plain English, and what comes back is not a chat reply but the
query itself, written as one editable sentence — every value a pill you can change, every piece of
logic an ordinary word you can flip.

## What we are trying to achieve

This is the direct attempt at the question that has been asked in nearly every design call and never
answered: how do you combine natural language with a user who wants to structure and verify their
search? The answer proposed here is that they are not two modes. There is one query, and language is
how you write it the first time.

Against the measured baseline: the live product takes about **3 clicks per filter parameter** and
**12 interactions** to reach a two-attribute, four-value set, with no counts and a blind six-second
commit. The worked example in this prototype carries **seven conditions** — drug type, descriptor,
target, geography, stage, route and molecule type. Built the way the product works today, that is
somewhere north of twenty clicks plus the commit. Here it is **one typed sentence**, and correcting
any part of it afterwards is two clicks: open the pill, tick or untick a value.

The other half of the goal is trust, and it is the harder half. The sentence is designed to be
*read*, not just accepted:

- The logic is in the words. `targeting`, `excluding`, `in`, `taken`, `limited to` are dropdowns
  with plain-English explanations underneath ("Drop drugs marketed in these countries"). There is no
  `AND`/`OR`/`NOT` radio group anywhere on the screen.
- Every value dropdown lists the alternatives with their counts, so you can see what you did not
  pick.
- The line underneath shows the prompt the sentence was read from, so the interpretation and the
  request sit next to each other.
- A `Filters` toggle redraws the identical query as conventional filter groups, for anyone who wants
  to check it in a familiar shape. It is a swap, not a second panel.

There is also an argument from what already exists: the platform ships a fast, genuinely good
natural-language search in the global header, and nothing found in it can be carried into a
screener. The honest framing of this direction is not "let us invent AI search" — it is "you already
built the good search and orphaned it."

## How it differs from the other three

All four answer the same question — how do you get from 285,529 drugs to a set you can work with —
and the difference between them is **where the query lives**.

- **Here, the query lives in one line of English above the results.** There is no filter panel, no
  tree, no column of attributes. Fewest interactions of the four, and the only one that answers the
  natural-language question directly.
- **Idea 1 — the incumbent** already had an AI tab, and it is the part of Sprint 2 that drew
  questions rather than criticism. The difference is that there, the AI wrote filters into a builder
  panel and left a chat transcript beside it, so the query existed in two places and you had to
  reconcile them. Here there is one object: the sentence, or the same clauses drawn as filters —
  never both at once.
- **Idea 2 — Full-pane screener** is the opposite trade. Its query lives in a permanent panel of
  columns beside the results; a parameter costs two clicks rather than a typed phrase. What it buys
  for those clicks is browsability and certainty: all 27 attributes under Drugs are visible and
  counted, and you never have to know the right word to find one. This direction gives that up —
  nothing on screen tells you what you could have asked for, beyond four suggested prompts.
- **Idea 4 — Results-first** has no query surface at all; you filter from the grid's column headers.
  Both this and Idea 4 avoid a dedicated filter panel, but for opposite reasons: Idea 4 assumes the
  user wants to see data first and narrow it by hand, this one assumes they can state the whole
  screen up front and want it in one move. Idea 4 also cannot express negation or "or" across
  attributes; the sentence can — `excluding Austria or Italy` is one of the seven clauses in the
  worked example.

Stated plainly, as the brief does: this is the fewest clicks and the highest trust risk of the four.

## What is built, and what is not

**One screen, at `/sprint-3/idea-3/sentence`.** It opens on a resolved query of seven conditions —
453 drugs of 285,529 — with the results underneath.

**What responds to a click:**

- **Every value pill.** Opening one shows that attribute's values with counts and ticks. Ticking or
  unticking changes the sentence and moves the big number.
- **Every logic word.** `excluding` ⇄ `only in`, `targeting` ⇄ `not targeting`, `in` ⇄ `not in` —
  each with its plain-English gloss. Flipping one from include to exclude changes the count.
- The `or` between two values, which can become `and`.
- `+ condition`, which appends a further clause; `Remove this condition`, at the bottom of any value
  dropdown, which drops one.
- `Undo`, which steps back one edit at a time, and `Clear all`, which empties the sentence and
  reveals the cold start — the same box, now showing four suggested queries.
- The `Sentence` / `Filters` toggle, top right of the box. The filters view is fully editable and
  edits there flow back into the sentence. It is also noticeably taller for the same query, which is
  part of the argument.

**What does not:**

- **You cannot type your own prompt.** The parse is not real. `edit as text` is presentational, and
  all four suggested queries return the same authored sentence. The claim being tested is what
  happens *after* a query is understood, not the understanding itself.
- **The result rows never change.** The count is deterministic arithmetic on fixed numbers — each
  value carries an authored share of the corpus — so it moves honestly with every edit, but the
  table under it is a fixed page of 16 rows. Remove `Phase III` and the count drops from 453 to 280
  while the table still shows Phase III drugs. Worth saying out loud before anyone clicks.
- `Export to Excel` and the column sort arrows do nothing.

## The bet

That a sentence written by a machine is trustworthy enough to be the primary surface for a screening
workflow, rather than a shortcut that sits beside the real filters.

The client's own concern about the Sprint 2 AI tab was precision. This direction runs a larger
version of that risk: if the parser misreads a term — an indication that is also a therapy area, a
stage that is also a marketing status — and the user reads past it, they get a confidently wrong
result set and an export to match. Everything in the design that slows a reader down (counts in the
dropdowns, the prompt shown underneath, the `Filters` view) is mitigation, not proof.

The second, quieter bet is discovery. A panel teaches you the taxonomy by showing it. A sentence
does not, so a new analyst may never learn that Gene Therapy Vector or ATC Classification exist.

## What we want feedback on

1. Given a deliberately ambiguous query — one the parser could plausibly get wrong — when language
   and structure disagree, which should be trusted by default? Should `Filters` be the view that
   opens, with the sentence as the shortcut, rather than the other way round?
2. Is one line of English enough of a record for something that becomes an Excel export somebody else
   acts on — or does a screen this consequential need the structured view visible at all times?
3. If this ran alongside GlobalData's existing agent rather than as a second, unbranded assistant,
   does that change the answer to either question above?
