# Weekly Research — 2026-10-22

## Research questions

1. Which LLM providers offer a BAA, under which plans, and which services or features does it cover?
2. Does using a model through an intermediary such as OpenRouter affect BAA coverage?
3. What features are standard in current AI mental health apps, and where are the gaps this app could fill?
4. How do AI mental health apps use user agreements and disclaimers to define their role and limit liability?
5. When would summaries or alerts shared with therapists become part of the clinical record?
6. What can wearables such as Apple Watch contribute to between-session support, and what evidence supports it?
7. Which evidence-based techniques, such as grounding exercises, are suitable for self-guided use between sessions?

## Points raised in the meeting

These are statements from the October 22 meeting, not verified findings.

- A BAA would be required for HIPAA compliance; local models are not feasible because of hardware costs (Huang and Stanley).
- Claude organization accounts offer BAA capabilities (Stanley).
- Most cloud APIs can be used with proper HIPAA compliance processes (Huang).
- Youper and Woebot suggest crisis hotlines and had problems with AI responses (Almutairi).
- Wearables reflect current trends in AI medicine (Dr. Dykeman).

## Stanley's research: BAA options and proposed stack

Prepared October 25, 2026, for research questions 1 and 2. Full write-up: [Tech Stack Under BAA Requirements](../../research/baa-tech-stack.md).

On October 25, 2026, Stanley selected this stack:

- **Frontend:** React + TypeScript.
- **API and database:** a TypeScript (Node) API and Postgres, both on Render.
- **Login:** Better Auth, running in our own API.
- **LLM:** the Claude API with HIPAA readiness.

### Main findings

- The Claude API offers a self-serve standard BAA through the Claude Console. It covers only eligible features: Messages API, streaming, prompt caching, and structured outputs are eligible; the Files API, batches, Managed Agents, and code execution are not. HIPAA mode applies to the whole organization and cannot be turned off (S011). This confirms Stanley's meeting point about Claude.
- Claude on Amazon Bedrock and Gemini on Google Cloud fall under the cloud provider's BAA, not Anthropic's (S011, S012, S013).
- AWS is excluded for now. Without AWS, the following options have published BAA terms:
  - Render: self-serve BAA on the Scale or Enterprise plan, plus a 20% usage fee; covers the API and Postgres (S019).
  - Fly.io: $99/month HIPAA package (S020).
  - Neon: Postgres on the Scale plan, with no current surcharge (S021).
  - Supabase: Team plan plus a HIPAA add-on (S014, S022).
- Clerk offers a BAA on its Enterprise plan only (S023); Auth0 reportedly does the same (S024). A self-hosted auth library that stores users in our own Postgres avoids needing another BAA vendor.
- No BAA or HIPAA statement was found for OpenRouter (S016). Justin's OpenRouter key should be used with fictional data only unless OpenRouter confirms a BAA in writing.
- Replit reportedly does not sign BAAs (S018), and Expo does not sign BAAs; push notifications must not contain PHI (S015).
- OpenAI reportedly offers an API BAA, but its help page could not be read (S017). Not verified.

### Limitations

- Several conclusions come from documentation summaries rather than signed agreements; the signed BAA controls coverage.
- S016–S018 were reviewed only through search summaries or could not be opened.
- Costs were not compared.

## Sources found

- S011–S015, S019, S021, S023: primary documentation from Anthropic, AWS, Google Cloud, Supabase, Expo, Render, Neon, and Clerk.
- S016–S018, S020, S022, S024: OpenRouter, OpenAI, Replit, Fly.io, Supabase, and Auth0; reviewed only through search summaries or could not be opened.

Citations are in the [source index](../../research/sources/source-index.md).

## Links

- Planning record: [`planning.md`](planning.md)
- Meeting record: [`meeting.md`](meeting.md)
