# globaldata-design

Design workstream for GlobalData. Sibling to [`globaldata-dev`](https://github.com/shoreditchdesign/globaldata-dev),
which holds the React component library and Storybook catalogue.

Sprint prototypes are a Next.js app built with **shadcn/ui in light mode only** — the point is an
uplift in interaction and component polish over the source designs, presentable straight to the
client.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
```

## Routes

| Route | What it is |
|-------|------------|
| `/` | The index — a table of sprints and ideas. The only navigation surface. |
| `/sprint-3` | Redirects to `/` |
| `/sprint-3/idea-1` | Redirects to the first screen of that idea |
| `/sprint-3/idea-1/results` | One screen of the flow, full bleed, no harness |
| `/sprint-3/compare` | Ideas side by side, stepped through together (Explorer only) |

Prototype screens render alone, filling the viewport. Navigation lives in the **Explorer**, a
floating panel toggled with **Cmd+Shift+E** (Ctrl+Shift+E elsewhere); Esc closes it. It is mounted
on the screen routes only, hides itself inside the compare view's iframes, and remembers whether it
was open for the rest of the session.

Each sprint carries independent ideas — separate takes on the same flow.

## Layout

```
src/app/<sprint>/<idea>/[screen]   route per screen
src/flows/<sprint>/<idea>/flow.ts  screen manifest for one idea
src/flows/<sprint>/<idea>/screens  the screen components
src/flows/registry.ts              source of truth for sprints and ideas
src/components/prototype           index table, Explorer, compare view
src/components/ui                  shadcn components (generated)

docs/<sprint>/{decks,scratchpad,research,exports}
slides/<sprint>                    built HTML decks
sprints/<sprint>                   brief, flow notes, decision log
```

## Adding a screen

1. Add the component to `src/flows/<sprint>/<idea>/screens/`.
2. Register it in that idea's `flow.ts`.

Routes, the Explorer and the compare view pick it up from the manifest.

## Adding a sprint or idea

Mirror the existing folders under `src/app/`, add a `flow.ts`, then register it in
`src/flows/registry.ts`. Add the matching `docs/`, `slides/` and `sprints/` folders.

Conventions: see [`CLAUDE.md`](./CLAUDE.md).
