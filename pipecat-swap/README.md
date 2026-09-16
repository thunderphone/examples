# Swap Pipecat's realtime service

Runs a saved ThunderPhone agent through Pipecat's local microphone and speaker
transport. The saved agent owns the prompt, voice, languages, tools and greeting;
the Pipecat pipeline carries audio at 24 kHz.

Prerequisites: Python 3.11–3.13, audio input/output, a deployed agent and API key.
Local audio requires PortAudio development libraries (`portaudio19-dev` on
Debian/Ubuntu, `portaudio` on macOS). Headphones avoid speaker feedback.

```bash
python3 bot.py --dry-run              # standard library only; no audio/network
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                  # fill in key and AGENT_ID
set -a; . ./.env; set +a
python bot.py
```

Dry-run output: `Offline model configuration OK: {'agent_id': 12}`. Live output
includes Pipecat lifecycle logs; hear the configured greeting and speak through
your microphone. Press Ctrl-C to stop. No phone number is required.

The service swap in an existing OpenAI Realtime pipeline:

```diff
-from pipecat.services.openai.realtime.llm import OpenAIRealtimeLLMService
-llm = OpenAIRealtimeLLMService(api_key=os.environ["OPENAI_API_KEY"])
+from pipecat_thunderphone import ThunderPhoneRealtimeLLMService
+llm = ThunderPhoneRealtimeLLMService(agent_id=int(os.environ["AGENT_ID"]))
```

Keep transport input, the context aggregators, service, and transport output in
that order, as in `bot.py`. Use an empty context for a saved agent; it runs its
own tools. This integration uses the realtime protocol rather than REST, so it
needs the published Pipecat adapter. Turn detection runs on ThunderPhone;
mid-call changes to instructions/tools are unsupported.

[Pipecat guide](https://thunderphone.com/docs/guides/use-with-pipecat)
