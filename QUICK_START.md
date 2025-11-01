# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### 1. Start PostgreSQL
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE ai_inbox_assistant;
```

### 2. Start Backend
```bash
cd backend
npm install
# Create .env file (see backend/README.md)
npm run dev
```

Backend will be available at: http://localhost:5000

### 3. Start Frontend
```bash
cd frontend
npm install
# Create .env.local file (see frontend/README.md)
npm run dev
```

Frontend will be available at: http://localhost:3000

### 4. Test It!

1. Open http://localhost:3000
2. Paste a message like:
   ```
   Hi, my name is John Smith. I have an urgent billing question about invoice #12345 dated Nov 15. The amount was $299. Please contact me at john@example.com ASAP!
   ```
3. Click "Analyze"
4. Review extracted fields
5. Click "Save Ticket"
6. View all tickets at http://localhost:3000/tickets

## 📝 Required Environment Files

### backend/.env
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

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## ✅ Verification

- Backend: http://localhost:5000/health should return `{"status":"ok"}`
- Frontend: http://localhost:3000 should show the paste interface
- Database: Check PostgreSQL - `tickets` table should be created automatically

That's it! You're ready to go! 🎉

