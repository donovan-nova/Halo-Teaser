import { neon } from '@neondatabase/serverless';

// POST /api/subscribe  { "email": "you@example.com" }
// Inserts the email into the GS_HALODB "signups" table.
// The Neon connection string is read from the DATABASE_URL environment
// variable (set this in Vercel -> Project -> Settings -> Environment Variables).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Server is not configured yet. Please try again later.' });
  }

  try {
    // Vercel parses JSON bodies automatically; guard just in case.
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = (body.email || '').toString().trim().toLowerCase();

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    if (!valid) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const sql = neon(process.env.DATABASE_URL);
    // ON CONFLICT keeps re-submits idempotent (no duplicate rows, no error).
    await sql`
      INSERT INTO signups (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
