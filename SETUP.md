# Setup Guide - AI Inbox Assistant

## Prerequisites

1. **Node.js 18+** and npm installed
2. **PostgreSQL 12+** installed and running
3. **Groq API key** (or any OpenAI-compatible provider)

## Step-by-Step Setup

### 1. Database Setup

Open PostgreSQL and create the database:

```sql
CREATE DATABASE ai_inbox_assistant;
```

The backend will automatically create the `tickets` table on first run.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the `backend` directory:

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

**Note:** Update `DB_PASSWORD` if your PostgreSQL password is different.

Start the backend:

```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database schema initialized
🚀 Server running on http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

### Test with English Message

Paste this into the message box:

```
Hi, my name is John Smith and I'm emailing from john@example.com. I have a billing question about my invoice dated November 15th. The amount was $299. Can you help me urgently? Thanks!
```

Click "Analyze" and verify:
- Contact details extracted
- Intent identified
- Priority set to "high" (due to "urgently")
- Reply suggestion generated

### Test with Arabic Message

Switch to Arabic (click "English" button) and paste:

```
مرحبا، اسمي أحمد محمد. عندي مشكلة في الفاتورة المؤرخة في 15 نوفمبر. المبلغ 1500 ريال. أحتاج مساعدة عاجلة. بريد: ahmed@example.com
```

Click "تحليل" (Analyze) and verify:
- Arabic language detected
- Contact information extracted
- RTL layout applied
- Arabic reply generated

## Troubleshooting

### Backend won't start

1. Check PostgreSQL is running: `pg_isready` or check service status
2. Verify database exists: `psql -l | grep ai_inbox_assistant`
3. Check `.env` file has correct credentials
4. Check port 5000 is not in use

### Frontend can't connect to backend

1. Verify backend is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS settings in backend `server.js`
4. Check browser console for errors

### Database connection errors

1. Verify PostgreSQL credentials in `.env`
2. Check PostgreSQL is accepting connections
3. Verify database `ai_inbox_assistant` exists
4. Check user permissions

### AI extraction fails

1. Verify `AI_API_KEY` is correct
2. Check `AI_BASE_URL` matches your provider
3. Verify `AI_MODEL` is available on your provider
4. Check API rate limits

## Next Steps

1. Customize the extraction prompt in `backend/prompts/extraction.md`
2. Adjust priority rules in `backend/src/controllers/aiController.js`
3. Style the UI in `frontend/app/globals.css`
4. Add more language support
5. Deploy to production (see main README.md)

## Project Structure

```
ai-inbox-assistant/
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── prompts/
├── frontend/         # Next.js app
│   ├── app/
│   ├── components/
│   └── lib/
└── README.md
```

Happy coding! 🚀

