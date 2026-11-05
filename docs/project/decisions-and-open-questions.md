# Decisions and open questions

Prepared November 1, 2026. These are proposals or unresolved questions, not retroactive meeting decisions. Existing dated assignments retain their owners and dates under [weekly attribution rules](../weeks/README.md).

## Source register and discrepancies

- **S-BRIEF:** User's November 1 execution brief, "Between Sessions MVP Roles, Architecture, and Development Sequence," supplied as a chat attachment. Its V3 description is the source for the eight-panel reflection-to-letter flow and independent SOS placeholder. It reports another later meeting summary with post-session/configurable windows; that underlying summary and standalone V3 storyboard are **not present in this checkout**. Do not invent a meeting date or claim independent verification. This register preserves the supplied provenance without adding the private attachment to the repository.
- [October 11 meeting](../weeks/2026-10-11/meeting.md): early pilot ideas and React/FastAPI discussion, not current implemented architecture.
- [October 15 meeting](../weeks/2026-10-15/meeting.md): decision-tree prototype and exploratory alerts/storage/monitoring, no agreed response workflow.
- [October 22 meeting](../weeks/2026-10-22/meeting.md): deferred therapist interaction, chose native App Store direction and considered Watch features. V3's therapist assignment/inbox and this plan's web-first recommendation therefore require confirmation.
- [October 25 stack research](../research/baa-tech-stack.md) and [October 22 research](../weeks/2026-10-22/research.md): the local baseline explicitly describes a selected stack at Stanley's direction, with some unverified claims. Remote main `b628c95` removes the stack document's status paragraph and task-attribution sentence (reviewed by diff), while selected-stack labels remain in its body and the weekly research is unchanged. Preserve these records without treating them as deployment, signed agreements, current vendor eligibility or compliance. This task does not revalidate vendor prices/model claims or change providers. See the [audit](repository-change-plan.md) for the local/remote distinction.

## Decision log awaiting agreement

All decisions below are OPEN. "Approver" identifies who should agree, not someone already consulted. Record the actual decision, date, approvers and superseded proposal here after discussion.

| Question / conflict | Planning assumption or limit | Proposed approver / preparer |
| --- | --- | --- |
| Before next appointment vs 24 hours after prior session? Is threshold therapist configurable (12/24h)? | V3's 24h-before to appointment-start rule is a proposed demo default only; no hardcoded product policy. Options, the swappable policy and questions are in the [send-window proposal](send-window-proposal.md). Exact trigger, inclusivity, exceptions and missing appointments unresolved. Source: S-BRIEF; later source unavailable | Team + Justin; Backend B drafts alternatives, Huang reviews copy |
| Rescheduled/canceled appointments, timezone changes and daylight saving? | Store UTC and IANA timezone; version/recheck at send. Reopening, grace periods, retargeting and existing-letter display need decisions | Team + Justin; Backend B with A |
| One letter per activity, resend, correction or withdrawal? | Fixed approved snapshots required. Do not implement overwrite; duplicate/retry semantics distinguished from an authorized second submission | Team + Justin; Backend B |
| Therapist features deferred vs V3 assignment/inbox? Clinical record/review expectation? | Propose limited asynchronous inbox only, no guaranteed response/read/assessment. Legal/clinical-record implications remain open. Sources: October 22 meeting, S-BRIEF | Justin + team; appropriate clinical/legal reviewer for future real use |
| Native App Store/Watch vs responsive web? | Recommend existing web stack for first milestone; native direction from October 22 remains recorded, not silently canceled | Team + Justin; Huang estimates UI scope |
| Guest SOS access and region? What real service, if any? | Independent, clearly labeled static placeholder only. Guest entry/region-specific resources need design agreement; no calls/transmission/alerts/triage | Team + Justin; separate approved service/operations review before integration |
| What may AI receive and retain? Which model/plan/provider? | Explicit source selection, server-only call, fictional data only. API access is not suitability or paid-plan approval | Team + Justin; Huang rubric, Backend B integration, A privacy |
| Who signs BAAs; which vendors/features/intermediaries are covered? | Research is not a signed agreement or HIPAA-ready system; no paid activation or PHI. Verify actual agreements/configuration separately before any pilot | Authorized account/entity owner and appropriate institutional/legal reviewer with Justin; team gathers evidence |
| Relationship enrollment, auth/session choices, assignment edits, retention and deletion? | Server authorization mandatory; library-specific paths, lifecycle and retention not finalized | Backend A + B + Huang; Justin for user-facing boundaries |
| Which facts must an AI summary preserve, and how are missed or changed details evaluated? | Fictional test cases only, including omission and meaning-change checks | Huang drafts; team reviews |
| Backend framework, ORM, contract validation and test database? | Proposed November 4, 2026 by Backend B: Hono and shared Zod `packages/contracts`. Database tooling, schema and migrations are Backend A's to choose; Backend B suggests Prisma with `prisma dev` locally and a Postgres service in CI, and lists its table needs in the [workflow schema proposal](workflow-schema-proposal.md). Also proposed: a swappable send policy whose demo default is `[startsAt - 24h, startsAt)`. Contracts package added; nothing else implemented | Backend A + B + Huang |
| Which teammate takes Backend A/B? | Names TBD; Huang owns frontend/AI feature design only | All three teammates |

## Current scope and collaboration requirements

Keep one npm monorepo. This planning PR does not implement the full application, deploy services, activate paid plans, use patient data, claim clinical effectiveness, or connect live emergency/monitoring services. Development uses fictional data only.

The user authorized publication through a feature branch and [PR #20](https://github.com/huanzhic/Between-Sessions/pull/20). Main now requires peer review and the **Typecheck and build** GitHub Actions check, with up-to-date branches. GitHub CI has passed on Node 22; see [verification evidence](github-collaboration-rules.md). Merge still requires an eligible teammate's approval, resolved conversations and passing CI on the latest revision. These collaboration requirements are mandatory, not open product decisions.
