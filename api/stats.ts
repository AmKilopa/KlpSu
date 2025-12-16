import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrl } from './_db';
import { isValidShortCode } from './_validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shortCode } = req.query;

  if (typeof shortCode !== 'string' || !isValidShortCode(shortCode)) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  try {
    const urlData = await getUrl(shortCode);

    if (!urlData) {
      return res.status(404).json({ error: 'Link not found' });
    }

    return res.json({
      shortCode,
      longUrl: urlData.longUrl,
      clicks: urlData.clicks,
      createdAt: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      maxClicks: urlData.maxClicks,
      isExpired: urlData.isExpired,
      isMaxedOut: urlData.isMaxedOut,
      hasPassword: urlData.hasPassword,
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
