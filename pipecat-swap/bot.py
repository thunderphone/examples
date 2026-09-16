"""A local microphone/speaker Pipecat bot; dry-run never opens audio or a socket."""
import argparse
import asyncio
import os


def model_options(env):
    agent_id = int(env['AGENT_ID'])
    if agent_id < 1:
        raise ValueError('AGENT_ID must be positive')
    return {'agent_id': agent_id}


async def main(options):
    from pipecat.audio.vad.silero import SileroVADAnalyzer
    from pipecat.pipeline.pipeline import Pipeline
    from pipecat.pipeline.worker import PipelineParams, PipelineWorker
    from pipecat.processors.aggregators.llm_context import LLMContext
    from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
    from pipecat.transports.local.audio import LocalAudioTransport, LocalAudioTransportParams
    from pipecat.workers.runner import WorkerRunner
    from pipecat_thunderphone import THUNDERPHONE_SAMPLE_RATE, ThunderPhoneRealtimeLLMService

    llm = ThunderPhoneRealtimeLLMService(**options)
    transport = LocalAudioTransport(LocalAudioTransportParams(
        audio_in_enabled=True, audio_out_enabled=True,
        audio_in_sample_rate=THUNDERPHONE_SAMPLE_RATE,
        audio_out_sample_rate=THUNDERPHONE_SAMPLE_RATE, vad_analyzer=SileroVADAnalyzer()))
    context = LLMContextAggregatorPair(LLMContext())
    pipeline = Pipeline([transport.input(), context.user(), llm, context.assistant(), transport.output()])
    worker = PipelineWorker(pipeline, params=PipelineParams(allow_interruptions=True))
    runner = WorkerRunner()
    await runner.add_workers(worker)
    await runner.run()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    options = model_options({'AGENT_ID': '12'} if args.dry_run else os.environ)
    if args.dry_run:
        assert options == {'agent_id': 12}
        print('Offline model configuration OK:', options)
    else:
        asyncio.run(main(options))
