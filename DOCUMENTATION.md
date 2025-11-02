# Inbox Assistant — Full Technical Documentation

This document is a full developer-facing reference for the project. It explains the architecture, every important function and file, the database schema, API contracts, runtime behavior and where to change things. It is intentionally detailed so a developer can read this file and find any logic or code they need.

Table of contents
- Overview & architecture
- How data flows (end-to-end)
- Environment variables and runtime configuration
- Backend (file-by-file, function-by-function)
  - Routes and controllers
  - Model (DB access) details and SQL
  - Error handling and warmup logic
- Frontend (file-by-file, component-by-component)
  - Key UI behaviors and data mapping
  - Helper modules
- Database schema (fields, types, indexes)
- API reference (inputs/outputs with examples)
- Data shapes and validation guidance
- Common maintenance tasks & where to change things
- Security, logs and stability notes
- Debugging tips and dev commands

---

Overview & architecture
------------------------
This project splits responsibilities in a standard web application pattern:

- Frontend: Next.js (React) with Tailwind CSS. Responsible for UX: pasting messages, calling the AI extract endpoint, showing an editable ticket form, and listing saved tickets.
- Backend: Express.js with a small controller/model separation. Responsible for: receiving UI requests, calling the AI provider to extract structured data, persisting tickets to PostgreSQL, and returning results.

Design principles used:
- Keep the backend stateless; persistence is in Postgres.
- Keep AI calls behind the backend to centralize model selection and credentials.
- Simple, well-typed frontend helpers and small presentational components.

How data flows (end-to-end)
--------------------------
1. User pastes text in frontend `app/page.tsx` and clicks Analyze.
2. Frontend calls `POST /api/ai/extract` via `frontend/lib/api.ts`.
3. Backend AI route (see `backend/src/routes/aiRoutes.js`) forwards message to configured AI provider (e.g., Ollama or remote API) and returns a structured JSON ticket.
4. Frontend maps fields returned by AI to the `TicketForm` props, allowing user edits.
5. When user saves, frontend posts to `POST /api/tickets` which persists via `TicketModel.create(...)`.
6. Tickets page fetches via `GET /api/tickets` (supports `status`, `priority`, `language`, `search` query params).

Environment variables & runtime config
------------------------------------
Backend `.env` keys used by the project (located in `backend`):

- DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT — postgres pool config.
- FRONTEND_URL — used for CORS; default `http://localhost:3000`.
- AI_BASE_URL — base URL for AI provider (e.g. `http://localhost:11434` for Ollama).
- AI_MODEL — model id to send to AI provider.
- AI_WARMUP_TIMEOUT_MS — optional timeout for model warmup routine.

Make sure `.env` is not committed.

Backend — file-by-file and function-level details
------------------------------------------------
Files live under `backend/src/`.

server.js
- Responsibilities:
  - Configure Express app (CORS, JSON parsing).
  - Mount routes: `/api/ai` and `/api/tickets`.
  - Initialize DB schema via `initializeDatabase()`.
  - Start server and perform a non-blocking model warmup if `AI_BASE_URL` points to a local model.

- Important behavior and functions:
  - Warmup routine: sends a short POST to `${AI_BASE_URL}/chat/completions` and logs warnings on failure, with abort via AbortController after `AI_WARMUP_TIMEOUT_MS`.
  - Error handler: final express error middleware logs error and returns HTTP 500 with details.message. Avoid logging sensitive data.

src/db/index.js
- Exports: `pool` (pg Pool) and `initializeDatabase()`.
- `initializeDatabase()` creates table `tickets` and indexes if they don't exist. The SQL column types and defaults are implemented here.

Key functions:
- `pool.on('connect', ...)` — logs when connected.
- `initializeDatabase()` — runs the CREATE TABLE IF NOT EXISTS and index creation queries.

src/models/TicketModel.js
- Responsibilities: single location for all SQL queries related to tickets.
- Functions:
  - `static async create(ticketData)`
    - Accepts a ticket object. Normalizes fields and uses parameterized SQL to insert into tickets.
    - Serializes `entities` as JSON string for storage.
    - Returns the inserted row.

  - `static async findAll(filters = {})`
    - Builds a parameterized SQL query dynamically based on provided filters (status, priority, language, search).
    - For `search` it performs ILIKE on message_raw, intent, contact_name, contact_email.
    - Maps `entities` column to a parsed JSON array/object before returning.

  - `static async findById(id)`
    - SELECT * WHERE id = $1; parse entities JSON.

  - `static async update(id, ticketData)`
    - Uses COALESCE to keep existing values when a field is not provided. This approach allows partial updates.
    - Accepts `entities` which, if present, is JSON.stringified.

  - `static async delete(id)`
    - DELETE ... RETURNING *; returns deleted row or null.

