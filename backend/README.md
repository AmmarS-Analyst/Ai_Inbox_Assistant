# Backend Setup

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from example if needed):
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

3. Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE ai_inbox_assistant;
```

4. Start the server:
```bash
npm run dev
```

The server will automatically create the database schema on first run.

## API Endpoints

- `POST /api/ai/extract` - Extract ticket data from message
- `GET /api/tickets` - Get all tickets (with filters)
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

## Health Check

- `GET /health` - Server health check

