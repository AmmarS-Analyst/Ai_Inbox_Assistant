const { pool } = require('../db');

class TicketModel {
  static async create(ticketData) {
    const {
      status = 'open',
      contact_name,
      contact_email,
      contact_phone,
      channel,
      language,
      intent,
      priority,
      entities = [],
      message_raw,
      reply_suggestion
    } = ticketData;

    const query = `
      INSERT INTO tickets (
        status, contact_name, contact_email, contact_phone,
        channel, language, intent, priority, entities,
        message_raw, reply_suggestion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      status,
      contact_name || null,
      contact_email || null,
      contact_phone || null,
      channel || 'unknown',
      language || 'en',
      intent || null,
      priority || 'low',
      JSON.stringify(entities),
      message_raw || null,
      reply_suggestion || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters.priority) {
      query += ` AND priority = $${paramCount++}`;
      values.push(filters.priority);
    }

    if (filters.language) {
      query += ` AND language = $${paramCount++}`;
      values.push(filters.language);
    }

    if (filters.search) {
      query += ` AND (
        message_raw ILIKE $${paramCount} OR
        intent ILIKE $${paramCount} OR
        contact_name ILIKE $${paramCount} OR
        contact_email ILIKE $${paramCount}
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows.map(row => ({
      ...row,
      entities: typeof row.entities === 'string' ? JSON.parse(row.entities) : row.entities
    }));
  }

  static async findById(id) {
    const query = 'SELECT * FROM tickets WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const ticket = result.rows[0];
    ticket.entities = typeof ticket.entities === 'string' ? JSON.parse(ticket.entities) : ticket.entities;
    return ticket;
  }

  static async update(id, ticketData) {
    const {
      status,
      contact_name,
      contact_email,
      contact_phone,
      channel,
      language,
      intent,
      priority,
      entities,
      message_raw,
      reply_suggestion
    } = ticketData;

    const query = `
      UPDATE tickets
      SET
        status = COALESCE($1, status),
        contact_name = COALESCE($2, contact_name),
        contact_email = COALESCE($3, contact_email),
        contact_phone = COALESCE($4, contact_phone),
        channel = COALESCE($5, channel),
        language = COALESCE($6, language),
        intent = COALESCE($7, intent),
        priority = COALESCE($8, priority),
        entities = COALESCE($9::jsonb, entities),
        message_raw = COALESCE($10, message_raw),
        reply_suggestion = COALESCE($11, reply_suggestion)
      WHERE id = $12
      RETURNING *
    `;

    const values = [
      status || null,
      contact_name || null,
      contact_email || null,
      contact_phone || null,
      channel || null,
      language || null,
      intent || null,
      priority || null,
      entities ? JSON.stringify(entities) : null,
      message_raw || null,
      reply_suggestion || null,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const ticket = result.rows[0];
    ticket.entities = typeof ticket.entities === 'string' ? JSON.parse(ticket.entities) : ticket.entities;
    return ticket;
  }

  static async delete(id) {
    const query = 'DELETE FROM tickets WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = TicketModel;

