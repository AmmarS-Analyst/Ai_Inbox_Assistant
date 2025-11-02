````markdown
# Inbox Assistant — Full Technical Documentation

This documentation serves as a complete developer-facing reference for the **Inbox Assistant** project. It covers architecture, file-level details, database schema, API contracts, runtime behavior, and where to make modifications. The intent is to allow a developer to quickly understand and work with the project.

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)  
2. [Data Flow (End-to-End)](#data-flow-end-to-end)  
3. [Environment Variables & Runtime Configuration](#environment-variables--runtime-configuration)  
4. [Backend](#backend)  
   - [File-by-File Details](#backend-file-by-file-details)  
   - [Model & SQL Notes](#model--sql-notes)  
   - [Error Handling & Warmup Logic](#error-handling--warmup-logic)  
5. [Frontend](#frontend)  
   - [Key Components & Conventions](#key-components--conventions)  
   - [Theme & Language Handling](#theme--language-handling)  
   - [Charts & Dashboard](#charts--dashboard)  
   - [UX & Layout](#ux--layout)  
6. [Database Schema](#database-schema)  
7. [API Reference](#api-reference)  
8. [Data Shapes & Validation](#data-shapes--validation)  
9. [Maintenance & Customization](#maintenance--customization)  
10. [Security, Logs & Stability](#security-logs--stability)  
11. [Debugging & Developer Commands](#debugging--developer-commands)  
12. [Recent Refactors & Rationale](#recent-refactors--rationale)

---

## Overview & Architecture

**Frontend:** Next.js (App Router) + Tailwind  
- Responsible for UX: pasting messages, calling AI extraction, editing tickets, listing tickets, and dashboard.

**Backend:** Express.js + PostgreSQL  
- Handles AI extraction requests, persists tickets, exposes API endpoints.

**Design Principles:**
- Backend is stateless; persistence is in Postgres.
- Centralized AI calls with credentials hidden behind the server.
- Frontend uses global providers (theme, language) to reduce duplication and hydration issues.

---

## Data Flow (End-to-End)

1. User pastes text in `app/page.tsx` and clicks **Analyze**.  
2. Frontend calls `POST /api/ai/extract`.  
3. Backend forwards request to AI provider, normalizes response into a ticket object.  
4. Frontend maps AI response to `TicketForm` for user edits.  
5. User saves → frontend posts to `POST /api/tickets` → persisted via `TicketModel`.  
6. Tickets page fetches via `GET /api/tickets` (supports `status`, `priority`, `language`, `search`).

---

## Environment Variables & Runtime Configuration

Located in `backend/.env`:

```env
PORT
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_HOST=
DB_PORT=
FRONTEND_URL=http://localhost:3000
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=openai/gpt-oss-20b
AI_REQUEST_TIMEOUT_MS=300000
AI_WARMUP_TIMEOUT_MS=600000
````

---

## Backend

### Backend File-by-File Details

**`server.js`**

* Configures Express app, CORS, JSON parsing.
* Mounts routes: `/api/ai`, `/api/tickets`.
* Initializes DB schema via `initializeDatabase()`.
* Performs AI model warmup (non-blocking, timeout-aware).
* Error middleware logs and returns HTTP 500.

**`src/db/index.js`**

* Exports `pool` (Postgres pool) and `initializeDatabase()`.
* `initializeDatabase()` creates `tickets` table and indexes if missing.

**`src/models/TicketModel.js`**

* Centralizes all SQL operations for tickets.
* Functions:

  * `create(ticketData)` → inserts ticket.
  * `findAll(filters)` → dynamic filter-based query.
  * `findById(id)` → fetch ticket by ID.
  * `update(id, ticketData)` → partial update via `COALESCE`.
  * `delete(id)` → delete ticket.
* Uses parameterized SQL to prevent injection.

**`src/controllers/ticketController.js`**

* Maps HTTP requests to model calls.
* Handles errors and returns 500 with helpful messages.

**`src/routes/ticketRoutes.js` & `aiRoutes.js`**

* Maps REST endpoints to controllers.
* AI route (`POST /api/ai/extract`) calls configured AI provider and normalizes response.

---

## Frontend

### Key Components & Conventions

* `NavBar.tsx` → Global navigation + theme & language toggles.
* `TicketForm.tsx` → Editable ticket form bound to AI/backend data.
* `TicketList.tsx` → Lists tickets with filter, edit, and delete actions.
* `lib/api.ts` → Frontend helper functions for backend calls.
* `lib/languages.ts` → Centralized language labels.
* `components/icons/Icons.tsx` → Centralized SVG icons.

### Theme & Language Handling

* **Theme:**

  * SSR-friendly static icon, replaced client-side with interactive toggle.
  * Managed via `ThemeContext`.

* **Language:**

  * `LanguageContext` manages `lang`, `toggleLanguage()`, `setLanguage()`.
  * NavBar language button persists selection in localStorage.
  * AI-detected language can auto-set language (e.g., Arabic).

### Charts & Dashboard

* Dashboard uses `react-chartjs-2` + Chart.js.
* Shows daily tickets, 7-day moving average, KPI tiles (avg/day, 7-day avg, % change).
* Chart.js registered in the dashboard component.

### UX & Layout

* `AppLayout.tsx` → Standardized container (`max-w-7xl`, min-height consistent with navbar).
* CSS utilities (`globals.css`) → `.card`, `.ai-gradient`, `.glass-effect`.
* Single NavBar with global theme/language toggles; duplicates removed.

---

## Database Schema

**Table:** `tickets`

| Column           | Type         | Notes                     |                           |        |
| ---------------- | ------------ | ------------------------- | ------------------------- | ------ |
| id               | SERIAL PK    | Auto increment            |                           |        |
| status           | VARCHAR(20)  | 'open'                    | 'closed' (default 'open') |        |
| created_at       | TIMESTAMP    | Default CURRENT_TIMESTAMP |                           |        |
| contact_name     | VARCHAR(100) |                           |                           |        |
| contact_email    | VARCHAR(100) |                           |                           |        |
| contact_phone    | VARCHAR(20)  |                           |                           |        |
| channel          | VARCHAR(20)  | 'email'                   | 'whatsapp'                | 'sms'  |
| language         | VARCHAR(10)  | 'en','ar', etc.           |                           |        |
| intent           | TEXT         | Extracted intent          |                           |        |
| priority         | VARCHAR(10)  | 'low'                     | 'medium'                  | 'high' |
| entities         | JSONB        | Structured entities       |                           |        |
| message_raw      | TEXT         | Original message          |                           |        |
| reply_suggestion | TEXT         | Optional AI reply         |                           |        |

**Indexes:** `idx_tickets_status`, `idx_tickets_priority`, `idx_tickets_language`, `idx_tickets_created_at`

---

## API Reference

**POST /api/ai/extract**

* Body: `{ message: string }`
* Response: `{ success: true, data: Ticket }`

**POST /api/tickets** → Persist a ticket
**GET /api/tickets** → List tickets, supports filters
**GET /api/tickets/:id** → Get ticket by ID
**PUT /api/tickets/:id** → Partial update
**DELETE /api/tickets/:id** → Delete ticket

---

## Data Shapes & Validation

```ts
type Ticket = {
  id?: number;
  status: 'open' | 'closed';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  channel?: string;
  language?: string;
  intent?: string;
  priority?: 'low'|'medium'|'high';
  entities?: Array<{ type: string, value: string }> | object;
  message_raw?: string;
  reply_suggestion?: string;
  created_at?: string;
}
```

---

## Maintenance & Customization

* **AI Provider:** Update `.env` `AI_BASE_URL` & `AI_MODEL`
* **DB Schema:** Modify `backend/src/db/index.js`; add migrations if needed
* **Entities:** Modify `TicketModel.js` serialization and frontend expectations
* **Language Labels:** Update `frontend/lib/languages.ts`

---

## Security, Logs & Stability

* Do not commit `.env` or credentials.
* Return safe error messages to clients; log full stack traces internally.
* AI warmup routine is non-blocking, times out safely.

---

## Debugging & Developer Commands

```powershell
# Frontend typecheck
cd frontend
npx tsc --noEmit

# Start backend
cd backend
npm install
npm run dev

# Start frontend
cd frontend
npm install
npm run dev
```

**Quick Local Flow:**

1. Start backend (creates `tickets` table).
2. Start frontend.
3. Paste a message → Analyze → Edit & Save → View tickets.




