## Project context

- This repository is a design exercise exploring new approaches to natural-language search for GlobalData's database platform.
- Alex Gibson is collaborating with another designer on the work.
- This is an exploratory prototype repository. Each idea should remain a hands-on, independent variant; do not introduce a shared core package or React component library unless Alex explicitly asks for one.

## Branch, commit, and pull-request workflow

- Work on a dedicated branch. The current working branch is `S3E1`; continue on it for the current piece of work unless Alex directs otherwise.
- Before starting a subsequent release, a new idea, or an independent split, confirm with Alex whether to resume the current branch or create a new branch.
- Keep changes scoped to the active branch. Stage only the intended files and inspect the staged diff before committing.
- Make routine, focused commits as changes are completed. Use relevant conventional labels such as `feat:`, `fix:`, `docs:`, `refactor:`, or `chore:` and do not mix unrelated work in one commit.
- Push the completed branch and open a GitHub pull request when an idea or coherent body of work is finished. Do this only after Alex has confirmed the result is satisfactory on the local development server when a visual or runtime check applies.

## Local development and review

- Alex is not familiar with local development. Whenever a change benefits from browser review, start or identify the appropriate local development command, then explicitly prompt Alex to open the relevant `localhost` URL and explain what to check.
- Use the local development server as the source of truth during iteration. Do not rely on Vercel or another hosted deployment for interim review.
- When adding or splitting an idea, wire it into the appropriate routes and folder structure. Point Alex to the relevant route and, when useful, the corresponding location in the file explorer.

## Design system

- Follow the repository's existing shadcn/ui component system and core colour palette. Reuse the established tokens, primitives, patterns, and components rather than creating a competing visual language.
- Preserve the exploratory structure: variants may implement their ideas independently, without extracting shared core packages or a cross-variant React component library.

## Project material and privacy

- Existing material under `docs/`, `slides/`, and `sprints/` is project context and may be used as a private scratchpad while working.
- Preserve that material in this private repository. Do not publish it, copy it to public services, or expose it through a public deployment.
- Do not add credentials, personal data, or other sensitive information about the client relationship to the scratchpad or repository.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
