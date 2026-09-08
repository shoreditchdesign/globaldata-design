# Codex thread handoff

This private handoff preserves the useful context from the Codex conversation that set up this repository. Authentication codes and transient security details have intentionally been omitted.

## Current state

- Repository: `shoreditchdesign/globaldata-design`
- Local path: `/Users/alexgibson/Documents/GitHub/globaldata-design`
- Active working branch: `S3E1`
- Remote: `origin` points to `https://github.com/shoreditchdesign/globaldata-design.git`
- GitHub authentication was completed successfully with the collaborator account `shoreditchdesigneng`.
- The working tree was clean when this handoff was created.
- `S3E1` is currently local and contains commit `616981c docs: add repository working guidance` on top of `origin/main`.
- No pull request has been opened. Continue working on `S3E1`; push and open the PR only after Alex confirms the work is satisfactory locally.

## Project context established in the thread

Alex Gibson is collaborating with another designer on an exploratory design exercise for natural-language search in GlobalData's database platform. Each design idea is intended to remain a hands-on variant rather than becoming a shared React component package at this stage.

The repository's `AGENTS.md` was expanded with the agreed working conventions:

- Work on a dedicated branch; `S3E1` is the current branch.
- Before a subsequent release, new idea, or independent split, confirm with Alex whether to continue the branch or create another one.
- Stage only intended changes, inspect the staged diff, and make focused conventional commits such as `feat:`, `fix:`, `docs:`, `refactor:`, or `chore:`.
- Review visual and runtime changes on the local development server. Explicitly tell Alex which `localhost` URL to open and what to check.
- Do not rely on Vercel or another hosted deployment during iteration.
- Once an idea or coherent body of work is complete and Alex is happy with the local result, push the branch and open a GitHub pull request for the team to merge.
- Follow the existing shadcn/ui design system, component patterns, and colour tokens.
- Wire new or split ideas into the appropriate routes and folder structure, and point Alex to the relevant browser route and file-explorer location.
- Treat `docs/`, `slides/`, and `sprints/` as private project context and scratchpad material. Preserve them in the private repository and do not add credentials, personal data, or other sensitive client information.

## Conversation timeline

1. Alex supplied `https://github.com/shoreditchdesign/globaldata-design.git` and asked for it to be cloned locally with a new branch named `S1E1`.
2. GitHub browser/device authentication was completed, the repository was cloned, and `S1E1` was created and checked out.
3. Alex asked for the local branch to be renamed to `S3E1`. It was renamed and verified as the active branch.
4. Alex provided repository-specific working, review, design-system, routing, commit, PR, and privacy instructions. These were added to `AGENTS.md` and committed as `616981c docs: add repository working guidance`.
5. Alex confirmed that work should resume on `S3E1`, with a pull request to be opened only after local review and approval; the team will merge it afterward.
6. Alex asked for future Shoreditch Design repositories to live under `/Users/alexgibson/Documents/GitHub` instead of `/Users/alexgibson/Documents/Ryzome`.
7. The existing repository was moved—without recloning—to `/Users/alexgibson/Documents/GitHub/globaldata-design`. Its Git history, remote, commit, and `S3E1` checkout were verified after the move. The old copy under `Ryzome` no longer exists.
8. Alex was advised that repositories belong under `Documents/GitHub`, while any future SSH private keys should live under `~/.ssh` with appropriate permissions and should never be committed to a repository.
9. The previous Codex session was still rooted at `/Users/alexgibson/Documents/Ryzome`; the next session should open `/Users/alexgibson/Documents/GitHub/globaldata-design` as its workspace before development resumes.

## Resume checklist

When opening a new Codex session from this repository:

1. Read `AGENTS.md`, `CLAUDE.md`, and the relevant material under `docs/`, `slides/`, and `sprints/` before changing application code.
2. Confirm `pwd` resolves to `/Users/alexgibson/Documents/GitHub/globaldata-design`.
3. Confirm `git branch --show-current` returns `S3E1` and inspect `git status --short --branch`.
4. Ask Alex what design work to resume.
5. For visual changes, run the local development server and provide the exact `localhost` route for review.
6. Do not open a pull request until Alex explicitly confirms the local result is ready.
