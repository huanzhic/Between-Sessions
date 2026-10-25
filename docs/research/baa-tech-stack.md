# Tech Stack Under BAA Requirements

**Prepared by:** Stanley Eng, drafted with Claude Code

**Date:** October 25, 2026

**Research cycle:** [October 22, 2026](../weeks/2026-10-22/research.md). This supports Stanley's October 22 BAA task and the open [October 11 stack decision](../weeks/2026-10-11/planning.md#tasks).

**Status:** Selected on October 25, 2026, at Stanley Eng's direction; the stack in section 2 is the project's chosen stack. Alternatives are kept for reference. This is not legal advice. Signed agreements and counsel control what is actually covered.

## 1. Constraints

- **Frontend:** React + TypeScript.
- **Database:** PostgreSQL.
- **No AWS for now.** This rules out using AWS directly, including Bedrock and Cognito. Some vendors below run on AWS themselves; that is acceptable because we sign with the vendor, not AWS.
- **BAA coverage:** Every service that stores, processes, or transmits protected health information (PHI) must be covered by a signed Business Associate Agreement (BAA). We may use only the products and features that agreement covers.

Once real patients use the app, check-ins, journal entries, chat messages, summaries, and wearable data on our servers count as PHI. In a therapy app, even a patient's name and email address can be PHI, because they reveal that the person is receiving care.

A BAA is necessary but not sufficient. Access controls, encryption, audit logging, and configuration remain our responsibility.

## 2. Selected stack

| Layer | Proposal | BAA path |
|---|---|---|
| Frontend | React + TypeScript (for example, built with Vite) | None needed if it is a static app with no PHI in the build. Patient data is loaded from the API only after login. |
| API | TypeScript (Node) service on **Render**, in a HIPAA-enabled workspace | Render's self-serve BAA (S019) |
| Database | **Render Postgres** in the same workspace | Same BAA (S019) |
| Login | **Self-hosted auth library** (such as Better Auth) inside our API, with users stored in our own Postgres | No separate vendor, so no additional BAA |
| LLM | **Claude API** with HIPAA readiness | Anthropic's self-serve BAA in the Claude Console (S011) |

With this setup, PHI touches two vendors (Render and Anthropic) under two BAAs. The API is TypeScript because the selected login library, Better Auth, is a TypeScript library. This also keeps the codebase in one language, so FastAPI, discussed on October 11, is no longer planned.

## 3. API and database alternatives

| Option | BAA terms | Cost (as published; verify) | Trade-offs |
|---|---|---|---|
| **Render** (selected) | Self-serve BAA. HIPAA-enabled workspaces require a Scale or Enterprise plan. Covers web services, workers, cron jobs, and Render Postgres. Static sites, logs, and resource names must not contain PHI. Enabling HIPAA is irreversible (S019). | Plan price plus a 20% fee on all workspace usage (S019); the plan's base price was not checked. | API and database under one BAA; managed backups and encryption. |
| **Fly.io** | HIPAA package with a BAA pre-signed by Fly.io, available on any paid plan (S020). | $99/month plus usage (S020). | Lowest fixed price found. Coverage of Fly's Managed Postgres is claimed only by a third party; confirm with Fly. |
| **Neon** (database only) + Render or Fly.io for the API | Self-serve on the Scale plan; the BAA is with Databricks. Neon Auth, the Data API, Neon Functions, Object Storage, and AI Gateway are excluded (S021). | HIPAA currently costs nothing extra; a 15% surcharge is planned (S021). Scale plan price not checked. | Serverless Postgres with branching. Adds a second infrastructure vendor and BAA. |
| **Supabase** | BAA plus a HIPAA add-on, a Team plan or higher, and High Compliance projects (S014, S022). | Team plan plus the add-on; third-party sources report about $599 plus $350 per month (unverified). | Postgres, auth, and API in one product, but the most expensive option here. Whether Supabase Auth and Edge Functions are covered needs confirmation (S022). |
| **Aptible** | HIPAA-focused platform; BAA arranged with its team when a dedicated stack is set up (search summary only). | About $400–$499 per month plus usage (unverified). | Strongest compliance tooling; costly for a student project. |

## 4. Login alternatives

| Option | BAA | Trade-offs |
|---|---|---|
| **Self-hosted auth library** (selected): Better Auth for TypeScript | None needed. User records stay in our BAA-covered Postgres. | Free, and no extra vendor sees patient identities. We maintain configuration, password hashing, sessions, and multi-factor authentication through the library. Neon's managed version of Better Auth is not covered (S021); this applies only to running the library ourselves. |
| **Supabase Auth** | Possibly covered by Supabase's BAA; confirm (S022). | Practical only if we choose Supabase for the database. |
| **Clerk** | BAA on the Enterprise plan only (S023). | Polished prebuilt React components; the Enterprise requirement is likely too costly for now. |
| **Auth0** | BAA reportedly limited to Enterprise plans (S024; community and secondary sources). | Mature, but likely too costly for now. |

Sending login emails, such as verification messages or magic links, would expose patient email addresses to an email provider. That provider needs a BAA, or the login flow should avoid it, for example with passwords and an authenticator app. The email provider has not been researched yet.

## 5. LLM

Use the Claude API with HIPAA readiness (S011), with Claude Opus 5.5 as the default. The final model and cost decision depends on Huang's token-cost testing.

- **Eligible features:** the Messages API, streaming, prompt caching, structured outputs, thinking, and token counting.
- **Blocked features:** the Files API, batch processing, Managed Agents, code execution, the MCP connector, context editing, and server-side compaction.
- **Store history ourselves:** keep conversation history in our Postgres database and send it with each request.
- **No PHI in JSON schemas:** schemas used for structured outputs are cached separately.
- **Separate organization for PHI:** HIPAA readiness applies to the whole organization and cannot be disabled.

OpenRouter: no BAA was found (S016), so Justin's OpenRouter key is for prototyping with fictional data only.

## 6. Services not to use with PHI

| Service | Reason |
|---|---|
| OpenRouter | No BAA or HIPAA statement found (S016). |
| Replit | Reportedly does not sign BAAs (S018). |
| Expo push, or any push service | Payloads are visible on lock screens and pass through Apple and Google, so use generic text only (S015). |
| Vercel serverless functions | BAA for Enterprise customers only (search summary only); a static frontend without PHI is fine. |
| Third-party analytics or error tracking | Covered only with a BAA; otherwise strip PHI before sending. |

## 7. Phases

1. **Now, prototype:** React + TypeScript and Postgres on any host, including Replit or local machines, with fictional data only.
2. **Before a pilot with real patients:**
   - Sign the Render and Anthropic BAAs.
   - Enable HIPAA mode on both accounts.
   - Configure encryption, access controls, and audit logging.
   - Settle data retention and access policies.

## 8. Open questions

1. Who signs the BAAs: Justin's practice, a university entity, or the team? The account owner must be the party that signs.
2. What will Render's Scale plan plus the 20% fee cost at pilot scale?
3. Which email provider, if any, will send login emails, and does it offer a BAA?

## Sources

S011–S024 are listed in the [source index](sources/source-index.md). Entries marked "Search summary only" or "Not read" need verification before anyone relies on them. S012 (AWS) is kept for comparison but is not part of the selected stack.
