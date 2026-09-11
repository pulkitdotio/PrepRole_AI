PrepAI data storage and retention notes
=======================================

This document describes the implemented engineering behavior. It is not a legal privacy policy.

Stored data
-----------

- Account username and normalized email.
- A bcrypt password hash. Plaintext passwords are neither stored nor logged.
- For each saved interview context: extracted resume text, target job description, self-description, generated interview report, match score, title and timestamps.
- A temporary random JWT revocation identifier (`jti`) and the token's expiration time after logout/account deletion. No usable raw JWT is stored.

The extracted resume text, job description and self-description remain inside each report because later tailored-resume generation needs the exact source context for that job application. Separating this context into another collection would add migration and lifecycle complexity without removing the need to retain it. These fields are excluded from creation, history and report-detail API responses; tailored resume generation reads them only on the backend.

Data not stored
---------------

- Original uploaded PDF bytes or filenames.
- Plaintext passwords, cookies, authorization headers or raw JWTs.
- Generated PDF buffers.
- Raw Gemini provider responses or unnecessary provider request metadata.
- Hidden copies of deleted reports or profile content.

Deletion and retention
----------------------

Users can permanently delete an individual owned interview report from history. Account deletion requires the current password, deletes all reports filtered by the authenticated user ID, revokes the current session, deletes that user record, clears the cookie and returns the frontend to the public application.

No automatic InterviewReport TTL or retention expiry is enabled. Reports remain until the user deletes them or deletes the account. A future retention period is a product/legal decision and must include migration, user communication and recovery decisions before destructive automation is enabled.

Account deletion uses ordered, retry-safe operations rather than a MongoDB transaction so local standalone MongoDB remains supported. Report deletion happens before user deletion, so a failure cannot silently remove the account while leaving its personal reports behind. Failures return a safe error and the operation may be retried. Atlas/replica-set deployments could adopt a transaction later.

Third-party processing
----------------------

Gemini processes the bounded extracted resume, job description and self-description to generate interview preparation and structured resume content. Phase 3 controls still separate untrusted data from instructions, constrain output and prevent raw provider responses from being persisted or returned.

Index deployment
----------------

Production disables automatic index creation. Run `npm run db:indexes:check` during deployment, review the proposed creates and drops, then run `npm run db:indexes`. Mongoose `syncIndexes()` can drop database indexes absent from current schemas. The reviewed deployment step creates unique username/email and jti indexes, the revocation expiry TTL index, and the `{ userId: 1, createdAt: -1 }` history index. The compound index prefix supports user-only queries, so the redundant standalone `userId` index was removed.

Page-based history can shift when reports are created or deleted between requests. That consistency tradeoff is accepted at the current product scale. Multiple API instances still require shared rate-limit storage, and production still depends on backups, access controls, encryption/TLS, secret management, index rollout review, monitoring, and tested restore/deletion procedures.
