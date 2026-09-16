# Bilingual dental receptionist with FastAPI

Creates an English/Spanish demo agent from `agent.json`, or updates and deploys
an agent with the same unique name. Assigns it to an **existing inbound-capable
phone number** and registers a signed completion webhook. The documented event
name is `telephony.complete`, not `call.completed`.

Prerequisites: Python 3.11+, a ThunderPhone key, an existing phone-number ID from
`GET /v1/phone-numbers`, a voice ID from `GET /v1/voices`, and a public HTTPS URL
forwarding to this app. Use a dedicated test agent: rerunning setup deploys its
new configuration, including any existing draft fields on that agent.

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python -m unittest -v                 # offline; no key or network
cp .env.example .env                 # fill the four values locally
set -a; . ./.env; set +a
python app.py                       # live setup; changes agent and number routing
uvicorn app:app --host 0.0.0.0 --port 8000
```

Expected offline output: `Ran 2 tests` and `OK`. Setup prints the agent and number
IDs. Call the assigned number; the app logs a JSON object containing `call_id`
and `transcripts` when the call ends. It acknowledges other validly signed event
types without processing them. Invalid or altered signatures return HTTP 401.

The endpoint's one-time signing secret is saved directly to ignored
`.webhook.json` with owner-only permissions and is never printed. Keep that file
when restarting or rerunning setup; it prevents duplicate endpoint creation.
To change its URL, update the endpoint in the dashboard and the saved `url`.
If setup fails after reserving the file, inspect the dashboard for an endpoint
before retrying; an empty file intentionally blocks silent duplicate creation.

This teaching receiver logs transcripts, so use synthetic conversations. Use a
protected transcript store for patient data. Endpoint retries may repeat logs;
add durable `event_id` deduplication before connecting external side effects.
A real scheduling integration needs tools; this agent collects preferences only.

[Signature recipe](https://thunderphone.com/docs/guides/verify-webhook-signatures) ·
[Completion payload](https://thunderphone.com/docs/webhooks/call-complete)
