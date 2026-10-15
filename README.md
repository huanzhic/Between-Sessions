# Between Sessions

## Project stage

We are at the project kickoff stage. Our current work is to frame the problem, review relevant research, and discuss the project with instructors and university stakeholders. Project requirements, research questions, and technical choices are still being refined. This project does not claim clinical effectiveness.

## Repository structure

```text
docs/
├── project/                              # Project framing, scope, requirements, open questions
├── weeks/
│   ├── README.md                         # Weekly record workflow and naming convention
│   └── YYYY-MM-DD/                       # One folder per week, named with that week's Thursday
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

- **`docs/project/`** — Keep the current problem framing, project goals, scope, and questions that need confirmation.
- **`docs/weeks/YYYY-MM-DD/`** — Keep one folder per week, named with that week's Thursday date. Store separate `planning.md`, `research.md`, and `meeting.md` records together so the week's preparation, research, and decisions are easy to follow.
- **`docs/research/sources/`** — Keep a reusable source catalog. Give each source one stable ID and refer to it from weekly records instead of duplicating its citation.

### Background reading

- [CBT and LLM Background Research](docs/research/cbt-llm-background.md) — Prepared by Zhicheng Huang. Introduces CBT concepts, implementation options, selected studies, and a possible initial investigation for team discussion. It does not represent agreed project requirements.

## Weekly workflow

1. Copy the templates in `docs/weeks/TEMPLATE/` to a new folder such as `docs/weeks/2026-10-15/`, using that week's Thursday date.
2. At the start of the week, complete `planning.md` with goals, todo items, research questions, owners, expected outputs, and Thursday meeting preparation.
3. During research, register each source once in `docs/research/sources/source-index.md`; cite its stable ID in `research.md` and summarize findings and limitations there.
4. After Thursday's meeting, record outcomes, decisions, unresolved questions, owners, and follow-up actions in `meeting.md`.
5. Link the three weekly records to one another and include relevant GitHub issues or approved meeting materials.

## Information handling

Do not commit real client records, therapy notes, EHR data, identifiable sensitive research data, credentials, or secrets. Store only meeting summaries that are appropriate for the repository; do not upload private email threads or meeting recordings here. Follow the team charter and obtain the required approval before sharing project code, partner information, or meeting content with AI tools. Use synthetic or properly de-identified data for development and testing, as required by the project brief.

This structure is a starting point for the kickoff phase and can grow as the team moves into design and development.
