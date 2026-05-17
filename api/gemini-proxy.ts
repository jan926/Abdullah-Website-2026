import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const prompt = req.body?.prompt || req.body?.input || '';
  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt in request body' });
    return;
  }

  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const url = process.env.GEMINI_API_URL || process.env.VITE_GEMINI_API_URL;

  if (!key || !url) {
    res.status(503).json({ error: 'Gemini API key or URL not configured on server' });
    return;
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(req.body),
    });

    const json = await r.json().catch(() => null);
    const text = json?.text || json?.output || json?.result || json || null;
    res.status(r.status).json({ raw: json, text });
  } catch (err: any) {
    console.error('gemini-proxy error', err);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
