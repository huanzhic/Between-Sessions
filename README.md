# Between Sessions

## Project stage

We are at the project kickoff stage. Our current work is to frame the problem, review relevant research, and discuss the project with instructors and university stakeholders. Project requirements, research questions, and technical choices are still being refined. This project does not claim clinical effectiveness.

## Repository structure

```text
docs/
├── project/                       # Project framing, scope, requirements, open questions
├── literature/                    # Bibliography, reading notes, evidence synthesis
├── research/
│   ├── README.md                   # How weekly research records and sources work together
│   ├── weekly/
│   │   └── TEMPLATE.md             # Reusable record for each week's research
│   └── sources/
│       ├── README.md               # Source catalog instructions
│       └── source-index.md          # Central index of sources reviewed or queued
├── weekly-planning/
│   ├── README.md                   # Weekly planning and Thursday meeting workflow
│   └── weeks/
│       └── TEMPLATE.md             # Reusable weekly todo and meeting-prep template
├── meetings/
│   ├── team/                       # Internal team meeting notes and action items
│   └── stakeholders/               # Instructor and university staff discussion notes
└── planning/                       # Semester milestones and decision points
```

### Directory purposes

- **`docs/project/`** — Keep the current problem framing, project goals, scope, and questions that need confirmation.
- **`docs/literature/`** — Track citations, reading notes, and summaries of published work. Prefer links and citations; only include full-text files when their license and course policy allow it.
- **`docs/research/weekly/`** — Keep dated records of the research questions, methods, sources reviewed, findings, limitations, and follow-up work for each week.
- **`docs/research/sources/`** — Keep a reusable source catalog. Give each source one stable ID and refer to it from weekly research records instead of duplicating its citation.
- **`docs/weekly-planning/weeks/`** — Keep each week's todo, research priorities, questions for Thursday's meeting, decisions needed, and post-meeting follow-up.
- **`docs/meetings/team/`** — Record internal meeting summaries, decisions, owners, and follow-up actions.
- **`docs/meetings/stakeholders/`** — Record concise summaries, confirmed requirements, open questions, and action items from discussions with instructors and university staff.
- **`docs/planning/`** — Track semester goals, milestones, dependencies, and upcoming decision points.

## Weekly workflow

1. Copy the weekly planning template to `docs/weekly-planning/weeks/YYYY-MM-DD.md`, using the Monday date for that week.
2. List the research questions, owners, expected outputs, and questions to bring to Thursday's meeting.
3. Record research activity in `docs/research/weekly/YYYY-MM-DD.md`. Add each source to `docs/research/sources/source-index.md` once and cite its stable ID in weekly records.
4. After the meeting, update decisions, unresolved questions, owners, and follow-up actions; link to the appropriate meeting notes or GitHub issue.

## Information handling

Do not commit real client records, therapy notes, EHR data, identifiable sensitive research data, credentials, or secrets. Store only meeting summaries that are appropriate for the repository; do not upload private email threads or meeting recordings here. Follow the team charter and obtain the required approval before sharing project code, partner information, or meeting content with AI tools. Use synthetic or properly de-identified data for development and testing, as required by the project brief.

This structure is a starting point for the kickoff phase and can grow as the team moves into design and development.
