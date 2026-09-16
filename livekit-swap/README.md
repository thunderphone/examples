# Swap LiveKit's realtime model

A LiveKit Agents worker that runs a saved ThunderPhone agent as its realtime
model. LiveKit rooms carry the audio; the saved agent owns its behavior and tools.

Prerequisites: Python 3.11–3.13, a LiveKit project with URL/key/secret, a deployed
ThunderPhone agent and API key. Connect a participant to a room with your normal
LiveKit client or playground after starting the worker.

The current guide's install line (plugin is still under review):

```bash
pip install "git+https://github.com/kolchinski/agents@add-thunderphone-plugin#subdirectory=livekit-plugins/livekit-plugins-thunderphone"
```

For repeatability, this example's requirements pin that branch to commit
`dca147c9008c952736b949fdd6ddb0da11974d5d` and the LiveKit packages to 1.8.2.
Use the pinned requirements for this example instead of installing both variants:

```bash
python3 bot.py --dry-run              # standard library only; no room connection
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                  # fill in all five variables
set -a; . ./.env; set +a
python bot.py dev
```

Dry-run output: `Offline model configuration OK: {'agent_id': 12}`. Live output
shows worker registration and room jobs; a connected participant hears the saved
agent. Stop with Ctrl-C. The dry-run checks configuration only, not room dispatch
or live audio.

```diff
-from livekit.plugins import openai
-session = AgentSession(llm=openai.realtime.RealtimeModel())
+from livekit.plugins import thunderphone
+session = AgentSession(llm=thunderphone.RealtimeModel(agent_id=int(os.environ["AGENT_ID"])))
```

Use `Agent(instructions="")` for saved agents, as in the guide. Their instructions
and tools stay on ThunderPhone. Audio is 16-bit mono PCM at 24 kHz, turn detection
is server-side, and instructions/tools cannot change during a call. This adapter
uses the realtime protocol, not a REST SDK.

[LiveKit guide](https://thunderphone.com/docs/guides/use-with-livekit)
