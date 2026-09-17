# Sprint 4 — decisions

## 2026-09-16 — Idea 1, the hybrid screener

Idea 1 puts three Sprint 3 directions on one screen and makes them views of one query. Idea 3's text box sits across the top, Idea 2's Miller columns take the bottom left, the results take the bottom right, and Idea 1's filter-builder stack opens down the left edge as a logic gate. Nothing is imported from `src/flows/sprint-3`. What the hybrid needed was copied into `src/flows/sprint-4/idea-1` and adapted there, so the Sprint 3 ideas stay independent.

**One dataset, Idea 2's.** The columns need a count on every value, and only Idea 2's 1,440-row seeded sample carries that honestly, so the whole screen runs on it. The headline count, the per-value counts in the columns and in a pill's menu, the running count on each node of the gate and the rows in the grid are all counted off that sample against the same list of conditions. The count says "of 1,440 sampled" rather than scaling up to the platform's 285,529, as Idea 2 did.

**One query model, with a link on every condition.** Idea 2 joined its attributes with an implicit AND and Idea 3 did the same, but a logic gate that could only ever say AND would be decoration. So each condition carries its values, the word between them (`or` or `and`), whether it keeps or drops rows, and how it meets everything before it (`and` or `or`). The query reads left to right, which is also the order the gate draws it top to bottom. `NOT` in the gate is the same field as `not available in` in the sentence, so flipping one flips the other. Idea 1 offered AND, OR and NOT between groups. The gate here adds `OR NOT`, because the sentence can say `or not available in` and the gate has to be able to draw anything the sentence says. The first node offers only AND and NOT, since an OR against the whole sample keeps everything.

**Inside a group, only OR and AND.** Idea 1 let each chip carry its own AND, OR or NOT. Here the values of one attribute share a single join, as they did in Ideas 2 and 3, so the pills between chips in a node all change together. A per-value NOT would have needed a second kind of condition that neither the sentence nor the columns can show.

**The sentence prints canonical labels.** Idea 3 softened values into prose, like `orally` for Oral. In the hybrid the same value is also a tick in a column and a chip in a node, and it has to read as the same word in all three places, so pills carry the taxonomy label and each attribute gets an operator phrase to introduce it (`for`, `in`, `available in`, `made as`, `given via`). A few of those read stiffly. That was the price of recognisability, and they are easy to reword in `grammar.ts`.

**The resolver was pointed at the new taxonomy.** It is still Idea 3's keyword matcher, with its honest reporting intact. Words it cannot place are named, the nearest known value is offered rather than applied, and companies, dates and NPV get their own note. Its patterns now come from Idea 2's labels plus a short synonym list, so a typed phrase lands on the label a column ticks. Conditions keep the order they were typed in rather than a fixed grammatical order, because with OR in play, reordering would change what the query means. A lone `or` between two different attributes sets the link. Everything else joins with `and`.

**The toggle is `Sentence / Logic gate`, and the sentence stays.** In Idea 3 the toggle swapped the sentence for filters in place. Here, Logic gate opens a sidebar instead and leaves the sentence where it is, because the point of the hybrid is watching one edit move both. Sentence closes the sidebar.

**The sidebar pushes, and the columns give up the room.** At the 1440px review viewport, a 320px sidebar beside two Miller columns and a results grid leaves the grid too narrow to read. So while the gate is open, the columns fold to one plus the breadcrumb (Idea 2 built the breadcrumb for exactly this) and the panel narrows from 600px to 300px. The results end up about the same width either way, roughly 820 to 840px. The sidebar runs the full height under the product chrome, so the text box narrows with it rather than the gate being squeezed into the bottom half. Idea 2 grew to three columns past 1880px. That media query stayed behind, and it is always two columns or one.

**What stayed behind from Idea 2's panel.** The filter-area column, the panel's own search field, the agent and its composer, the record drawer and the column picker are all out. The text box above is the search, and the columns open straight on the attributes of Drugs, with `Drugs` as the root of the breadcrumb.

