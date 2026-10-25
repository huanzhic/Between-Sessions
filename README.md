# Between Sessions

## Project stage

We are in planning and early prototyping. A React/TypeScript frontend and Node API scaffold are in place, with the stack selection recorded in [Stanley's research](docs/research/baa-tech-stack.md). The web currently shows a title and the API exposes `/health`; authentication, database integration, and LLM features are not implemented. Product scope, mobile delivery, and pilot preparation remain to be resolved. This project does not claim clinical effectiveness.

See [current task status and proposed next steps](docs/project/status.md), synchronized with GitHub on October 25, 2026.

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

## Development setup

Requires Node.js 22 or later.

```sh
npm install
cp .env.example .env
npm run dev:web    # frontend at http://localhost:5173
npm run dev:api    # API at http://localhost:3000/health
npm run typecheck
```

## Weekly workflow

1. Copy the templates in `docs/weeks/TEMPLATE/` to a new folder such as `docs/weeks/2026-10-15/`, using that week's Thursday date.
2. Use the dated meeting as the start of its work period: tasks assigned on October 11 belong in `2026-10-11/`; tasks assigned on October 15 belong in `2026-10-15/`; tasks assigned on October 22 belong in `2026-10-22/`. The same rule applies to Google Drive task tabs. Deadlines and the next meeting date do not change task ownership. See [weekly attribution rules](docs/weeks/README.md).
3. Complete `planning.md` with the dated meeting's follow-up tasks, goals, research questions, owners, expected outputs, and preparation for the next meeting. Link unfinished earlier tasks under Carryover with their original meeting date rather than treating them as new assignments.
4. During research, register each source once in `docs/research/sources/source-index.md`; cite its stable ID in `research.md` and summarize findings and limitations there.
5. Record the dated meeting's outcomes, decisions, unresolved questions, owners, and follow-up actions in `meeting.md` in the same folder as its plan.
6. Link the three weekly records to one another and include relevant GitHub issues or approved meeting materials.

## Information handling

Do not commit real client records, therapy notes, EHR data, identifiable sensitive research data, credentials, or secrets. Store only meeting summaries that are appropriate for the repository; do not upload private email threads or meeting recordings here. Follow the team charter and obtain the required approval before sharing project code, partner information, or meeting content with AI tools. Use synthetic or properly de-identified data for development and testing, as required by the project brief.

This structure is a starting point for the kickoff phase and can grow as the team moves into design and development.
