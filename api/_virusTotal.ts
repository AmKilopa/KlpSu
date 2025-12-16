// api/_virusTotal.ts
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY!;
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';

interface VirusTotalAnalysis {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
}

interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: VirusTotalAnalysis;
      last_analysis_results: Record<string, any>;
    };
  };
}

export async function checkUrlSafety(url: string): Promise<{
  safe: boolean;
  malicious: number;
  suspicious: number;
  error?: string;
}> {
  if (!VIRUSTOTAL_API_KEY) {
    console.warn('VirusTotal API key not configured');
    return { safe: true, malicious: 0, suspicious: 0, error: 'API key missing' };
  }

  try {
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
    
    const response = await fetch(`${VIRUSTOTAL_API_URL}/urls/${urlId}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
    });

    if (response.status === 404) {
      await submitUrlForScanning(url);
      return { safe: true, malicious: 0, suspicious: 0 };
    }

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data: VirusTotalResponse = await response.json();
    const stats = data.data.attributes.last_analysis_stats;

    const isSafe = stats.malicious === 0 && stats.suspicious < 3;

    return {
      safe: isSafe,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
    };
  } catch (error) {
    console.error('VirusTotal check failed:', error);
    return { safe: true, malicious: 0, suspicious: 0, error: 'Check failed' };
  }
}

async function submitUrlForScanning(url: string): Promise<void> {
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);

    await fetch(`${VIRUSTOTAL_API_URL}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  } catch (error) {
    console.error('Failed to submit URL for scanning:', error);
  }
}

export async function checkUrlWithCache(url: string): Promise<{
  safe: boolean;
  malicious: number;
  suspicious: number;
}> {
  const result = await checkUrlSafety(url);
  return result;
}
