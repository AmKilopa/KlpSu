declare global {
  var urlDatabase: Record<string, { longUrl: string; clicks: number; createdAt: string }> | undefined;
}

if (!global.urlDatabase) {
  global.urlDatabase = {};
}

export async function saveUrl(shortCode: string, longUrl: string) {
  global.urlDatabase![shortCode] = {
    longUrl,
    clicks: 0,
    createdAt: new Date().toISOString()
  };
}

export async function getUrl(shortCode: string) {
  return global.urlDatabase![shortCode] || null;
}

export async function findByLongUrl(longUrl: string) {
  for (const [shortCode, data] of Object.entries(global.urlDatabase!)) {
    if (data.longUrl === longUrl) {
      return shortCode;
    }
  }
  return null;
}

export async function incrementClicks(shortCode: string) {
  if (global.urlDatabase![shortCode]) {
    global.urlDatabase![shortCode].clicks++;
  }
}
