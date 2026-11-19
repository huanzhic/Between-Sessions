# Reflection Draft Persistence and Editing

## Overview

Implements retrieval, saving, and editing of private reflection drafts using PostgreSQL, Prisma, existing shared contracts, and session authorization helpers.

No schema changes or database migrations are required. Frontend integration remains pending. Use fictional development data only.

## Implementation

| File | Responsibility |
|---|---|
| `apps/api/src/drafts/repository.ts` | Retrieval, transactional saving, ownership checks, and optimistic concurrency |
| `apps/api/src/drafts/routes.ts` | HTTP endpoints, authorization, and request validation |
| `apps/api/src/drafts/repository.integration.test.ts` | PostgreSQL integration tests |
| `apps/api/src/drafts/routes.test.ts` | HTTP route tests with mocked sessions and repository |
| `apps/api/src/index.ts` | Production repository and session resolver wiring |
| `apps/api/src/server.ts` | Route registration and error handling |

## API Endpoints

| Method | API path | Response |
|---|---|---|
| GET | `/activities/:id/reflection` | `PrivateDraft` |
| PUT | `/activities/:id/reflection` | Updated `PrivateDraft` |

Both endpoints require the assigned client's authenticated session and an active therapist-client relationship. The activity ID must be a valid UUID. Therapists cannot retrieve or modify private drafts.

### Saving a Draft

The PUT endpoint accepts the shared `SaveReflectionRequest` contract:

```json
{
  "expectedVersion": 0,
  "answers": [
    {
      "questionId": "22222222-2222-4222-8222-222222222222",
      "text": "Example answer"
    }
  ],
  "privateWriting": "Example private writing",
  "summary": {
    "text": "Example draft message",
    "origin": "manual"
  }
}
```

The question ID above is illustrative; use a real question ID belonging to the assigned activity.

- Use `expectedVersion: 0` for the first save. The first successful save returns version `1`.
- For later edits, use the version returned by the last successful retrieval or save.
- Each successful edit increments the version.
- PUT replaces the complete draft content and answer collection. Empty or skipped answers are supported.
- Concurrent saves using the same version cannot both succeed. A stale save returns 409.
- Draft saving does not create or modify sent letters.

## Authorization and Validation

The repository validates activity ownership, active relationships, and question membership. Draft changes and answer replacement occur in one database transaction. Responses use the private draft DTO rather than exposing raw database records.

The route requires a client session, rejects unauthorized write origins and cookie-authenticated writes without an Origin, and applies `Cache-Control: no-store`. The request body limit is 1 MB; shared contract field limits also apply.

| Status | Meaning |
|---|---|
| 200 | Successful retrieval or save |
| 400 | Invalid ID, body, question, or malformed JSON |
| 401 | Unauthenticated |
| 403 | Wrong role or rejected origin |
| 404 | Draft absent or activity inaccessible/missing |
| 409 | Stale version or conflicting save |
| 413 | Request body too large |
| 500 | Generic internal error |

Draft route errors use the shared `ApiError` shape with a request ID.

## Frontend Integration Handoff

Through the local Vite proxy, use `/api/activities/:id/reflection` for GET and PUT. Use the authenticated session and actual activity/question IDs, not the current demo fixture IDs.

1. Retrieve the saved draft when opening an activity. A 404 can also mean inaccessible activity, so only initialize an empty draft when activity access is established.
2. Populate the editor from the returned draft and remember its version.
3. Save the complete draft with the correct `expectedVersion`.
4. Update local state and version from the server response.
5. Preserve unsaved local edits on failure. On a 409, reload the server draft and let the client reconcile changes before saving again.

## Validation

| Check | Result |
|---|---|
| TypeScript (all workspaces) | Passed |
| Contract tests | 7 passed |
| API tests | 40 passed; 1 opt-in database test skipped in default run |
| Frontend tests | 3 passed |
| New HTTP route tests (included in API total) | 17 passed |
| PostgreSQL integration test | Passed in separate opt-in run
| Production build (all workspaces) | Passed |

## Known Limitations

- The frontend currently uses simulated draft saving. Website refresh persistence is not yet implemented end-to-end.
- HTTP route tests use mocked sessions and repositories. Combined real Better Auth and PostgreSQL HTTP testing, including server restart testing, remains pending.
- Concurrent relationship deactivation during an in-flight save remains a security hardening item. Sequential deactivation checks have passed. Resolve the race before production use.
