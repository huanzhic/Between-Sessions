# CBT and LLMs: Background Research Overview

**Prepared by:** Zhicheng Huang

**Date:** October 15, 2026

**Status:** Background research for team discussion

## 1. Purpose and Scope

This document summarizes background research on cognitive behavioral therapy (CBT) and LLM-based conversational systems to support team discussion. It introduces key concepts, selected studies, and a possible direction for initial investigation.

The ideas here are proposals for discussion. They are not agreed project requirements, a finalized research plan, or guidance for treating patients. The project does not claim clinical effectiveness.

## 2. CBT: Key Concepts

CBT examines how **situations, thoughts, emotions, physical responses, and behaviors influence one another**. Through collaborative observation and practice, it aims to change patterns that maintain distress. Real circumstances and hardships also matter; CBT should not reduce someone's difficulties to a thinking error. [S001]

Consider this fictional team discussion:

| Element | Example |
|---|---|
| Observation | “Nobody responded to my suggestion.” |
| Interpretation | “They think I'm incompetent.” |
| Emotion | Anxiety |
| Behavior | Avoiding future discussions |

A conversational system should distinguish these elements and avoid recording an interpretation as an established fact.

## 3. Relevance to Conversational Systems

Some CBT exercises have explicit steps that can help us discuss conversational workflows. A **thought record**, for example, follows a sequence such as:

**Situation → Feelings → Thoughts → Supporting evidence → Evidence against the thought → A more balanced interpretation → Feelings afterward.** [S002]

This gives us concrete questions for system design:

- What information should each step collect?
- When should the system ask for clarification or confirmation?
- How can users decline, correct, or revisit an answer?
- How can the system preserve the user's meaning without inventing facts?

A thought record is one exercise within a broader approach to therapy. Other methods include behavioral activation, behavioral experiments, and exposure. They serve different purposes. Exposure and response prevention (ERP) for obsessive-compulsive disorder (OCD), and trauma-focused interventions for post-traumatic stress disorder (PTSD), require specialized methods and professional judgment. They should not be converted directly into a generic chatbot script. [S003, S004]

## 4. Implementation Options

| Approach | How it works |
|---|---|
| Fixed forms or decision trees | People define questions, fields, and branches in advance. |
| Prompting | Instructions guide the model without changing its parameters. |
| External workflow control + LLM | Software manages the steps; the model performs limited tasks such as clarification or restatement. |
| Fine-tuning | Reviewed examples update model parameters; the resulting behavior requires separate evaluation. |

An early question is what value the model adds. Can it preserve the user's meaning, avoid inventing answers or skipping steps, and allow the user to decline, correct, or revise? These behaviors provide concrete evaluation targets.

## 5. Selected Research Examples

### Woebot: 2017 Trial

The studied version used a decision tree with natural language processing at selected points, rather than a modern LLM. The trial involved 70 young adults over approximately two weeks and compared Woebot with an informational ebook. Depression outcomes favored Woebot; anxiety outcomes showed no statistically significant difference between groups. [S005]

### Therabot: 2025 Paper

The studied system used generative models fine-tuned on expert-curated dialogues. The trial enrolled 210 adults based on symptom screening and compared the intervention with a waitlist. Assessments continued through week eight, with app access continuing during the latter four weeks. The study included human monitoring and intervention. Its findings do not establish equivalence to human-delivered therapy. [S006]

These descriptions apply to specific research versions, not every later product version. Comparing results across the two trials does not establish which system is more effective.

**Review limitation:** For the original research notes, the papers' extracted main texts were read. Supplements and differences from trial registrations were not fully checked. This overview reorganizes those notes; it does not represent a new review of the full studies.

## 6. Possible Initial Investigation

For one thought-record exercise, compare **prompting alone** with **software-controlled steps plus an LLM**. The proposed starting point is fictional cases and offline comparisons, with expert review.

| Evaluation target | What to check |
|---|---|
| Step completion | Does the system skip required steps? |
| Factual grounding | Does it add unsupported facts, invent counterevidence, or claim to know what others think? |
| User confirmation | Does it confirm its interpretation with the user? |
| Correction handling | Can users revise earlier answers successfully? |
| User choice | Can users decline without being pressured into a positive interpretation? |

This investigation could assess workflow behavior. It would not establish therapeutic effectiveness. Model training and patient-facing testing have not been agreed upon.

Evidence supporting CBT does not automatically validate a new system that imitates some of its techniques. Satisfaction, engagement, correct execution of steps, symptom improvement, and long-term functioning are separate outcomes. Methods differ across conditions; general conversation or a worksheet cannot replace professional assessment.

## 7. Questions for Team Discussion

- Is this research direction useful for the project?
- How narrowly should the initial exercise be scoped?
- Who can review the content and evaluation cases?
- Which evaluation criteria should we prioritize?

## 8. References

The IDs below correspond to entries in the [source index](sources/source-index.md), which records citation details, usage, and review limitations.

- **S001:** National Institute of Mental Health — [Psychotherapies](https://www.nimh.nih.gov/health/topics/psychotherapies).
- **S002:** National Health Service — [Thought record](https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/thought-record/).
- **S003:** National Institute for Health and Care Excellence — [Obsessive-compulsive disorder and body dysmorphic disorder: treatment (CG31), recommendations](https://www.nice.org.uk/guidance/cg31/chapter/Recommendations).
- **S004:** National Institute for Health and Care Excellence — [Post-traumatic stress disorder (NG116), recommendations](https://www.nice.org.uk/guidance/ng116/chapter/recommendations).
- **S005:** Fitzpatrick, Darcy, and Vierhile (2017) — [Delivering Cognitive Behavior Therapy to Young Adults With Symptoms of Depression and Anxiety Using a Fully Automated Conversational Agent (Woebot): A Randomized Controlled Trial](https://doi.org/10.2196/mental.7785).
- **S006:** Heinz et al. (2025) — [Randomized Trial of a Generative AI Chatbot for Mental Health Treatment](https://doi.org/10.1056/AIoa2400802).
