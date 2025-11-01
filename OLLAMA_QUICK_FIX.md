# Quick Fix: Switch to Ollama

## The Problem
The error shows: `The model 'llama-3.1-8b-instruct' does not exist or you do not have access to it.`

This means the model name doesn't exist on Groq. You can either:
1. Use Ollama (local, free, fast)
2. Use a different Groq model

## Solution: Use Ollama (Recommended)

### Step 1: Pull a Model in Ollama

Open a terminal and run:

```bash
ollama pull llama3.2
```

This will download the model (about 2GB). Alternative models:
- `llama3.2` (recommended - best JSON support)
- `llama3.1:8b` (smaller, faster)
- `mistral` (also good)

### Step 2: Verify Ollama is Running

Ollama should start automatically. If not:

```bash
ollama serve
```

### Step 3: Update Backend .env

Edit `backend/.env` and change:

```env
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.2
```

**Remove or comment out** the AI_API_KEY line (Ollama doesn't need it):
```env
# AI_API_KEY=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
```

Or you can keep it, it just won't be used.

### Step 4: Restart Backend

Stop your backend (Ctrl+C) and restart:

```bash
cd backend
npm run dev
```

### Step 5: Test

Try analyzing a message again. It should work now!

## Alternative: Use Different Groq Model

If you want to stick with Groq, change the model name in `backend/.env`:

```env
AI_MODEL=llama-3.3-70b-versatile
```

Or check Groq's available models at: https://console.groq.com/docs/models

## Troubleshooting

### Ollama not found
Install Ollama from: https://ollama.ai/download

### Model not found
List available models:
```bash
ollama list
```

Pull the model:
```bash
ollama pull llama3.2
```

### Port already in use
Ollama uses port 11434. Make sure nothing else is using it.

### Still getting errors
Check backend logs for detailed error messages. The model name must match exactly what's installed in Ollama.

