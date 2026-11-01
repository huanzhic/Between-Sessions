# API contract draft

Proposal, November 1, 2026; no routes below are implemented except `GET /health`. Backend B drafts workflow DTOs, Backend A approves authorization/storage, Huang approves UI consumption. All three review before parallel implementation. See [visibility matrix](mvp-scope-and-architecture.md) and [open decisions](decisions-and-open-questions.md).

## Conventions and proposed models

JSON over a single Node API. IDs are opaque strings. Instants are ISO 8601 UTC strings; appointment `timeZone` is an IANA identifier. Versions are server-issued integers; client timestamps never authorize sending. No client-supplied actor/role is trusted. Proposed cookie sessions require secure, HttpOnly cookies, appropriate SameSite, CSRF protection on writes and an explicit local-development CORS policy; A settles exact auth-library integration.

```ts
type SessionView = { user: { id: string; role: 'client' | 'therapist'; displayName: string } };
type AppointmentView = {
  id: string; startsAt: string; timeZone: string;
  status: 'scheduled' | 'canceled'; version: number;
};
type ActivityView = {
  id: string; topic: string; appointment: AppointmentView;
  questions: { id: string; prompt: string; position: number }[];
  recipient: { id: string; displayName: string }; version: number;
};
type PrivateDraft = {
  activityId: string; answers: { questionId: string; text: string }[];
  privateWriting: string; summary: { text: string; origin: 'manual' | 'ai-edited' };
  version: number; updatedAt: string;
};
type SendAvailability = {
  allowed: boolean; reason?: 'not-open' | 'closed' | 'canceled' | 'already-sent' | 'policy-unconfirmed';
  opensAt: string | null; closesAt: string | null; serverNow: string;
  policyVersion: string; appointmentVersion: number;
};
type SentLetterView = {
  id: string; activityId: string; appointmentId: string;
  sender: { id: string; displayName: string };
  recipient: { id: string; displayName: string };
  approvedBody: string; sentAt: string;
};
type ApiError = { error: { code: string; message: string; requestId: string } };
```

Private writing may be stored separately from question responses; it remains client-only. Empty/skipped answers are allowed. Length limits and pagination limits must be agreed and validated server-side. DTOs use allowlisted fields; do not serialize database entities directly. No draft text, private metadata or source versions appear in therapist responses. `SentLetterView` excludes private source IDs/history and never implies read or clinical assessment.

## Route categories

Paths and status codes are proposals. All resource reads/writes require ownership and active relationship checks, including nested IDs. Resolve client identity from the session. Do not accept arbitrary therapist/client IDs for model generation.

| Route | Request / response | Authorization and errors |
| --- | --- | --- |
| `GET /health` | Existing `{status:"ok"}` | Public; preserve current behavior |
| `/auth/*` session/sign-in/sign-out | Library-native credential inputs; minimal `SessionView` via `GET /auth/session` | A chooses exact paths, rate limits, CSRF and session expiry; no password/hash in responses |
| `GET /clients` | Linked-client minimal IDs/display names only | Therapist's own active links; no reflection aggregates |
| `POST /appointments` | `{clientId, startsAt, timeZone}` → appointment | Therapist linked to that client; validate UTC/timezone; editing/cancel semantics pending |
| `GET /appointments` | `{items: AppointmentView[], nextCursor: string|null}` | Client's own or therapist's linked appointments only |
| `PATCH /appointments/:id` | `{expectedVersion, startsAt?, timeZone?, status?}` → appointment | Linked therapist; conflict returns 409; final reschedule policy awaits approval |
| `POST /activities` | `{clientId, appointmentId, topic, questions:[{prompt,position}]}` → activity | Linked therapist; appointment must belong to same link |
| `GET /activities`, `GET /activities/:id` | List `{items: ActivityView[], nextCursor}` / detail | Assigned client or linked assigning therapist; no private fields |
| `PUT /activities/:id/reflection` | `{expectedVersion, answers, privateWriting, summary}` → `PrivateDraft` | Assigned client only; skip supported, validate question IDs, save anytime; 409 on stale write |
| `GET /activities/:id/reflection` | `PrivateDraft` | Assigned client only; therapist always denied |
| `POST /activities/:id/ai-summary` | `{expectedDraftVersion, selectedQuestionIds}` → structured summary from [AI spec](ai-summary-spec.md) | Assigned client only; explicit selection/consent; server loads owned source; does not save over or send draft |
| `GET /activities/:id/send-availability` | `SendAvailability` | Assigned client only; informational, send recomputes policy |
| `POST /activities/:id/letters` | `Idempotency-Key` header; `{recipientId, approvedBody, expectedDraftVersion, expectedAppointmentVersion, expectedPolicyVersion, confirmed:true}` → 201 `SentLetterView` | Assigned client only; server validates current relationship, recipient, policy and versions in transaction; no auto-send |
| `GET /letters/:id` | Fixed `SentLetterView` | Sender or exact recipient only; no private joins |
| `GET /inbox?cursor=…` | `{items: SentLetterView[], nextCursor: string|null}` | Therapist only, restricted to recipientId = session user; submitted letters only |

