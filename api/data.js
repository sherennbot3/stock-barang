import { sql } from '@vercel/postgres';

const TABLE = 'app_state';

function validData(data) {
  return data && Array.isArray(data.items) && Array.isArray(data.hist) && data.set && typeof data.set === 'object';
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'PUT') {
    response.setHeader('Allow', 'GET, PUT');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.POSTGRES_URL) {
    return response.status(503).json({ error: 'POSTGRES_URL is not configured' });
  }

  try {
    await ensureTable();

    if (request.method === 'GET') {
      const result = await sql`SELECT payload, updated_at FROM app_state WHERE id = 1`;
      if (!result.rows.length) return response.status(200).json({ data: null });
      return response.status(200).json({ data: result.rows[0].payload, updatedAt: result.rows[0].updated_at });
    }

    const data = request.body;
    if (!validData(data) || JSON.stringify(data).length > 5_000_000) {
      return response.status(400).json({ error: 'Invalid data payload' });
    }

    await sql`
      INSERT INTO app_state (id, payload, updated_at)
      VALUES (1, ${JSON.stringify(data)}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `;
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Database request failed', error);
    return response.status(500).json({ error: 'Database request failed' });
  }
}
