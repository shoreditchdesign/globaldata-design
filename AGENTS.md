## Project context

This repository is a design exercise exploring approaches to natural-language search for
GlobalData's drug database. Every idea is a hands-on, independent variant — do not extract a
shared core package or a cross-variant React component library.

## Branch and commit workflow

- **Work on `main` and push there.** Do not create or switch branches unless you are explicitly
  asked to for that piece of work. A named branch belongs to whoever asked for it.
- **The repository has a single working tree, shared by every concurrent session.** A `git
  checkout` in one session switches the branch for all of them, so check `git branch
  --show-current` before you commit — it may have moved since you last looked. If work lands on
  the wrong branch, cherry-pick your own commits across rather than merging, since the branch
  will carry other sessions' work too.
- Stage only the files you intended to change and read the staged diff before committing. Other
  sessions' uncommitted work is usually in the tree alongside yours; committing it is not yours
  to do. If a shared file has to go in, say whose work it was.
- Make focused commits with conventional labels (`feat:`, `fix:`, `docs:`, `refactor:`,
  `chore:`). Do not mix unrelated work in one commit.
- Open a pull request only when asked. Otherwise a coherent, verified body of work goes straight
  to `main`.

## Review

- `pnpm typecheck`, `pnpm lint` and `pnpm build` must all pass before anything is pushed. The
  production build catches what the other two do not — a route that typechecks can still fail to
  prerender.
- For anything visual, run the local dev server and point to the exact route to look at, saying
  what changed there. Do not rely on a hosted deployment for interim review.
- When adding or splitting an idea, wire it into the routes and the registry, and name the route
  it now lives at.

## Project material and privacy

`docs/`, `slides/` and `sprints/` are project context and a working scratchpad. This repository is
private: do not publish that material, copy it to external services, or expose it through a public
deployment. Keep credentials, personal data and commercial detail about the client relationship
out of it entirely.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
