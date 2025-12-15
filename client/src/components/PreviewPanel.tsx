import { Sparkles, Calendar, Shield, X, RefreshCw, CheckCircle } from 'lucide-react';
import type { PreviewData } from '../types';

interface PreviewPanelProps {
  preview: PreviewData;
  baseUrl: string;
  loading: boolean;
  onReject: () => void;
  onRegenerate: () => void;
  onApprove: () => void;
}

const EXPIRY_MAP: Record<string, string> = {
  '1h': '1 час',
  '24h': '24 часа',
  '7d': '7 дней',
  '30d': '30 дней',
};

export const PreviewPanel = ({
  preview,
  baseUrl,
  loading,
  onReject,
  onRegenerate,
  onApprove,
}: PreviewPanelProps) => {
  const expiryText = preview.expiresIn ? EXPIRY_MAP[preview.expiresIn] || '' : '';
  const hasSettings = preview.expiresIn || preview.maxClicks;

  return (
    <div
      className="border border-emerald-500/30 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-emerald-500/15"
      role="region"
      aria-label="Предпросмотр короткой ссылки"
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-md opacity-60" />
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-black">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        <div>
          <p className="text-sm sm:text-base font-semibold text-white">
            Предпросмотр ссылки
          </p>
          <p className="text-[11px] text-gray-500">
            Проверь параметры перед созданием
          </p>
        </div>
      </div>

      <div className="bg-black/80 rounded-xl p-3 sm:p-4 border border-zinc-800/80">
        <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-[0.16em]">
          Короткая ссылка
        </p>
        <p className="text-emerald-400 font-mono text-xs sm:text-sm break-all">
          {baseUrl}/{preview.shortCode}
        </p>
      </div>

      {hasSettings && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {preview.expiresIn && (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-black/70 rounded-full border border-zinc-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              <span className="text-xs text-gray-300">{expiryText}</span>
            </div>
          )}
          {preview.maxClicks && (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-black/70 rounded-full border border-zinc-800">
              <Shield className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              <span className="text-xs text-gray-300">Макс: {preview.maxClicks}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
        <button
          onClick={onReject}
          aria-label="Отменить создание ссылки"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md font-medium hover:bg-red-500/20 active:bg-red-500/30 transition-colors text-sm touch-manipulation min-h-[44px]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          <span>Отмена</span>
        </button>

        <button
          onClick={onRegenerate}
          aria-label="Изменить параметры ссылки"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md font-medium hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors text-sm touch-manipulation min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Изменить</span>
        </button>

        <button
          onClick={onApprove}
          disabled={loading}
          aria-label={loading ? 'Создание ссылки...' : 'Создать короткую ссылку'}
          aria-busy={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-black rounded-md font-semibold hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-zinc-800 disabled:text-gray-600 transition-colors text-sm touch-manipulation min-h-[44px]"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" aria-hidden="true" />
              <span className="sr-only">Создание...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>Создать</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
