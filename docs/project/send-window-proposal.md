# Send-window proposal

Prepared November 4, 2026 by Stanley Eng (Backend B). **Proposal for the team and Justin; nothing here is an agreed product rule.** It answers the open sending-window question in [decisions and open questions](decisions-and-open-questions.md#decision-log-awaiting-agreement).

## What is built

`apps/api/src/policy/send-policy.ts` defines a swappable `SendPolicy`. Each rule has a version string, and a send request must echo the version it was shown, so changing the rule can't silently apply to a letter the client already reviewed. No route uses it yet.

The **demo default** (`demo-24h-before-v1`) follows Storyboard V3. It doesn't restrict private saving, which is always allowed, and SOS doesn't depend on it.

- Sending is allowed from **24 hours before the appointment until it starts**: `[startsAt − 24h, startsAt)`, compared in UTC on the server clock.
- A canceled appointment blocks sending.
- One letter per activity: a second send is blocked as `already-sent`. This is a single switch on the policy, not a database rule.

## Options to decide between

| Option | Rule | Trade-off |
| --- | --- | --- |
| A. Before next appointment (demo default) | Open 24h before the appointment, close when it starts | Letters arrive fresh for the session; a client who reflects early must wait to send |
| B. After the previous session | Open when a session ends, close N hours later (meeting notes mentioned 24h) | Captures reflection while fresh; the letter may be days old by the next session |
| C. Therapist-configurable | Therapist sets the threshold (for example 12h or 24h) per client or activity | Most flexible; needs a setting, UI and a default |

Any of these is a new `createWindowPolicy` configuration or a small new policy. The routes don't change.

## Questions for Justin and the team

1. Which option, A, B or C? If C, what is the default?
2. **Daylight saving:** the demo uses 24 *elapsed* hours. For a 10:00 AM appointment on the day clocks change, the window opens at 11:00 AM (or 9:00 AM) local time the day before. Is that acceptable, or should it open at the same local clock time?
3. **Rescheduling:** the window follows the appointment's new time, and a pending send gets a 409 conflict and is asked to review again. Should an already-sent letter stay attached to the original appointment, or to the rescheduled one?
4. **Cancellation:** a canceled appointment blocks sending. Should the client's draft move to the next appointment?
5. **Resending:** one letter per activity, or allow corrections or a second letter?
6. **No appointment:** can a client send when no upcoming appointment exists? The demo assumes every activity has one.
