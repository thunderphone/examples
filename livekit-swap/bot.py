"""LiveKit saved-agent worker. Dry-run needs only Python's standard library."""
import os
import sys


def model_options(env):
    agent_id = int(env['AGENT_ID'])
    if agent_id < 1:
        raise ValueError('AGENT_ID must be positive')
    return {'agent_id': agent_id}


async def entrypoint(ctx):
    from livekit.agents import Agent, AgentSession
    from livekit.plugins import thunderphone

    session = AgentSession(llm=thunderphone.RealtimeModel(**model_options(os.environ)))
    await session.start(agent=Agent(instructions=''), room=ctx.room)


if __name__ == '__main__':
    if '--dry-run' in sys.argv:
        options = model_options({'AGENT_ID': '12'})
        assert options == {'agent_id': 12}
        print('Offline model configuration OK:', options)
    else:
        from livekit.agents import WorkerOptions, cli
        cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
