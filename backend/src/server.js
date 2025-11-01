const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./db');
const aiRoutes = require('./routes/aiRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Inbox Assistant API is running' });
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      // After server starts, attempt a non-blocking warmup of the local Ollama model
      (async () => {
        const usingLocalOllama = !!(process.env.AI_BASE_URL && process.env.AI_BASE_URL.includes('localhost:11434'));
        const warmupTimeout = parseInt(process.env.AI_WARMUP_TIMEOUT_MS || '300000', 10); // default 5 minutes

        if (!usingLocalOllama) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), warmupTimeout);

        try {
          const base = process.env.AI_BASE_URL.replace(/\/$/, '');
          const url = `${base}/chat/completions`;
          const body = {
            model: process.env.AI_MODEL,
            messages: [
              { role: 'system', content: 'System warmup: please respond with a short acknowledgement in one word.' },
              { role: 'user', content: 'Warmup' }
            ],
            temperature: 0.0
          };

          console.log(`Warmup: calling Ollama to preload model ${process.env.AI_MODEL} (timeout ${warmupTimeout}ms)`);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
          });

          if (!res.ok) {
            const txt = await res.text();
            console.warn(`Warmup: non-OK response ${res.status}: ${txt}`);
          } else {
            // consume body to finish request
            await res.text();
            console.log('Warmup: completed (model should be loaded)');
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            console.warn(`Warmup: aborted after ${warmupTimeout}ms`);
          } else {
            console.warn('Warmup: error', err.message || err);
          }
        } finally {
          clearTimeout(timeout);
        }
      })();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

