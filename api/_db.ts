import { createClient } from '@supabase/supabase-js';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

const getCurrentTime = () => new Date();

export async function saveUrl(
  shortCode: string,
  longUrl: string,
  expiresIn?: string,
  maxClicks?: number,
  password?: string,
  securityFlags?: { malicious: number; suspicious: number },
) {
  let expiresAt: string | null = null;

  if (expiresIn) {
    const now = Date.now();
    const durations: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const duration = durations[expiresIn];
    if (duration) {
      expiresAt = new Date(now + duration).toISOString();
    }
  }

  let hashedPassword: string | null = null;
  if (password) {
    hashedPassword = await argon2Hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
    });
  }

  const { error } = await supabase.from('urls').insert({
    short_code: shortCode,
    long_url: longUrl,
    clicks: 0,
    expires_at: expiresAt,
    max_clicks: maxClicks,
    password: hashedPassword,
    created_at: new Date().toISOString(),
    security_malicious: securityFlags?.malicious || 0,
    security_suspicious: securityFlags?.suspicious || 0,
  });

  if (error) throw error;
}

export async function getUrl(shortCode: string) {
  const { data, error } = await supabase
    .from('urls')
    .select('long_url, clicks, created_at, expires_at, max_clicks, password, security_malicious, security_suspicious')
    .eq('short_code', shortCode)
    .single();

  if (error || !data) return null;

  const now = getCurrentTime();
  const expiresAt = data.expires_at ? new Date(data.expires_at) : null;

  return {
    longUrl: data.long_url,
    clicks: data.clicks,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    maxClicks: data.max_clicks,
    hasPassword: !!data.password,
    isExpired: expiresAt ? expiresAt < now : false,
    isMaxedOut: data.max_clicks ? data.clicks >= data.max_clicks : false,
    securityMalicious: data.security_malicious || 0,
    securitySuspicious: data.security_suspicious || 0,
  };
}

export async function verifyPassword(
  shortCode: string,
  providedPassword: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('urls')
    .select('password')
    .eq('short_code', shortCode)
    .single();

  if (error || !data?.password) return false;

  try {
    return await argon2Verify(data.password, providedPassword);
  } catch {
    return false;
  }
}

export async function findAllByLongUrl(longUrl: string) {
  const { data, error } = await supabase
    .from('urls')
    .select('short_code, clicks, created_at, expires_at, max_clicks, password')
    .eq('long_url', longUrl)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return [];

  const now = getCurrentTime();

  return data.map(item => {
    const expiresAt = item.expires_at ? new Date(item.expires_at) : null;

    return {
      shortCode: item.short_code,
      clicks: item.clicks,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      maxClicks: item.max_clicks,
      hasPassword: !!item.password,
      isExpired: expiresAt ? expiresAt < now : false,
      isMaxedOut: item.max_clicks ? item.clicks >= item.max_clicks : false,
    };
  });
}

export async function checkCodeExists(shortCode: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('urls')
    .select('*', { count: 'exact', head: true })
    .eq('short_code', shortCode);

  return !error && (count ?? 0) > 0;
}

export async function incrementClicks(shortCode: string) {
  const { error } = await supabase.rpc('increment_clicks', { p_code: shortCode });

  if (error) throw error;
}

export async function deleteUrl(shortCode: string) {
  const { error } = await supabase.from('urls').delete().eq('short_code', shortCode);

  if (error) throw error;
}

export async function logAccess(shortCode: string, ip: string, userAgent: string) {
  await supabase.from('access_logs').insert({
    short_code: shortCode,
    ip_address: ip,
    user_agent: userAgent,
    accessed_at: new Date().toISOString(),
  });
}
