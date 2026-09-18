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

## 2026-09-17 — Idea 2, rearranging the query by hand

Austin wanted the blue pills in the sentence to be draggable, so filters can be put in a different order and a value can be pulled out of a group to stand as its own condition. For example, in `small molecules in Europe or North America` you can drag North America out of the geography group. He also wanted a quick way to remove a pill. The semantics below were decided with him.

**The query reads strictly left to right.** Each condition folds into the result of everything before it by its own link, so `A and B or C` is `(A and B) or C`. The evaluator already worked this way, and the count on each canvas node is the same fold stopped early, so the last node always matches the headline. Nothing about the evaluator changed. It is now written down beside the code, because once conditions can be reordered by hand, order is part of what the query means.

**What drags.** A pill in a group of values carries just that value. Drop it in a gap between conditions and it becomes a condition of its own on the same attribute. Drop it on another group of the same attribute and it merges there. A pill that is alone in its condition carries the whole condition, which can be moved or merged but has nothing to be pulled out of. To move a whole group, you drag the clause's operator word, such as `available in`. We chose that word over a grip handle because it already leads the clause and names what the clause does, and a grip glyph in a line of prose would either take up width or have to appear on hover and shift the line. The word still opens its menu on a click; a press only turns into a drag after 4px of movement. On the canvas, a node's heading drags the node and its chips follow the same rules as pills.

**A pulled-out value joins with OR.** This was Austin's call, made knowing it can widen the set. A value pulled from an excluded group joins with OR NOT. It lands straight after its source group unless you drop it somewhere else, and the join word it creates stays lit for a beat so it is obvious what was made and that it can be changed. Merging a value back puts it into the target group with that group's join and mode.

**Refused drops show nothing.** Over the middle of a group on a different attribute, or anywhere a drop would change nothing, no caret appears and the pill springs back when you let go. The outer third of each clause, or at least 14px of it, counts as the gap on that side, so you can still reorder past a group you are not allowed to merge into.

**The count is previewed before the drop.** While a target is hovered, a small tag beside the caret reads, for example, `41 → 1,367`. Because Austin chose OR knowing it can widen the set, this preview is how the user sees that happen before letting go. The caret is a thin line in the gap and the ghost follows the pointer outside the flow, so the sentence never reflows mid-drag. After a drop the clauses settle into place over the `reflow` beat. Reduced motion skips the settle and the spring back.

**Removing and moving without a drag.** Every pill has an × on hover or focus, which removes that value, and removes the whole condition if it was the last value. `Remove this condition` stays in the pill's menu. The menu also has `Move to its own condition` for pills in a group, plus `Move left` and `Move right`, and `Merge with …` wherever another condition shares the attribute. Node menus on the canvas offer `Move up` and `Move down`. Drags, moves from a menu and removals are all one step in Undo.

**Conditions have an id now.** A pulled-out value leaves the same attribute in two conditions, so conditions are no longer keyed by attribute. The value counts in a menu lift only that one condition, and the other condition on the same attribute still counts. The new `pulled-apart` frame shows the example above: 598 drugs, where the group gave 400.

**What felt odd in the hand.** Pulling a value out of an excluded group joins it with OR NOT, and in a query that reads left to right, that can take the count from 41 to 1,367. The preview shows this, but it is rarely what anyone means. Pulling a value out to a spot *before* its source group also leaves the source's own `and` sitting after an `or`. For example, `small molecule, or Europe, and North America` gives 162. Both results are correct under the rules above, and both are worth watching in review.

**No drag library.** The drag is a small pointer-events implementation in `components/Arrange.tsx`. `@dnd-kit` sortable assumes block or grid items. Here the targets are thin carets in the gaps of wrapping inline text, so the geometry had to be written either way, and adding the dependency would only have supplied the gesture.

## 2026-09-17 — Idea 2, the sentence shows the grouping, and the record comes back

Two more of Austin's calls, made together.

**Picking happens on the canvas, not in the sentence.** The sentence's pills used to open a value dropdown, its operator words opened a menu of alternatives, and `+ condition` opened an attribute picker. All three are gone. The sentence is there to show how the conditions group, so its words are now read rather than set: a pill is a plain blue value, and `and`, `or` and `available in` are plain text, without the dotted underline that marked them as controls. `not available in` keeps its heavier weight, because that word is still the whole difference between an excluded value and an included one. Values and operators are chosen on the logic gate canvas, where every one has its counted list.

