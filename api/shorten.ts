import { VercelRequest, VercelResponse } from '@vercel/node';
import { saveUrl, getUrl } from './_db';
import { isValidHttpUrl, isValidPasswordLength, isValidShortCode, sanitizeUrl } from './_validation';
import { checkRateLimit, getRateLimitHeaders } from './_rateLimit';
import { checkUrlWithCache } from './_virusTotal';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://klpsu.vercel.app'
    : 'http://localhost:3000';

const ALLOWED_ORIGINS = [
  'https://klpsu.vercel.app',
  'http://localhost:3000',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rateLimit = checkRateLimit(req);
  const rateLimitHeaders = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.' });
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
      return res.status(400).json({ error: 'Некорректный короткий код (6 символов a-zA-Z0-9)' });
    }

    if (!longUrl || !isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }

    if (password && !isValidPasswordLength(password)) {
      return res.status(400).json({ error: 'Пароль должен быть от 8 до 256 символов' });
    }

    const sanitizedUrl = sanitizeUrl(longUrl);

    const virusTotalCheck = await checkUrlWithCache(sanitizedUrl);
    
    if (!virusTotalCheck.safe) {
      return res.status(403).json({ 
        error: 'Ссылка заблокирована по соображениям безопасности',
        details: {
          malicious: virusTotalCheck.malicious,
          suspicious: virusTotalCheck.suspicious,
        }
      });
    }

    const codeExists = await getUrl(shortCode);
    if (codeExists) {
      return res.status(400).json({ error: 'Этот код уже занят' });
    }

    await saveUrl(shortCode, sanitizedUrl, expiresIn, maxClicks, password);

    return res.json({
      shortUrl: `${BASE_URL}/${shortCode}`,
      shortCode,
      securityCheck: {
        malicious: virusTotalCheck.malicious,
        suspicious: virusTotalCheck.suspicious,
      }
    });
  } catch (error) {
    console.error('Error in shorten:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
