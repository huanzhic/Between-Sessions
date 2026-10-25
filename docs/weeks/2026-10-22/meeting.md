# Weekly Meeting — 2026-10-22

## Meeting details

- Date / time: Filed under the October 22, 2026 meeting, a standing Thursday 6 PM meeting. The supplied summary does not confirm the date, start time, or duration.
- Participants named in the summary: Justin, Almutairi, Huang, Stanley, and Dr. Cass Dykeman (joined during the meeting).
- Location: Zoom; the summary does not name the meeting room.
- Source: User-provided Zoom meeting summary; summarized here. The source spells the competitor apps "Yooper," "Yupert," and "Wobot"; these are likely Youper and Woebot (confirm).

## Questions and issues to resolve

- What should the storyboard and prototype show, and which features should be prioritized next?
- How can the app use an AI model while meeting HIPAA requirements?
- What liability protections and disclaimers are needed, and should the app include therapist interaction?
- What would distinguish the app from existing AI mental health apps?

## Summary

- Almutairi presented a website prototype for visual presentation, designed with ChatGPT and Figma AI. It includes daily check-ins, guided journaling, and a talk option with a chatbot that asks users to rate their feelings from 1 to 10. A patient dashboard showed a 5-4-3-2-1 anxiety scale with options for breathing exercises, guided journaling, or the chatbot. Almutairi mentioned a sprint assignment due Sunday.
- Huang shared a comic of current concepts and presented an AI chat prototype in which patients discuss their sessions, receive AI-suggested next steps, choose among options, and get a session summary at the end. Huang also mentioned attending an upcoming event to gather ideas.
- Justin suggested starting simply, possibly with CBT, and identifying a competitive advantage such as customization or a distinctive therapeutic approach. Customizable therapist prompts were discussed.
- Justin asked about HIPAA compliance and data privacy. Huang and Stanley said a business associate agreement (BAA) would be required and that local models are not feasible because of hardware costs. Stanley noted that Claude organization accounts offer BAA capabilities. Huang reported that most cloud APIs can be used with proper HIPAA compliance processes. These statements were made in the meeting and have not been verified in this record.
- Almutairi reported that apps such as Youper and Woebot suggest crisis hotlines and had problems with AI responses. Justin recommended researching user agreements and disclaimers to limit liability, noting their importance for pitch competitions.
- Justin asked whether session summaries or alerts shared with therapists would become part of clinical notes. The team agreed to keep building the current design and to explore enabling or disabling features depending on context.
- The team agreed on a mobile app for the App Store, possibly with Apple Watch integration. Dr. Dykeman suggested wearables as a market differentiator, noting that current trends in AI medicine emphasize wearables, and mentioned evidence-based techniques such as EMDR and grounding exercises.
- Text-to-speech, two-way communication, and evidence-based treatment suggestions were discussed for the storyboard.

## Answers and decisions

- Focus on the patient-side storyboard and prototype; defer therapist interaction features because of legal and liability complications.
- Build a mobile app for the App Store rather than a computer-based solution; Apple Watch integration remains a possibility.
- Continue the current design while exploring context-dependent feature toggles; the clinical-notes question remains open.
- Almutairi will expand competitor research, collect example user agreements and disclaimers, and create an animated patient-side storyboard or prototype for the next meeting.
- Stanley will research which LLM models or enterprise plans offer a BAA.
- Huang will email Justin to request an API key. Justin will provide one (OpenRouter preferred) to Huang and Dykeman on request and send the Zoom meeting summary to the team. This provides access, not a model selection or confirmation of suitability for client data.

## Follow-up actions

| Owner | Action | Timing |
| --- | --- | --- |
| Almutairi | Research current AI therapy apps and competitors beyond Woebot and Youper to identify industry standards and differentiators. | Not specified |
| Almutairi | Find examples of user agreements and disclaimers that other AI therapy bots use to address liability and state that they are not therapy. | Not specified |
| Almutairi | Create an animated storyboard or prototype of the patient-side app flow. | Next meeting |
| Huang | Email Justin to request the API key. | Not specified |
| Justin | Send the Zoom meeting summary to the team. | Not specified |
| Justin | Provide an API key (OpenRouter preferred) to Huang and Dykeman on email request. | On request |
| Stanley | Research which LLM models or enterprise versions offer a BAA for HIPAA compliance. | Not specified |

## Follow-up status — October 25, 2026

Huang's API-key request [#16](https://github.com/huanzhic/Between-Sessions/issues/16) and Stanley's BAA research [#19](https://github.com/huanzhic/Between-Sessions/issues/19) are closed as completed in GitHub. Justin's key delivery #18 and summary delivery #17 remain open, as do Almutairi's tasks #13–#15. The older stack-selection assignment #3 is closed; implementation ownership and mobile delivery still need agreement. See the [plan](planning.md) and [current status](../../project/status.md). These later updates do not change the original meeting decisions.

## Unresolved questions

- Which model providers and plans offer a BAA, and would access through OpenRouter be covered?
- What user agreement and disclaimer language is needed? These were raised as questions, not established legal conclusions.
- Would summaries or alerts shared with therapists become part of clinical notes?
- What will differentiate the app: wearables, customization, a specific therapeutic approach, or something else?
- Which evidence-based techniques, such as grounding exercises or EMDR-related elements, are appropriate for self-guided use between sessions?
- Which features should be prioritized for the next prototype iteration?

## Next meeting

- Next week at 6 PM, as stated in the summary; likely Thursday, October 29, 2026 (confirm).

## Links

- Planning record: [`planning.md`](planning.md)
- Research record: [`research.md`](research.md)
- Previous meeting: [`../2026-10-15/meeting.md`](../2026-10-15/meeting.md)
