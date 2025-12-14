import { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrl, incrementClicks } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParts = req.url?.split('/').filter(p => p);
  const shortCode = pathParts?.[0];

  if (!shortCode || shortCode.startsWith('api')) {
    return res.status(400).send('Invalid code');
  }

  try {
    const urlData = await getUrl(shortCode);

    if (!urlData) {
      return res.status(404).send('<h1>404 - Link not found</h1>');
    }

    await incrementClicks(shortCode);
    return res.redirect(307, urlData.longUrl);
  } catch (error) {
    return res.status(500).send('Server error');
  }
}
