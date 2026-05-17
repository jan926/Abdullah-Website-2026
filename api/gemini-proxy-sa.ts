import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessTokenFromServiceAccount(sa: any) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat,
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = sign.sign(sa.private_key, 'base64');
  const signed = `${unsigned}.${signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;

  const params = new URLSearchParams();
  params.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  params.set('assertion', signed);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Token request failed: ' + txt);
  }
  const json = await res.json();
  return json.access_token as string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const prompt = req.body?.prompt || req.body?.input || '';
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!saRaw) return res.status(503).json({ error: 'Service account not configured' });

  let sa: any;
  try {
    // allow base64 or raw JSON
    if (saRaw.trim().startsWith('{')) sa = JSON.parse(saRaw);
    else sa = JSON.parse(Buffer.from(saRaw, 'base64').toString('utf8'));
  } catch (e) {
    return res.status(500).json({ error: 'Invalid service account JSON' });
  }

  const model = process.env.GEMINI_MODEL || process.env.GEMINI_MODEL_NAME || 'models/gemini-1.0';

  try {
    const token = await getAccessTokenFromServiceAccount(sa);

    const genRes = await fetch(`https://generativelanguage.googleapis.com/v1/${model}:generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        // Basic request shape — the AI helper sends a prompt string; adapt if needed
        prompt: { text: prompt },
        temperature: 0.7,
        maxOutputTokens: 512,
      }),
    });

    const json = await genRes.json().catch(() => null);
    // Return raw and a convenience text field if present
    const text = json?.candidates?.map((c: any) => c.output || c.content || c.text).join('\n') || json?.output?.text || json?.text || null;
    return res.status(genRes.status).json({ raw: json, text });
  } catch (err: any) {
    console.error('gemini-proxy-sa error', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
