import { VercelRequest, VercelResponse } from '@vercel/node';
import { checkCodeExists } from './_db';

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
    const { shortCode } = req.body;

    if (!shortCode || typeof shortCode !== 'string') {
      return res.status(400).json({ error: 'Short code is required' });
    }

    const exists = await checkCodeExists(shortCode);

    return res.json({ exists });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
