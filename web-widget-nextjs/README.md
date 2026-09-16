# Next.js voice widget

Embeds `@thunderphone/widget` with its required stylesheet. The widget resolves
its agent from a publishable key: `AGENT_ID` is consumed by the **server-side
setup script**, not passed as an unsupported widget prop.

Prerequisites: Node 20.19+, an API key and a deployed agent with
`widget_enabled: true`. Localhost works for microphone access; deployed sites
need HTTPS. Set `ALLOWED_DOMAINS` to the hostnames that will embed the widget.

```bash
npm ci
npm test
node setup.js --dry-run
npm run build                         # offline compilation, no API key required
cp .env.example .env                   # set API key, AGENT_ID and allowed domains
npm run setup                         # live: creates a publishable key
npm run dev
```

Open [localhost:3000](http://localhost:3000). Expected: a heading and a voice call
bar. Click its call button and allow microphone access to speak with the saved
agent. Calls appear in the dashboard. Before setup, the page shows setup guidance.
Offline tests check the key-creation payload, browser props and missing-key state.

Setup saves only the publishable `pk_live_` key in ignored `.env.local`; the secret
API key stays in `.env` and never enters browser props. Setup refuses to overwrite
`.env.local`. If an interrupted setup leaves it empty, inspect existing widget
keys in the dashboard before retrying. You can instead obtain a publishable key
from **Web Widgets** and put it in `.env.local` yourself. Rebuild after changing
`NEXT_PUBLIC_THUNDERPHONE_PUBLISHABLE_KEY` for a production build.

Manual verification: test microphone allow/deny, connect, mute, end, reconnect,
keyboard access and a narrow screen. Offline tests do not establish audio quality
or allowed-domain enforcement against the live API.

[Embed guide](https://thunderphone.com/docs/guides/embed-web-widget) ·
[React component](https://thunderphone.com/docs/widget/react)
