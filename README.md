# ThunderPhone examples

Small examples you can run, inspect and adapt. REST examples use plain HTTP;
realtime examples use the documented framework integrations.

| Example | What it does | Offline check (inside directory) |
| --- | --- | --- |
| [Inbound receptionist](inbound-receptionist-fastapi/) | English/Spanish dental receptionist, number assignment, signed webhooks | `python -m unittest -v` |
| [Outbound reminders](outbound-reminders-node/) | CSV campaign and single call with transcript | `npm test` |
| [Next.js widget](web-widget-nextjs/) | Agent-bound publishable key and browser voice widget | `npm test` |
| [Pipecat swap](pipecat-swap/) | Saved agent through a local microphone/speaker pipeline | `python bot.py --dry-run` |
| [LiveKit swap](livekit-swap/) | Saved agent as a LiveKit realtime model | `python bot.py --dry-run` |
| [Claude Code session](claude-code-session/) | Copyable skill prompt sequence | README only |

Get an API key at [app.thunderphone.com](https://app.thunderphone.com) → Organization → Keys.
Copy the chosen example's `.env.example` to `.env` and fill it locally; follow that
README's installation and run commands. The REST base is `https://api.thunderphone.com`
with `Authorization: Bearer $THUNDERPHONE_API_KEY`. The Streamable HTTP MCP server is
`https://api.thunderphone.com/v1/mcp`; install agent skills with
`npx skills add thunderphone/skills`. Start with offline checks, which need no keys
and make no API calls. Live runs require your own deployed agents and resources.

Use Python 3.11+ and Node 20.19+. Each example pins its direct dependencies; Node
examples include lockfiles. Microphone examples need audio hardware for live use.
The fictional contacts and practice details are for testing: replace them before
an approved live run. Calls are billable; a queued call is not evidence of a
successful conversation. No real session transcript is included.

[Documentation](https://thunderphone.com/docs) ·
[Developers](https://thunderphone.com/developers) ·
[Agent skills](https://github.com/thunderphone/skills)
