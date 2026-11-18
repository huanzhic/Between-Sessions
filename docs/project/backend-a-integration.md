# Backend A — Database & Authentication Integration

## Overview

Backend A provides the PostgreSQL database schema, Prisma configuration, SQL migration, and Better Auth integration for Between Sessions.

The database supports the therapist-client relationships, appointments, activities, reflection drafts, and sent letters required by Backend B's workflow APIs.

**Current status:** PostgreSQL connectivity, the initial migration, Prisma Client generation, and Better Auth authentication endpoints have been implemented and tested in development. Server-side authorization and Backend B workflow persistence remain unfinished.

This implementation uses fictional development data only and is not approved for real patient information or clinical use.

## Implementation Status

| Component | Location | Status |
|---|---|---|
| Prisma schema | `apps/api/prisma/schema.prisma` | Implemented and validated |
| PostgreSQL migration | `db/migrations/20261115000000_initial_schema/migration.sql` | Applied successfully |
| Prisma configuration | `apps/api/prisma7.config.ts` | Configured |
| Prisma Client | `apps/api/src/generated/prisma/` | Generated successfully |
| PostgreSQL connection | `apps/api/src/lib/prisma.ts` | Implemented |
| Better Auth configuration | `apps/api/src/lib/auth.ts` | Implemented |
| Authentication routes | `apps/api/src/server.ts` | Implemented |
| Authentication registration and login | Development API | Manually tested |
| Database constraints | PostgreSQL migration | Applied |
| Sent-letter immutability trigger | PostgreSQL migration | Applied; behavior not yet tested |
| Server-side authorization | API | Not implemented |
| Backend B workflow persistence | API | Not implemented |

## Database Models

The Prisma schema contains 12 models.

| Model | Purpose |
|---|---|
| `User` | Stores client and therapist identities |
| `Session` | Stores Better Auth sessions |
| `Account` | Stores authentication account records |
| `Verification` | Stores authentication verification records |
| `TherapistClient` | Links therapists with their assigned clients |
| `Appointment` | Stores appointments, statuses, time zones, and versions |
| `Activity` | Stores therapist-assigned activities |
| `ActivityQuestion` | Stores ordered questions belonging to activities |
| `ReflectionDraft` | Stores private writing, summaries, and draft versions |
| `DraftAnswer` | Stores individual answers to activity questions |
| `SentLetter` | Stores approved letter content and recipient references |
| `SendIdempotency` | Supports duplicate-send protection |

## Backend B Contract Mapping

Backend B defines the workflow request and response contracts in `packages/contracts`.

Backend A provides the persistence structure for these contracts.

| Backend B contract | Prisma model / field |
|---|---|
| `SessionView.user.id` | `User.id` |
| `SessionView.user.role` | `User.role` |
| `SessionView.user.displayName` | `User.name` |
| `AppointmentView.startsAt` | `Appointment.startsAt` |
| `AppointmentView.timeZone` | `Appointment.timeZone` |
| `AppointmentView.status` | `Appointment.status` |
| `AppointmentView.version` | `Appointment.version` |
| `ActivityView.topic` | `Activity.topic` |
| `ActivityView.questions` | `ActivityQuestion[]` |
| `ActivityView.version` | `Activity.version` |
| `PrivateDraft.answers` | `DraftAnswer[]` |
| `PrivateDraft.privateWriting` | `ReflectionDraft.privateWriting` |
| `PrivateDraft.summary.text` | `ReflectionDraft.summaryDraft` |
| `PrivateDraft.summary.origin` | `ReflectionDraft.summaryOrigin` |
| `PrivateDraft.version` | `ReflectionDraft.version` |
| `SentLetterView.approvedBody` | `SentLetter.approvedBody` |
| `SentLetterView.sentAt` | `SentLetter.sentAt` |

Backend B must map database records into the public DTOs instead of returning Prisma records directly.

## Appointments and Activities

Every activity references an appointment and a therapist-client relationship.

Composite foreign keys ensure that the referenced appointment belongs to the same therapist-client relationship as the activity.

Appointment and activity versions begin at `1`.

Supported appointment statuses are `scheduled` and `canceled`.

PostgreSQL enforces these values through a `CHECK` constraint. API-level validation is still required.

## Reflection Drafts

Each client can have one reflection draft per activity.

Reflection answers use a relational design rather than JSON storage.

