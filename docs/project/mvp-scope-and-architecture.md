# Proposed MVP scope and architecture

Prepared November 1, 2026. Proposal for team/Justin review, not an implemented product or clinical validation. Use fictional data only. See [open decisions](decisions-and-open-questions.md), [roles](team-roles-and-development-order.md), and [API draft](api-contract-draft.md).

## User stories and ordinary flow

1. As a therapist and client, we agree on an unfinished topic at the end of an appointment.
2. As a therapist, I assign that topic and customizable questions to my linked client for a next appointment.
3. As a client, I see the assignment, next appointment, privacy boundaries, and proposed sending availability.
4. I answer at my own pace, skip questions, and save private answers or writing at any time. The UI distinguishes saving, saved, and save failure; failed saves retain local edits and offer retry.
5. I write a summary myself or optionally request an AI-organized draft. Both paths lead to the same editable review screen.
6. I review the exact letter and intended recipient, edit it, and explicitly send within the agreed window. AI never sends.
7. The therapist's asynchronous inbox contains only the approved fixed sent letter. Sent does not mean read, clinically assessed, or guaranteed a response.
8. We can use that letter to start the next appointment.

V3's **proposed demo default** opens sending 24 hours before the next appointment and closes at its start: `opensAt <= serverNow < closesAt`. Writing is always available. This timing is disputed, not approved product policy. Backend B must keep any eventual demo policy explicit and configurable; no timing rule is implemented in this preparation task.

## Independent SOS path

Keep a prominent SOS resource entry available independently of writing, AI, appointment availability, or sending state. Prototype copy: "Prototype resource placeholder. This does not contact emergency services or your therapist. Nobody is monitoring this entry." Do not claim dispatch, receipt, intervention, or help on its way. No calls, data transmission, therapist alerts, risk scores, automatic triage, or real crisis integration. Guest access, region and eventual resources require approval. A demonstrated support prompt would be illustrative only, with no real risk classification.

## Architecture target

Retain the npm TypeScript monorepo: one responsive React application with `/client/*` and `/therapist/*` routes, one modular Node API, and one proposed Postgres store. Recommend mobile-responsive web for the first milestone using the existing stack; the October 22 native App Store direction remains an explicit unresolved decision. Role-aware routes provide navigation; server authorization provides protection.

```text
React app: app/ (router/providers), features/client/, features/therapist/,
           features/sos/, components/, api/ (typed clients)
Node API:  modules/auth/, activities/, reflections/, letters/, ai/;
           db/ (repositories), middleware/ (auth/authorization/errors)
Postgres:  db/migrations/, db/seeds/ (fictional)
Future:    packages/contracts/ (only once consumed by both apps)
```

These are target modules, not new empty scaffolds. Backend A owns identity/storage and access enforcement; Backend B owns workflow and server-only AI invocation; Huang owns UI and AI requirements/evaluation. Browser bundles must never contain provider keys or provider SDK invocation. Existing Render/Better Auth/Claude research is retained without selecting new vendors, signing agreements, or treating planned services as deployed.

## Proposed data visibility and entity ownership

All application records below are confidential within their relationship; "shared" does not mean public. Backend A owns persistence and access controls for all entities; the owner column identifies domain responsibility. Scope queries by authenticated identity and an active therapist-client link. No administrator dashboard, aggregation endpoint, log, export, or debug path may expose private drafts to therapists.

| Entity / proposed fields | Client access | Therapist access | Domain owner |
| --- | --- | --- | --- |
| User: id, role, displayName; credentials/session secrets separate | Own minimal profile; never secrets | Own profile and minimal linked-client identity | Backend A |
| TherapistClientLink: id, therapistId, clientId, status | Own link metadata | Own link metadata | Backend A |
| Appointment: id, linkId, startsAt UTC, timeZone, status, version | Linked appointment | Linked appointment; authorized scheduling writes | Backend B |
| Activity: id, linkId, appointmentId, topic, version | Assigned activity | Create/read own linked assignments | Backend B |
| ActivityQuestion: id, activityId, prompt, position | Assigned questions | Manage own assignments, subject to version rules | Backend B |
| PrivateReflectionResponse: clientId, activityId, questionId, text, version | Owner only; skip or save | Never, including answer counts or excerpts | Backend B |
| PrivateSummaryDraft: clientId, activityId, text, origin, version | Owner only; AI/manual both private | Never | Backend B |
| SentLetter: id, senderId, recipientId, appointmentId, activityId, approvedBody, sentAt, sourceVersion | Sender reads fixed snapshot | Specified recipient only; inbox and detail | Backend B |
| Optional audit record: actorId, action, targetId, timestamp, outcome | No general endpoint proposed | No general endpoint proposed | Backend A |

Audit/error records must omit responses, letters, model inputs/outputs, tokens and credentials. A sent letter copies only client-approved content; do not expose source response IDs or private draft history in therapist DTOs. Subsequent private edits cannot mutate the sent snapshot. Assignment and appointment data visible beside a letter must not silently rewrite its approved body or recipient.

## Scope and limitations

In scope for the proposed fictional demo: assignments, appointment display, private save, manual summary, explicit send confirmation, immutable letters, therapist inbox, authorization and failure paths, independent SOS placeholder, then optional AI organization.

Later, without commitments: native iOS/App Store, Apple Watch, voice, mood tracking, open-ended therapeutic chat, live monitoring, push alerts, real emergency integration, clinical advice, real-patient pilot. No diagnosis, treatment/medication advice, unsupported AI interpretation, clinical-effectiveness claim, guaranteed model accuracy, PHI, or compliance claim. No deployment or paid service activation in this task.

## Acceptance checklist for later implementation

- Private saves work outside the sending window; another client and the therapist cannot retrieve drafts through any route or aggregate.
- Manual editing/sending works without AI; invalid output, timeout or unavailability does not discard edits or block manual completion.
- Recipient and exact content are confirmed before explicit send; the API checks identity, relationship, current appointment/window and versions atomically.
- Sent snapshots remain fixed after private edits; inbox includes submitted letters only and makes no monitoring promise.
- Server rejects unauthorized IDs, stale versions, out-of-window sends and concurrent duplicates according to the approved policy.
- UTC instants plus an IANA appointment timezone support display, daylight-saving transitions and rescheduling checks. A development-only test clock must be unavailable in production requests.
- SOS remains accessible with no appointment, a closed window, AI failure and ordinary-flow errors; copy accurately describes the placeholder.
