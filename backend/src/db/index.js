const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create tickets table
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
    
    // Create indexes for better query performance
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

