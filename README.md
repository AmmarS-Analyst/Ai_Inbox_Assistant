# AI Inbox Assistant

A full-stack web application that transforms messy incoming messages (email, WhatsApp exports, chat transcripts) into structured support tickets with AI-powered extraction and reply suggestions.

## Features

- 📧 **Message Analysis**: Paste any message format (email, WhatsApp, SMS, chat)
- 🤖 **AI-Powered Extraction**: Automatically extracts contact details, intent, priority, entities, and channel
- 💬 **Smart Reply Generation**: AI-generated reply suggestions in the detected language
- 🎯 **Priority Detection**: Rule-based + AI priority detection (urgent keywords, date-based)
- 🌍 **Multi-language Support**: English and Arabic with RTL support
- 📋 **Ticket Management**: Create, edit, view, and filter tickets
- 🔍 **Advanced Filtering**: Filter by status, priority, language, and search

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- OpenAI-compatible API (Groq)
- pg (PostgreSQL client)

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Groq API key (or any OpenAI-compatible provider)

## Installation

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ai_inbox_assistant;
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
DB_NAME=ai_inbox_assistant
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=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
AI_MODEL=llama-3.1-8b-instruct
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

The server will:
- Connect to PostgreSQL
- Create the tickets table automatically
- Start on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will start on http://localhost:3000

## Project Structure

```
ai-inbox-assistant/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── aiController.js      # AI extraction logic
│   │   │   └── ticketController.js  # Ticket CRUD operations
│   │   ├── db/
│   │   │   └── index.js             # Database connection & schema
│   │   ├── models/
│   │   │   └── TicketModel.js       # Database model
│   │   ├── routes/
│   │   │   ├── aiRoutes.js          # /api/ai/* routes
│   │   │   └── ticketRoutes.js      # /api/tickets/* routes
│   │   └── server.js                # Express server
│   ├── prompts/
│   │   └── extraction.md            # AI extraction prompt
│   ├── .env                         # Backend environment variables
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Home page (message paste)
│   │   ├── tickets/
│   │   │   ├── page.tsx             # Ticket list
│   │   │   └── [id]/page.tsx        # Ticket detail/edit
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── TicketForm.tsx           # Ticket form component
│   │   ├── TicketList.tsx           # Ticket list component
│   │   └── Loader.tsx               # Loading spinner
│   ├── lib/
│   │   └── api.ts                   # API client
│   ├── .env.local                   # Frontend environment variables
│   └── package.json
└── README.md
```

## Usage

### 1. Analyze a Message

1. Go to http://localhost:3000
2. Paste your message (email, WhatsApp export, chat transcript, etc.)
3. Click "Analyze"
4. The AI will extract:
   - Contact information (name, email, phone)
   - Channel (email, WhatsApp, SMS, chat)
   - Language
   - Intent
   - Priority (low/medium/high)
   - Entities (dates, amounts, locations, etc.)
   - Reply suggestion

### 2. Edit and Save

1. Review the extracted information
2. Edit any fields as needed
3. Click "Save Ticket"

### 3. Manage Tickets

1. Go to http://localhost:3000/tickets
2. Use filters to search by:
   - Status (open/closed)
   - Priority (low/medium/high)
   - Language (en/ar/fr)
   - Free text search

## Priority Detection

The system uses a hybrid approach:

**Rule-based (applied first):**
- Contains "urgent", "ASAP", "immediately", "emergency" → High
- Mentions date within 48 hours → Medium
- Otherwise → Low

**AI-based:**
- AI analyzes context and intent
- Rule-based priority takes precedence if it's "high"

## API Endpoints

### AI Extraction
- `POST /api/ai/extract` - Extract structured data from message

### Tickets
- `GET /api/tickets` - Get all tickets (with optional filters)
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 5000)
- `DB_NAME` - PostgreSQL database name
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `AI_BASE_URL` - OpenAI-compatible API base URL
- `AI_API_KEY` - API key for AI provider
- `AI_MODEL` - Model name (e.g., llama-3.1-8b-instruct)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Testing

### Test Messages

**English:**
```
Hi, my name is John Smith and I'm emailing from john@example.com. I have a billing question about my invoice dated November 15th. The amount was $299. Can you help me urgently? Thanks!
```

**Arabic:**
```
مرحبا، اسمي أحمد محمد. عندي مشكلة في الفاتورة المؤرخة في 15 نوفمبر. المبلغ 1500 ريال. أحتاج مساعدة عاجلة. بريد: ahmed@example.com
```

## Deployment

### Backend
1. Deploy to Render, Railway, or Heroku
2. Set environment variables in the platform
3. Configure PostgreSQL (Supabase, Neon, or hosted PostgreSQL)

### Frontend
1. Deploy to Vercel, Netlify, or similar
2. Set `NEXT_PUBLIC_API_URL` to your backend URL
3. Configure CORS on backend to allow frontend domain

## Notes

- The AI extraction uses temperature 0.2 for deterministic results
- JSON response format is enforced for consistent parsing
- All AI outputs are validated against the schema before saving
- Contact details are never hallucinated - null if not present
- Reply suggestions are generated in the detected language (2-5 sentences)

## License

ISC

## Support

For issues or questions, please check the code comments or open an issue.

