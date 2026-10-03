# Booking flow checks

Run pure helper regression checks after `npm ci`:

```sh
node --test tests/booking-helpers.test.mjs
```

The browser smoke check requires Playwright and Chrome. It intercepts every external request, supplies a simulated customer session, and never sends real bookings or notifications. Start `npm run dev -- --host 127.0.0.1` (port 8080), then run:

```sh
# Optional local test tooling; does not change package.json or the lockfile.
npm install --no-save --package-lock=false playwright
node tests/booking-flow.cjs
```

Alternatively set `PLAYWRIGHT_MODULE` to an existing Playwright installation. Screenshots and the generated PNG are written to ignored `test-results/`.

Covers provider slug entry, service expansion, nearest-slot review across browser timezones, optional notes, one booking write, customer/provider filters on receipt reads, PNG download, manual date/time selection, service changes, availability retry, mobile overflow, cancelled/missing receipts, stale search cancellation, and public booking selection, blocked browser storage, provider-preserving sign-in redirects, restored notes and selection, stale availability after sign-in, and draft cleanup after success.

Customers browse and select without signing in; authentication is required only to create a booking. Provider-scoped drafts use sessionStorage, expire after 24 hours, and are cleared on success. The booking flow retains existing Supabase authentication, inserts and notification API. Frontend filters and availability rechecks are defense in depth: deployed RLS, authorization and atomic prevention of overlapping bookings must still be enforced by the backend. No schema, policy, backend, or calendar integration changes are included.
