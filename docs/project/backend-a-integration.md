# Backend A — Database & Authentication Integration

## Overview

Backend A provides the database schema, Prisma configuration, PostgreSQL migration, and Better Auth foundation for Between Sessions.

This implementation prepares the data structures needed by Backend B's appointment, activity, reflection, and letter workflows.

**Current status:** Prisma schema and authentication foundation implemented. Database connection, authentication endpoints, authorization enforcement, and workflow persistence remain pending.

## Implementation

| Component | Location | Status |
|---|---|---|
| Prisma schema | `apps/api/prisma/schema.prisma` | Implemented |
| PostgreSQL migration | `db/migrations/001_initial_schema.sql` | Generated, not executed |
| Prisma Client | `apps/api/src/generated/prisma/` | Generation verified |
| Better Auth foundation | `apps/api/` | Configuration prepared |
| Authentication endpoints | API | Not implemented |
| Database connection | PostgreSQL | Not configured |
| Authorization enforcement | API | Not implemented |

The schema contains 11 models, including four authentication models and seven application models.

## Database Models

| Model | Purpose |
|---|---|
| `User` | Stores client and therapist identities |
| `Session` | Better Auth session records |
| `Account` | Better Auth account and credential records |
| `Verification` | Better Auth verification records |
| `TherapistClient` | Links therapists with their assigned clients |
| `Appointment` | Stores scheduled appointments, time zones, statuses, and versions |
| `Activity` | Stores therapist-assigned activities linked to appointments |
| `ActivityQuestion` | Stores ordered questions for each activity |
| `ReflectionDraft` | Stores private client answers, writing, and summaries |
| `SentLetter` | Stores approved letter content and recipient references |
| `SendIdempotency` | Supports safe handling of repeated send requests |

## Backend B Contract Mapping

Backend B defines workflow request and response contracts in `packages/contracts`. Backend A's database schema supports those contracts through the following mappings.

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
| `PrivateDraft.answers` | `ReflectionDraft.responses` |
| `PrivateDraft.privateWriting` | `ReflectionDraft.privateWriting` |
| `PrivateDraft.summary.text` | `ReflectionDraft.summaryDraft` |
| `PrivateDraft.summary.origin` | `ReflectionDraft.summaryOrigin` |
| `PrivateDraft.version` | `ReflectionDraft.version` |
| `SentLetterView.approvedBody` | `SentLetter.approvedBody` |
| `SentLetterView.sentAt` | `SentLetter.sentAt` |

Backend B must map database records to the public DTOs rather than returning Prisma records directly.

### Appointments and Activities

Every activity references an appointment and a therapist-client relationship.

The schema uses a composite foreign key to ensure that an activity's appointment belongs to the same therapist-client relationship.

Appointment and activity versions begin at `1`.

Appointment statuses are stored as strings. Backend B must validate supported values, including `scheduled` and `canceled`.

### Reflection Drafts

Each client can have one reflection draft per activity.

Unlike Backend B's proposed relational answer tables, Backend A stores the draft's answers as JSON in `ReflectionDraft.responses`.

The draft also stores:

- `privateWriting` — private client writing.
- `summaryDraft` — editable summary text.
- `summaryOrigin` — `manual` or `ai-edited`.
- `version` — optimistic concurrency version, initially `0`.
- `updatedAt` — last modification timestamp.

Backend B must validate that submitted question IDs belong to the assigned activity and that the stored JSON matches the expected contract.

The JSON-based design is a proposed simplification for the demo and requires Backend B agreement.

### Sent Letters

Sent letters contain a separate copy of the exact client-approved content.

The schema stores:

- Approved letter body.
- Sending client and receiving therapist IDs.
- Activity and appointment references.
- Source draft version.
- Send-policy version.
- Send timestamp.

A composite foreign key ensures that a letter's appointment matches its referenced activity.

The schema also provides an index for therapist inbox queries ordered by send time.

**Important:** The database currently does not enforce sent-letter immutability through a trigger. Backend B must not expose update or delete operations for sent letters. Stronger database-level enforcement is deferred.

