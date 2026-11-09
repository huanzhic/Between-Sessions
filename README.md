# Between Sessions

## Project stage

Between Sessions aims to help therapy clients reflect between appointments and bring what matters to the next one. The frontend now provides the Milestone 1 client/therapist shells, fictional reflection and approved-letter fixtures, simulated save/failure/retry states, and an independent SOS placeholder. A real health check connects to the API; the API still implements only `/health`. Nothing is deployed, and development uses fictional data only. This project does not claim clinical effectiveness.

Start with [requirements](docs/requirements.md), [design](docs/design.md), [risks](docs/risks.md), and [contributing](CONTRIBUTING.md).

## Repository structure

```text
apps/
├── web/                                  # React + TypeScript frontend (Vite)
│   └── src/
│       ├── api/                          # Client code for calling the API
│       ├── components/                   # Shared UI components
│       └── pages/                        # Screens
└── api/                                  # TypeScript (Node) API, deployed on Render
    └── src/
        ├── auth/                         # Login (Better Auth)
        ├── db/                           # Postgres access
        ├── llm/                          # Claude API integration
        └── routes/                       # HTTP endpoints
db/
├── migrations/                           # Postgres schema changes
└── seeds/                                # Fictional development data only
docs/
├── project/                              # Project framing, scope, requirements, open questions
├── weeks/
│   ├── README.md                         # Weekly record workflow and naming convention
│   └── YYYY-MM-DD/                       # Meeting date; work period starts after that meeting
│       ├── planning.md                   # Weekly goals, tasks, owners, and meeting preparation
│       ├── research.md                   # Research process, findings, and limitations
│       └── meeting.md                     # Meeting notes, decisions, and follow-up actions
│   └── TEMPLATE/                         # Starter files to copy into each dated week folder
│       ├── planning.md
│       ├── research.md
│       └── meeting.md
└── research/
    ├── cbt-llm-background.md              # CBT and LLM background research for team discussion
    └── sources/
        ├── README.md                     # Source catalog instructions
        └── source-index.md               # Central index of sources reviewed or queued
```

### Directory purposes

- **`apps/`** — Application code, managed as npm workspaces. The stack and its BAA requirements are described in [Tech Stack Under BAA Requirements](docs/research/baa-tech-stack.md).
- **`db/`** — Postgres migrations and fictional seed data.
- **`docs/project/`** — Keep the current problem framing, project goals, scope, and questions that need confirmation.
- **`docs/weeks/YYYY-MM-DD/`** — Keep one folder per meeting date, normally Thursday, covering work after that meeting. Store separate `planning.md`, `research.md`, and `meeting.md` records together so the cycle's tasks, research, and decisions are easy to follow.
- **`docs/research/sources/`** — Keep a reusable source catalog. Give each source one stable ID and refer to it from weekly records instead of duplicating its citation.

### Background reading

- [CBT and LLM Background Research](docs/research/cbt-llm-background.md) — Prepared by Zhicheng Huang. Introduces CBT concepts, implementation options, selected studies, and a possible initial investigation for team discussion. It does not represent agreed project requirements.

## Proposed MVP plan

Prepared November 1, 2026 for team/Justin review. These documents propose the reflection-to-letter demo and preserve unresolved conflicts with earlier meeting decisions. They do not describe implemented application features or compliance readiness.

- [MVP scope and architecture](docs/project/mvp-scope-and-architecture.md)
- [Team roles and development order](docs/project/team-roles-and-development-order.md) — teammate-shareable split and Discord message
- [API contract draft](docs/project/api-contract-draft.md)
- [Optional AI summary specification](docs/project/ai-summary-spec.md)
- [Decisions and open questions](docs/project/decisions-and-open-questions.md)
- [Repository audit and change plan](docs/project/repository-change-plan.md)
- [Required GitHub collaboration rules and enforcement status](docs/project/github-collaboration-rules.md)

## Quickstart

Requires Node.js 22 or later and Git. From a clean clone:

```sh
git clone https://github.com/huanzhic/Between-Sessions.git
cd Between-Sessions
npm ci
cp .env.example .env
npm test
npm run dev:api    # in one terminal: http://localhost:3000/health returns {"status":"ok"}
npm run dev:web    # in another terminal: http://localhost:5173 opens the frontend demo
```

The Vite development server proxies `/api/health` to `http://localhost:3000/health`. Its status and retry action appear below the page. See [CONTRIBUTING](CONTRIBUTING.md) for the full set of checks.

### Frontend foundation demo

- `/#/client`: client home, reflection questions, manual letter editing and exact-content preview.
- `/#/therapist`: overview, linked-client example, approved letters, assignment form and settings placeholder.
- `/#/sos`: independent resource placeholder; no sign-in or backend required.

The role links switch fictional previews; they are not authentication. Saves are simulated in memory, including a failure/retry control. Refreshing or switching to the therapist role clears client writing; visiting SOS preserves it. No text is persisted in browser storage or sent to the server. Sending, AI, account settings and real assignment creation are unavailable. Example sent letters are fixed fixtures, not delivery evidence. Backend ownership and authorization still need implementation.

Colors follow [Between Sessions — Frontend v0.1](https://www.figma.com/design/vX1H6Um9USBwHEKtkLILH8), with separate client and therapist palettes. Inter is bundled locally. See the [GitHub/file change plan](docs/project/frontend-v01-change-plan.md).

Browser checks, in addition to the existing CI checks:

```sh
npx playwright install chromium
npx playwright test --config apps/web/playwright.config.ts
```

These start both local servers. Stop existing processes on ports 3000/5173 first. Production hosting needs a same-origin `/api/health` reverse proxy; Vite's development proxy is not included in the static build.

## Weekly workflow

1. Copy the templates in `docs/weeks/TEMPLATE/` to a new folder such as `docs/weeks/2026-10-15/`, using that week's Thursday date.
2. Use the dated meeting as the start of its work period: tasks assigned on October 11 belong in `2026-10-11/`; tasks assigned on October 15 belong in `2026-10-15/`; tasks assigned on October 22 belong in `2026-10-22/`. The same rule applies to Google Drive task tabs. Deadlines and the next meeting date do not change task ownership. See [weekly attribution rules](docs/weeks/README.md).
3. Complete `planning.md` with the dated meeting's follow-up tasks, goals, research questions, owners, expected outputs, and preparation for the next meeting. Link unfinished earlier tasks under Carryover with their original meeting date rather than treating them as new assignments.
4. During research, register each source once in `docs/research/sources/source-index.md`; cite its stable ID in `research.md` and summarize findings and limitations there.
5. Record the dated meeting's outcomes, decisions, unresolved questions, owners, and follow-up actions in `meeting.md` in the same folder as its plan.
6. Link the three weekly records to one another and include relevant GitHub issues or approved meeting materials.

## Information handling

Do not commit real client records, therapy notes, EHR data, identifiable sensitive research data, credentials, or secrets. Store only meeting summaries that are appropriate for the repository; do not upload private email threads or meeting recordings here. Follow the team charter and obtain the required approval before sharing project code, partner information, or meeting content with AI tools. Use synthetic or properly de-identified data for development and testing, as required by the project brief.
