# GitHub collaboration rules

Permanent user-required policy, recorded November 1, 2026. Applies to all three teammates including administrators and maintainers.

## Team workflow

1. Create a feature branch; never push directly to main.
2. Open a PR with a short change summary and validation evidence; request review from one of the other two human teammates with write permission.
3. Obtain at least one GitHub review submitted as **Approve** from an eligible teammate other than the PR author. A comment, emoji, Discord agreement, bot review, pending review or author's own review does not satisfy team policy. GitHub disallows author self-approval; verify reviewer eligibility in the PR. The team must choose a human reviewer; the approval-count setting alone does not distinguish every possible bot account.
4. Resolve conversations and pass all required checks. New reviewable changes dismiss stale approvals; approval of the most recent push must come from someone other than its pusher. Request fresh review after code changes.
5. Merge only when requirements are satisfied. Never use an admin bypass or temporarily disable protection to merge.

## Setup status

Overall status: **PARTIALLY ENFORCED**. Main peer-review protection is **ENFORCED**, verified through authenticated GitHub REST readback on November 1, 2026 at 20:22:00 UTC (12:22 PM America/Los_Angeles). CI enforcement is **PENDING / NOT ENFORCED** until the local workflow is published separately and has a successful GitHub run. Local checks do not establish a required remote status.

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
| Required CI | `required_status_checks` absent; zero remote workflows at audit | PENDING / NOT ENFORCED |

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

## Pending manual actions

After separately authorizing publication, land the local workflow through a feature PR with peer review. Observe a successful GitHub Actions run, then add the exact reported check as required and verify readback. Recheck eligible human collaborators and use this workflow for the first real PR. If permission/plan blocks setup, use the checklist above and retain NOT ENFORCED/PARTIALLY ENFORCED until verified; do not claim Markdown enforces settings.

Reference: [GitHub's branch-protection setup guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule).
