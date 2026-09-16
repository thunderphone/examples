import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function request(env) {
  const agent_id = Number(env.AGENT_ID);
  const allowed_domains = (env.ALLOWED_DOMAINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!Number.isSafeInteger(agent_id) || agent_id < 1 || !allowed_domains.length)
    throw new Error('Set a positive AGENT_ID and comma-separated ALLOWED_DOMAINS');
  return {name: 'Next.js example', mode: 'agent', agent_id, allowed_domains};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dry = process.argv.includes('--dry-run');
  const body = request(dry ? {AGENT_ID: '12', ALLOWED_DOMAINS: 'localhost'} : process.env);
  if (dry) console.log(JSON.stringify(body, null, 2));
  else {
    if (!process.env.THUNDERPHONE_API_KEY) throw new Error('Set THUNDERPHONE_API_KEY');
    // Reserve the output before creating a key; do not overwrite an existing configuration.
    await writeFile('.env.local', '', {mode: 0o600, flag: 'wx'});
    // TODO: Replace fetch with the ThunderPhone SDK when published.
    const r = await fetch('https://api.thunderphone.com/v1/publishable-key', {
      method: 'POST', headers: {Authorization: `Bearer ${process.env.THUNDERPHONE_API_KEY}`,
        'Content-Type': 'application/json'}, body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Create publishable key: HTTP ${r.status}`);
    const {key} = await r.json();
    if (!/^pk_live_[A-Za-z0-9_-]+$/.test(key || '')) throw new Error('Unexpected publishable key');
    await writeFile('.env.local', `NEXT_PUBLIC_THUNDERPHONE_PUBLISHABLE_KEY=${key}\n`);
    console.log('Saved publishable key in .env.local; run npm run dev.');
  }
}
