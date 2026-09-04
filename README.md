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
| `/` | All sprints and ideas |
| `/sprint-2` | Sprint overview, both ideas, screen lists |
| `/sprint-2/idea-2` | Redirects to the first screen of that idea |
| `/sprint-2/idea-2/entry` | One screen of the flow, with prototype chrome |
| `/sprint-2/idea-2/entry?chrome=off` | The bare screen, no chrome |
| `/sprint-2/compare` | Both ideas side by side, stepped through together |

Each sprint carries two ideas — two independent takes on the same flow.

## Layout

```
src/app/<sprint>/<idea>/[screen]   route per screen
src/flows/<sprint>/<idea>/flow.ts  screen manifest for one idea
src/flows/<sprint>/<idea>/screens  the screen components
src/flows/registry.ts              source of truth for sprints and ideas
src/components/prototype           prototype chrome
src/components/ui                  shadcn components (generated)

docs/<sprint>/{decks,scratchpad,research,exports}
slides/<sprint>                    built HTML decks
sprints/<sprint>                   brief, flow notes, decision log
```

## Adding a screen

1. Add the component to `src/flows/<sprint>/<idea>/screens/`.
2. Register it in that idea's `flow.ts`.

Routes, the stepper and the compare view pick it up from the manifest.

## Adding a sprint or idea

Mirror the existing folders under `src/app/`, add a `flow.ts`, then register it in
`src/flows/registry.ts`. Add the matching `docs/`, `slides/` and `sprints/` folders.

Conventions: see [`CLAUDE.md`](./CLAUDE.md).
