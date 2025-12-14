import { VercelRequest, VercelResponse } from '@vercel/node';
import { findAllByLongUrl } from './_db';

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
    const { longUrl } = req.body;

    if (!longUrl || typeof longUrl !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const existingCodes = await findAllByLongUrl(longUrl);

    return res.json({
      variants: existingCodes.map(code => ({
        shortUrl: `${BASE_URL}/${code.shortCode}`,
        shortCode: code.shortCode,
        clicks: code.clicks,
        createdAt: code.createdAt,
        expiresAt: code.expiresAt,
        maxClicks: code.maxClicks,
        isExpired: code.isExpired,
        isMaxedOut: code.isMaxedOut
      }))
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
