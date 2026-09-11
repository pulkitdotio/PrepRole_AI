# PrepAI Final Engineering Audit

This document records the local code audit completed after Phases 1–7. It is an engineering review of the repository and automated checks, not a penetration-test report, accessibility certification, deployment guide, or guarantee of complete security.

## Architecture

- React/Vite provides a public homepage and protected workspace routes through React Router. Authentication state is restored from an HttpOnly cookie; intended internal destinations survive login and registration.
- Express exposes explicit auth and interview routes. Zod validates request bodies, query strings, route parameters, and bounded AI output. Mongoose models enforce stored-data limits and indexes.
- Interview and resume endpoints require authentication and scope every report read or mutation by both report ID and authenticated user ID. Browser-facing projections omit retained resume, job-description, and self-description source text.
- Resume generation remains: untrusted candidate/job text → trusted Gemini instruction and structured JSON → strict bounded Zod schema → escaped server-owned HTML/CSS → JavaScript-disabled and network-denied Puppeteer → transient PDF response.
- Generated resume JSON and PDFs are not persisted. The browser owns only its temporary object URL and revokes replaced/unmounted previews.

## Security and privacy controls reviewed

- JWT cookies are HttpOnly, use deliberate SameSite/Secure configuration, and are cleared with matching attributes. JWT signing and verification constrain HS256, issuer, audience, expiry, subject, and cryptographic `jti`.
- Logout uses POST and stores only `jti` plus actual expiry in the revocation collection; raw bearer tokens are not stored. Revocation lookup failures fail closed.
- Unsafe browser methods require a trusted configured Origin or Referer. Credentialed CORS uses the same explicit allowlist. Helmet headers, body/upload bounds, rate limits, safe errors, request IDs, and metadata-only request logging remain enabled.
- Password hashes use bcrypt cost 12, are `select: false` by default, and are explicitly selected only for credential checks. Password input is not trimmed or logged. Login does not distinguish an unknown email from an incorrect password.
- PDF upload checks MIME metadata, a PDF signature, byte/page/text/time bounds, disables PDF.js eval support, and does not use user-controlled paths or URLs.
- AI requests use an allowlisted data envelope, bounded attempts and timeouts, no tools, strict response schemas, and generic client errors. Model text never controls ownership, markup, CSS, filesystem paths, or network destinations.
- PDF rendering keeps the Chromium sandbox enabled, disables page JavaScript and service workers, enables offline mode, aborts every request, rejects horizontal overflow, sets explicit timeouts, and closes browser resources on success or failure.

## Resume output review

- The A4 single-column template uses 12.7 mm margins, a 10 pt normal body, and a deterministic compact mode with a 9.5 pt minimum primary body size.
- Profile, grouped skills, experience, projects, education, and certifications have bounded structures and deterministic order. Entry-level page breaks avoid orphaned headings/bullets without applying an unbounded shrink-to-fit loop.
- Trusted prompt rules require concise supported facts, forbid adding job-only skills or unsupported metrics, preserve real experience and projects, and accept professional links only when the candidate supplied a full HTTPS URL.
- Synthetic Chromium regressions confirm the representative early-career fixture is exactly one page, the long fixture is exactly two meaningfully filled pages, hostile markup remains literal text, and expected text is extractable.

## Final fixes from the audit

- Removed a leftover AI success `console.info`; structured warning/error events remain and do not include prompts, response bodies, credentials, or source resumes.
- Made frontend session expiration respond to the backend's explicit `AUTHENTICATION_REQUIRED` code on every protected API surface, including account settings. Expected login and password-confirmation failures remain visible and do not clear a valid session.
- Moved tailored-resume actions onto the shared loading-aware Button component, adding consistent disabled and `aria-busy` behavior.
- No release-blocking code issue remains from the automated audit. Human browser and content-quality checks below are still required before treating a specific local configuration as complete.

## Automated verification

- Backend: `npm test` — 64 passed, 0 failed, including real bundled-Chromium PDF rendering and security regressions.
- Frontend: `npm test` — 12 passed, 0 failed; `npm run lint` and `npm run build` passed.
- Dependencies: backend and frontend `npm audit --audit-level=low` each reported 0 vulnerabilities at audit time.
- Local startup: the backend started against the configured local environment and returned 200 from `/health`; Vite started and served its root document. Both smoke processes were stopped after verification, and no Gemini request was made.
- Repository: `git diff --check` passed. Synthetic PDFs were generated transiently and were not committed.

## Deliberate limitations and deployment-specific work

- A real Gemini call was not made during automated verification. A human must review truthful tailoring, relevance, wording, and contact accuracy using synthetic or consented non-sensitive inputs.
- PDF parsing has cooperative time checks inside the process; hard CPU/memory isolation would require a worker process or separate service.
- Rate limiting uses process-local storage. Multi-instance deployment needs an infrastructure-backed shared store and an explicit proxy topology.
- Deployment still needs strong injected secrets, HTTPS/TLS, exact frontend origins and cookie policy, production MongoDB/index checks, backups, capacity limits, logging/monitoring, and platform-specific Chromium validation.
- Formal penetration testing, formal accessibility conformance testing, and ATS-vendor compatibility certification were not performed.

## Manual checks still required

Complete every applicable item in `LOCAL_QA.md`, with special attention to real-browser console/network behavior, keyboard/focus flows, widths from 375 px through desktop, reduced motion, cookie behavior under the chosen deployment topology, cross-account ownership attempts, and visual inspection of one-page, long two-page, and regenerated resume PDFs in a standard viewer.
