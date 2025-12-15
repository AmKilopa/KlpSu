const CUSTOM_CODE_REGEX = /^[a-zA-Z0-9_-]{6}$/;

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidCustomCode = (code: string): boolean => {
  return typeof code === 'string' && code.length === 6 && CUSTOM_CODE_REGEX.test(code);
};
