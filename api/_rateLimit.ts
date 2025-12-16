import { VercelRequest } from '@vercel/node';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function checkRateLimit(req: VercelRequest): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = (req.headers['x-forwarded-for'] as string) || 
             (req.headers['x-real-ip'] as string) || 
             'unknown';
  
  const now = Date.now();
  const key = `rate_limit:${ip}`;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime: store[key].resetTime };
  }

  store[key].count++;

  if (store[key].count > RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: store[key].resetTime };
  }

  return { allowed: true, remaining: RATE_LIMIT - store[key].count, resetTime: store[key].resetTime };
}

export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Limit': RATE_LIMIT.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };
}