The `DraftAnswer` model stores:

- The associated reflection draft.
- The associated activity.
- The question being answered.
- The answer text.

Composite foreign keys ensure that each answer belongs to a question from the correct activity.

A unique constraint on `(draftId, questionId)` prevents duplicate answers to the same question within one draft.

The `ReflectionDraft` model also stores:

- `privateWriting` — private client writing.
- `summaryDraft` — editable summary text.
- `summaryOrigin` — `manual` or `ai-edited`.
- `version` — optimistic concurrency version, initially `0`.
- `updatedAt` — last modification timestamp.

The database establishes structural integrity, but Backend B must implement draft saving, version-conflict handling, and access restrictions.

## Sent Letters

Sent letters store a separate copy of the exact content approved for sending.

Each letter contains:

- Approved letter body.
- Sending client and receiving therapist IDs.
- Activity and appointment references.
- Therapist-client relationship reference.
- Source draft version.
- Send-policy version.
- Send timestamp.

Composite foreign keys enforce consistency between the letter's activity, appointment, client, therapist, and therapist-client relationship.

An index supports therapist inbox queries ordered by send time.

### Immutability

The initial PostgreSQL migration includes the `sent_letters_immutable` trigger.

The trigger calls `prevent_sent_letter_changes()` before an `UPDATE` or `DELETE` operation on `sent_letters`.

The function raises an exception to reject modifications and deletions.

The migration containing this trigger was successfully applied to the development database.

**Validation limitation:** The trigger's presence was checked during development, but its behavior against an existing sent-letter record has not yet been tested.

Backend B must also avoid exposing update or delete operations for sent letters.

## Send Idempotency

`SendIdempotency` stores:

- Sending actor.
- Activity.
- Idempotency key.
- Request body hash.
- Associated sent letter.

A unique constraint on `(actorId, activityId, key)` supports duplicate-request detection.

Backend B must implement the application behavior, including returning an existing letter for an identical retry and rejecting conflicting reuse of an idempotency key.

The database constraint alone does not implement this behavior.

## Authentication

Backend A uses Better Auth with a Prisma adapter and PostgreSQL.

The authentication implementation includes:

- Better Auth configuration in `apps/api/src/lib/auth.ts`.
- Prisma database integration in `apps/api/src/lib/prisma.ts`.
- Express authentication routes under `/api/auth/*path`.
- Email-and-password authentication.
- Client and therapist roles, with `client` as the default.
- Environment-based authentication configuration.

The API also preserves the `/health` endpoint.

### Development Verification

Authentication was manually tested using a fictional patient account.

The following operations succeeded:

- User registration.
- Email-and-password login.
- Session creation.
- Persistence of authentication records in PostgreSQL.

The test database was subsequently reset to validate the initial migration.

### Authentication Configuration

Local development requires environment variables including:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Actual credentials and secrets must remain outside version control.

## Authorization

Authentication identifies a user, but it does not automatically establish permission to access workflow data.

Server-side authorization remains unfinished.

Backend A and Backend B must coordinate on:

1. Resolving the authenticated user from the server session.
2. Restricting therapist access to actively linked clients.
3. Ensuring clients can access only their assigned activities and drafts.
4. Preventing therapists from accessing private reflection content.
5. Validating letter recipients against the relevant therapist-client relationship.
6. Enforcing authorization on database reads and writes.

Frontend role switching is not a substitute for server-side authorization.

### Session and authorization helpers (Backend B)

Items 1 and 2 above now have shared helpers in `apps/api/src/auth/`. Items 3–6 are enforced per route as the workflow endpoints are built.

| Helper | What it does |
|---|---|
| `betterAuthResolver(auth)` (`session.ts`) | Reads the Better Auth session from the request cookie and returns `{ id, role, displayName }`, or `null`. A missing or unknown role is treated as signed out. Email and tokens are never passed on. |
| `requireUser(resolve)` (`middleware.ts`) | Returns 401 `unauthenticated` when nobody is signed in; otherwise stores the user for the route. |
| `requireRole("client" \| "therapist")` | Returns 403 `forbidden` for the wrong role. Use after `requireUser`. |
| `currentUser(res)` | Gets the signed-in user inside a route; throws if the route forgot `requireUser`. |
| `sameOriginWrites([WEB_ORIGIN])` | Rejects browser writes from other sites (403 `bad-origin`). Workflow routers mount it; it is not global yet. |
| `prismaLinks(prisma).findActiveLink(therapistId, clientId)` (`links.ts`) | Returns the active `TherapistClient` link or `null`. `inMemoryLinks` is a test fake. |

