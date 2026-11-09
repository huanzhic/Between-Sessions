# Workflow data needs: proposal for Backend A

Prepared November 4, 2026 by Stanley Eng (Backend B) for Jack Almutairi (Backend A). **Proposal only.** Backend A owns the schema, migrations and seeds; this document says what Backend B's endpoints need from them. Jack decides the final tables, names and migration approach. The request/response shapes these tables must support are in `packages/contracts` (PR #25), and visibility rules are in the [visibility matrix](mvp-scope-and-architecture.md#proposed-data-visibility-and-entity-ownership).

## What the workflow endpoints need

| Need | Why | Used by |
| --- | --- | --- |
| Appointment: `startsAt` as a UTC instant, an IANA `timeZone`, `status` (scheduled/canceled), integer `version` | Send-window checks, DST-correct display, 409 on stale reschedule | Appointment routes, send policy |
| Activity tied to one appointment **of the same therapist–client link** | A therapist must not attach an activity to another client's appointment | Assignment routes |
| Ordered questions per activity, unique position | Stable question order; skipping allowed | Assignment, draft routes |
| One private draft per client and activity, with **one version number** covering answers, private writing and summary | The API's `PrivateDraft.version` and optimistic-save 409s | Draft save/load |
| Answers keyed by question, and only questions of that draft's activity | Prevents saving an answer against a foreign question | Draft save |
| Summary text with origin `manual` or `ai-edited` | Manual and AI-edited letters stay private until sent | Draft save, AI (later) |
| Sent letter: copied `approvedBody`, sender, recipient, activity, appointment matching that activity, `sentAt`, `sourceVersion`, `policyVersion` | Fixed snapshot; `sourceVersion` is never sent to therapists | Send, letter detail, inbox |
| Sent letters **cannot be updated**, ideally enforced in the database (for example a trigger rejecting UPDATE) | Later draft edits must never change what was sent | Send |
| No unique constraint on one letter per activity yet | That rule is still an open team decision; the send policy checks it for now | Send policy |
| Idempotency record unique on (actor, activity, key), storing a body hash and the letter it created | Retried send returns the same letter; same key with a different body is a 409 | Send |
| Inbox index on (recipient, sentAt desc, id) | Cursor pagination for the therapist inbox | Inbox |
| Timestamps as `timestamptz` | UTC comparisons at window boundaries | All |

From Backend A's own tables, Backend B needs: user `id`, `role` (client/therapist) and `displayName`; a therapist–client link with `status`; and a way to resolve the session user (see the session interface in the Backend B plan).

## Example in Prisma syntax

A working draft that passed `prisma validate` on Prisma 7.10.1, offered as a starting point only. It assumes `User` and `TherapistClientLink` models with back-relations for these models.

