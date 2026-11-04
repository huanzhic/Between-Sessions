# Frontend foundation implementation plan

**Goal:** Deliver Huang's Milestone 1 frontend from team-roles-and-development-order.md.

**Architecture:** Existing React/Vite app, role-specific shells with deterministic fictional DTOs. API health is real; save and error states are explicitly simulated. No backend business changes.

**Spec:** docs/project/team-roles-and-development-order.md, Milestone 1; Figma Frontend v0.1 colors override earlier palettes.

- [x] Add typed, separate client and therapist fixtures; therapist fixture contains no private fields.
- [x] Build navigable responsive shells, client reflection editor and simulated save/error/retry; independent SOS route reachable without role selection.
- [x] Add real health request through Vite proxy, with loading/error/retry.
- [x] Verify DTO privacy, rendering, browser interactions, typecheck, tests and build.
- [x] Document actual implementation, startup and remaining backend dependencies; prepare GitHub change proposal without pushing main.

Review focus: edits survive failed save; pending save cannot overwrite newer input; role switch clears private editor state; SOS does not depend on API; health failures never fall back to fake success.