**What stayed behind from Idea 3's box.** The global search in the header is the static placeholder again, and Export is gone from the count block. Undo, Clear all, Edit (the query written back as prose that resolves to the same conditions) and the resolve animation all came across.

**What stayed behind from Idea 1's builder.** Clear filters and Apply filters are gone, because selection is live and there is nothing to apply. Clicking a node's heading or one of its chips opens that attribute in the columns instead.

**The right half before and after.** Before any condition exists, the right half is an empty state: the size of the set, and the two ways in, typing above or ticking a column. It is deliberately not a table of all 1,440 rows, since that would look like an answer to a question nobody has asked yet. Once a condition exists, it becomes the results grid at the sprint's scale: 13px cells, 10px uppercase headers, `py-2.5`. Half a window cannot hold eight columns, so the grid scrolls sideways with the drug name pinned. It draws the first 100 rows and says how many there are in total.

**The view toggle takes the washed brand.** Idea 3's toggle lifted the selected option on a white fill with a shadow. This one follows the design system's rule for segmented options, `bg-brand-tint` with a `brand-border` edge.

## 2026-09-17 — Idea 2, the tucked logic gate

Idea 2 is a variant of Idea 1 with the Miller columns taken out. The text box and its `Sentence / Logic gate` toggle sit across the top at full width, and the results sit underneath. The logic gate no longer opens as its own full-height pillar. It takes the slot the columns held, and it stays tucked away until you ask for it. Everything it needed was copied into `src/flows/sprint-4/idea-2` and trimmed there, so nothing imports from Idea 1 or from Sprint 3. It lives at `/sprint-4/idea-2`.

**Two views of one query.** The query model is Idea 1's, with each condition carrying its values, its join, whether it keeps or drops rows and how it meets the conditions before it. The sentence and the canvas both draw that one list, and the grid and every count are read from it. Build a node on the canvas and the sentence gains a pill. Type a request and resolve it, and the canvas holds the same nodes. Toggling back to Sentence hides the canvas and keeps the query.

**Landing is one thing to do.** You arrive on a large text box with Sentence selected and the grid at full width underneath. The grid keeps its column heads, so you can see where results will land, and the body says "No results yet" with one short line under it. Idea 1's right-hand empty state counted the sample and listed the two ways in. That went, because the count already sits beside the text box and the columns it pointed to are gone.

**Logic gate splits the bottom half.** At the 1440px review viewport the canvas takes 560px on the left and the results keep the rest, roughly 880px. The canvas opens and closes by width over the `reflow` duration on the `settle` curve, and its contents fade up a `handover` beat later, so the nodes slide into view rather than reflowing as the slot grows. Reduced motion gets the end state at once. The canvas holds its width inside the slot while it animates, and it stays mounted while closed so it can close as smoothly as it opens.

**The empty canvas suggests, from real pairings.** A blank canvas gives you nowhere to start, so it offers suggested filters. They come from the drug search behaviour pairing analysis, which counts how often two Drugs filters are used in the same search:

- Company Name + Company Type, 10.3%
- Development Stage + Therapy Area, 9.2%
- Development Stage + Molecule Type, 5.0%
- Development Stage + Drug Geography, 3.6%
- Molecule Type + Therapy Area, 3.5%

The empty canvas ranks the attributes by how much they co-occur across those pairs. That puts Development Stage first, since it appears in three of them, followed by Therapy Area, Molecule Type and Drug Geography. Company Name and Company Type top the list, but the 1,440-row sample does not carry either as a filter, and Idea 1 already treats Company as its own product area. So they are left out rather than offered as a chip that filters nothing. The same analysis for Clinical Trials was read as context only, since this screener is Drugs. The percentages rank the chips and never appear on screen.

**Suggestions build on what is there.** Once a node is on the canvas, the remaining suggestions reorder by what pairs with the nodes present, strongest first. After Development Stage the chips read Therapy area, Molecule type, Drug geography. After Molecule Type they read Development stage and Therapy area, and Drug geography drops out because nothing in the analysis pairs it with Molecule Type. If nothing on the canvas pairs with anything, the chips fall back to the cold-start order. Every other attribute stays one click away under `More`.

