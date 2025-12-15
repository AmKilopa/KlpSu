export interface Stats {
  clicks: number;
  createdAt: string;
}

export interface UrlVariant {
  shortUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string;
  maxClicks?: number;
  hasPassword?: boolean;
  isExpired: boolean;
  isMaxedOut: boolean;
}

export interface PreviewData {
  shortCode: string;
  longUrl: string;
  expiresIn?: string;
  maxClicks?: number;
}