What stays in the sentence is clearing and regrouping. The × on a pill and on a clause still removes it, and pills and a clause's head word still drag by the rules in the section above. That means the moves that lived in the pill's menu, `Move to its own condition`, `Move left`, `Move right` and `Merge with …`, are now reachable without a drag only from the node menus on the canvas. With the canvas tucked away, Sentence mode has two ways to change a query: type it again, or clear what is there.

**Open brings the whole record in from the right.** This is ported from Sprint 3 Idea 2. `Open` sits on the pinned drug-name cell and shows when the row is hovered, but it can be focused at any time. The name keeps the button's width all the time rather than making room on hover, because making room on hover is what made Sprint 3's row reflow under the cursor and swallow the click. The record is a shadcn `Sheet` over a scrim and closes by the scrim, Escape or its close button. It lists every field in the sample, including the eight that are not grid columns.

The drawer is looked up in the filtered rows, never the sample. When an edit anywhere drops the open drug, the drawer closes and forgets which drug it was, so it cannot slide back in if a later edit or Undo lets the row through again. The record id lives in the screen's one state atom, so the new `record` frame is addressable like the others.

One divergence from the source: Sprint 3 Idea 2 set its drawer at 16px and 17px, and this one uses the sprint's 13px data scale with a 17px title. That way the record reads as part of the same grid it was opened from.

## 2026-09-17 — Idea 1 handed to its own branch

The hybrid screener that was Idea 1 has come off main, and the Idea 1 slot is a placeholder again. A colleague is picking up Idea 1 as a separate direction on their own branch, and an empty slot keeps that work from colliding with a prototype it is not building on. The routes under `/sprint-4/idea-1` stay, now showing one placeholder screen.

Nothing about the hybrid is lost. Its code is in the history at `ae56cf1`, and its section at the top of this file still stands as the record of what it was. Idea 2 grew out of it, so Idea 2's copy and comments now name it as "the Sprint 4 hybrid screener" rather than "Idea 1", which would otherwise start pointing at the colleague's work. The Sprint 4 goal in the registry is rewritten to describe what is on main.

## 2026-09-18 — Idea 2, three ways into one query

Austin reworked the idea around three ways to build the same query, and the logic gate came out of it.

**The toggle went, and the explorer replaced the canvas.** There is no Sentence / Logic gate switch any more: the box always shows the sentence. Where the canvas used to split in, a file tree does, opened from `Explorer` in the head of the results rather than from a toggle over the box. The first level is the Drugs attributes, each with its own icon, then values, then the children a value has. The other product areas are not at the top of the tree; they are separate screeners with their own taxonomies, and putting all eight there made the top of the tree read as the platform's nav rather than this screen's filters.

**Nothing the tree does reaches the table until it is applied.** Ticks build up against a rail at the foot, so walking a branch costs nothing and the count only moves when it is asked to. Applying keeps an existing condition's own words and changes only its values, so a tick can never quietly turn `not Austria` into `Austria`.

**It reads both ways.** A query resolved from the box arrives in the tree as ticks in the branches it came from, and they land the way the sentence does — the branches open and the values tick one after another, on the same stagger the resolve uses. It is the resolve animation's claim, made where the taxonomy can show which branch each word came from. Reduced motion gets the end state at once.

**The quick filter bar writes, it does not apply.** Eight chips under the box, each a dropdown of counted values with its own search. Ticking a value adds it to the line in the box, in the same words a typed query resolves to, and the query only moves on Resolve. So the bar is a filter builder whose output is a sentence, rather than a second filter model beside the sentence. A line already in the box was typed or read back from a query, so the first tick clears it rather than appending to someone else's sentence. The suggestion chips that used to sit inside the box are gone, replaced by the bar.

**`$$` fills in an example.** Six worked examples cycle, covering several conditions at once, an exclusion, an `or` between values, a partial read that offers its nearest match, and terms that name something real in the product this prototype does not wire. Every one was checked against the resolver, so a demo cannot land on a sentence that does not read.

**The sentence speaks boolean.** `Development Stage is Phase II or Phase III, and Drug Geography is not Austria or Italy`. The phrase-per-attribute wording — `available in`, `given via`, `described as` — is gone: it read as invented product language, and the attribute names are the same labels the picker, the tree branch and the grid column use. Dragging pills is switched off behind one flag, with the code left in place.

**Three cards on a grey page.** The box, the explorer and the results each sit on their own card with the same outer gutter and the same inner padding, rather than the box floating over two full-bleed panes. That fixed the `Explorer` control reading as closer to the table than to the tree it opens, and it means the shared inset only has to hold inside a card: `--text-inset` is now the card's padding plus its border, not the sum of the page gutter as well.

