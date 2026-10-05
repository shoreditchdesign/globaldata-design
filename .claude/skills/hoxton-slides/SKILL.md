---
name: hoxton-slides
description: Build a GlobalData presentation deck as HTML on Shoreditch Design's Hoxton layout library (1440×800 slides, Inter + Cabinet Grotesk, coral accent, keyboard navigation, Figma-ready). Use when someone asks for a deck, slides, a presentation, an options review, a user-testing readout, a client decision deck, or slides to present on a call.
---

# Hoxton slides, for GlobalData decks

Shoreditch Design's deck system, adapted for this repository. A deck is one HTML file of
`<section class="slide">` blocks. It **references** the shared files rather than copying them:
Hoxton's `deck.css` and `deck.js` load from Hoxton's live URL, and the GlobalData layer
(`extensions.css`, `logo.js`) loads from `slides/shared/`. No build step. Serve the repo and open
the deck in a browser to present; paste slides into Figma to polish.

Upstream Hoxton tells you to copy its files into each deck unchanged. Do not do that here. Every
deck pointing at one copy is what lets a fix land once.

## Sources

| File | Where | Read it for |
|---|---|---|
| Layout library | https://theshoreditchway.vercel.app/skills/hoxton-slides/ (`index.html`) | Markup for each layout, tagged `data-layout="<name>"` |
| `design-notes.md` | https://theshoreditchway.vercel.app/skills/hoxton-slides/design-notes.md | Themes, type, spacing, layout, components, content register |
| `deck.css` | https://theshoreditchway.vercel.app/skills/hoxton-slides/deck.css | Tokens and every library layout's CSS. Reference, never copy |
| `deck.js` | https://theshoreditchway.vercel.app/skills/hoxton-slides/deck.js | Navigation engine. Reference, never copy |
| `slides/shared/DESIGN-NOTES.md` | this repo | The GlobalData layer: its components, the logo, viewing, register |
| `slides/shared/extensions.css` | this repo | GlobalData components the library lacks |
| `slides/shared/logo.js` | this repo | The deck mark, injected into `[data-logo]` |

Treat the remote files as read-only. Hoxton is maintained in the `theshoreditchway` repository;
never edit it from here.

## Workflow

1. Read Hoxton's `design-notes.md` and layout library, then `slides/shared/DESIGN-NOTES.md`.
2. Outline the deck as a list of slides, each mapped to a layout below or a GlobalData component.
   Confirm the outline with the user before writing slides.
3. Create the deck folder inside its sprint folder: lowercase with underscores, without repeating
   the sprint name, for example `slides/sprint-5/user_testing/`. The folder holds `index.html`
   and nothing else, unless the deck has images of its own.
4. Write `index.html` with this skeleton, then one `<section>` per slide copied from the matching
   library layout:

   ```html
   <!DOCTYPE html>
   <html lang="en-GB">
   <head>
   <meta charset="utf-8">
   <title>Sprint 5 user testing</title>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
   <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700&display=swap" rel="stylesheet">
   <link rel="stylesheet" href="https://theshoreditchway.vercel.app/skills/hoxton-slides/deck.css">
   <link rel="stylesheet" href="../../shared/extensions.css">
   </head>
   <body>

   <!-- slides -->

   <script src="../../shared/logo.js"></script>
   <script src="https://theshoreditchway.vercel.app/skills/hoxton-slides/deck.js"></script>
   </body>
   </html>
   ```

   Keep the stylesheet order: `deck.css`, then `extensions.css`. Add a `<style>` block only for a
   rule that belongs to this deck alone.
5. Every slide keeps `<div class="logo" data-logo></div>`, a `data-section` label, and a
   `data-title` if it has no `h1`/`h2`.
6. Serve the repository root (`python3 -m http.server 8765`), open
   `http://localhost:8765/slides/<sprint>/<deck>/`, and step through every slide with the arrow
   keys and the index panel to check nothing overflows the 1440×800 frame.

## Layouts

From Hoxton's library:

| `data-layout` | Use for |
|---|---|
| `cover` | Opening slide. Dark, `h1`, short subtitle, date. |
| `stack` | Numbered sequential points, title over body. |
| `compare` | Two-column A vs B with in-favour/against marks. Optional `.footnote`. |
| `targets` | Grid of evidence items plus a measures strip. Add `.targets--4` for 7+ items. |
| `profile` | Team member or case study: photo, bio, list left, media grid right. |
| `quote` | One large verbatim statement. Nothing else on the slide. |
| `metrics` | Row of big coral numbers with a label each. |
| `cards` | Three or four ruled cards: coral index, title, a sentence or two. |
| `rows` | Three or four ruled rows on the thirds: index, title, text. |
| `close` | Dark recommendation or decision slide using `stack`. |

From `slides/shared/extensions.css` (details in `slides/shared/DESIGN-NOTES.md` §3):
`.goal-head` and `.mechanism` for a goal slide, `.slide-foot` for an option slide's verdict and
prototype link, `.link-list` for a list of prototype states, `.one-link` for a closing link,
`ul.marks.pos` and `ul.marks li strong` for a richer compare, `.accent` for a coral word.

Content that fits none of these: ask the user before inventing a layout. A new GlobalData-only
component goes into `slides/shared/extensions.css` with a row in `slides/shared/DESIGN-NOTES.md`,
never hand-rolled in one deck. A layout any studio deck could use belongs in Hoxton's library,
which is changed in its own repository, not from here.

## Hard rules

- Default to `.slide--light`. Use `.slide--dark` for the cover and the single most important
  slide. Never use `.slide--coral` as a background.
- Only sizes from the type scale and spacing from `--space-*`. No new fonts, colours or sizes.
- Every claim traces to a source the user gave you. No invented numbers, names, quotes or
  clients. Use `<span class="pending">Findings pending</span>` where evidence is missing.
- Declarative prose, no filler, no em dashes in body copy. Heading-separator dashes are fine.
- These are client decks and read formally: complete sentences, no slang or studio shorthand,
  and GlobalData's own terms for its product and data.
- Never copy `deck.css`, `deck.js` or a logo into a deck folder.
- Don't convert to PPTX, PDF or a framework app unless asked.
