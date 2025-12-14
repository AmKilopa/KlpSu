import { VercelRequest, VercelResponse } from '@vercel/node';
import { nanoid } from 'nanoid';
import { saveUrl, findByLongUrl } from './_db';

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

    if (!longUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const existingCode = await findByLongUrl(longUrl);
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    if (existingCode) {
      return res.json({
        shortUrl: `${baseUrl}/${existingCode}`,
        shortCode: existingCode,
        existing: true
      });
    }

    const shortCode = nanoid(6);
    await saveUrl(shortCode, longUrl);

    return res.json({
      shortUrl: `${baseUrl}/${shortCode}`,
      shortCode,
      existing: false
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