**A suggestion looks like a suggestion.** The chips have a dashed edge, muted text and a plus, and hover is grey. They never take the brand fill or the washed-brand treatment an applied filter wears, so a row of suggestions next to a node cannot be read as conditions that are already on.

**A clicked suggestion becomes a node straight away.** It appears as a dashed node with its value picker already open, and every value is counted as it is in Idea 1's pill menu. The node joins the query with its first value, so the sentence, the count and the grid all move on that click. Closing the picker without a value removes the node, rather than leaving an empty condition in the sentence. More nodes join with AND by default, and each operator flips to OR, NOT or OR NOT exactly as in Idea 1.

**The sentence adds conditions without columns.** In Idea 1, `+ condition` sent you to the columns. Here it opens a small picker, attribute first and then the same counted value list the canvas uses.

**What stayed behind from Idea 1.** The Miller columns, the breadcrumb, `Show in the columns` and the column-edit and resolving frames all went. The resolve animation still plays, and while it runs the address stays on the frame it started from. The canvas also dropped Idea 1's click-through from a node to the columns. Clicking a node's heading or a value opens that node's value picker.

## 2026-09-17 — Idea 2, Austin's visual pass

Four changes from Austin's review of Idea 2. Three of them go against a rule in `CLAUDE.md` or against a call logged above, and they are his direction.

**One inset, shared by the box, the grid and the canvas.** The sentence starts 45px in from the edge of the screen: the box's 24px gutter, its 1px border and its own 20px padding. The grid's first column, header and cells both, now starts on that same line, and so does the results toolbar. The grid's last column pads by the same amount, so at full width its content ends where the count block's does. The value comes from one set of CSS variables in `src/flows/sprint-4/idea-2/inset.ts`, set on the screen root, which means the box padding and the grid padding cannot drift apart. The pinned drug-name column and the sideways scroll are unchanged.

When Logic gate is open, the canvas takes the same inset on both sides. Its heading, the `All drugs` card and every node start 45px in and end 45px short of the canvas edge, and the close icon sits on that right-hand line too. So the canvas content lines up with the sentence above it. The node stack now fills the canvas's width rather than sitting in a centred 400px column, and the empty canvas is left-aligned rather than centred, since a centred block has no edge to line up. The grid keeps the same 45px inside its own half, so it starts at 605px beside the 560px canvas. We kept that rather than inventing a second value, so every pane on the screen insets its content by the same amount from its own edge.

**The view toggle's selected segment is white.** `Sentence / Logic gate` is now a white segment with a light shadow, lifted off a muted track, with foreground text. It uses no brand fill and no washed brand. This reverses the entry above that gave the toggle the washed brand, and it departs from the design system's rule for segmented options.

**Suggested conditions are blue.** The suggestion chips on the canvas now use the same washed brand as the pills in the sentence: the tint fill, the brand edge and brand-ink text. They keep the leading plus, so they still read as something to add, and hover stays in the same family with a firmer edge and a light lift. This reverses the call above that a suggestion never takes the brand treatment. What separates a suggestion from a condition that is on is now the plus and where it sits, inside the `Add a condition` well, rather than the colour.

**A placed condition is never red.** Excluded values used to take the rose negation tone as a pill in the sentence, as a chip on the canvas and as a tick in the value menu. They now look exactly like included ones. The operator carries the exclusion instead. In the sentence, `not available in` is full-strength text at a heavier weight with a darker dotted rule, next to muted operator words at normal weight. On the canvas, `NOT` and `OR NOT` get foreground text, semibold, with a firmer edge than `AND` and `OR`. `CLAUDE.md` says an excluded filter must never look identical to an included one. The chips are now identical, so the operator is what keeps that promise. The full-failure alert in the composer keeps its rose tone, since it reports a real failed outcome rather than a placed condition.

**The reviewer's own words are blue, not quoted.** The `Read from` line under the sentence and the notes about phrases the resolver skipped or could not build used to wrap the typed words in curly quotes. They now show the words in brand-ink with no quotes. To do that, the resolver's notes carry the phrase and the message separately. The failure alert still quotes the phrases it could not place.
