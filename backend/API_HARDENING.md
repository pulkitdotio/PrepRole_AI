Phase 4: API hardening and deployment assumptions
=================================================

Request boundaries
------------------

- Strict Zod schemas validate registration, login, interview text fields and report IDs before controllers. Unknown body fields are rejected. Multipart bytes remain under Multer/PDF validation.
- JSON bodies are limited to 32 KiB. No route consumes URL-encoded bodies, so that parser is disabled.
- Errors retain the top-level `message` used by the React client and also provide `error.code`, a safe public message, optional safe field details, and a request ID. Stack traces and internal errors are never returned.

Traffic controls
----------------

- General API: 300 requests per 15 minutes in production; 1,000 in development.
- Failed login: 10 per 15 minutes in production; 50 in development. Successful responses are not counted after completion.
- Registration: 5 per hour in production; 30 in development.
- Authenticated interview/resume generation combined: 10 per hour per user in production; 100 in development. IP is only the fallback when identity is unavailable.
- Limiters use draft-8 `RateLimit` headers and omit legacy `X-RateLimit-*` headers. `/health` and `/ready` are outside the general API limiter.
- Limits use process memory. A horizontally scaled deployment must add a shared store such as Redis; otherwise each process has an independent allowance. The production `trust proxy` value of one assumes exactly one trusted reverse proxy and must match the host topology.

Headers and browser boundary
----------------------------

Helmet removes Express disclosure and supplies `nosniff`, frame, referrer and related headers. HSTS is enabled only in production. The backend intentionally disables CSP because it serves JSON/PDF rather than the React HTML document; the frontend hosting layer must set the browser CSP. CORS and unsafe-method Origin protection retain their explicit frontend-origin allowlist.

Operations and logging
----------------------

Every request receives a fresh server-generated UUID in `X-Request-Id`. Structured request logs contain timestamp, level, request ID, method, path without query text, status, duration and authenticated user ID when available. They never contain bodies, passwords, cookies, authorization headers, JWTs, resume/profile text, generated content, provider output, Mongo URIs or API keys.

`/health` reports process liveness. `/ready` returns 200 only while Mongoose is connected and never calls Gemini. `SIGTERM` and `SIGINT` stop HTTP acceptance, drain/close connections within a bounded timeout, disconnect MongoDB, then exit. Unhandled rejections and uncaught exceptions follow the same cleanup path with an error exit code. Startup fails without listening if MongoDB or required revocation indexes are unavailable.

Deployment controls still required include TLS termination, frontend CSP, correct proxy-hop configuration, a shared rate-limit store when scaling beyond one process, infrastructure egress/resource isolation for PDF/Chromium, secret management, and process supervision/restarts.
