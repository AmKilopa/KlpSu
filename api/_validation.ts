const URL_MAX_LENGTH = 2000;
const PASSWORD_MAX_LENGTH = 256;
const CODE_LENGTH = 6;

export function isValidHttpUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.length > URL_MAX_LENGTH) return false;

  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    return true;
  } catch {
    return false;
  }
}

export function isValidShortCode(code: string): boolean {
  return typeof code === 'string' && code.length === CODE_LENGTH;
}

export function isValidPasswordLength(password: string): boolean {
  return typeof password === 'string' && password.length > 0 && password.length <= PASSWORD_MAX_LENGTH;
}