**Hierarchy inside the tree.** The first level sits on the card's own white with more height per row; an open branch is recessed into `surface-sunken`, which is what that surface is for — a well cut into a panel, so an open attribute reads as opened rather than as a second plane laid on top.

## 2026-09-18 — Idea 2, one rail under the box, and two views of the results

**The card's foot is one grey rail.** The filter chips sit on the left of it and what the query costs sits on the right: the count, Undo, Clear all, and Resolve while a line is being written, or Edit once it has resolved. The count lost its 34px column on the right of the card, which was a headline number in a place nothing else was happening; as a figure on the rail it sits beside the buttons that change it. Everything a query can be built or undone with is now on one band, whichever of the three ways in was used.

**Standard and Explorer are two views, not a toggle with an on state.** The head of the results carries a segmented control rather than a single button that lights up. Standard is the grid on its own; Explorer brings the tree in beside it. The selected segment is white on a muted track, the same treatment the box's own toggle had before it was removed.

**The explorer's plane is a middle grey.** Its body takes `surface-chrome`, between the white of its own header and apply rail and the page grey behind the cards, so the panel reads as a distinct surface without becoming a white card that competes with the results. Both the tree and the grid now carry `shadow-raised`, the same lift the box has, so the three cards read as one family on the page.

Austin's Paper frames for both of these could not be opened — the Paper MCP server did not connect in this session — so this was built from his description and is for him to correct against the file.

## 2026-09-18 — Idea 2, the grey comes back out

Austin reversed the two greys added earlier the same day, and both reversals hold.

**The explorer is white again, and an open branch has no fill.** The middle grey read as murky rather than as a distinct plane, and a fill under an open branch was one surface too many beside the tinted row of the attribute it hangs from. The rule down the left is the whole of the nesting now, which is what a file tree actually uses.

**An active filter chip is the primary button.** A chip holding values takes the brand fill with a white label and its count inline in brackets, `Drug Geography (2)`, rather than a washed tint with a solid badge sitting on it. This is a chip you pressed and that is on, which is the accent's own job in `CLAUDE.md`; the tint stays for the inline pills in the sentence, so the two do not read as the same control.

**The grid's rows carry the tint, the heads keep the white.** Floating the panes as cards cost the table the contrast it had when its head was the only white thing on a grey plane. The rows now sit on the same faintly blue grey the explorer reads on, with every other row a step darker, so a row is easy to follow across eight columns, and the column heads stay white above them. The pinned name column takes its row's own fill rather than setting one, so the stripe runs unbroken under it.

## 2026-09-18 — Idea 2, applying is starting again

**A filter applied from the explorer is a fresh search, not an edit.** What is ticked becomes the whole query: every attribute joined with `and`, its own values with `or`, in the product's order, and the line in the box is rewritten to match. A typed query's exclusions and `or` links do not survive it. That is Austin's call and it is the honest reading of a button that says Apply filters on a panel showing the whole taxonomy — the alternative, quietly keeping a `not` the tree has no way to show, was worse. The quick filter bar works the same way: if a line is already in the box, the first tick clears it and builds its own from scratch.

*Reversed the same day; see "every way in adds to the query" below.*

**Edit sits where Resolve sits.** The rail's right end holds one action: Resolve while a line is being written, Edit once it has resolved, as a blue link rather than a second button. The duplicate Edit beside the "Read from" line is gone, and that line is now just what the query was read from.

**The heads are pinned to one height.** The results toolbar is 48px, two pixels above and below the Standard / Explorer toggle, and its column heads are 36px. The explorer's head is 84px — its title row and its search row — so the two panes' chrome ends on the same line, measured rather than eyeballed. The search field carries its own bottom padding, so it clears the head's rule.

**The explorer's plane is the page grey.** Darker than its own white head and rail, and darker than the grid's rows beside it, which is what carries the separation now that both panes are cards.

## 2026-09-18 — Idea 2, the Open button, and a card that sits in front

**`Open` took clicks while it was invisible.** The control sits over the right-hand end of the drug name and fades in on row hover, but it kept its pointer events at zero opacity, so every click landing on that part of a name hit a button nobody could see and nothing happened. It now takes no clicks until it is shown, by hover or by keyboard focus, and it is a little taller so the target is worth aiming at. The name reserves its width permanently, as before, because animating that room is what made Sprint 3's rows reflow under the cursor.

**A new shadow, `shadow-float`.** The explorer card needed to read as in front of the page rather than resting on it, and `shadow-raised` was not carrying that at this size. `float` is the same shape carried further — a 32px spread at 0.18 against `raised`'s 24px at 0.1 — and the card's edge steps up from `border` to `border-edge` with it. It is a fourth step on an existing ladder rather than a new idea, and only this card uses it so far.

