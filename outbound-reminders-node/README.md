# Outbound reminders with Node 20

`campaign.js` reads `contacts.csv`, creates a draft campaign with a daily calling
window, imports contacts, optionally starts it and polls stats. `call.js` places
one outbound call, polls until completed/failed and fetches its transcript.

Prerequisites: Node 20.19+, a deployed agent, an outbound-capable number from your
own carrier, balance and any required organization outbound confirmation in the
dashboard. ThunderPhone-managed inbound numbers cannot originate these calls.
Use an approved audience and spend, with recipient consent and an appropriate
calling window. All CSV rows share the configured IANA timezone.

```bash
npm ci
npm test
node campaign.js --dry-run
node call.js --dry-run
cp .env.example .env                  # fill values, including a unique IDEMPOTENCY_KEY
# Replace fictional contacts.csv rows with your reviewed contact list.
npm run campaign                     # live: creates and imports a DRAFT
# Inspect the draft in the dashboard and start that draft there.
# Alternatively, for an already reviewed batch, create AND start a NEW campaign:
npm run campaign -- --start
npm run call -- --call                # live: dials TO_NUMBER
```

Offline output: three passing tests; dry-runs print request bodies using fictional
IDs. Live campaign output includes its UUID and progress counts. The single-call
script prints its call ID and the transcript JSON (possibly empty on failed calls).
Treat transcripts as sensitive and use synthetic conversations while testing.

Every campaign invocation creates a **new campaign**. Do not rerun a draft command
with `--start` to start the old draft. Import failures leave it in draft; inspect
it before retrying. The script stops on partial imports. Keep the same
`IDEMPOTENCY_KEY` when retrying the same intended single call; choose a fresh key
only for a new intended call. An unknown initiation outcome is polled using the
returned call ID, not redialed.

Polling stops after 120 attempts at five-second intervals (plus request time).
Timeout does not stop remote work. Inspect its ID in the dashboard; campaigns
can be paused/cancelled there. No automatic retries of creation/start requests.

[Campaign API](https://thunderphone.com/docs/api-reference/campaigns) ·
[Outbound calls](https://thunderphone.com/docs/api-reference/outbound-calls)
