# Working on these examples

Each directory is independent. Read its README before editing and run its offline
check from that directory. Use Python 3.11+ and Node 20.19+ (Node 20 for CI).
Keep implementation code around 150 lines per example and pin direct dependencies.
Use plain HTTP for REST calls until the ThunderPhone SDK is available.

Use https://thunderphone.com/docs/llms.txt and the linked API reference to verify
methods, fields, event names and integration contracts. Never invent API fields.
Run `python -m pyflakes` on Python and `node --check` on JavaScript after changes;
run `npm run build` for widget changes. CI must never require credentials or
originate calls. Keep `.env`, signing secrets, recordings and customer data out
of source control. Public examples must be self-contained and use public URLs.

Tests use fictional IDs and contacts. Live runs create billable resources or
calls: use explicitly approved numbers, audiences and spend. Do not run live
setup or calls merely to validate an edit. Keep secrets server-side; only a
publishable widget key belongs in the browser. Preserve the MIT license.
