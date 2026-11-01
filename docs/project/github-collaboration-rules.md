# GitHub collaboration rules

Permanent user-required policy, recorded November 1, 2026. Applies to all three teammates including administrators and maintainers.

## Team workflow

1. Create a feature branch; never push directly to main.
2. Open a PR with a short change summary and validation evidence; request review from one of the other two human teammates with write permission.
3. Obtain at least one GitHub review submitted as **Approve** from an eligible teammate other than the PR author. A comment, emoji, Discord agreement, bot review, pending review or author's own review does not satisfy team policy. GitHub disallows author self-approval; verify reviewer eligibility in the PR. The team must choose a human reviewer; the approval-count setting alone does not distinguish every possible bot account.
4. Resolve conversations and pass all required checks. New reviewable changes dismiss stale approvals; approval of the most recent push must come from someone other than its pusher. Request fresh review after code changes.
5. Merge only when requirements are satisfied. Never use an admin bypass or temporarily disable protection to merge.

## Setup status

Current overall status: **ENFORCED**. After the user separately authorized GitHub publication on November 1, 2026, PR [#20](https://github.com/huanzhic/Between-Sessions/pull/20) published the workflow. GitHub Actions [run 41346826621](https://github.com/huanzhic/Between-Sessions/actions/runs/41346826621) successfully ran **Typecheck and build** on Node 22. Main now requires that exact check from GitHub Actions (`app_id: 15368`), with `strict: true` (up-to-date branches). Authenticated protection readback confirmed these values and retained all review/admin/conversation/force-push/deletion protections. No merge or bypass was performed. The earlier snapshot below records the preparation phase before publication.

Preparation-phase status: **PARTIALLY ENFORCED**. Main peer-review protection was verified through authenticated GitHub REST readback on November 1, 2026 at 20:22:00 UTC (12:22 PM America/Los_Angeles); CI was pending at that time.

Initial audit found classic protection 404, no rulesets/effective rules, and zero Actions workflows. With verified admin access, this task created classic main protection using only the authorized review/branch settings. No unrelated settings were changed.

| Requirement | Readback evidence | Status |
| --- | --- | --- |
| PR with at least one peer approval | `required_approving_review_count: 1` | ENFORCED |
| No author self-approval | GitHub platform rule; request one of the other human teammates | Platform restriction; not behavior-tested |
| Fresh review after changed code | `dismiss_stale_reviews: true` | ENFORCED |
| Approval of most recent reviewable push | `require_last_push_approval: true` | ENFORCED |
| Resolved review threads | `required_conversation_resolution.enabled: true` | ENFORCED |
| Admin/maintainer enforcement, no bypass actors | `enforce_admins.enabled: true`; no PR bypass allowances returned; no rulesets | ENFORCED |
| No direct unreviewed code pushes | Required PR/review protection applies to admins | ENFORCED by settings; no push attempted |
| Block force pushes/deletion | Both `allow_force_pushes.enabled` and `allow_deletions.enabled: false` | ENFORCED |
| Required CI | Current readback: `checks: [{context: "Typecheck and build", app_id: 15368}]`, `strict: true`; successful GitHub run linked above | ENFORCED |

Readback endpoints: `/repos/huanzhic/Between-Sessions/branches/main/protection` returned 200 with the values above; `/rulesets?includes_parents=true` and `/rules/branches/main` each returned zero entries. Classic protection is the active mechanism. `/collaborators?per_page=100` confirmed `JackAlmutairi` and `StanLeeEng` have write access and `huanzhic` has admin access. This is access verification only; Backend A/B allocations remain TBD. No bypass actors were configured. No PR, push, review, merge or deletion behavior was exercised.

## Exact settings checklist

For this public, personally owned repository, inspect both Settings → Rules → Rulesets and Settings → Branches before editing. Preserve stricter existing requirements. Update the applicable rule rather than creating conflicting duplicates. Admin or edit-rules permission and a GitHub plan supporting protection are prerequisites.

- Match `main` exactly; ruleset enforcement must be Active if using a ruleset.
- Require a pull request before merging; require **at least 1 approval**.
- Enable **Dismiss stale pull request approvals when new commits are pushed**.
- Enable **Require approval of the most recent reviewable push**.
- Enable **Require conversation resolution before merging**.
- Enable **Do not allow bypassing the above settings** (classic `enforce_admins=true`); no specified actors may bypass PR review. Ruleset bypass list must be empty if using rulesets.
- Leave **Allow force pushes** and **Allow deletions** disabled.
- After the CI workflow is published and reports successfully, enable **Require status checks to pass before merging**, select the actual **Typecheck and build** check from GitHub Actions (confirm exact reported name), and require up-to-date branches. Keep any stricter existing checks; never add a nonexistent check.
- Read settings back and inspect effective rules, not only the save confirmation. Verify no other applicable rule introduces a bypass. Ensure the two human peer reviewers have write access; request access from the owner if missing. Do not modify unrelated repository settings.

## Verification and expected behavior

Read REST `GET /repos/huanzhic/Between-Sessions/branches/main/protection`, `/rulesets?includes_parents=true` and `/rules/branches/main`. For classic protection, verify `required_pull_request_reviews.required_approving_review_count >= 1`, `dismiss_stale_reviews=true`, `require_last_push_approval=true`, no bypass allowances, `required_conversation_resolution.enabled=true`, `enforce_admins.enabled=true`, `allow_force_pushes.enabled=false` and `allow_deletions.enabled=false`. Rulesets endpoint lists rulesets; the effective-rules endpoint describes ruleset rules and may be empty when classic protection is active. Classic protection must therefore be inspected separately. Check actual status contexts/check runs after publication before requiring them.

Expected behavior after verified configuration: an unapproved PR cannot merge; author approval never counts; new reviewable commits invalidate old approval; direct code pushes/admin bypasses are rejected; unresolved threads block merging; required CI must pass **once CI enforcement is enabled**. A properly reviewed PR merge updates main normally. Do not test enforcement with a direct push, artificial PR or merge in this task; those actions are outside authorization. Settings inspection is not an observed behavioral test.

## Next team action

A human teammate must review PR #20. Any new reviewable commits need fresh approval and a successful check on the latest revision. Merge only after those requirements are satisfied. Publication and initial successful CI/check enforcement are complete; the PR remains unmerged.

Reference: [GitHub's branch-protection setup guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule).
