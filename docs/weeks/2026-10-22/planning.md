# Weekly Plan — 2026-10-22

> This plan covers work assigned at the October 22 meeting for the period afterward, regardless of deadline. Earlier assignments remain in their original meeting records. See [weekly rules](../README.md).

## Goal for this week

- Prepare an animated patient-side storyboard or prototype for the next meeting.
- Clarify HIPAA-compliant model options, liability disclaimers, and competitor differentiators before expanding the prototype.

## Tasks assigned at the October 22 meeting

- [ ] **Task:** Research current AI therapy apps and competitors beyond Woebot and Youper ("Yooper" in the source) to identify industry standards and differentiators. — **Owner:** Almutairi — **Due date:** Not specified.
- [ ] **Task:** Find examples of user agreements and disclaimers that other AI therapy bots use to address liability and state that they are not therapy. — **Owner:** Almutairi — **Due date:** Not specified.
- [ ] **Task:** Create an animated storyboard or prototype of the patient-side app flow. — **Owner:** Almutairi — **Due date:** Next meeting.
- [x] **Task:** Email Justin to request the API key. — **Owner:** Huang — **Due date:** Not specified. — **Status source:** [GitHub #16](https://github.com/huanzhic/Between-Sessions/issues/16), closed as completed on October 25, 2026. Key delivery is still Justin's open task [#18](https://github.com/huanzhic/Between-Sessions/issues/18).
- [ ] **Task:** Send the Zoom meeting summary to the team. — **Owner:** Justin — **Due date:** Not specified.
- [ ] **Task:** Provide an API key (OpenRouter preferred) to Huang and Dykeman on email request. — **Owner:** Justin — **Due date:** On request.
- [x] **Task:** Research which LLM models or enterprise versions offer a Business Associate Agreement (BAA) for HIPAA compliance. — **Owner:** Stanley — **Due date:** Not specified. — **Status source:** [GitHub #19](https://github.com/huanzhic/Between-Sessions/issues/19), closed as completed on October 25, 2026. [Research delivered](../../research/baa-tech-stack.md); source limitations and pilot preparation remain open.

Status checked October 25, 2026: competitor research (#13), disclaimers (#14), storyboard (#15), summary delivery (#17), and key delivery (#18) remain open in GitHub. No implementation assignment for Huang has been recorded after the key request. See the [current status and proposed next steps](../../project/status.md).

## Research questions

1. Which LLM providers offer a BAA, under which plans, and which services or features does it cover?
2. Does using a model through an intermediary such as OpenRouter affect BAA coverage?
3. What features are standard in current AI mental health apps, and where are the gaps this app could fill?
4. How do AI mental health apps use user agreements and disclaimers to define their role and limit liability?
5. When would summaries or alerts shared with therapists become part of the clinical record?
6. What can wearables such as Apple Watch contribute to between-session support, and what evidence supports it?
7. Which evidence-based techniques, such as grounding exercises, are suitable for self-guided use between sessions?

## Next meeting preparation

### Questions for instructors or university staff

1. **Question:** Are summaries or alerts shared with therapists part of clinical notes?
   - Context: Raised by Justin; affects whether therapist-facing features can be added later.

### Topics or decisions to resolve

- [ ] Review Almutairi's animated patient-side storyboard or prototype.
- [ ] Review implementation of the [selected tech stack](../../research/baa-tech-stack.md), including how the web scaffold supports the mobile/App Store direction. Stack selection is closed in #3; agree implementation owners and decide who signs the Render and Anthropic BAAs.
- [ ] Choose features to prioritize for the next prototype iteration.
- [ ] Decide whether wearables or another feature will be the main differentiator.

## Links

- Research record: [`research.md`](research.md)
- Meeting record: [`meeting.md`](meeting.md)
- Previous meeting: [`../2026-10-15/meeting.md`](../2026-10-15/meeting.md)

## Carryover

- October 15 assignments: see [the original task list](../2026-10-15/planning.md#tasks-assigned-at-the-october-15-meeting). As of October 25, Huang's DeepSeek research (#7) and token/cost testing (#8) are closed as completed in GitHub; their results are not linked in the research record. Almutairi's crisis research (#5) and decision-tree prototype (#6) remain open, along with Justin's tasks (#9–#12). Almutairi reported initial crisis-response findings and Huang presented a chat prototype at this meeting; those reports do not close Almutairi's tasks. Justin's API-access offer is partly superseded by the specific October 22 key-delivery assignment (#18). These remain attributed to October 15.
- October 11 assignments: see [the original task list](../2026-10-11/planning.md#tasks). As of October 25, HIPAA research (#1), prototype exploration (#2), and stack selection (#3) are closed as completed in GitHub. Stanley's narrower October 22 BAA assignment (#19) is also closed. Justin's meeting-time notification (#4) remains open; Cass's attendance does not confirm that notification. These remain attributed to their original meetings.
- Therapist interaction features are deferred because of legal and liability concerns; text-to-speech, two-way communication, and Apple Watch integration remain ideas without implementation assignments.
