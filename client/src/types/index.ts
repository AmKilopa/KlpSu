export interface Stats {
  clicks: number;
  createdAt: string;
}

export interface UrlVariant {
  shortUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
  maxClicks: number | null;
  hasPassword: boolean;
  isExpired: boolean;
  isMaxedOut: boolean;
  rank: number;
  isMostPopular: boolean;
}

export interface PreviewData {
  shortCode: string;
  longUrl: string;
  expiresIn?: string;
  maxClicks?: number;
}
