# PrepAI Local QA Checklist

Use a local test database and disposable accounts. Do not paste real resumes, passwords, API keys, or other private data into screenshots or bug reports.

## Setup

- [ ] Copy the documented variables from `backend/.env.example` into a local `backend/.env` and provide development-only values for `MONGO_URI`, `JWT_SECRET`, `GOOGLE_API_KEY`, and the client origin.
- [ ] Configure `frontend/.env` from `frontend/.env.example`; point `VITE_API_URL` at the local backend API.
- [ ] From `backend`, run `npm install`, then `npm run dev`; confirm the API starts without an immediate error.
- [ ] From `frontend`, run `npm install`, then `npm run dev`; confirm Vite starts without a compile error.
- [ ] Run `npm test` in both `backend` and `frontend`, plus `npm run lint` and `npm run build` in `frontend`.

## Public flow

- [ ] Logged-out `/` loads the public homepage without waiting for authentication content.
- [ ] Public navigation and section links work at desktop and mobile widths.
- [ ] “Start Preparing” sends a logged-out visitor through login and then to `/interviews/new`.
- [ ] Switching from Login to Register preserves the intended destination.
- [ ] A logged-in visitor can still view `/`, and its header shows authenticated actions.
- [ ] An unknown route shows the 404 page; a logged-in user also sees a Dashboard action.

## Authentication

- [ ] Register succeeds and preserves spaces inside the chosen password.
- [ ] Login submits with Enter and shows the same safe error for an unknown email or incorrect password.
- [ ] Authentication inputs and submit controls remain disabled while a request is pending.
- [ ] Direct access to `/dashboard`, `/interviews`, `/interviews/new`, `/interviews/report/:id`, `/resume/:id`, and `/settings` requires authentication and returns to the requested path after login.
- [ ] Logout clears the session and leaves public pages usable.

## Interview creation

- [ ] Required and maximum-length errors appear beside the correct control and receive screen-reader announcement.
- [ ] Character counts state the current and maximum character values.
- [ ] The PDF chooser works with keyboard, pointer, and drag-and-drop.
- [ ] A selected PDF shows filename and size and can be replaced or removed.
- [ ] A valid PDF up to 3 MB uploads and generates an Interview Report.
- [ ] Empty, oversized, renamed/non-PDF, encrypted, malformed, or structurally invalid files fail with readable guidance while the selected form values remain available.
- [ ] Long or instruction-like resume/job text is treated as source data and does not alter the application flow.
- [ ] Double-clicking Generate produces only one request.
- [ ] During generation, staged status copy remains visible without invented percentages.
- [ ] A generation failure keeps the form and file selection available for an explicit retry.
- [ ] A 429 response gives useful limit feedback without exposing limiter internals.

## Report

- [ ] Refreshing `/interviews/report/:id` loads the report without relying on prior navigation state.
- [ ] Tab, Shift+Tab, Left Arrow, Right Arrow, Home, and End operate the report tabs with a visible focus indicator.
- [ ] The active tab is visually clear and announced as selected.
- [ ] Technical and behavioral accordions work with keyboard and expose their expanded state.
- [ ] Long URLs, code-like text, questions, answers, gaps, and tasks wrap without page-level horizontal overflow.
- [ ] Unexpected empty report sections display a clear empty message.
- [ ] A failed report request shows Retry and Back to Interviews actions.
- [ ] User A cannot access User B’s report by changing the URL ID.

## Tailored resume

- [ ] Refreshing `/resume/:id` loads report context before enabling generation.
- [ ] Generate displays “Generating your tailored resume…” and explains that it may take a moment.
- [ ] Repeated clicks while generation is pending produce only one request.
- [ ] A failed generation shows a readable error and allows an explicit retry without a broken iframe.
- [ ] Regeneration replaces the prior preview, and the latest PDF previews and downloads successfully.
- [ ] A failed report-context request does not show misleading generation controls and offers Retry.
- [ ] User A cannot generate or retrieve a tailored resume from User B’s report ID.

## Dashboard, history, and deletion

- [ ] A new account shows zero statistics, no recent reports, and a clear History first-use state.
- [ ] If statistics fail while recent reports load, the recent reports remain usable; verify the reverse case too.
- [ ] Dashboard section failures show explicit Retry actions without automatic retry loops.
- [ ] With more than 10 reports, history pagination and direct refresh of `/interviews?page=2` show the correct page.
- [ ] History search clearly filters only the current page.
- [ ] A page-local search with no matches differs from the empty-account state.
- [ ] Rapid history page changes never allow an older response to replace the newest page.
- [ ] Deleting a report requires confirmation, disables repeated confirmation, and restores focus after closing.
- [ ] Deleting the last report on a later page returns to the previous valid page.
- [ ] A failed delete keeps the report and shows a readable error.

## Account deletion

- [ ] `/settings` refreshes directly and the danger zone stacks cleanly on a narrow screen.
- [ ] Incorrect password feedback is associated with the password field.
- [ ] Delete Account cannot be submitted twice while pending.
- [ ] Successful account deletion removes the account and retained interview data and returns to the public homepage.

## Mobile and keyboard

- [ ] Check layouts near 1440, 1024, 768, 430, and 375 CSS pixels with no accidental page-level horizontal overflow.
- [ ] The mobile sidebar opens from the menu button, receives focus, closes with Escape or the overlay, locks background scroll, and restores focus to the menu button.
- [ ] Creation actions, report tabs, history cards, resume controls, and account actions remain readable and operable at 375 px.
- [ ] Complete the public, auth, create, report, resume, history-delete, and account-delete flows using keyboard only.
- [ ] Confirmation dialog focus stays inside with Tab/Shift+Tab, starts on Cancel, closes with Escape, and returns to its opener.
- [ ] Visible focus styling appears on links, buttons, tabs, pagination, upload controls, and dialog controls.
- [ ] With `prefers-reduced-motion: reduce`, Lenis is disabled and loading meaning remains available without animation.

## Session, network, privacy, and browser checks

- [ ] Expire or clear the auth cookie on a public page; the page stays usable without a forced login redirect.
- [ ] Expire the session during protected activity; the app becomes unauthenticated and the next protected navigation preserves its intended destination.
- [ ] Stop the backend and verify public pages remain usable while protected reads show connection guidance and Retry.
- [ ] Confirm normal API validation messages remain visible and no raw Axios “Network Error” text appears.
- [ ] In browser DevTools, confirm there are no React warnings, duplicate-key warnings, uncontrolled-input warnings, failed asset requests, or unexpected repeated API calls.
- [ ] Confirm the page title changes for Home, Login, Register, Dashboard, New Interview, History, Report, Tailored Resume, Settings, and 404.
- [ ] Confirm authentication stays in an HttpOnly cookie and no JWT appears in local/session storage or frontend logs.
- [ ] Confirm API payloads and rendered UI do not expose password hashes, raw JWTs, extracted resume text, or another user’s source data.
- [ ] Confirm no external links open a new tab without `noopener noreferrer`.
