# Test suite

```bash
npm test             # run everything once
npm run test:watch   # re-run on change
npm run test:e2e     # run real-browser flows (requires E2E_* credentials)
npx vitest run tests/integration/invoices.test.ts   # one file
npx vitest run -t "discount"                        # one pattern
```

No database, network or running server is required — every suite substitutes
`@/app/lib/db` and `next/headers`, and the upload suite substitutes `fs` so a
path-traversal bug shows up as a failed assertion rather than a deleted file.

## Layout

| File | Covers |
| --- | --- |
| `unit/session-token.test.ts` | Cookie signing, forged payloads, expiry, `token_version`, misconfigured secret |
| `unit/password.test.ts` | scrypt hashing, per-user salt, legacy hash upgrade, strength policy |
| `unit/validation.test.ts` | Every Zod schema against the payloads the admin pages actually post |
| `unit/rate-limit.test.ts` | Lockout threshold, window reset, email vs IP keying |
| `unit/sequence.test.ts` | Document numbering, including 20 concurrent callers |
| `unit/proxy.test.ts` | `/admin` redirect gate and matcher scope |
| `integration/authorization.test.ts` | **The permission matrix** — every route × every role |
| `integration/login.test.ts` | Sign-in, throttling, user enumeration, legacy migration |
| `integration/invoices.test.ts` | Discount ceilings, stock, overpayment, cancellation |
| `integration/staff.test.ts` | Self-lockout, last admin, duplicate email, revocation |
| `integration/suppliers.test.ts` | Supplier edit, and that `balance` stays server-owned |
| `integration/upload.test.ts` | Magic-byte sniffing, SVG refusal, path traversal |

## The one to keep updated

`integration/authorization.test.ts` holds a `MATRIX` listing every guarded
endpoint and the roles allowed to reach it. **Add a row whenever you add a
route.** It asserts both directions — that permitted roles are not rejected and
that everyone else gets a 403 — so a forgotten `requireRole` fails the build
rather than shipping silently.

Because the database is mocked, some handlers fail later for unrelated reasons;
the matrix therefore asserts "not 401/403" for permitted roles rather than a
specific success code.

## Conventions

- A test name states the behaviour, not the function: *"rejects a payload
  rewritten to escalate role"*, not *"verifySessionToken works"*.
- Fixtures mirror what the UI really sends. The staff cases post
  `{ id, ...form }` with `password: ''`, because that is what the edit form does
  and it previously broke every staff edit.
- Regression guards say so in a comment, so nobody "simplifies" them away.

## Verifying the suite still bites

The tests were checked by reintroducing real bugs and confirming failure:
replacing `requireRole('admin')` with `requireSession()` in the settings route
fails 2 authorization cases, and restoring the `password: z.string().min(1)`
rule fails 8 staff cases. If you change a security rule and nothing goes red,
the coverage is missing — add it.

## Browser / End-to-End Coverage (Playwright)

```bash
npm run test:e2e          # Run all Playwright E2E suites (headless)
npm run test:e2e:headed   # Run Playwright with visible browser window
npx playwright show-report # View latest interactive HTML test report
```

Playwright tests all roles and workflows using the seeded accounts:
- **Admin**: `admin@darshana.com` (`admin@2026`)
- **Manager**: `manager@darshana.com` (`manager@2026`)
- **Staff**: `staff@darshana.com` (`staff@2026`)

(Custom credentials can also be provided via `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, etc.)

Suites included under `tests/e2e/`:
- `auth.spec.ts`: Login page rendering, invalid credentials error states, password visibility toggle, unauthenticated route redirection.
- `admin-role.spec.ts`: Full Admin access to all 17 navigation modules, Staff team management, Shop settings, Audit logs, Reports, and clean logout.
- `manager-role.spec.ts`: Manager access to reports, purchases, suppliers, expenses, and verification that Staff & Settings are strictly blocked.
- `staff-role.spec.ts`: Staff access to POS billing, bookings, products, customers, and verification of zero access to management/settings tools.
- `e2e-flows.spec.ts`: Public website navigation, eye test booking page, and role isolation across sequential logins.
- `admin-flow.spec.ts`: Protected eye-test API checks, operational screen load verifications, mobile and tablet responsive layouts.

## Not covered

- Pixel-level visual regression snapshots.
- Real SQL. The fakes reproduce the semantics the code depends on — including
  MySQL evaluating `ON DUPLICATE KEY UPDATE` assignments left to right — but a
  schema change can still break production while these pass. Run
  `node db/migrate_security.mjs` and exercise the app after schema work.
