export const required = (env, key) => {
  if (!env[key]) throw new Error(`Set ${key}`);
  return env[key];
};
export function agentId(env) {
  const id = Number(required(env, 'AGENT_ID'));
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('AGENT_ID must be positive');
  return id;
}
export async function api(method, path, body) {
  // TODO: Replace fetch with the ThunderPhone SDK when published.
  const r = await fetch(`https://api.thunderphone.com${path}`, {
    method, headers: {Authorization: `Bearer ${required(process.env, 'THUNDERPHONE_API_KEY')}`,
      'Content-Type': 'application/json'},
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`${method} ${path}: HTTP ${r.status}`);
  return r.json();
}
export async function poll(read, done, attempts = 120, delay = 5000) {
  for (let i = 0; i < attempts; i++) {
    const value = await read();
    if (done(value)) return value;
    if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('Polling timed out; the remote call/campaign continues. Inspect its ID in the dashboard.');
}
