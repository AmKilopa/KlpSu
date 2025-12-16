import { VercelRequest, VercelResponse } from '@vercel/node';
import { saveUrl, getUrl } from './_db';
import { isValidHttpUrl, isValidPasswordLength, isValidShortCode } from './_validation';

const BASE_URL =
  process.env.NODE_ENV === 'production'
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
    const { shortCode, longUrl, expiresIn, maxClicks, password } = req.body as {
      shortCode?: string;
      longUrl?: string;
      expiresIn?: string;
      maxClicks?: number;
      password?: string;
    };

    if (!shortCode || !isValidShortCode(shortCode)) {
      return res.status(400).json({ error: 'Некорректный короткий код' });
    }

    if (!longUrl || !isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }

    if (password && !isValidPasswordLength(password)) {
      return res.status(400).json({ error: 'Некорректная длина пароля' });
    }

    const codeExists = await getUrl(shortCode);
    if (codeExists) {
      return res.status(400).json({ error: 'Этот код уже занят' });
    }

    await saveUrl(shortCode, longUrl, expiresIn, maxClicks, password);

    return res.json({
      shortUrl: `${BASE_URL}/${shortCode}`,
      shortCode,
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
