import test from 'node:test';
import assert from 'node:assert/strict';
import {request} from './setup.js';
import Page from './app/page.js';
import Widget from './app/widget.js';
test('agent ID binds the publishable key; browser receives only that key', () => {
  assert.deepEqual(request({AGENT_ID: '12', ALLOWED_DOMAINS: 'localhost, example.com'}),
    {name: 'Next.js example', mode: 'agent', agent_id: 12, allowed_domains: ['localhost', 'example.com']});
  assert.throws(() => request({AGENT_ID: 'invalid'}), /Set/);
  process.env.NEXT_PUBLIC_THUNDERPHONE_PUBLISHABLE_KEY = 'pk_live_offline';
  const widget = Page().props.children[2];
  assert.equal(widget.type, Widget);
  assert.deepEqual(widget.props, {publishableKey: 'pk_live_offline'});
  assert.equal(Widget(widget.props).props.publishableKey, 'pk_live_offline');
  delete process.env.NEXT_PUBLIC_THUNDERPHONE_PUBLISHABLE_KEY;
  assert.equal(Page().props.children[2].props.role, 'status');
});