`GET /auth/session` returns the contract's minimal `SessionView` (`{ user: { id, role, displayName } }`) or 401. All errors use the contract's `ApiError` shape with a `requestId` that matches the `X-Request-Id` header.

New accounts are always created with role `client` (`input: false`), so a therapist account currently has to be set directly in the database. Seed data should create the fictional therapist.

## Database Constraints

The PostgreSQL migration includes primary keys, foreign keys, composite foreign keys, unique constraints, and indexes.

Four additional `CHECK` constraints restrict supported values:

| Constraint | Allowed values |
|---|---|
| `user_role_check` | `client`, `therapist` |
| `appointments_status_check` | `scheduled`, `canceled` |
| `therapist_clients_status_check` | `active`, `inactive` |
| `reflection_drafts_summary_origin_check` | `manual`, `ai-edited` |

The migration containing these constraints was successfully applied.

The constraint definitions were checked during development. Individual invalid-value rejection tests have not yet been completed.

Database constraints provide an additional protection layer but do not replace API validation or authorization.

## Database Migration

The Prisma migration configuration points to:

`../../db/migrations`

The initial migration is stored at:

`db/migrations/20261115000000_initial_schema/migration.sql`

The development database was originally initialized using `prisma db push`.

To test the actual SQL migration, the disposable development database was reset using Prisma Migrate.

The reset successfully applied `20261115000000_initial_schema`.

A subsequent `npx prisma migrate status` confirmed:

`Database schema is up to date!`

This verifies that the complete initial migration executed successfully against the development PostgreSQL database.

The reset removed the previous fictional test account and session data.

**Migration caution:** This initial migration was tested against a reset development database. Existing populated or shared databases require a separate migration strategy rather than an unconditional reset.

## Backend B Integration Handoff

Backend B can use the updated Prisma schema as the persistence structure for workflow endpoints.

| Integration item | Required action |
|---|---|
| Session identity | Integrate authenticated session resolution |
| Reflection answers | Use relational `DraftAnswer` records |
| Draft versions | Implement optimistic concurrency checks |
| Appointment ownership | Enforce therapist-client relationship permissions |
| Letter sending | Validate recipients, versions, policy, and authorization |
| Idempotency | Implement duplicate-send behavior |
| Sent-letter immutability | Preserve database protection and avoid modification endpoints |
| Response DTOs | Map Prisma records to shared Zod contracts |

These are integration requirements, not completed workflow functionality.

## Validation

The following checks have been completed during development:

| Check | Result |
|---|---|
| Prisma schema validation | Passed |
| Prisma Client generation | Passed |
| TypeScript typecheck | Passed |
| PostgreSQL migration execution | Passed |
| Prisma migration status | Up to date |
| Authentication registration | Passed manually |
| Authentication login | Passed manually |
| Authentication session persistence | Verified manually |

Additional testing is required for authorization, ownership restrictions, constraint rejection behavior, sent-letter immutability behavior, and complete workflow persistence.

Earlier automated-test and production-build results should be rechecked against the updated code before being reported as current.

## Current Limitations

- Server-side role and ownership authorization remain unfinished.
- Backend B workflow endpoints are not yet connected to persistent storage.
- Draft version conflicts and letter-send idempotency behavior remain unimplemented.
- Database trigger and constraint behavior need negative-case testing.
- Complete end-to-end workflow tests have not been performed.
- The development environment is not approved for real patient information.

## Next Steps

1. Complete Backend A review and merge the database and authentication changes.
2. Coordinate session identity and authorization requirements with Backend B.
3. Add fictional therapist, client, and relationship seed data.
4. Implement and test role-based and ownership authorization.
5. Integrate Backend B workflow endpoints with Prisma.
6. Test draft version conflicts, letter sending, idempotency, and immutability.
7. Run the complete automated test suite and production build.

## References

- [Workflow Schema Proposal](workflow-schema-proposal.md)
- [API Contract Draft](api-contract-draft.md)
- [MVP Scope and Architecture](mvp-scope-and-architecture.md)
- [Send Window Proposal](send-window-proposal.md)
- [Team Roles and Development Order](team-roles-and-development-order.md)