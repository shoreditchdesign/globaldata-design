# Sprint 4, Idea 1 — new prototype on branch S4I1

Build a new prototype direction as Sprint 4 Idea 1 in `shoreditchdesign/globaldata-design`. Read `CLAUDE.md` and `AGENTS.md` first, and follow the patterns the repo already uses rather than inventing new ones.

**The idea:** <!-- fill in -->

## Branch

- Fetch first, so the branch starts from the newest main on the remote rather than a stale local copy:

  ```
  git fetch origin
  git log --oneline -5 origin/main
  ```

  The top commit should be `chore: clear Sprint 4 Idea 1 for its own branch`, or something newer. If it isn't, main hasn't been pushed yet. Wait for it rather than branching from an older main.

- Then create the branch from the fetched main:

  ```
  git switch -c S4I1 origin/main
  ```

- Everything happens on `S4I1`. Don't commit or push to `main`.

## Sandboxing

- All of this idea's code lives in `src/flows/sprint-4/idea-1/`.
- Don't import from other ideas' folders (`src/flows/sprint-3/*`, `src/flows/sprint-4/idea-2`). If you need something from one, copy it into your folder and adapt it there.
- The shared layer is fine to use as-is: `src/components/ui` (shadcn) and `src/components/prototype`.

## Structure

- Follow the existing shape: `flow.ts`, `screens/`, `components/`, `data.ts`, `state.ts`. The routes and the registry entry for Idea 1 already exist, so replace the placeholder `flow.ts` and it appears in the Explorer, on the index table and on the compare page.
- Split the idea into states addressable by URL, as Sprint 3 does: one living screen, a slug per state (`/sprint-4/idea-1/<slug>`), seeded from `state.ts` and kept in sync with `useDeepLink`. `src/flows/sprint-4/idea-2` is a working example of the pattern.
- Use the same token system, shadcn components and grid type scale as the other ideas.

## Commit and pull request

- Check your work on `pnpm dev`. `pnpm typecheck`, `pnpm lint` and `pnpm build` must all pass.
- Stage only the files you changed and make focused conventional commits (`feat:`, `fix:`, `docs:`) on `S4I1`.
- Before opening the pull request, fetch again and rebase onto the latest main, so it merges cleanly:

  ```
  git fetch origin
  git rebase origin/main
  ```

- Push with `git push -u origin S4I1` (after a rebase on an already-pushed branch, use `git push --force-with-lease`), then open a pull request into main with `gh pr create --base main --head S4I1`. List the routes to review in the description. Leave it unmerged for review.