## 2026-09-18 — Idea 2, the frames between the frames

**Four intermediate states are addressable.** `filter-open` and `filter-ticked` are a quick filter's dropdown open and then holding two values, with the line above written as they were ticked. `explorer-expanded` and `explorer-ticked` are branches opened and values ticked in the tree, with the rail counting them and nothing applied. `explorer-open` is renamed in its title to say what it is: the tree with every branch shut.

None of them is a mock. The ticks are seeded into the same state the screen edits, so pressing Resolve or Apply filters from one of these frames does what it would have done had you clicked your way there.

**A dropdown can be pinned open.** A popover that closes the moment focus leaves it cannot be screenshotted, and these screens are reviewed as captures into Figma as much as in the browser. A frame naming a pinned filter holds that dropdown open when focus leaves the page — which is what a capture extension, the devtools or another window takes — while a click in the page still dismisses it, along with the chip and Escape. Losing focus is a tool doing its work; a click is a person, and nothing is locked open. Resolving clears the pin. `pinnedFilter` lives in the screen's state, so the address bar follows it like everything else.

**The empty grid takes the tint too.** It was white until the first row landed and then turned faintly blue, which made the empty state look like a different surface from the one it was about to become.

## 2026-09-18 — Idea 2, every way in adds to the query

**Ticking adds and unticking removes, wherever it happens.** Applying from the explorer no longer restarts the search: a condition the query already holds keeps its own words and only its values change, so unticking Austria under an excluded geography takes that value out and leaves `is not` standing, and ticking Europe there adds to the exclusion rather than flipping it. An attribute the query did not have joins the end with a plain `and`; one left with nothing ticked leaves the query. The quick filter bar works the same way: the line it writes is the query with that attribute's values swapped in, and Resolve reads that line like any other. Starting again is what Clear all is for.

**A tick the reviewer clears now clears.** The boxes were answering to the reveal sequence that staggers a resolved query into the tree, not to the ticks themselves, so unticking a value left the box drawn while the query behind it had already moved. The draft decides what is drawn; the sequence only decides when a tick that arrived with a resolve is drawn.

## 2026-09-18 — Idea 2, the partial read says less

The callout for what a reading missed was a grey card with a sentence in it: the phrase, an em dash, and "no condition in this screener matches that, so it was left out". No interface talks like that. It is now one line above the line it was read from, with no card around it: the phrases it could not place, `not found.`, and the nearest thing it does have as a button you can press. The disclosure survives, which `CLAUDE.md` requires; the explanation of itself does not.

## 2026-09-18 — Idea 2, the suggestion moves into the sentence

**A nearest value is offered where it would land.** Rather than a pill listed under the query, the suggestion is drawn as the clause it would become — `and Drug Descriptor is Immunosuppressant Therapy` — faded into the end of the sentence, the same move the composer makes when it ghosts the rest of a query you are typing. Pressing it makes it real. One mechanic now covers both halves of the reading: what the words would complete to, and what a phrase would have been.

**What could not be placed sits under the words it came from.** The `not found` line moved below `Read from`, so the order reads: the query, then what it was read from, then what that reading missed.

**`autofill` is a frame.** The ghost completion could only be seen by typing into the box, which made it invisible in review and impossible to capture. `/sprint-4/idea-2/autofill` opens on half a common query with the rest ghosted after the caret.

## 2026-09-18 — Idea 2, the clause head says keep or drop in colour

The head of a clause is one control — the attribute and its operator — and pressing it flips `is` and `is not`. Hovering underlines it in the brand rather than filling it, so the only fill in the sentence stays the values.

The operator carries the difference in colour instead of weight: `is` in `brand-ink`, `is not` in `negative-ink`. Bolding the negation made an excluded clause shout across the line, and the design system already keeps a tone for negation that an included filter must never wear. The attribute beside it stays muted, so the coloured word is the one that changes what the query does.

## 2026-09-18 — Idea 2, an excluded value is ticked as a minus

Flip a clause to `is not` in the sentence and the other two ways now say the same thing: the values under it carry a minus rather than a tick, in the negation tone, and the filter chip holding them wears that tone instead of the brand. A value under an exclusion is not unticked — it was chosen and then excluded — and a plain tick in the tree or the dropdown claimed the opposite of what the sentence said.

The registry's checkbox hard-codes its tick, so `TickBox` wraps the Radix primitive and swaps the mark rather than editing a generated component. It keeps the shadcn box's own shape, focus ring and disabled behaviour, and takes `selected` for a kept value, exactly as the registry does.

