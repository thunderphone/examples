import test from 'node:test';
import assert from 'node:assert/strict';
import {requests, run as campaign} from './campaign.js';
import {request, run as call} from './call.js';
import {api, poll} from './api.js';
const env = {AGENT_ID: '12', FROM_NUMBER: '+12025550100', TO_NUMBER: '+12025550101',
  IDEMPOTENCY_KEY: 'offline', TIMEZONE: 'UTC', WINDOW_START: '09:00', WINDOW_END: '17:00'};
const payload = requests(env, 'phone_number,first_name\n+12025550101,"Example, Person"\n');
test('campaign request, import gate and terminal polling', async () => {
  assert.equal(payload.contacts.contacts[0].first_name, 'Example, Person');
  const calls = [];
  const send = async (method, path, body) => {
    calls.push([method, path, body]);
    if (path === '/v1/campaigns') return {public_id: 'campaign-uuid'};
    if (path.endsWith('/contacts')) return {accepted: 1, rejected: 0};
    return {status: 'completed', total: 1, completed: 1, failed: 0};
  };
  await campaign(send, payload, true);
  assert.deepEqual(calls[2], ['POST', '/v1/campaigns/campaign-uuid/start', {consent_to_charge: true}]);
  assert.equal(calls[3][1], '/v1/campaigns/campaign-uuid/stats');
  await assert.rejects(campaign(async (_, path) => path.endsWith('/contacts') ?
    {accepted: 0, rejected: 1} : {public_id: 'draft'}, payload, true), /incomplete/);
  assert.throws(() => requests(env, 'phone_number\ninvalid'), /E.164/);
  assert.throws(() => requests({...env, WINDOW_END: '08:00'}, 'phone_number\n+12025550101'), /window/);
});
test('single call uses returned ID and retrieves transcript', async () => {
  const calls = [];
  const transcript = await call(async (method, path, body) => {
    calls.push([method, path, body]);
    return path === '/v1/call' ? {call_id: 44} : {status: 'completed', transcripts: []};
  }, request(env));
  assert.equal(calls[0][2].idempotency_key, 'offline');
  assert.equal(calls[2][1], '/v1/calls/44/transcript');
  assert.deepEqual(transcript.transcripts, []);
  await assert.rejects(poll(async () => ({}), () => false, 2, 0), /timed out/);
});

test('HTTP wrapper serializes JSON and authenticates', async t => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, 'https://api.thunderphone.com/v1/call');
    assert.equal(init.headers.Authorization, 'Bearer offline-test-key');
    assert.deepEqual(JSON.parse(init.body), request(env));
    return {ok: true, json: async () => ({call_id: 44})};
  });
  const previous = process.env.THUNDERPHONE_API_KEY;
  process.env.THUNDERPHONE_API_KEY = 'offline-test-key';
  try { assert.deepEqual(await api('POST', '/v1/call', request(env)), {call_id: 44}); }
  finally { if (previous === undefined) delete process.env.THUNDERPHONE_API_KEY; else process.env.THUNDERPHONE_API_KEY = previous; }
});
