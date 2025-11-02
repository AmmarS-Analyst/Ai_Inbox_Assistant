const { pool } = require('../db');

exports.summary = async (req, res) => {
  try {
    // Total count
    const totalRes = await pool.query('SELECT COUNT(*)::int AS total FROM tickets');
    const total = totalRes.rows[0].total || 0;

    // Counts by status
    const statusRes = await pool.query('SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status');
    const byStatus = {};
    statusRes.rows.forEach(r => { byStatus[r.status] = r.count; });

    // Counts by priority
    const prioRes = await pool.query('SELECT priority, COUNT(*)::int AS count FROM tickets GROUP BY priority');
    const byPriority = {};
    prioRes.rows.forEach(r => { byPriority[r.priority] = r.count; });

    // Top intents
    const intentsRes = await pool.query("SELECT COALESCE(intent, 'unknown') AS intent, COUNT(*)::int AS count FROM tickets GROUP BY intent ORDER BY count DESC LIMIT 10");
    const topIntents = intentsRes.rows.map(r => ({ intent: r.intent, count: r.count }));

    // Trend: last 30 days (day granularity)
    const trendRes = await pool.query("SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count FROM tickets WHERE created_at >= now() - interval '30 days' GROUP BY day ORDER BY day");
    const trend = trendRes.rows.map(r => ({ day: r.day, count: r.count }));

    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byPriority,
        topIntents,
        trend
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics', details: error.message });
  }
};
