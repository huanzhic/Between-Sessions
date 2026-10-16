# Weekly Research — 2026-10-15

## Research questions

1. What HIPAA compliance requirements apply to software applications, specifically mental health apps?
   - Assigned to: Jack, Huang, Stanley.
2. How does the Replit platform work, and what functionality does the prototype shared by Justin provide?
   - Assigned to: Jack, Huang, Stanley.
3. Which technology stack should the team use for the project, including the React and FastAPI options discussed in the meeting?
   - Assigned to: Jack, Huang, Stanley.

## Sources found

- CBT and LLM background sources: S001–S006 in the [source index](../../research/sources/source-index.md).

## Research follow-up from the October 15 meeting

These are research tasks and questions extracted from the supplied meeting summary, not new research findings. No external sources were reviewed for this update.

| Topic | Questions / expected output | Owner / timing |
| --- | --- | --- |
| Comparable apps | Investigate crisis responses, escalation, consent, conversation retention, and privacy practices in Woebot and the app called "Yooper" in the summary (likely Youper; confirm). Verify rather than assume whether conversations are stored. | Almutairi; timing not specified |
| Crisis requirements | Identify legal/liability questions, disclosure requirements, and consent considerations affecting crisis responses or notifications. Clarify what needs qualified review. | Justin; timing not specified |
| Patient needs | Gather feedback on check-ins, journaling, tools, prior-session context, and the importance of therapist appearance or voice. Feed findings into prototype scope. | Justin; this week per summary |
| Model options | Investigate DeepSeek as a cost-conscious option; compare its suitability with the Claude, ChatGPT, and open-source options discussed. No provider has been selected. | Huang assigned to DeepSeek; broader comparison owner not specified |
| Usage and cost | Measure token usage and estimate costs for roughly 15-minute and one-hour interactions; record model, context assumptions, and usage rather than treating elapsed time as a token count. | Huang; closer to a pilot |

### Design questions raised

- Can simple decision-tree interactions support the initial needs, with an LLM added only where useful? Almutairi is assigned to start the prototype; detailed flow and evaluation criteria remain to be defined.
- How should CBT-informed structure fit clinicians who use other approaches? CBT has not been confirmed as the sole framework.
- What conversation data, if any, should be retained, and what access should clinicians have to summaries? Privacy and HIPAA implications remain unresolved.
- Therapist-style training, session note capture, Zoom or partner integrations, and real-time monitoring were discussed as possibilities. They are not finalized requirements or completed investigations.

Register external sources in the source index when they are actually reviewed. The meeting summary itself does not verify competitor practices, legal requirements, model suitability, or clinical effectiveness.

## Background research: CBT and LLMs

- **Prepared by:** Zhicheng Huang.
- **Date:** October 15, 2026.
- **Document:** [CBT and LLMs: Background Research Overview](../../research/cbt-llm-background.md).
- **Summary:** Introduces CBT concepts and thought records, compares implementation options, and summarizes the Woebot (S005) and Therabot (S006) research examples. Background sources S001–S004 cover psychotherapy, thought records, and specialized OCD and PTSD methods.
- **Possible investigation:** Compare prompting alone with software-controlled steps plus an LLM using fictional thought-record cases, offline comparisons, and expert review. Evaluate skipped steps, unsupported factual additions, user confirmation, correction handling, and user choice.
- **Limitations:** The original paper notes were based on extracted main texts; supplements and registration differences were not fully checked. Reading extent for the background webpages was not recorded. Reorganizing the material did not include a new source review. Workflow evaluation would not establish therapeutic effectiveness.
- **Status:** Background material for team and instructor discussion. This direction is not an agreed project requirement or finalized research plan; model training and patient-facing testing have not been agreed upon.

## Links

- Planning record: [`planning.md`](planning.md)
- Meeting record: [`meeting.md`](meeting.md)
