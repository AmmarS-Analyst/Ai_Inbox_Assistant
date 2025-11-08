const { Pool } = require('pg');
require('dotenv').config();

// ✅ Use connection string for Neon / Vercel deployments
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ✅ Required by Neon
  },
});

// Log connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize DB schema
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contact_name VARCHAR(100),
        contact_email VARCHAR(100),
        contact_phone VARCHAR(20),
        channel VARCHAR(20),
        language VARCHAR(10),
        intent TEXT,
        priority VARCHAR(10),
        entities JSONB,
        message_raw TEXT,
        reply_suggestion TEXT
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
      CREATE INDEX IF NOT EXISTS idx_tickets_language ON tickets(language);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
    `);

    client.release();
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

module.exports = { pool, initializeDatabase };
