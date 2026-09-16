import hashlib
import hmac
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient
import app


class OfflineTests(unittest.TestCase):
    def test_create_update_and_signature(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(app, 'STATE', Path(tmp) / 'state'):
            calls = []
            def send(method, path, body=None):
                calls.append((method, path, body))
                if path == '/v1/agents' and method == 'GET':
                    return []
                return {'id': 12, 'secret': 'offline-test-secret'}
            env = {'VOICE_ID': 'test-voice', 'PHONE_NUMBER_ID': '7', 'PUBLIC_URL': 'https://example.com'}
            app.configure(send, env)
            self.assertEqual(calls[1][2]['additional_languages'], ['es-ES'])
            self.assertEqual(calls[2], ('PATCH', '/v1/phone-numbers/7', {'inbound_agent_id': 12}))
            self.assertEqual(calls[3][2]['events'], ['telephony.complete'])
            self.assertEqual(app.STATE.stat().st_mode & 0o777, 0o600)
            calls.clear()
            def existing(method, path, body=None):
                if method == 'GET':
                    return [{'id': 12, 'name': 'Example bilingual dental receptionist'}]
                return send(method, path, body)
            app.configure(existing, env)
            self.assertEqual([c[:2] for c in calls], [('PATCH', '/v1/agents/12'),
                ('POST', '/v1/agents/12/deploy'), ('PATCH', '/v1/phone-numbers/7')])
            body = json.dumps({'type': 'telephony.complete', 'data': {
                'call_id': 99, 'transcripts': [{'role': 'user', 'content': 'Hello'}]}}).encode()
            sig = hmac.new(b'offline-test-secret', body, hashlib.sha256).hexdigest()
            client = TestClient(app.app)
            with patch('builtins.print') as log:
                self.assertEqual(client.post('/thunderphone-webhook', content=body,
                    headers={'X-ThunderPhone-Signature': sig}).status_code, 200)
                self.assertIn('Hello', log.call_args.args[0])
            for content, signature in [(body + b' ', sig), (body, ''), (body, 'bad')]:
                self.assertEqual(client.post('/thunderphone-webhook', content=content,
                    headers={'X-ThunderPhone-Signature': signature}).status_code, 401)

    def test_http_request(self):
        response = Mock(is_success=True)
        response.json.return_value = {'id': 12}
        with patch.dict(app.os.environ, {'THUNDERPHONE_API_KEY': 'offline-test-key'}), patch.object(app.httpx, 'request', return_value=response) as send:
            self.assertEqual(app.api('POST', '/v1/agents', {'name': 'Example'}), {'id': 12})
            self.assertEqual(send.call_args.args, ('POST', 'https://api.thunderphone.com/v1/agents'))
            self.assertEqual(send.call_args.kwargs['json'], {'name': 'Example'})
            self.assertEqual(send.call_args.kwargs['headers']['Authorization'], 'Bearer offline-test-key')
