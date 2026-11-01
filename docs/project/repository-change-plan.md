# Repository audit and incremental change plan

Publication update, November 1, 2026: the user subsequently authorized GitHub upload. The nine-file change was committed on `docs/mvp-plan-and-review-workflow`, rebased onto fetched main and pushed as [PR #20](https://github.com/huanzhic/Between-Sessions/pull/20). The first GitHub Actions Node 22 run passed. Main now requires the actual **Typecheck and build** GitHub Actions check with up-to-date branches; protection readback verified all earlier peer-review safeguards remain enabled. Overall protection is now **ENFORCED**. The preparation-phase audit below retains its original timing and authorization limits; statements about unpublished CI or no commits describe that earlier phase. No PR merge or deployment was performed.

Audited November 1, 2026. Local main and the initially cached origin/main were `ffc3378` (revert of task-state sync); local branch `local/initial-setup` also exists. Initial working tree was clean. A final `git ls-remote` and `git fetch origin main` verified actual remote main at `b628c951392e128ed1f5585c9df9d431c72dc5f3`, one commit ahead. That commit only edits `docs/research/baa-tech-stack.md`: removes the Claude Code attribution, task-attribution sentence and explicit selected-status paragraph; selected-stack labels remain in the body. Its diff was reviewed. Application/configuration/weekly records match the local baseline. The checkout is deliberately not merged/reset; local main remains `ffc3378`, fetched origin/main is `b628c95`. No new branch, commit, push or PR is created by this task.

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

No framework, router, application DB schema, authentication, AI provider SDK, workflow endpoint, test suite or CI workflow was implemented at audit. `/health` is functional; other API paths return 404. README folder labels describe intentions (Render, Better Auth, Claude), not evidence of deployed/configured services. Existing dependencies are installed locally; Node 24.21.0/npm 11.19.0 available, `gh` unavailable. Only root AGENTS.md applies. No existing PR template/CODEOWNERS or local CI policy was found.

Remote inspection found a public repository with admin permission, no classic main protection (404), no rulesets/effective rules and zero Actions workflows. See [protection evidence and final status](github-collaboration-rules.md). Missing branch settings are not inferred from Markdown alone.

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

Seven planning/policy documents and README links; a basic `.github/workflows/ci.yml` runs reproducible `npm ci`, root typecheck and root build on PRs and pushes to main, using Node 22. Workflow permissions are read-only; it needs no secrets, services or patient data. Proposed actual check name is **Typecheck and build**. No path filters or no-op checks. Local clean installation validates the existing lockfile; avoid unrelated dependency upgrades.

The workflow is local/unpublished because commits/pushes/PRs are prohibited. Required status-check enforcement is **PENDING**, not completed, until this workflow is separately authorized for publication and a successful GitHub run reports the actual check name. Do not select an imagined check or use local build success as remote evidence. Preserve any existing stricter checks when configuring future requirements.

## Validation and handoff

Run `npm ci`, `npm run typecheck`, `npm run build`, startup smoke checks for API health/404 and frontend, and `git diff --check`. Results and limitations are recorded below after execution. Future authorization/security/workflow tests belong to their feature owners; this preparation task adds no implementation-mirroring test suite. Weekly records and application source stay unchanged. No deployment or real-data testing.

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
| GitHub settings readback | Peer-review/branch protections ENFORCED; overall PARTIALLY ENFORCED because required CI is pending |

Local checks used Node 24.21.0, not the workflow's Node 22 Linux runner. GitHub Actions execution and remote check enforcement were **not run**: no publication is authorized. Startup checks are HTTP smoke checks, not browser accessibility or full application tests. No authentication/letter/AI/SOS implementation exists to exercise end-to-end. Settings were inspected, not tested by pushing or merging.

Final handoff also checks whitespace and local documentation links. Only README, these seven documents and the local CI workflow are intended changes; application source, lockfile and historical weekly records are unchanged. Main protection was the only remote mutation.
