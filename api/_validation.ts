const URL_MAX_LENGTH = 2000;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 256;
const CODE_LENGTH = 6;

const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:', 'vbscript:'];
const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^localhost$/i,
  /^0\.0\.0\.0$/,
];

export function isValidHttpUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.length > URL_MAX_LENGTH) return false;

  try {
    const u = new URL(url);
    
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    
    const lowerUrl = url.toLowerCase();
    if (BLOCKED_PROTOCOLS.some(proto => lowerUrl.includes(proto))) return false;
    
    const hostname = u.hostname;
    if (PRIVATE_IP_RANGES.some(regex => regex.test(hostname))) return false;
    
    if (hostname.includes('@') || hostname.includes('..')) return false;
    
    return true;
  } catch {
    return false;
  }
}

export function isValidShortCode(code: string): boolean {
  if (typeof code !== 'string' || code.length !== CODE_LENGTH) return false;
  return /^[a-zA-Z0-9]{6}$/.test(code);
}

export function isValidPasswordLength(password: string): boolean {
  return (
    typeof password === 'string' &&
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH
  );
}

export function sanitizeUrl(url: string): string {
  return url.trim().replace(/[\r\n\t]/g, '');
}
