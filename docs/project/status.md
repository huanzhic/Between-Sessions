# Project status — October 25, 2026

This snapshot reconciles GitHub issue states with weekly plans and the [Google Drive task tracker](https://docs.google.com/spreadsheets/d/1joyW9T528nUwNUEtKxecBeo6gYhho6xcZ6USRf8ym44/edit?usp=drivesdk). Assignments retain their original meeting date and owner. GitHub has 7 completed issues and 12 open issues; an open issue does not establish whether work has started. Completion below follows the issue's explicit `completed` closure, rather than an inference from a later meeting or deadline.

## Completed assignments in GitHub

All seven issues were closed as completed on October 25, 2026.

| Assigning meeting | Assignment | Original owner | Source / evidence |
| --- | --- | --- | --- |
| October 11 | HIPAA requirements research | Jack, Huang, Stanley | [#1](https://github.com/huanzhic/Between-Sessions/issues/1); [BAA research](../research/baa-tech-stack.md) covers part of the topic. |
| October 11 | Explore Replit and Justin's prototype | Jack, Huang, Stanley | [#2](https://github.com/huanzhic/Between-Sessions/issues/2) |
| October 11 | Choose technology stack | Jack, Huang, Stanley | [#3](https://github.com/huanzhic/Between-Sessions/issues/3); [selected stack](../research/baa-tech-stack.md) and repository scaffold. |
| October 15 | Research DeepSeek | Huang | [#7](https://github.com/huanzhic/Between-Sessions/issues/7); separate findings are not linked in the weekly research record. |
| October 15 | Test token usage and costs | Huang | [#8](https://github.com/huanzhic/Between-Sessions/issues/8); measured results and tested model are not linked in the weekly research record. |
| October 22 | Request an API key from Justin | Huang | [#16](https://github.com/huanzhic/Between-Sessions/issues/16); delivery remains open in #18. |
| October 22 | Research providers/plans offering a BAA | Stanley | [#19](https://github.com/huanzhic/Between-Sessions/issues/19); [research delivered](../research/baa-tech-stack.md), with limitations retained. |

The October 11 task-tracker setup and Replit-access assignments were already Done in Drive. Huang previously confirmed completion of the October 11 CBT/LLM background research. These remain completed in the [October 11 plan](../weeks/2026-10-11/planning.md).

## Open assignments in GitHub

| Assigning meeting | Assignment | Owner | Issue / recorded timing |
| --- | --- | --- | --- |
| October 11 | Notify Cass of Thursday 6 PM meetings | Justin | [#4](https://github.com/huanzhic/Between-Sessions/issues/4); no deadline specified. |
| October 15 | Research crisis handling and conversation privacy | Almutairi | [#5](https://github.com/huanzhic/Between-Sessions/issues/5); initial findings reported October 22; completion unconfirmed. |
| October 15 | Begin a simple decision-tree prototype | Almutairi | [#6](https://github.com/huanzhic/Between-Sessions/issues/6); no deadline specified. |
| October 15 | Ask patients about useful features | Justin | [#9](https://github.com/huanzhic/Between-Sessions/issues/9); week after the meeting, per summary; no completion confirmed. |
| October 15 | Ask patients about therapist appearance/voice | Justin | [#10](https://github.com/huanzhic/Between-Sessions/issues/10); week after the meeting, per summary; no completion confirmed. |
| October 15 | Research crisis liability and disclosures | Justin | [#11](https://github.com/huanzhic/Between-Sessions/issues/11); no deadline specified. |
| October 15 | Provide Claude/ChatGPT API access when needed | Justin | [#12](https://github.com/huanzhic/Between-Sessions/issues/12); partly superseded by #18; still open. |
| October 22 | Research other AI mental health competitors | Almutairi | [#13](https://github.com/huanzhic/Between-Sessions/issues/13); no deadline specified. |
| October 22 | Collect user-agreement/disclaimer examples | Almutairi | [#14](https://github.com/huanzhic/Between-Sessions/issues/14); no deadline specified. |
| October 22 | Build an animated patient-side storyboard/prototype | Almutairi | [#15](https://github.com/huanzhic/Between-Sessions/issues/15); next meeting. |
| October 22 | Send the meeting summary to the team | Justin | [#17](https://github.com/huanzhic/Between-Sessions/issues/17); no deadline specified. |
| October 22 | Deliver an API key to Huang and Dykeman on request | Justin | [#18](https://github.com/huanzhic/Between-Sessions/issues/18); request task #16 is closed, delivery is not confirmed. |

## Next steps for Huang

No currently open GitHub issue is assigned to Huang. These are proposed follow-ups for coordination, not new meeting assignments or reasons to reopen completed work:

1. Check whether Justin has delivered the requested key and whether it works locally. If delivery is still pending, follow up on #18; there is no need to repeat the completed request task. Keep key values out of the repository and task tracker.
2. Link the existing DeepSeek findings and token/cost results under [October 15 research](../weeks/2026-10-15/research.md). Include the tested model, token counts, and measured costs if available. If results are unavailable, clarify what the closed tasks covered before relying on them for a budget.
3. Review Stanley's selected stack and Almutairi's patient flow together. Agree who owns the API, database, authentication, and LLM work, and how the React web scaffold will support the recorded mobile/App Store direction. No such implementation ownership is recorded yet.
4. Once scope and ownership are agreed and a key is available, a useful first implementation would be one patient chat flow using fictional conversations, with API access handled by the backend. This is a proposed next increment, not an existing assignment.

The next meeting is likely Thursday, October 29, at 6 PM, according to the [October 22 summary](../weeks/2026-10-22/meeting.md#next-meeting); its date still needs confirmation. Existing agenda items include the storyboard, feature priorities, differentiation, and the party responsible for signing the BAAs.

## Implementation status

React/TypeScript/Vite renders a title; the Node/TypeScript API implements `/health`. The database directories are placeholders. Authentication, migrations, persistence, and LLM integration are not implemented. Dependency installation, type checking, and production builds passed locally on October 25, 2026. The existing research's limitations and source-verification notes remain unchanged.
