"""Assign a receptionist and receive signed completion events."""
import hashlib
import hmac
import json
import os
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, Request

app = FastAPI()
STATE = Path('.webhook.json')


def api(method, path, body=None):
    # TODO: Replace this HTTP request with the ThunderPhone SDK when published.
    response = httpx.request(method, 'https://api.thunderphone.com' + path,
                             json=body, timeout=30, headers={
                                 'Authorization': 'Bearer ' + os.environ['THUNDERPHONE_API_KEY']})
    if not response.is_success:
        raise RuntimeError(f'{method} {path}: HTTP {response.status_code}')
    return response.json()


def configure(send, env):
    payload = json.loads(Path('agent.json').read_text())
    payload['voice'] = env['VOICE_ID']
    number_id = int(env['PHONE_NUMBER_ID'])
    url = env['PUBLIC_URL'].rstrip('/') + '/thunderphone-webhook'
    if not url.startswith('https://') or not payload['voice'] or number_id < 1:
        raise ValueError('Set VOICE_ID, positive PHONE_NUMBER_ID and HTTPS PUBLIC_URL')
    if STATE.exists() and json.loads(STATE.read_text())['url'] != url:
        raise ValueError('Existing webhook URL differs; update the endpoint in the dashboard')
    matches = [a for a in send('GET', '/v1/agents') if a['name'] == payload['name']]
    if len(matches) > 1:
        raise ValueError('Agent name is ambiguous; choose a unique name')
    if matches:
        agent_id = matches[0]['id']
        send('PATCH', f'/v1/agents/{agent_id}', payload)
        send('POST', f'/v1/agents/{agent_id}/deploy', {})
    else:
        agent_id = send('POST', '/v1/agents', payload)['id']
    send('PATCH', f'/v1/phone-numbers/{number_id}', {'inbound_agent_id': agent_id})
    if not STATE.exists():
        # Reserve a private file before creating the one-time signing secret.
        with os.fdopen(os.open(STATE, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as f:
            endpoint = send('POST', '/v1/developer/webhook-endpoints', {
                'label': 'Example receptionist', 'url': url, 'events': ['telephony.complete']})
            json.dump({'url': url, 'secret': endpoint['secret']}, f)
    print(f'Agent {agent_id} assigned to phone-number ID {number_id}; webhook configured.')


@app.post('/thunderphone-webhook')
async def webhook(request: Request):
    secret = json.loads(STATE.read_text())['secret']
    body = await request.body()
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    signature = request.headers.get('X-ThunderPhone-Signature', '')
    if not secret or not hmac.compare_digest(expected.encode(), signature.encode()):
        raise HTTPException(401, 'Invalid signature')
    try:
        event = json.loads(body)
    except ValueError:
        raise HTTPException(400, 'Invalid JSON') from None
    if event.get('type') == 'telephony.complete':
        data = event['data']
        print(json.dumps({'call_id': data['call_id'], 'transcripts': data['transcripts']}))
    return {'ok': True}


if __name__ == '__main__':
    configure(api, os.environ)
