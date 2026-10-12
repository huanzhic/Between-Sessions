# Between Sessions

## Project stage

We are at the project kickoff stage. Our current work is to frame the problem, review relevant research, and discuss the project with instructors and university stakeholders. Project requirements, research questions, and technical choices are still being refined. This project does not claim clinical effectiveness.

## Repository structure

```text
docs/
├── project/                              # Project framing, scope, requirements, open questions
├── weekly-planning/
│   ├── README.md                         # How to plan and record each week
│   └── weeks/
│       └── TEMPLATE.md                   # Todo, research, and Thursday meeting record
└── research/
    ├── README.md                         # How weekly records use the reusable source catalog
    └── sources/
        ├── README.md                     # Source catalog instructions
        └── source-index.md               # Central index of sources reviewed or queued
```

### Directory purposes

- **`docs/project/`** — Keep the current problem framing, project goals, scope, and questions that need confirmation.
- **`docs/weekly-planning/weeks/`** — Keep one dated record per week containing priorities, research tasks and findings, Thursday meeting preparation and outcomes, and follow-up actions.
- **`docs/research/sources/`** — Keep a reusable source catalog. Give each source one stable ID and refer to it from weekly records instead of duplicating its citation.

## Weekly workflow

1. Copy `docs/weekly-planning/weeks/TEMPLATE.md` to `docs/weekly-planning/weeks/YYYY-MM-DD.md`, using the Monday date for that week.
2. At the start of the week, add the todo items, research questions, owners, and expected outputs.
3. During research, register each source once in `docs/research/sources/source-index.md`, then cite its ID in the weekly record and summarize findings and limitations there.
4. Before Thursday's meeting, add questions, context, and the clarification or decision needed.
5. After the meeting, record outcomes, unresolved questions, owners, and follow-up actions in the same weekly file. Link any GitHub issues or approved meeting materials.

## Information handling

Do not commit real client records, therapy notes, EHR data, identifiable sensitive research data, credentials, or secrets. Store only meeting summaries that are appropriate for the repository; do not upload private email threads or meeting recordings here. Follow the team charter and obtain the required approval before sharing project code, partner information, or meeting content with AI tools. Use synthetic or properly de-identified data for development and testing, as required by the project brief.

This structure is a starting point for the kickoff phase and can grow as the team moves into design and development.
