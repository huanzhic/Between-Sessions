# Suggested team split and development order

Prepared November 1, 2026. Proposed allocation for discussion; Backend A and Backend B names are **TBD**. Historical tasks keep their original owner and assigning meeting date. See [scope](mvp-scope-and-architecture.md) and [open decisions](decisions-and-open-questions.md).

| Huang — Frontend & AI Feature Lead | Backend A — Core Infrastructure, Identity & Data Security (TBD) | Backend B — Reflection Workflow, Letter APIs & AI Integration (TBD) |
| --- | --- | --- |
| Client assignment/questions, private save states, manual and AI draft editing, recipient/content confirmation and send feedback | Schema, migrations, fictional seeds and data-access layer | Assignments/questions, appointment linkage, private draft endpoints and letter lifecycle |
| Therapist assignment UI, appointment display, inbox and approved letter view | Authentication, sessions, therapist-client relationships and ownership checks | Server submission windows/state machine, UTC/timezones and atomic immutable sent snapshots |
| Responsive routing, shared accessible components, independent SOS placeholder and API integration | Server-enforced privacy, role authorization, safe errors/audit primitives and authorization tests | Server-only provider SDK/keys, structured-output validation, timeouts/fallback and workflow/integration tests |
| AI requirements, prompts, proposed output schema, source-faithfulness rubric and fictional evaluation cases | Reviews every API field/access boundary with Backend B | Drafts endpoint contracts with A's security review and Huang's UI review; maintains API documentation |
| Does not own server SDK/keys/routes, storage, authentication, authorization, deployment or BAAs | Does not own UI or all workflow/LLM logic | Does not own frontend or replace A's identity/storage protections |

We should keep scope comparable by delivering small vertical pieces. Huang's two role-based interfaces are substantial; Backend A's privacy tests and Backend B's lifecycle/AI failures are equally necessary. Revisit the split together if one milestone becomes uneven.

## Shared responsibilities and sequence

Agree on the [API contract](api-contract-draft.md) before parallel implementation: B drafts endpoints, A reviews access/data fields, Huang reviews consumption. Each owner tests their module; all three run the fictional Dr. Lee → Maya stressful-work-moment scenario and failures together.

| Milestone | Huang | Backend A | Backend B | Dependency / exit criterion |
| --- | --- | --- | --- | --- |
| 0. Contract | Screens, mock DTOs, AI rubric | Entities, privacy matrix, auth assumptions | Routes, state machine, time policy proposal | All three approve a coherent draft; record unresolved rules with Justin |
| 1. Foundation in parallel | Client/therapist shells and independent SOS placeholder with mocks | Auth/data layer and fictional linked-user seeds | Activity/appointment/draft skeleton with deterministic mocks | Depends on M0; runnable app, stable DTOs and tested role boundaries |
| 2. Manual end-to-end | Forms, save/edit, exact-content/recipient review, explicit send, inbox | Ownership and access enforcement | Assignment/save/send/inbox with atomic snapshot and approved demo policy | Depends on M1 and timing/submission decisions; Dr. Lee → Maya → sent letter → Dr. Lee works without AI |
| 3. Optional AI | Prompt fixtures, review editor, manual alternative | Apply private access rules to AI requests/storage | Server model call, schema validation, timeout/failure handling | Depends on manual flow; editable AI draft, manual path always usable |
| 4. Integration/demo | Responsive and accessible states | Security/integrity tests | Lifecycle/window/AI tests | Shared fictional demo passes; no implied monitoring/emergency connection |

## Milestone 1 tasks to pick up after contract agreement

| Owner | Task | Dependency | Acceptance criterion |
| --- | --- | --- | --- |
| Huang | Build client/therapist shells with agreed mock DTOs and save/error states | M0 screen/DTO agreement | Both roles navigate on mobile and desktop; private fields absent from therapist mocks |
| Huang | Add independent SOS placeholder | Agreed prototype copy; guest decision documented | Available outside sending/AI state; clearly sends nothing and promises no monitoring |
| Backend A | Choose migration approach within existing stack; create fictional Dr. Lee/Maya plus unrelated-user fixtures | M0 entities and identity assumptions | Repeatable local seed and documented startup; no real data |
| Backend A | Implement sessions/relationship access checks | Seed and agreed auth contract | Anonymous, wrong-role and cross-client access denied; therapist private-draft access denied |
| Backend B | Implement activity/appointment/private-draft API skeleton | DTO agreement; A's repository/session interface (use mocks while pending) | Deterministic responses, schema validation and draft conflicts documented; no accidental send endpoint behavior |
| All three | Integrate shells with API and review policy | Above tasks; repository access | App runs, health remains available, typecheck/build pass, one peer reviews each feature PR |

## GitHub workflow (required)

Feature branch → PR → **at least one eligible human teammate's approving review** → passing required CI → merge. Authors cannot approve themselves; new reviewable code requires fresh approval. Resolve review conversations. No direct pushes to main and no admin/maintainer bypass. See [policy and live enforcement status](github-collaboration-rules.md); local CI preparation is not yet an enforced remote check.

## Discord-ready message

> I reviewed the storyboard and repo and drafted a suggested three-way split. I can take the client + therapist frontend and AI summary design/testing. Backend A could own auth, database and privacy; Backend B could own assignments, reflection/letter APIs, submission windows and server-side AI. Both backend roles are still TBD—please suggest changes. Let's agree on the API contract first, build the manual reflection-to-letter flow, then add optional AI. Every change to main needs a PR, an approval from another teammate and passing CI; nobody can approve their own PR or bypass review. We still need to confirm the sending window, web vs native direction and therapist scope with Justin.
