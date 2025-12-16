import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { isValidHttpUrl } from './_validation';


const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://klpsu.vercel.app'
    : 'http://localhost:3000';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});


export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });


  try {
    const { longUrl } = req.body as { longUrl?: string };


    if (!isValidHttpUrl(longUrl || '')) {
      return res.status(400).json({ error: 'Некорректный URL' });
    }


    const { data: rawData, error } = await supabase
      .from('urls')
      .select('short_code, long_url, clicks, created_at, expires_at, max_clicks, password')
      .eq('long_url', longUrl);


    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }


    if (!rawData || rawData.length === 0) {
      return res.json({ variants: [] });
    }


    const now = Date.now();
    const validUrls: any[] = [];
    const invalidCodes: string[] = [];


    rawData.forEach(row => {
      const expired = row.expires_at ? new Date(row.expires_at).getTime() < now : false;
      const maxedOut = row.max_clicks != null ? row.clicks >= row.max_clicks : false;


      if (expired || maxedOut) {
        invalidCodes.push(row.short_code);
      } else {
        validUrls.push(row);
      }
    });


    if (invalidCodes.length > 0) {
      await supabase.from('urls').delete().in('short_code', invalidCodes);
    }


    const sorted = validUrls.sort((a, b) => {
      const aNoPass = !a.password;
      const bNoPass = !b.password;
      if (aNoPass && !bNoPass) return -1;
      if (!aNoPass && bNoPass) return 1;


      const aUnlimited = a.max_clicks == null;
      const bUnlimited = b.max_clicks == null;
      if (aUnlimited && !bUnlimited) return -1;
      if (!aUnlimited && bUnlimited) return 1;


      return (b.clicks || 0) - (a.clicks || 0);
    });


    const variants = sorted.map((row, index) => ({
      shortUrl: `${BASE_URL}/${row.short_code}`,
      shortCode: row.short_code,
      clicks: row.clicks || 0,
      createdAt: row.created_at,
      expiresAt: row.expires_at || null,
      maxClicks: row.max_clicks,
      hasPassword: Boolean(row.password),
      isExpired: false,
      isMaxedOut: false,
      rank: index + 1,
      isMostPopular: index === 0 && sorted.length > 1,
    }));


    return res.json({ variants });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}