## 2026-09-18 — Idea 2, excluding from the tree

Option-clicking a box in the explorer ticks it as an exclusion: the mark is the minus, the attribute joins the query as `is not`, and the sentence says so. The sentence has a word you press to negate a clause and the quick filter has the chip it inherits, so the tree needed a way of its own that did not cost it a second control per row.

The modifier is unguessable, so it is named once — `⌥ click to exclude`, beside the count of what is ticked in the rail at the foot — rather than beside every box. Alt is read on the pointer going down, since the change event does not carry it, and unticking the last value of an attribute forgets that it was excluding.

## 2026-09-18 — Idea 2, keeping and dropping the same attribute

One attribute can now do both at once: `Molecule Type is Small Molecule but is not Peptide or Recombinant Protein`. The values are blue ticks and red minuses in the same branch, and the clause reads as one breath rather than naming the attribute twice.

**In the model it is two conditions.** The query is an ordered list of conditions, each with one polarity, so an attribute that keeps and drops writes two: `Molecule Type` and `Molecule Type~not`. Nothing about the evaluator changed — it still folds left to right — and the sentence collapses the pair when it draws them: the second clause reads `but is not …` and does not repeat the attribute, and no comma separates them.

**The resolver reads it back.** It used to fold an attribute into a single condition with one exclude flag, so `small molecules but not peptides` would have negated the lot. It now buckets by attribute *and* polarity, and `but` joins the resolver's grammar words, so a sentence the screen writes is a sentence it can read again — which is the rule the whole idea rests on.

**Polarity is per value everywhere.** In the tree and in the filter dropdowns a value is ticked blue or minused red on its own, option-click chooses which, and a chip goes red only when everything under it is excluded.

## 2026-09-18 — Idea 2, the modifier works in the bar too

Option-click excluded a value in the explorer but not in a quick filter's dropdown, where it quietly ticked an include and wrote it into the line — so the gesture appeared to do nothing but pre-fill the box. The bar now reads the modifier the same way, holds which of its ticks are exclusions, and writes the pair of clauses the explorer writes: `Molecule Type is Small Molecule but is not Peptide`. The rail names it once, beside the count, as the explorer's does.

Removing this also cleared out the last of the drag frames: `pulled-apart` had gone from the flow when dragging was switched off, but `slugFor` still named it whenever an attribute appeared twice — which mixed polarity now does on purpose, so a legitimate query was addressing a frame that no longer existed.

## 2026-09-18 — Idea 2, two clauses that agree become one

Flip the `is not` half of `Molecule Type is Small Molecule but is not Peptide` back to `is`, and the query would hold two clauses saying the same kind of thing about one attribute. They now fold into one: `Molecule Type is Small Molecule or Peptide`. The values are unioned into the first of the pair, which keeps its own join and its place in the order, and the second clause goes.

Only a clause joined with `and` is folded in. In a query read left to right an `or` between two clauses means something else, and merging it would quietly change the set rather than tidy the sentence. The merge runs in `normaliseConditions`, which every edit already passes through, so it holds however the duplicate arrived — the sentence's own toggle, the tree, or the filter bar.

## 2026-09-18 — Idea 2, one card for the results

**The explorer and the grid are one card now, with one head between them.** The head carries the Standard / Explorer toggle on the left and what the query found on the right, and the tree and the grid sit under it as siblings. As two cards, each with its own head, the toggle that opened the tree lived in the grid's own head rather than the tree's — the control sat in the pane it was not opening. The tree still opens by width inside the shared card, always mounted so it closes as smoothly as it opens, and reduced motion still gets the end state at once. The results pane gave up its own toolbar; it now reports what it is sorted by up to the head it shares with the tree.

**The count reads larger.** The number is 16px now, with the sample size and what the grid is sorted by beside it at 12px, where the whole line used to sit at 12px together. It is the one number on the screen a reviewer is actually reading, so it is the one that earns the size.

**The box lost its `DRUG SCREENER` label and took its own controls.** Undo, Clear all and Resolve — or Edit, once the query has resolved — now sit in the bottom-right corner of the field itself, rather than on the grey rail underneath it.

**The rail can be tucked away.** A button in the top-right corner of the field collapses the filter chips by height, on the same motion vocabulary as the tree with its own reduced-motion path, because a query with seven chips across two rows pushes the sentence up the page. Undo, Clear all and Resolve stay visible whether the rail is open or shut. `railOpen` lives in the screen's state atom like everything else.