```prisma
// Backend B: assignments, appointments, private drafts and sent letters.
// Visibility rules: docs/project/mvp-scope-and-architecture.md. Never serialize these
// rows directly; map them to packages/contracts DTOs.

enum AppointmentStatus {
  scheduled
  canceled
}

enum SummaryOrigin {
  manual
  ai_edited @map("ai-edited")
}

model Appointment {
  id        String              @id @default(cuid())
  linkId    String
  link      TherapistClientLink @relation(fields: [linkId], references: [id], onDelete: Restrict)
  startsAt  DateTime            @db.Timestamptz(3) // UTC instant
  timeZone  String // IANA name, for display and DST-aware checks
  status    AppointmentStatus   @default(scheduled)
  version   Int                 @default(1)
  createdAt DateTime            @default(now()) @db.Timestamptz(3)
  updatedAt DateTime            @updatedAt @db.Timestamptz(3)

  activities Activity[]

  @@unique([id, linkId]) // target for Activity's same-link foreign key
  @@index([linkId, startsAt])
}

model Activity {
  id            String              @id @default(cuid())
  linkId        String
  link          TherapistClientLink @relation(fields: [linkId], references: [id], onDelete: Restrict)
  appointmentId String
  // Composite key: the appointment must belong to the same therapist-client link.
  appointment   Appointment         @relation(fields: [appointmentId, linkId], references: [id, linkId], onDelete: Restrict)
  topic         String
  version       Int                 @default(1)
  createdAt     DateTime            @default(now()) @db.Timestamptz(3)

  questions ActivityQuestion[]
  drafts    PrivateDraft[]
  letters   SentLetter[]

  @@unique([id, appointmentId]) // target for SentLetter's matching-appointment key
  @@index([linkId])
  @@index([appointmentId])
}

model ActivityQuestion {
  id         String   @id @default(cuid())
  activityId String
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  prompt     String
  position   Int

  responses PrivateReflectionResponse[]

  @@unique([activityId, position])
  @@unique([id, activityId])
}

// Client-only. One versioned draft per client and activity; the API's
// PrivateDraft.version is this row's version.
model PrivateDraft {
  id             String   @id @default(cuid())
  clientId       String
  client         User     @relation(fields: [clientId], references: [id], onDelete: Restrict)
  activityId     String
  activity       Activity @relation(fields: [activityId], references: [id], onDelete: Restrict)
  privateWriting String   @default("")
  version        Int      @default(0)
  updatedAt      DateTime @updatedAt @db.Timestamptz(3)

  responses PrivateReflectionResponse[]
  summary   PrivateSummaryDraft?

  @@unique([clientId, activityId])
  @@unique([id, activityId])
}

// Client-only. Empty text means the question was skipped.
model PrivateReflectionResponse {
  id         String           @id @default(cuid())
  draftId    String
  activityId String
  // Both keys include activityId, so an answer can only target its own activity's questions.
  draft      PrivateDraft     @relation(fields: [draftId, activityId], references: [id, activityId], onDelete: Cascade)
  questionId String
  question   ActivityQuestion @relation(fields: [questionId, activityId], references: [id, activityId], onDelete: Restrict)
  text       String           @default("")

  @@unique([draftId, questionId])
}

// Client-only, whether written manually or edited from an AI draft.
model PrivateSummaryDraft {
  id      String        @id @default(cuid())
  draftId String        @unique
  draft   PrivateDraft  @relation(fields: [draftId], references: [id], onDelete: Cascade)
  text    String        @default("")
  origin  SummaryOrigin @default(manual)
}

// Immutable snapshot of client-approved content. A migration trigger rejects UPDATE.
// Whether one letter per activity is enforced is an open decision, so there is no
// unique constraint on activityId.
model SentLetter {
  id            String   @id @default(cuid())
  senderId      String
  sender        User     @relation("LetterSender", fields: [senderId], references: [id], onDelete: Restrict)
  recipientId   String
  recipient     User     @relation("LetterRecipient", fields: [recipientId], references: [id], onDelete: Restrict)
  activityId    String
  appointmentId String
  activity      Activity @relation(fields: [activityId, appointmentId], references: [id, appointmentId], onDelete: Restrict)
  approvedBody  String
  sentAt        DateTime @default(now()) @db.Timestamptz(3)
  sourceVersion Int // PrivateDraft.version that was approved; never sent to therapists
  policyVersion String

  idempotency SendIdempotency?

  @@index([recipientId, sentAt(sort: Desc), id]) // inbox cursor pagination
  @@index([senderId])
}

// Same key and body returns the existing letter; same key, different body is a 409.
model SendIdempotency {
  id         String     @id @default(cuid())
  actorId    String
  actor      User       @relation(fields: [actorId], references: [id], onDelete: Restrict)
  activityId String
  key        String
  bodyHash   String
  letterId   String     @unique
  letter     SentLetter @relation(fields: [letterId], references: [id], onDelete: Restrict)
  createdAt  DateTime   @default(now()) @db.Timestamptz(3)

  @@unique([actorId, activityId, key])
}
```
