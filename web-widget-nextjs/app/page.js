import {createElement as h} from 'react';
import Widget from './widget.js';
export default function Page() {
  const key = process.env.NEXT_PUBLIC_THUNDERPHONE_PUBLISHABLE_KEY;
  return h('main', {style: {maxWidth: 640, margin: '64px auto', padding: 24, fontFamily: 'system-ui'}},
    h('h1', null, 'Talk to an AI receptionist'),
    h('p', null, 'Use the call button to start. Your browser will ask for microphone permission.'),
    key ? h(Widget, {publishableKey: key}) : h('p', {role: 'status'}, 'Run npm run setup to configure your agent.'));
}
