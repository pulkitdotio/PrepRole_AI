Phase 3: untrusted-content pipeline
==================================

The public routes, JWT/revocation architecture, cookie and Origin protection, and frontend session/Lenis behavior remain unchanged. The interview/report/resume endpoints and response shapes are preserved. Resume generation now asks Gemini for structured content instead of arbitrary HTML; the server owns the resume layout.

Boundaries and limits
---------------------

- `contentLimits.js` owns backend limits: 3 MiB PDF, 10 pages, 30,000 extracted UTF-16 characters, 6,000 job-description characters (including the frontend's title/company prefix), and 2,000 self-description characters. Reject oversized input rather than silently truncate. Multipart also limits files, fields, parts and each field's byte size.
- MIME metadata is checked but not trusted: the controller also requires a nonempty Buffer, bounded actual bytes and `%PDF-` header, followed by successful parsing. Files remain in memory; original filenames never become filesystem paths or output filenames.
- `pdfText.service.js` disables PDF.js eval support, extracts individual pages, checks page count/accumulated text and checks a 10-second elapsed budget between operations. Normalization removes NUL/inappropriate controls, normalizes line endings and excessive blank lines, and preserves Unicode, code, URLs and instruction-like phrases.
- **Parser limitation:** this is not a hard timeout or memory sandbox. PDF.js in-process work, metadata parsing, an individual page or cleanup may block before a check runs or exhaust memory. No Promise.race is advertised as cancellation. True process isolation, CPU/memory quotas and concurrency controls are deferred. This remains a production DoS risk, especially with concurrent requests.
- Zod strict objects bound every AI string and array; response text is capped at 100,000 characters before JSON.parse. Interview schema bounds are also enforced by Mongoose. Old oversized stored profiles are rejected when reused for generation; no historical documents are migrated or truncated.

Gemini
------

- `ai.prompts.js` uses separate `systemInstruction` and user-message JSON containing only `UNTRUSTED_INPUT` with three allowlisted profile/job fields. Closing-tag or role-like strings remain JSON string values. No request object, cookie, token, environment, parser error or provider output is concatenated into instructions.
- The API key authenticates the SDK transport as required; it is never prompt data. No tools, search, URL context, file retrieval or code execution are configured.
- One budget permits at most three calls total for provider errors and invalid output combined. SDK retries are explicitly disabled. Only transient HTTP statuses retry, with at most one-second backoff, 45-second per-call timeout and 120-second local overall budget. Abort signals stop local waiting/transport; they do not guarantee provider-side cancellation or prevent charges for work already submitted.
- Invalid output receives only fixed schema-regeneration feedback, never raw output or validator errors. Logs contain operation, attempt and numeric status only. Client errors do not expose provider/parser/browser internals.
- Prompt injection is **not solved**: a model can still misunderstand, follow adversarial content semantically, leak generic instruction text, fabricate claims or produce misleading preparation advice within a valid schema. Schema validation controls structure/size, not factual correctness. No application secrets are supplied as context.

Resume HTML and Chromium
------------------------

- `resume.template.js` validates structured JSON and escapes `& < > " '` in every dynamic value. It creates a professional single-column A4 layout with server-owned CSS. No model-authored elements, attributes, links, styles, URLs or HTML enter the document. Therefore there is no remaining arbitrary-HTML sanitizer: the regex sanitizer and HTML generation path were removed, with no sanitizer dependency needed.
- `resumePdf.service.js` accepts structured data only. HTML is limited to 200,000 bytes. Chromium runs headlessly with its default sandbox intact; no no-sandbox flags. The page has JavaScript disabled, service workers bypassed, offline mode, deny-all request interception (including data/file/internal URLs), and a server-owned document CSP denying scripts, connections, frames, fonts, images, base URLs and forms. Inline server CSS is the sole allowed style source. This CSP belongs to the generated document, not the React website.
- Content/protocol/launch timeout: 10 seconds; PDF timeout: 20 seconds. A 45-second watchdog after launch terminates the browser process, and finally blocks close page/browser. Generated PDFs are capped at 5 MiB. The watchdog depends on the Node event loop; a blocked parser in the same process can delay it. Browser process-tree cleanup and OS resource enforcement still need deployment verification.
- These prevent content-initiated page requests, not all potential Chromium background/OS networking. They are not an operating-system firewall. Keep Chromium/PDF.js patched and add deployment egress isolation/resource controls later. Parser/browser vulnerabilities cannot be ruled out by application tests.
- Typical output targets 1–2 pages; unusually long but valid structured content can exceed this. No silent page truncation is used. System-font availability may affect Unicode coverage and layout on a different host.

Ownership and validation
------------------------

Report, history and resume queries include `req.user.id`. Malformed ObjectIds return 400 before querying. Model output passes strict validation and cannot supply ownership; trusted ownership and profile fields are assigned last. Frontend rendering remains escaped React text, and filenames from uploads remain display text only.

Verification and scope
----------------------

Focused tests cover hostile text/markup, prompt separation, size/page limits, real PDF parsing, retries, ownership, multipart limits, model constraints, deny-all rendering configuration and cleanup. The real Chromium test uses synthetic data and no Gemini/network request, then parses the resulting PDF to verify literal hostile text and readable content. Browser-dependent tests require Puppeteer's Chromium installation and permission to launch it. No live Gemini or MongoDB calls are needed for these tests.

No dependencies added/removed. Both npm audits reported 0 vulnerabilities at implementation time; no force fixes were run. The already-present `zod-to-json-schema` dependency is not used by this pipeline; native Zod 4 JSON-schema export keeps the provider schema aligned with validation.

Deferred: parser process isolation, malware scanning, rate/concurrency limits, OS network restrictions, queues/workers, broader API validation and platform hardening. No auth/session redesign, React CSP/Helmet, deployment configuration, or unrelated UI redesign was added.

References: [pdf-parse](https://github.com/mehmet-kozan/pdf-parse), [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output), [Puppeteer PDF timeout options](https://pptr.dev/api/puppeteer.pdfoptions).
