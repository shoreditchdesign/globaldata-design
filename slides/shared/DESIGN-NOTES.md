# GlobalData decks — design notes

Every deck in `slides/` is built on Shoreditch Design's Hoxton slides system, and reads it live
rather than carrying its own copy. This folder is the thin GlobalData layer that sits on top. Read
Hoxton's own notes first, since they set the palette, type scale, spacing scale, layouts, navigation
and content register: <https://theshoreditchway.vercel.app/skills/hoxton-slides/design-notes.md>.
The layout library, one example slide per layout, is at
<https://theshoreditchway.vercel.app/skills/hoxton-slides/>.

These notes replace `slides/template/`, which was the same system before it was packaged as Hoxton.
Its `index.html`, `deck.js` and CSS matched Hoxton's line for line apart from comments, and its
design notes were an earlier draft of Hoxton's, so nothing in it was lost when it was retired.

## 1. What each deck loads

| File | Where it lives | Role |
|---|---|---|
| `deck.css` | Hoxton, remote | Tokens, type and spacing scales, every library layout |
| `extensions.css` | `slides/shared/` | GlobalData components the library does not have (§3) |
| `logo.js` | `slides/shared/` | The deck mark, injected into every `[data-logo]` (§4) |
| `deck.js` | Hoxton, remote | Bottom bar, index panel, hover thumbnails, `?slide=N`, arrow keys, print |

A deck folder holds only its `index.html`, plus any images that deck alone uses. The `<head>`
loads the two font links, then Hoxton's `deck.css`, then `../../shared/extensions.css`, in that
order so the extensions win any tie. The end of `<body>` loads `../../shared/logo.js` and then
Hoxton's `deck.js`. A deck carries no `<style>` block unless it has a rule that genuinely belongs to
that deck alone.

## 2. Viewing a deck

Serve the repository root (or `slides/`), not the deck folder, so the `../../shared/` paths
resolve: `python3 -m http.server 8765` from the repo root, then
`http://localhost:8765/slides/sprint-4/user_testing/`. A deck needs a network connection, since
`deck.css` and `deck.js` load from Hoxton's live URL.

A change to Hoxton's `main` reaches every deck here on the next load. That is the point of
reading it live, but it means a Hoxton change should be checked against these decks before it is
pushed. If a deck ever has to be frozen, for a handover or an offline review, inline the four files
into it as Hoxton's notes describe (§1 there).

## 3. GlobalData components

Built from Hoxton's tokens and type scale, so none of them sets a size or colour of its own. They
live in `extensions.css`.

| Component | Use for | Used in |
|---|---|---|
| `.accent` | Coral on a word: a verdict label, a goal tag. Never a fill | All three decks |
| `.slide a` | Links that inherit the text colour, carried by the underline | Sprint 3 options review, Sprint 4 option review |
| `ul.marks.pos` | Coral marks on the in-favour column too, when both columns of a compare carry them | Sprint 4 option review |
| `ul.marks li strong` | A mark whose claim sits on its own line above its detail | Sprint 4 option review |
| `.goal-head` (+ `.centre-v`) | The block a goal slide opens on: coral letters at metric size, the goal's name, the client's figures, a hairline | Sprint 4 option review |
| `.mechanism` | A headed paragraph under a goal header, explaining how an option meets it | Sprint 4 option review |
| `.slide-foot` | Bottom row of an option slide: verdict left, prototype link right | Sprint 3 options review |
| `.link-list` | One prototype state per row, its goal tag inline | Sprint 3 options review |
| `.one-link` | A closing slide that is one centred link at `h2` size | Sprint 4 option review |
| `.eyebrow` + `h1`/`h2` | A chapter index ("01 — What changed") carried over every heading in that chapter, and over a divider's `h1` | Sprint 5 client review |
| `.split-text` (`.split-copy`, `.split-frame`) | Copy on the left half, an empty dashed frame on the right half for a screenshot. Hoxton's `profile` puts its media on the right too, but it is built for a bio; this is the general text-and-image slide | Sprint 5 client review |

A slide that fits neither Hoxton's library nor this table is a new component, not a bent existing
one. If it is GlobalData-specific, add it to `extensions.css` under its own commented block and a
row here. If it would suit any studio deck, it belongs in Hoxton's library, which is maintained in
the `theshoreditchway` repository, not from here.

## 4. Logo

`logo.js` is Hoxton's injection pattern with the mark held once for every deck. It still carries
the Shoreditch Design mark the decks were built with, because no GlobalData SVG has been supplied.
When one arrives, replace the SVG string in `logo.js`, with every `fill` and `stroke` set to
`currentColor`, and every deck picks it up.

## 5. Register

These are client decks, and they read formally: complete sentences, no slang, no studio shorthand,
and the client's own terms for their product and data. Hoxton's content register (§9 of its notes)
applies on top: declarative prose, every claim traced to a source, no em dashes in body copy.
