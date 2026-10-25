# Weekly Meeting — 2026-10-15

## Meeting details

- Date / time: Filed under the October 15, 2026 meeting, scheduled for 6 PM. The supplied summary does not confirm the date, start time, or duration.
- Participants named in the summary: Justin, Almutairi, Stanley, and Huang.
- Location: Justin Jacques's Personal Meeting Room.
- Source: User-provided meeting summary, `Justin Jacques's Personal Meeting Room.md`; summarized here without private task links. The source calls the prototype "Replete"; existing project records call the platform Replit.

## Questions and issues to resolve

- What should the first prototype do, and how much therapist personalization is needed?
- How should crisis responses, disclosures, consent, and conversation data be handled?
- Which model and integration options are practical for the current project phase?

## Summary

- Justin reviewed the existing basic prototype. The discussion favored starting small with controlled decision-tree interactions and adding features incrementally.
- Justin will gather patient feedback on between-session support, including check-ins, journaling, tools, knowledge of prior sessions, and whether the bot should look or sound like their therapist.
- CBT was discussed as a possible basis for structured interactions. Justin noted that clinicians do not all practice pure CBT; empathy and reflective listening were also discussed.
- Mimicking a therapist using recorded sessions and automatically capturing session notes were explored. The summary describes the data requirements as impractical for the current phase. Zoom integration and partnerships with existing therapy or note-taking platforms were future possibilities.
- Crisis handling raised questions about output control, emergency guidance, disclosures, consent, and liability. Automatic alerts to therapists, backup clinicians, or emergency services were proposals with unresolved privacy and operational questions.
- The team discussed conversation storage, clinician access to summaries, and possible real-time monitoring. No storage policy or monitoring workflow was settled. Justin's suggestion that other apps may avoid storing conversations requires verification.
- Justin offered Claude or ChatGPT API access when needed. DeepSeek and open-source alternatives were discussed for prototype costs; no model or technology stack was selected.

## Answers and decisions

- Initial development direction: start with simple decision-tree interactions and add features incrementally; Almutairi is assigned to begin this work.
- Justin will ask patients which features they want and whether therapist appearance or voice matters.
- Almutairi will investigate how other mental health apps handle crises and conversation data. Justin will investigate crisis-related legal/liability requirements and disclosures.
- Huang will investigate DeepSeek and, closer to a pilot, test token usage and costs for different interaction lengths.
- Justin will provide Claude or ChatGPT API keys when the team is ready. This is an offer of access, not a model selection or confirmation of suitability for client data.

## Follow-up actions

| Owner | Action | Timing |
| --- | --- | --- |
| Almutairi | Research crisis handling and data storage/privacy in apps such as Woebot and the app named "Yooper" in the source (likely Youper; confirm). | Not specified |
| Almutairi | Start a simple decision-tree prototype and add features incrementally. | Not specified |
| Huang | Research DeepSeek as a model option, including cost. | Not specified |
| Huang | Test token usage and costs for interactions of about 15 minutes versus one hour. | Closer to a pilot |
| Justin | Ask patients about desired between-session features. | This week, as stated in the summary |
| Justin | Ask patients about the importance of therapist appearance or voice. | This week, as stated in the summary |
| Justin | Research crisis-related legal/liability requirements and disclosure statements. | Not specified |
| Justin | Provide Claude or ChatGPT API access when the team is ready. | When needed |

The source uses "Almutairi" while earlier records use "Jack"; the identity mapping is not confirmed here. See the planning record for earlier tasks whose completion was not reported.

## Follow-up status — October 25, 2026

Huang's DeepSeek research [#7](https://github.com/huanzhic/Between-Sessions/issues/7) and token/cost testing [#8](https://github.com/huanzhic/Between-Sessions/issues/8) are closed as completed in GitHub; their separate results are not linked in the research record. The other October 15 assignments remain open. Justin's API-access offer #12 is partly superseded by the specific October 22 key-delivery task #18. See the [plan](planning.md) for current status; the meeting-time statements above describe the original assignments.

## Unresolved questions

- Which patient needs and features should define the first prototype? How much therapist personalization is necessary?
- Is CBT the primary framework, or should the prototype support other clinician approaches?
- What constitutes an imminent threat, what should the system do, and who would be available to respond? Are alerts appropriate and consented to?
- What disclosures and liability requirements apply? These were questions raised in the meeting, not established legal conclusions.
- Should conversations be retained, for how long, and who can access them or their summaries? How do applicable privacy and HIPAA requirements affect the design?
- Which model, API provider, and technology stack should be selected after reviewing cost, privacy, and prototype needs?

## Links

- Planning record: [`planning.md`](planning.md)
- Research record: [`research.md`](research.md)
