# Requirements

Between Sessions, updated November 4, 2026. FR-1 and FR-2 are implemented. The Milestone 1 frontend additionally demonstrates role shells, reflection editing, simulated save/error/retry, letter preview and independent SOS placeholder with fictional data. These UI demonstrations do not satisfy the backend, persistence, authorization or actual-send acceptance criteria below. The detailed acceptance checklist and data-visibility matrix are in [MVP scope and architecture](project/mvp-scope-and-architecture.md).

**Status labels.** *Implemented*: runs at this commit, with a CI test. *Partner-stated*: raised by Justin in a recorded meeting. *Assumption*: proposed by the team and not yet confirmed by the partner.

## Problem statement

Clients in therapy have thoughts and unfinished topics between appointments, when their therapist is unavailable, and much of that can be lost by the next session. Between Sessions, introduced by Justin Jacques at the October 11 kickoff, aims to help clients reflect between appointments and bring what matters back to the next one, while handling sensitive data safely and staying easy to use. It supports therapy and does not replace it. The proposed first milestone is an appointment-preparation workflow, not a live therapy chatbot or a crisis-monitoring system.

## Functional requirements

| ID | Requirement | Priority and reason | Status | Acceptance criterion or test |
| --- | --- | --- | --- | --- |
| FR-1 | The API reports its health at `GET /health`. | Must: the deployment check for the walking skeleton | Implemented | CI test: `GET /health reports that the API is up` |
| FR-2 | The web app loads and shows the product name. | Must: first slice of the walking skeleton | Implemented | CI test: `App renders the product heading` |
| FR-3 | A therapist assigns a topic and customizable questions to a linked client for a next appointment. | Must: starts the proposed flow | Assumption; conflicts with the October 22 deferral of therapist features | The assignment appears only for the linked client. |
| FR-4 | A client answers at their own pace, skips questions, and saves private answers. | Must: core client value | Assumption | Saves work outside the sending window. Saving, saved, and failed states are distinct. A failed save keeps local edits and offers retry. |
| FR-5 | Private answers and drafts are visible only to the client who wrote them. | Must: privacy promise of the flow | Assumption | Another client and the therapist cannot retrieve drafts, counts, or excerpts through any route. |
| FR-6 | A client writes a summary and reviews the exact letter and recipient before explicitly sending. | Must: the client controls what is shared | Assumption | Nothing sends without explicit confirmation. A sent letter stays fixed after later private edits. |
| FR-7 | A therapist reads approved sent letters in an asynchronous inbox. | Should: closes the loop before the appointment | Assumption; same conflict as FR-3 | The inbox holds only letters sent to that therapist and makes no promise of being read or monitored. |
| FR-8 | A client may request an AI-organized draft of their summary. | Could: useful, but the manual path must work first | Assumption | The draft is editable. AI never sends. A timeout or invalid output keeps edits and leaves the manual path usable. |
| FR-9 | A clearly labeled SOS resource placeholder stays available regardless of writing, AI, appointment, or sending state. | Must: crisis needs may arise at any point | Assumption | Reachable with no appointment, a closed window, or an AI failure. The copy states it contacts nobody and that nobody monitors it. |

## Non-functional requirements

| ID | Requirement | Priority and reason | Status | Acceptance criterion or test |
| --- | --- | --- | --- | --- |
| NFR-1 | Authorization is enforced by the server, never only by client routes. | Must: sensitive data | Assumption | Anonymous, wrong-role, and cross-client requests are denied by integration tests. |
| NFR-2 | Logs, errors, and audit records omit responses, letters, model input and output, tokens, and credentials. | Must: logs must not leak sensitive content | Assumption | Tests of failure paths find none of these values in log output. |
| NFR-3 | Provider keys and SDK calls stay on the server. | Must: keys in a browser bundle are public | Assumption | A search of the built web bundle finds no key or provider SDK. |
| NFR-4 | The app is usable on phone and desktop browsers. | Should: ease of use is a partner goal | Partner-stated goal; web form is an assumption | The core flow completes at phone and desktop widths. |
| NFR-5 | A clean clone reaches a running scaffold by following the README. | Must: graders and successors start there | Implemented | [README quickstart](../README.md#quickstart) |

## Constraints

Limits the team did not choose:

- **C-1 HIPAA and BAAs.** Any service that stores, processes, or transmits protected health information needs a signed Business Associate Agreement before real patient data is used. No agreement has been signed. A BAA discussion or a UI disclaimer is not proof of HIPAA compliance, and any real-client pilot also needs separate organizational, privacy and security, and clinical review. Details: [tech stack research](research/baa-tech-stack.md).
- **C-2 Synthetic data.** The project brief requires synthetic or properly de-identified data for development and testing.
- **C-3 No clinical claims.** The product makes no claim of clinical effectiveness and gives no diagnosis or treatment advice.
- **C-4 Course timeline.** A walking skeleton must be deployed by fall week 10, about December 6, 2026.
- **C-5 Unresolved legal scope.** Liability, disclosure, and clinical-record questions are unanswered, and they limit therapist and crisis features until someone qualified answers them.

The team's own choices, such as no AWS for now and the TypeScript stack, are recorded in [the design](design.md) because the team could reverse them.

## Success metrics

Proposed; not yet agreed with the partner.

- The fictional therapist-to-client-to-letter scenario completes end to end without AI by the end of winter term.
- Every authorization and privacy test in FR-5 and NFR-1 passes in CI.
- Pilot clients or clinicians, if a pilot is approved, can complete the flow unaided in a usability session.

## Non-goals

Not planned for the current milestones: real patient data, open-ended therapeutic chat, live monitoring or alerts, emergency-service integration, automated risk scoring, diagnosis or treatment advice, voice features, and Apple Watch integration.

## Open questions

| ID | Question | Owner |
| --- | --- | --- |
| Q-1 | Native App Store app (October 22 decision) or responsive web (current recommendation)? | Stanley Eng, with Justin |
| Q-2 | Are therapist assignment and inbox in scope, given the October 22 deferral? | Zhicheng Huang, with Justin |
| Q-3 | When can a client send: the 24 hours before the next appointment, the 24 hours after a session, or a therapist-set threshold? What happens if an appointment is rescheduled? | Team, until the Backend B role is assigned; with Justin |
| Q-4 | Do summaries shared with therapists become part of clinical notes? | Justin |
| Q-5 | Who signs the Render and Anthropic BAAs? | Stanley Eng, with Justin |
| Q-6 | What may AI receive and retain, and which model is used? | Zhicheng Huang |
| Q-7 | What distinguishes the product: customization, wearables, a therapeutic approach, or something else? | Jack Almutairi |
| Q-8 | One sent letter per activity, or edits and resubmission after sending? What does a therapist see if an appointment is canceled? | Team, until the Backend B role is assigned; with Justin |
| Q-9 | What should the prototype SOS page show, and who evaluates any future real service or location-specific resources? | Team, with Justin |
| Q-10 | Which facts must an AI summary preserve, and how are missed or changed details evaluated with fictional test cases? | Zhicheng Huang |

Owners above are proposed. The full list of unresolved decisions is in [Decisions and open questions](project/decisions-and-open-questions.md).
