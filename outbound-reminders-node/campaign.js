import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {parse} from 'csv-parse/sync';
import {api, agentId, required, poll} from './api.js';

export function requests(env, csv) {
  const contacts = parse(csv, {columns: true, skip_empty_lines: true, bom: true});
  if (!contacts.length || contacts.length > 5000 || contacts.some(c => !/^\+[1-9]\d{7,14}$/.test(c.phone_number)))
    throw new Error('Supply 1–5000 contacts with E.164 phone_number values');
  if (new Set(contacts.map(c => c.phone_number)).size !== contacts.length)
    throw new Error('Remove duplicate phone numbers');
  const timezone = required(env, 'TIMEZONE');
  new Intl.DateTimeFormat('en', {timeZone: timezone});
  const start = required(env, 'WINDOW_START'), end = required(env, 'WINDOW_END');
  if (![start, end].every(t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)) || start >= end)
    throw new Error('Use an increasing same-day HH:MM calling window');
  return {campaign: {name: 'Appointment reminders', agent: agentId(env),
    from_number: required(env, 'FROM_NUMBER'), timezone,
    daily_window_start: start, daily_window_end: end, max_attempts: 1}, contacts: {contacts}};
}
export async function run(send, payload, start, watch = poll) {
  const campaign = await send('POST', '/v1/campaigns', payload.campaign);
  const path = `/v1/campaigns/${campaign.public_id}`;
  console.log(`Campaign ${campaign.public_id}`);
  const imported = await send('POST', `${path}/contacts`, payload.contacts);
  if (imported.rejected || imported.accepted !== payload.contacts.contacts.length)
    throw new Error('Contact import incomplete; campaign remains draft. Review it in the dashboard.');
  if (!start) return console.log('Draft ready. Review and start it in the dashboard.');
  await send('POST', `${path}/start`, {consent_to_charge: true});
  await watch(async () => {
    const stats = await send('GET', `${path}/stats`);
    console.log(JSON.stringify({total: stats.total, completed: stats.completed, failed: stats.failed}));
    return send('GET', path);
  }, c => ['completed', 'cancelled', 'paused'].includes(c.status));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dry = process.argv.includes('--dry-run');
  const env = dry ? {AGENT_ID: '12', FROM_NUMBER: '+12025550100', TIMEZONE: 'America/Los_Angeles',
    WINDOW_START: '09:00', WINDOW_END: '17:00'} : process.env;
  const payload = requests(env, await readFile(new URL('./contacts.csv', import.meta.url), 'utf8'));
  if (dry) console.log(JSON.stringify(payload, null, 2));
  else await run(api, payload, process.argv.includes('--start'));
}
