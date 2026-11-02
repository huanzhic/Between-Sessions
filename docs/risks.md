# Risk register

The project's only risk register, as of November 1, 2026. Ranked by likelihood and impact (High, Medium, Low), highest first. Reviewed at each sprint planning; a risk whose trigger fires becomes an issue on the board. Owners and dates marked "proposed" await team confirmation.

## Ranked risks

| Rank | Risk (condition and consequence) | Category | Likelihood and why | Impact and why | Owner | Trigger | Response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | The production target is not yet agreed with the partner, so week 10 deployment work could target the wrong place. | Business | High: not yet agreed | High: Checkpoint 2 checks this deployment | Team: Zhicheng Huang, Jack Almutairi, Stanley Eng | No agreement by November 5 | Mitigate: asked Justin on November 1; bring it to the November 5 meeting if unanswered. |
| 2 | Meeting records choose a native App Store app while the current plan recommends responsive web, so work could be built for the wrong platform. | Business | High: the conflict is open | High: changes the whole client stack | Team: Zhicheng Huang, Jack Almutairi, Stanley Eng | Partner restates the native requirement | Mitigate: settle Q-1 with Justin alongside rank 1. |
| 3 | The proposed therapist assignment and inbox conflict with the October 22 deferral, so the core flow may lose its second half. | Business | Medium: the proposal is newer but unconfirmed | High: changes data model and scope | Zhicheng Huang (proposed) | Justin or a legal reviewer rejects therapist features | Mitigate: confirm scope before Milestone 2; keep the client flow usable alone. |
| 4 | Backend A and Backend B roles are unassigned, so foundation work has no owner. | Team | High: both recorded as TBD | Medium: delays the skeleton, though the scaffold exists | Team: Zhicheng Huang, Jack Almutairi, Stanley Eng | Roles still TBD on November 8 | Mitigate: decide together who takes each role at the November 5 meeting; see [team roles](project/team-roles-and-development-order.md). |
| 5 | Crisis or AI output could mislead a vulnerable user or create liability if the product reaches real users early. | Business | Low: fictional data only for now | High: potential harm to users | Zhicheng Huang (proposed) | Any proposal to use real users or real crisis integration | Eliminate for now: placeholder only, no AI sending, no real data. |
| 6 | The BAA signer is undecided, so a real-data pilot cannot begin. | Business | Medium: no owner has been named | High for the pilot; none for the skeleton | Team: Zhicheng Huang, Jack Almutairi, Stanley Eng | Pilot is scheduled with no signer | Mitigate: raise it with Justin; no real data until signed. |
| 7 | The required peer review can stall merges near deadlines, since each new push needs fresh approval. | Team | Medium: a three-person team | Medium: delays, with no quality loss | Zhicheng Huang (proposed) | A PR waits past the review window | Accept: the protection is worth it; open PRs early. |
| 8 | Tests cover only the scaffold, so feature regressions would pass CI. | Technical | Medium: only three tests exist | Medium: grows with each feature | Team: Zhicheng Huang, Jack Almutairi, Stanley Eng | A feature PR arrives with no tests | Mitigate: the Definition of Done in `CONTRIBUTING.md` requires tests. |
| 9 | Vendor prices and BAA terms in the stack research may be stale or unverified, so the selected stack could cost more or cover less. | Technical | Medium: some sources are marked unverified | Low now; rises before a pilot | Team: Zhicheng Huang, Jack Almutairi, Stanley Eng | Verification before the pilot finds a difference | Accept for now: verify before signing anything. |

## External prerequisites

| Prerequisite | Needed for | Who asks | Who decides | Asked on | Status |
| --- | --- | --- | --- | --- | --- |
| Agreement on the production target (Render, web) | Checkpoint milestone; week 10 deployment | Stanley Eng | Justin Jacques | November 1, 2026 | Asked; awaiting reply; to close by November 5, 2026 |
| Render account for the fictional skeleton | Week 10 deployment | Stanley Eng (proposed) | Team; whether the partner must approve is unconfirmed | Not yet asked | Open |
| Render and Anthropic BAAs | Any real patient data; **not** the fictional skeleton | Not yet assigned | Signer undecided (Q-5) | Not yet asked | Not started |
| API key, OpenRouter preferred, for fictional prototyping | Optional AI work | Zhicheng Huang (issue #16, closed as completed) | Justin Jacques | Closed by October 25, 2026; exact request date not recorded | Delivery open (issue #18) |
| Organizational, privacy and security, and clinical review | Any real-client pilot; **not** the fictional skeleton | Not yet assigned | Reviewers undecided | Not yet asked | Not started |
| Apple Developer account | Only if Q-1 chooses native | Not yet assigned | Account holder undecided | Not yet asked | Depends on Q-1 |

## Staging and rollback plan

Neither exists yet. Dates are proposed; Stanley Eng is the proposed owner of both.

- **Where changes are exercised:** today, on local machines and in CI. By **November 15, 2026**, a separate Render staging service deployed from `main`, using fictional data only, where changes are checked before reaching the production target.
- **How a bad change is undone:** today, revert the pull request through a new reviewed pull request. By **November 22, 2026**, also Render's rollback to the previous deploy, tried once on staging and documented in `README.md`. Database migrations need their own undo path once a schema exists.
- **Review gates on expensive changes:** every change to `main` already needs a peer approval and passing CI. See [CONTRIBUTING](../CONTRIBUTING.md#pull-requests-and-review).