Notes on SQL safety:
- All queries use parameterized SQL (`$1, $2, ...`) with values array — this helps prevent SQL injection.

src/controllers/ticketController.js
- Responsibilities: translate HTTP req/res to model calls.
- Functions
  - `createTicket(req, res)` — calls `TicketModel.create(req.body)` and responds 201.
  - `getTickets(req, res)` — reads query params, removes undefined filters, calls `TicketModel.findAll(filters)`.
  - `getTicketById(req, res)` — calls `findById` and returns 404 if not found.
  - `updateTicket(req, res)` — calls `TicketModel.update(id, body)`.
  - `deleteTicket(req, res)` — calls `TicketModel.delete(id)`.

Error handling in controllers:
- Controllers catch errors, log them, and return 500 with a helpful message. In production, replace console.error with a structured logger.

src/routes/ticketRoutes.js
- Maps RESTful endpoints to the controller functions. See file for simple router configuration.

AI routes (`src/routes/aiRoutes.js` and its controller)
- Responsibility: accept raw message and return structured ticket data.
- Typically POST `/api/ai/extract` with { message: '<raw text>' }.
- Implementation notes:
  - The controller calls the configured AI provider via fetch to AI_BASE_URL or other API.
  - Response must be normalized into the same ticket structure the frontend expects (intent, contact fields, language, entities array, priority, message_raw, reply_suggestion).
  - Keep mapping/regex or parsing logic in a single place so tests can target it.

Frontend — file-by-file and component-level details
------------------------------------------------
Project rooted in `frontend/` using Next.js app router.

`app/layout.tsx`
- Registers global fonts (Inter/Outfit/Space Grotesk via next/font) and wraps children with `Providers` (theme provider).

`app/globals.css`
- Tailwind setup and a few component utilities. CSS variables for colors and a `.card` class used across components.

`lib/api.ts` (frontend helper)
- Exposes functions used by the UI to call backend routes: `extractTicket(message)`, `getTickets(filters)`, `createTicket(ticket)`, `updateTicket(id, ticket)`, `deleteTicket(id)`.
- Centralizes fetch URL building and response handling.

`lib/languages.ts`
- Central map `languageNames` used by UI components (keeps language labels in one place).

`components/icons/Icons.tsx`
- Centralized React components for all inline SVG icons used across the UI. This reduces duplication and makes it easier to change icons site-wide.

`components/TicketForm.tsx`
- Presents an editable form bound to a ticket object. Fields typically include: contact_name, contact_email, contact_phone, intent, priority, language, message_raw, reply_suggestion, entities.
- It emits `onSave(ticket)` — the parent handles posting the ticket to the backend.

`components/TicketList.tsx` (detailed)
- Responsibilities:
  - Fetch tickets from `GET /api/tickets`.
  - Maintain filter state (status, priority, language, search).
  - Render the list of tickets and the filter controls.
  - Offer view and delete actions for each ticket.

- Important implementation notes:
  - Unique languages are computed with a TypeScript-safe array-based dedupe (map -> filter(Boolean) -> reduce) to avoid `TS2802` issues with Set iteration on older targets.
  - Uses `languageNames` from `frontend/lib/languages.ts` to display readable labels.
  - `handleDelete` uses `confirm()` by default (simple) — if you need a non-blocking UX, replace this with a modal.

  - Edit flow: The Tickets list now exposes an "Edit" action for each ticket which links to `/tickets/[id]` where the `TicketForm` is rendered pre-filled. This page allows updating any ticket fields (status, priority, contact info, etc.). After saving, the app navigates back to the Tickets list and the updated values are visible.

Where the UI maps AI response -> ticket form
-----------------------------------------
- The AI extractor returns a structured object. The frontend flattens any nested contact object into `contact_name`, `contact_email`, `contact_phone` before passing to `TicketForm`:

  const flatTicket: Ticket = {
    ...ticket,
    contact_name: ticket.contact_name || ticket.contact?.name || null,
    contact_email: ticket.contact_email || ticket.contact?.email || null,
    contact_phone: ticket.contact_phone || ticket.contact?.phone || null,
  };

Database schema (exact)
-----------------------
Table: `tickets`

Columns:
- id: SERIAL PRIMARY KEY
- status: VARCHAR(20) DEFAULT 'open' — e.g. 'open'|'closed'
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- contact_name: VARCHAR(100)
- contact_email: VARCHAR(100)
- contact_phone: VARCHAR(20)
- channel: VARCHAR(20) — e.g. 'email', 'whatsapp', 'sms'
- language: VARCHAR(10) — short code like 'en','ar'
- intent: TEXT — extracted intent label
- priority: VARCHAR(10) — 'low'|'medium'|'high'
- entities: JSONB — structured entities array/object
- message_raw: TEXT — original message
- reply_suggestion: TEXT — optional suggested reply generated by AI

