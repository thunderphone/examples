# A Claude Code session using ThunderPhone skills

Prerequisites: Claude Code, Node.js/npm, a ThunderPhone account and a secret API
key stored locally as `THUNDERPHONE_API_KEY`. Do not paste the key into chat.
Install the skills in the project where you want to build:

```bash
npx skills add thunderphone/skills
claude
```

Paste these prompts in order. Replace angle-bracket values locally with your own
approved resources before the corresponding step. The prompts deliberately
separate inspecting a plan from authorizing live changes.

1. `Use thunderphone-mcp-setup and setup-api-key to configure ThunderPhone's Streamable HTTP MCP server at https://api.thunderphone.com/v1/mcp for this project. Read THUNDERPHONE_API_KEY from my local environment without displaying or storing its value in source control. Verify access with a read-only request.`
2. `Use create-agent and thunderphone-prompt-builder to draft an English/Spanish dental receptionist. It should collect scheduling preferences for a human, never claim to book appointments, and never provide medical advice. Read the available voices and show me the proposed agent configuration. Do not create or deploy it yet.`
3. `Create the reviewed agent configuration. Report its ID and deployed revision without exposing credentials. Use test-agent to propose a small test plan; do not place calls yet.`
4. `Use get-phone-number and handle-inbound-calls to inspect phone-number ID <PHONE_NUMBER_ID>. Show the current routing and proposed assignment to agent <AGENT_ID>. Do not buy a number or change routing yet.`
5. `Assign the reviewed agent <AGENT_ID> to inbound calls on phone-number ID <PHONE_NUMBER_ID>. Verify the saved assignment with a read-only request.`
6. `Use setup-webhooks to draft a FastAPI receiver for telephony.complete with raw-body HMAC verification and offline tampering tests. Run the offline tests. Do not register an endpoint until I supply its public HTTPS URL.`
7. `Register the receiver at <PUBLIC_HTTPS_URL>/thunderphone-webhook for telephony.complete. Store the one-time signing secret in an ignored owner-readable local file without printing it. Report only the endpoint ID.`
8. `I will make a controlled inbound test call now. After it ends, use test-agent to inspect its transcript and summarize what was actually verified and any remaining failures. Do not originate outbound calls.`

Expected result: a deployed agent, an assigned number and a tested signed webhook
receiver, with IDs and evidence from your own session. This directory is README
only: it has no dependencies, `.env` template or executable test. Installation
and live prompts need network access; read through the sequence offline first.

<!-- TRANSCRIPT: to be inserted from a real session -->

[Skills](https://github.com/thunderphone/skills) ·
[MCP setup](https://thunderphone.com/docs/guides/thunderphone-mcp-server)