### Send Idempotency

`SendIdempotency` stores the sending actor, activity, idempotency key, request body hash, and associated letter.

A unique constraint on `(actorId, activityId, key)` supports duplicate-request detection.

Backend B must implement the retry behavior, including returning the existing letter for an identical request and rejecting conflicting reuse of an idempotency key.

The database model alone does not implement this behavior.

## Authentication and Authorization

Backend A includes the database models required by Better Auth.

The `User` model supports the `client` and `therapist` roles, with `client` as the default.

Authentication endpoints, session resolution, and role-based authorization are not yet implemented.

Before connecting the workflow APIs, Backend A and Backend B must coordinate on:

1. Resolving the authenticated user from the server session.
2. Restricting therapist access to actively linked clients.
3. Ensuring clients can access only their own assigned activities and private drafts.
4. Preventing therapists from accessing private reflection content.
5. Validating letter recipients against the activity's therapist-client relationship.
6. Enforcing authorization during database reads and writes.

Frontend role switching is not a substitute for server-side authorization.

## Database Constraints and Validation

The PostgreSQL migration includes Prisma-generated primary keys, foreign keys, unique constraints, and indexes.

These support relationship integrity, question ordering, unique drafts, and idempotency-key uniqueness.

Additional PostgreSQL `CHECK` constraints and sent-letter immutability triggers are not included in the current migration.

Backend B's Zod contracts validate workflow request shapes and field values. Backend A remains responsible for identity, relationship access, and database protections.

Neither the Prisma schema nor Zod validation alone establishes complete application security.

## Backend B Integration Handoff

Backend B can use the Prisma schema as the proposed persistence structure for its workflow endpoints.

Before connecting persistence, the team should confirm:

| Integration item | Required action |
|---|---|
| Session identity | Agree on the authenticated session interface |
| Reflection answers | Accept JSON storage or agree on a relational alternative |
| Draft versions | Implement version checks for concurrent saves |
| Appointment ownership | Use existing therapist-client relationships |
| Letter sending | Validate recipient, versions, policy, and authorization |
| Idempotency | Implement duplicate-send handling |
| Sent-letter immutability | Prevent modifications; determine stronger database enforcement |
| Response DTOs | Map Prisma records to shared Zod contracts |

These are integration requirements, not completed functionality.

## Validation

The following checks passed during local development:

| Check | Result |
|---|---|
| Prisma schema formatting | Passed |
| Prisma schema validation | Passed |
| Prisma Client generation | Passed |
| TypeScript typecheck | Passed |
| Automated tests | 20 passed |
| Production build | Passed |

These results verify the current codebase's formatting, schema validation, generation, compilation, and existing automated tests.

They do not establish that database migrations, authentication, authorization, or workflow persistence work end-to-end.

## Current Limitations

- No PostgreSQL database is connected.
- The SQL migration has not been executed against PostgreSQL.
- No fictional database seed has been implemented.
- Authentication routes and session enforcement remain unfinished.
- Role-based and ownership authorization checks remain unfinished.
- Backend B workflow endpoints are not yet connected to persistent storage.
- Sent-letter immutability is not enforced at the database level.
- Database integration and security behavior have not been tested end-to-end.

This implementation is intended for a fictional-data development demo. It is not ready for real patient information or clinical use.

## Next Steps

1. Obtain Backend B review of the schema and JSON draft-storage decision.
2. Connect PostgreSQL and execute the migration in a development environment.
3. Add fictional client, therapist, and relationship seed data.
4. Implement authentication and session-based authorization.
5. Integrate Backend B's workflow endpoints with Prisma.
6. Test access restrictions, version conflicts, and letter submission behavior.

## References

- [Workflow Schema Proposal](workflow-schema-proposal.md)
- [API Contract Draft](api-contract-draft.md)
- [MVP Scope and Architecture](mvp-scope-and-architecture.md)
- [Send Window Proposal](send-window-proposal.md)
- [Team Roles and Development Order](team-roles-and-development-order.md)