Indexes (created on startup):
- idx_tickets_status
- idx_tickets_priority
- idx_tickets_language
- idx_tickets_created_at

API Reference (detailed)
------------------------
All endpoints are mounted under `/api`.

1) POST /api/ai/extract
- Purpose: Send unstructured text to the AI extractor and receive a normalized ticket-like object.
- Body: { message: string }
- Response (200): { success: true, data: { intent, contact_name, contact_email, contact_phone, language, entities, message_raw, reply_suggestion, priority, channel } }
- Errors: 400 for bad input, 500 for server/AI errors.

2) POST /api/tickets
- Purpose: Persist a ticket.
- Body: ticket object (fields listed in DB schema). `entities` should be a JSON array/object.
- Response: 201 created with the created row including `id` and `created_at`.

3) GET /api/tickets
- Purpose: List tickets.
- Query params (optional): status, priority, language, search (string applied to intent/message/contact/email via ILIKE).
- Response: 200 { success: true, data: [...tickets], count }

4) GET /api/tickets/:id
- Purpose: Retrieve a ticket by id.

5) PUT /api/tickets/:id
- Purpose: Partial update of a ticket. The model uses COALESCE to preserve existing fields if null/undefined passed.

6) DELETE /api/tickets/:id
- Purpose: Delete a ticket (returns deleted row)

Data shapes and examples
------------------------
Ticket (incoming from AI or stored in DB):

{
  id?: number,
  status: 'open' | 'closed',
  contact_name?: string,
  contact_email?: string,
  contact_phone?: string,
  channel?: string,
  language?: string,
  intent?: string,
  priority?: 'low'|'medium'|'high',
  entities?: Array<{ type: string, value: string }> | object,
  message_raw?: string,
  reply_suggestion?: string,
  created_at?: string
}

Common maintenance tasks & where to change things
-------------------------------------------------
- Change AI provider model or endpoint:
  - Edit `AI_BASE_URL` and `AI_MODEL` in `.env` and check `backend/src/routes/aiRoutes.js` for request shape.

- Change DB schema:
  - Edit `backend/src/db/index.js` and consider adding migration tooling (recommended) if in production.

- Change how entities are stored/used:
  - `backend/src/models/TicketModel.js` serializes `entities` as JSON; front-end expects an array/object. Update both sides if you change structure.

- Add a new language label:
  - Add to `frontend/lib/languages.ts` and (if needed) ensure incoming AI response uses the language code.

Security, logs and stability notes
--------------------------------
- Do not commit `.env` or DB credentials. Use environment-specific secrets storage in production.
- Avoid returning raw error objects to clients in production. Keep only helpful messages and log stack traces to an internal logger.
- The server warmup logic is safe but will attempt a network call on startup if AI_BASE_URL is local. This is non-blocking and times out.

Debugging tips & developer commands
----------------------------------
- Frontend typecheck:
  ```powershell
  cd frontend
  npx tsc --noEmit
  ```
- Start backend:
  ```powershell
  cd backend
  npm install
  npm run dev
  ```
- Start frontend:
  ```powershell
  cd frontend
  npm install
  npm run dev
  ```

- Quick steps to reproduce the main flow locally:
  1. Start backend (it creates the `tickets` table automatically).
 2. Start frontend.
 3. Paste a sample message in the home page and Analyze.
 4. Edit/save the ticket and view it on the Tickets page.

Where to look when something fails
----------------------------------
- If AI extraction fails: check backend logs and the `AI_BASE_URL` + `AI_MODEL` values. Use curl/postman to call the provider manually.
- If DB errors happen: confirm env DB_* vars and check Postgres logs.
- If TypeScript compile issues appear: run `npx tsc --noEmit` in `frontend`.

Recent refactors and rationale
-----------------------------
- Centralized icons (`frontend/components/icons/Icons.tsx`) to remove inline SVG duplication and make it easier to change visuals later.
- Centralized language mapping at `frontend/lib/languages.ts` to keep UI labels consistent.
- Replaced Set+spread with a reduce dedupe in `TicketList.tsx` to avoid TypeScript `TS2802` when compiling to older ES targets.
- Humanized UI copy in `app/page.tsx` to remove heavy "AI" branding while preserving function and clarity.

Final notes
-----------
This document aims to be the single source of truth for the codebase. If you want, I can also:

- Generate a short Postman collection with the API endpoints and example bodies.
- Add inline JSDoc comments to the backend model and controller functions for more discoverability in editors.
- Add a CONTRIBUTING.md with testing and release steps.

Tell me which of those you'd prefer next and I will implement it.
