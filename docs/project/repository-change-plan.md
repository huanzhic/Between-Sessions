# Repository audit and incremental change plan

## Current status — November 1, 2026

The user authorized GitHub publication. The nine-file change is committed on `docs/mvp-plan-and-review-workflow`, based on main `b628c95`, and published as [PR #20](https://github.com/huanzhic/Between-Sessions/pull/20). GitHub Actions has passed on Node 22. Main requires the **Typecheck and build** GitHub Actions check with up-to-date branches, plus peer approval, stale-review dismissal, last-push approval and resolved conversations. Protection applies to admins, with no configured bypass; force pushes and deletion are blocked. Overall protection is **ENFORCED**; see [readback evidence](github-collaboration-rules.md). The PR remains unmerged. No deployment was performed.

## Initial audit history — before publication

The initial working tree was clean. Local main and the cached origin/main were `ffc3378`; local branch `local/initial-setup` also existed. Fetching main revealed `b628c95`, whose only change was stack-research attribution/status wording. That diff was reviewed; the feature branch was subsequently rebased onto it without changing application code or historical weekly records.

At this initial inspection, the public repository had no classic main protection (404), rulesets/effective rules or Actions workflows. Those findings describe the starting state; the current enforced protection and published CI are documented above.

## Actual implementation

```text
apps/web/       Vite + React 19 + TypeScript; App.tsx renders one heading
  src/api/, components/, pages/     .gitkeep scaffolds only
apps/api/       TypeScript + node:http; GET /health returns {status:"ok"}
  src/auth/, db/, llm/, routes/     .gitkeep scaffolds only
db/            README; migrations/ and seeds/ contain .gitkeep only
docs/project/  initially .gitkeep only; planning documents added in this task
docs/weeks/    October 11, 15, 22 records and templates, preserved unchanged
docs/research/ stack research, CBT/LLM research and source catalog
package.json   npm workspaces apps/*; root build/typecheck scripts
package-lock.json  existing tracked lockfile
```

No framework, router, application DB schema, authentication, AI provider SDK, workflow endpoint or test suite is implemented. `/health` is functional; other API paths return 404. README folder labels describe intentions (Render, Better Auth, Claude), not evidence of deployed/configured services. CI is added by this PR. Local validation used Node 24.21.0/npm 11.19.0; `gh` was unavailable. Only root AGENTS.md applies. No existing PR template or CODEOWNERS file was found.

## Target and ownership

Keep one frontend/API/Postgres design. Incrementally organize frontend as app/, features/client/, features/therapist/, features/sos/, shared components/ and api/. Organize API as modules/auth/, activities/, reflections/, letters/, ai/, plus db/ and middleware/. See [scope](mvp-scope-and-architecture.md) for boundaries and [roles](team-roles-and-development-order.md) for milestones.

1. Agree DTOs, identity/relationship assumptions and proposed timing semantics first (all three; Backend B drafts).
2. Backend A introduces migrations/repositories/auth and fictional seeds; preserve `/health` and current development scripts.
3. Huang adds routes/screens with mock DTOs; Backend B introduces workflow modules against A's interfaces. Move existing files only when there is real code to move.
4. Deliver and test manual private-save → approved immutable letter → inbox before AI.
5. Add server-only AI and Huang's fictional evaluation fixtures; keep manual fallback.
6. Introduce `packages/contracts` only when both applications consume an exported contract. Then add `packages/*` to workspaces, settle TypeScript exports/build ordering, and require both full workspace checks to pass.

No contracts workspace is created now: neither application consumes a contract, so it would add unused scaffolding. No need to split repositories, frontends or backend services, replace TypeScript, choose a framework/migration tool prematurely, rename all empty folders, or refactor the health server now.

## Minimal preparation in this task

Seven planning/policy documents and README links; a published `.github/workflows/ci.yml` runs reproducible `npm ci`, root typecheck and root build on PRs and pushes to main, using Node 22. Workflow permissions are read-only; it needs no secrets, services or patient data. The actual required check name is **Typecheck and build**. No path filters or no-op checks. Local clean installation validated the existing lockfile; no dependency upgrades were made.

After observing a successful GitHub run, the check was made required on main and its configuration was read back. Future changes must preserve this requirement and existing review protections. Local build success alone does not replace a successful GitHub check on the PR's latest revision.

## Validation and handoff

The checks below were executed during preparation and publication. Future authorization/security/workflow tests belong to their feature owners; this planning PR adds no application test suite. Weekly records and application source are unchanged. No deployment or real-data testing was performed.

See [GitHub policy](github-collaboration-rules.md) for exact setup/readback evidence and expected behaviors; review protection and CI protection must be reported separately.

### Executed results — November 1, 2026

| Check | Result / limits |
| --- | --- |
| `npm install --package-lock-only --ignore-scripts` | Passed; existing tracked lockfile remained unchanged |
| `npm ci` | Passed; 74 packages installed, audit reported zero vulnerabilities. npm noted an esbuild install-script policy warning; build passed afterward |
| `npm run typecheck` | Passed for API and web |
| `npm run build` | Passed for API and web; Vite built 28 modules |
| API startup smoke | Built server started with a temporary local port; `/health` returned 200 `{status:"ok"}`, unknown path returned 404; temporary process stopped |
| Frontend development startup smoke | Vite started on localhost with strict port; HTML returned 200 with `/src/main.tsx` entry; temporary process stopped |
| Documentation checks | All 31 local Markdown links across README and seven new documents resolved; tracked diff whitespace check passed |
| GitHub Actions Node 22 | [Run 41346940442](https://github.com/huanzhic/Between-Sessions/actions/runs/41346940442) passed for publication revision `7722e14`; later revisions must pass again |
| GitHub settings readback | Peer-review and required CI protections verified; overall ENFORCED |

Local checks used Node 24.21.0; the published GitHub Actions workflow also passed on its Node 22 Linux runner. Startup checks are HTTP smoke checks, not browser accessibility or full application tests. No authentication/letter/AI/SOS implementation exists to exercise end-to-end. Protection settings were inspected; rejection behavior was not tested through direct pushes or attempted merges.

Whitespace and local documentation links passed validation. This PR changes only README, seven project documents and the CI workflow; application source, lockfile and historical weekly records are unchanged. Authorized remote changes comprise the feature branch/PR publication and main protection configuration. Merge still requires teammate review and passing required checks.
