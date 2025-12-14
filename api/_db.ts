import { sql } from '@vercel/postgres';

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS urls (
        short_code VARCHAR(10) PRIMARY KEY,
        long_url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (error) {
    console.error('Init DB error:', error);
  }
}

export async function saveUrl(shortCode: string, longUrl: string) {
  await initDB();
  await sql`
    INSERT INTO urls (short_code, long_url, clicks, created_at)
    VALUES (${shortCode}, ${longUrl}, 0, NOW())
  `;
}

export async function getUrl(shortCode: string) {
  await initDB();
  const result = await sql`
    SELECT * FROM urls WHERE short_code = ${shortCode}
  `;
  
  if (result.rows.length === 0) return null;
  
  return {
    longUrl: result.rows[0].long_url,
    clicks: result.rows[0].clicks,
    createdAt: result.rows[0].created_at
  };
}

export async function findByLongUrl(longUrl: string): Promise<string | null> {
  await initDB();
  const result = await sql`
    SELECT short_code FROM urls WHERE long_url = ${longUrl}
  `;
  
  return result.rows.length > 0 ? result.rows[0].short_code : null;
}

export async function incrementClicks(shortCode: string) {
  await sql`
    UPDATE urls SET clicks = clicks + 1 WHERE short_code = ${shortCode}
  `;
}

export async function deleteUrl(shortCode: string) {
  await sql`
    DELETE FROM urls WHERE short_code = ${shortCode}
  `;
}
