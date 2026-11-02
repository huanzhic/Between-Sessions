# Contributing

For whoever makes the next change: a teammate, the partner's developers, the team after us, or an AI tool. Response times below are proposed and await team confirmation.

## Development setup

Start with the [README quickstart](README.md#quickstart). Beyond that:

- Copy `.env.example` to `.env`. No code loads this file yet. `DATABASE_URL` and `ANTHROPIC_API_KEY` are reserved for future code; if you need a key, ask a teammate privately, and never commit one.
- No local services are needed yet.
- Use fictional data only. Never commit real client records, therapy notes, or credentials.

## Local checks

These are the commands CI runs, from the repository root:

```sh
npm ci
npm run typecheck
npm test
npm run build
```

Linting and formatting do not exist yet. ESLint and Prettier, with a CI step, are planned by November 15, 2026 (proposed owner: Stanley Eng).

## Branches and commits

- The default branch is `main`. Nobody pushes to it directly.
- Branch names follow `type/short-description`, for example `feat/client-save-states`.
- Commit messages follow `type: what changed and why`, for example `fix: keep local edits when a save fails so clients do not lose writing`. Types include `feat`, `fix`, `docs`, `test`, and `chore`.

## Pull requests and review

Full policy and enforcement evidence: [GitHub collaboration rules](docs/project/github-collaboration-rules.md).

- Keep pull requests small. A pull request includes a short summary, how it was validated, and any doc changes the behavior requires.
- It needs **1 approval** from another human teammate with write access: Zhicheng Huang (`huanzhic`), Stanley Eng (`StanLeeEng`), or Jack Almutairi (`JackAlmutairi`). Authors cannot approve their own work.
- New pushes dismiss earlier approvals, and the latest push must be approved by someone other than its pusher. All review conversations must be resolved.
- Reviews are expected within **48 hours**.
- The branch must be up to date with `main`, and the **Typecheck and build** check must pass. The job also runs tests, but keep that name: branch protection requires it exactly.
- Merge with **squash and merge** when a branch's history is noisy. Nobody bypasses protection or force-pushes `main`.
- Changes to schema, authentication, deployment, or migrations are hard to undo: describe the rollback in the pull request.

## Definition of Done

| Check | Enforced by |
| --- | --- |
| Types check | `npm run typecheck` in `.github/workflows/ci.yml` |
| Tests pass, and new behavior has a test that fails if it breaks | `npm test` in CI; the test requirement is checked by the reviewer |
| The build succeeds | `npm run build` in CI |
| Peer review is complete and conversations are resolved | `main` branch protection |
| `docs/requirements.md` and `docs/design.md` match the change | Reviewer |
| New risks and prerequisites are in `docs/risks.md` | Reviewer |
| Lint and format pass | Not enforced yet: CI step planned by November 15, 2026 (proposed owner: Stanley Eng) |
| Security checks | Not enforced yet: dependency audit in CI planned by November 22, 2026 (proposed owner: Stanley Eng) |

CI has been shown to fail when behavior breaks: [a deliberately broken `/health` went red](https://github.com/huanzhic/Between-Sessions/actions/runs/41370725045) on throwaway [pull request 21](https://github.com/huanzhic/Between-Sessions/pull/21), which was not merged.

## Where other work lives

| Work | Where | Accepted by |
| --- | --- | --- |
| Meeting notes, weekly plans, and research | `docs/weeks/` and `docs/research/`, by pull request; see [weekly rules](docs/weeks/README.md) | A peer reviewer |
| Task tracking | The team's GitHub Project board and GitHub issues | The task's owner |
| Prototypes and storyboards made outside this repository | Team shared drive, linked from the board | The team at the weekly meeting |
| Partner decisions | Recorded in the dated `meeting.md` and in [Decisions and open questions](docs/project/decisions-and-open-questions.md) | Justin Jacques |
| Team documents, such as the charter and retrospectives | The team's own files, not this repository | The team |

## Getting help

Ask in the team's Discord channel, and expect an answer within **24 hours**. Bring anything needing partner input to the Thursday 6 PM meeting. A problem between teammates goes to the Teaching Assistant.
