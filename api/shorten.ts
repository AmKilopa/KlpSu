import { VercelRequest, VercelResponse } from '@vercel/node';
import { saveUrl, getUrl } from './_db';

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://klpsu.vercel.app'
  : 'http://localhost:3000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortCode, longUrl, expiresIn, maxClicks } = req.body;

    if (!shortCode || !longUrl) {
      return res.status(400).json({ error: 'Short code and URL are required' });
    }

    const codeExists = await getUrl(shortCode);
    if (codeExists) {
      return res.status(400).json({ error: 'Этот код уже занят' });
    }

    await saveUrl(shortCode, longUrl, expiresIn, maxClicks);

    return res.json({
      shortUrl: `${BASE_URL}/${shortCode}`,
      shortCode
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
