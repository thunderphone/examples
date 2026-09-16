import {pathToFileURL} from 'node:url';
import {api, agentId, required, poll} from './api.js';

export function request(env) {
  return {agent_id: agentId(env), from_number: required(env, 'FROM_NUMBER'),
    to_number: required(env, 'TO_NUMBER'), idempotency_key: required(env, 'IDEMPOTENCY_KEY')};
}
export async function run(send, body, watch = poll) {
  const {call_id: id} = await send('POST', '/v1/call', body);
  if (!id) throw new Error('Missing call ID; reconcile in the dashboard before retrying');
  console.log(`Call ${id}`);
  await watch(() => send('GET', `/v1/calls/${id}`), c => ['completed', 'failed'].includes(c.status));
  const transcript = await send('GET', `/v1/calls/${id}/transcript`);
  console.log(JSON.stringify(transcript));
  return transcript;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dry = process.argv.includes('--dry-run');
  const body = request(dry ? {AGENT_ID: '12', FROM_NUMBER: '+12025550100',
    TO_NUMBER: '+12025550101', IDEMPOTENCY_KEY: 'offline-example'} : process.env);
  if (dry) console.log(JSON.stringify(body, null, 2));
  else if (process.argv.includes('--call')) await run(api, body);
  else throw new Error('Review recipient and spend, then pass --call');
}
