# Weekly Research — 2026-10-11

## Research questions

List the questions the team is researching this week. These can match the questions in [`planning.md`](planning.md).

1. How should Cognitive Behavioral Therapy (CBT) inform the project's goals, between-session activities, and product boundaries?
   - Assigned to: Zhicheng Huang.
   - Review core CBT concepts and therapist-guided between-session practices; identify candidate activities and the evidence and limitations relevant to each.
   - Confirm with Justin whether CBT is the primary theoretical framework and which activities require therapist guidance or review.
   - Distinguish evidence for CBT from evidence for this specific AI-supported implementation; do not assume the prototype has clinical effectiveness.

## Proposed research priorities

1. **CBT foundation and project fit:** Clarify the intended therapeutic framework, target users, candidate activities, and boundaries. Produce a short mapping from CBT concepts to proposed product behavior and questions for Justin.
2. **HIPAA applicability and data requirements:** Identify applicable constraints and unresolved questions that affect data handling and platform choices. This can proceed alongside the CBT research.
3. **Replit and prototype review:** Inventory existing functionality, data flows, dependencies, and reusable code; compare these with the proposed activities and constraints. Access from Justin is a prerequisite.
4. **Technology stack decision:** Compare options after the preceding research has initial findings, considering team skills and the 11-week project timeline.

## Sources found

- CBT and LLM background sources: S001–S006 in the [source index](../../research/sources/source-index.md).

## Background research: CBT and LLMs

- **Prepared by:** Zhicheng Huang.
- **Research cycle:** October 11, 2026 (confirmed by Huang); the background document is dated October 15, 2026.
- **Document:** [CBT and LLMs: Background Research Overview](../../research/cbt-llm-background.md).
- **Summary:** Introduces CBT concepts and thought records, compares implementation options, and summarizes the Woebot (S005) and Therabot (S006) research examples. Background sources S001–S004 cover psychotherapy, thought records, and specialized OCD and PTSD methods.
- **Possible investigation:** Compare prompting alone with software-controlled steps plus an LLM using fictional thought-record cases, offline comparisons, and expert review. Evaluate skipped steps, unsupported factual additions, user confirmation, correction handling, and user choice.
- **Limitations:** The original paper notes were based on extracted main texts; supplements and registration differences were not fully checked. Reading extent for the background webpages was not recorded. Reorganizing the material did not include a new source review. Workflow evaluation would not establish therapeutic effectiveness.
- **Status:** Background material for team and instructor discussion. This direction is not an agreed project requirement or finalized research plan; model training and patient-facing testing have not been agreed upon.

## Links

- Planning record: [`planning.md`](planning.md)
- Meeting record: [`meeting.md`](meeting.md)