No therapist reflection/AI route, private-data admin endpoint, sent-letter update/delete route, SOS dispatch endpoint or live-monitoring endpoint is proposed. Assignment edits after answering need versioning and team approval before adding a PATCH activity route.

## Lifecycle, atomicity and failures

Private states: unanswered → saved private draft → manual or AI-assisted private summary → client review. Only explicit send creates a separate immutable `SentLetter`. Editing a private draft after sending never edits that row. Recipient confirmation is bound to the submitted body and appointment/policy versions; fail and request review if any relevant version changed.

The send transaction rechecks authorization/link, versions, appointment status, server time and approved policy; it copies the exact approved body, sender, recipient and appointment references. No rereading a mutable summary later to render the sent letter. Store any needed display snapshot consistently. Enforce concurrency at the database boundary. Proposed idempotency: same key/body returns the same letter, same key/different body returns 409; scope key to actor/activity. One-letter uniqueness, resend and withdrawal remain open decisions, not a committed schema constraint.

Proposed demo window only: `[nextAppointment - 24h, nextAppointment)`, UTC comparisons and appointment timezone display. Alternative post-session and 12/24-hour configurable rules are unresolved. Missing/canceled/rescheduled appointments require explicit approved handling; stale version returns 409 and updated review, not silent retargeting. Inject clocks only into development/test server construction, never through a public request header/query.

| Failure | Proposed handling |
| --- | --- |
| 400 invalid IDs/body/question/timezone, empty approved letter | Field-safe validation message; retain local edits |
| 401 absent/expired session | Sign-in prompt; prevent silent loss of private work |
| 403 wrong role; 404 missing or inaccessible foreign resource | Consistent anti-enumeration policy settled by A; no private details |
| 409 stale draft/appointment/policy, concurrent or duplicate send | Refresh state and require exact-content/recipient review again |
| 422 window not open/closed, canceled, policy not confirmed | Safe state reason; private saving and SOS still available |
| 429 throttled; 502 invalid model output; 503 provider unavailable; 504 timeout | Preserve private draft and manual summary path; no automatic retry that could send |
| 500 storage/internal error | Generic error + request ID; transaction rollback, no partial letter |

## Contract acceptance cases

Test fictional client A vs client B and therapist A vs therapist B on every resource path. Verify therapist reflection/AI requests fail, inbox/detail never leak private fields, and log/error payloads omit content. Test skipping, optimistic save conflict, boundary instants, DST display, appointment version races, concurrent/retried sends, immutable snapshots after edits, invalid/timeout AI, session expiry and manual completion with provider disabled. Huang validates UI mocks against these DTOs before implementation.
