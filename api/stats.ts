import { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrl } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { shortCode } = req.query;

  if (typeof shortCode !== 'string') {
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
      createdAt: urlData.createdAt
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
