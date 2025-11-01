# Ollama Setup Guide

## Step 1: Install Required Model

Since you have Ollama installed, you need to pull a model that supports JSON responses. Run this command in your terminal:

```bash
ollama pull llama3.2
```

Or if you prefer the 8B version:

```bash
ollama pull llama3.1:8b
```

**Recommended:** Use `llama3.2` as it has better JSON support.

## Step 2: Verify Ollama is Running

Make sure Ollama is running. It usually starts automatically, but if not, start it:

```bash
ollama serve
```

By default, Ollama runs on `http://localhost:11434`

## Step 3: Test the Model

Test if the model works:

```bash
ollama run llama3.2 "Return this as JSON: {\"test\": \"value\"}"
```

## Step 4: Update Backend .env

Update your `backend/.env` file:

```env
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.2
```

Or if using 8B version:

```env
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3.1:8b
```

## Step 5: Restart Backend

Restart your backend server:

```bash
cd backend
npm run dev
```

That's it! The backend will now use Ollama instead of Groq.

