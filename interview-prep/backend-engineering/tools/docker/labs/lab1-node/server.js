const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Config comes from ENV (12-factor). Defaults match docker-compose service names.
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'appdb',
});
const redis = createClient({ url: process.env.REDIS_URL || 'redis://cache:6379' });
redis.on('error', (e) => console.error('redis error', e.message));

// Retry helper: in production there's no depends_on, so the app must tolerate slow deps.
async function retry(fn, label, tries = 10) {
  for (let i = 1; i <= tries; i++) {
    try { return await fn(); }
    catch (e) {
      console.log(`${label} not ready (${i}/${tries}): ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error(`${label} never became ready`);
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/visits', async (_req, res) => {
  const count = await redis.incr('visits');
  await pool.query('INSERT INTO hits(at) VALUES (now())');
  const { rows } = await pool.query('SELECT count(*) FROM hits');
  res.json({ redisCounter: count, dbRows: Number(rows[0].count) });
});

(async () => {
  await retry(() => pool.query('SELECT 1'), 'postgres');
  await pool.query('CREATE TABLE IF NOT EXISTS hits(at timestamptz)');
  await retry(() => redis.connect(), 'redis');

  const server = app.listen(PORT, '0.0.0.0', () => console.log(`listening on ${PORT}`));

  // Graceful shutdown on docker stop (SIGTERM)
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down');
    server.close(async () => {
      await pool.end();
      await redis.quit();
      process.exit(0);
    });
  });
})().catch((e) => { console.error(e); process.exit(1); });
