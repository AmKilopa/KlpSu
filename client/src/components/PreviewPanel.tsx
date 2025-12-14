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

export const PreviewPanel = ({
  preview,
  baseUrl,
  loading,
  onReject,
  onRegenerate,
  onApprove
}: PreviewPanelProps) => {
  return (
    <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-md p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <p className="text-base font-semibold text-white">Предпросмотр ссылки</p>
      </div>

      <div className="bg-black rounded-md p-4 border border-zinc-800">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Короткая ссылка</p>
        <p className="text-emerald-400 font-mono text-sm">
          {baseUrl}/{preview.shortCode}
        </p>
      </div>

      {(preview.expiresIn || preview.maxClicks) && (
        <div className="flex flex-wrap gap-3">
          {preview.expiresIn && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-md border border-zinc-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-gray-400">
                {preview.expiresIn === '1h' && '1 час'}
                {preview.expiresIn === '24h' && '24 часа'}
                {preview.expiresIn === '7d' && '7 дней'}
                {preview.expiresIn === '30d' && '30 дней'}
              </span>
            </div>
          )}
          {preview.maxClicks && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-md border border-zinc-800">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-gray-400">Макс: {preview.maxClicks}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onReject}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md font-medium hover:bg-red-500/20 transition-colors"
        >
          <X className="w-4 h-4" />
          Отмена
        </button>

        <button
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md font-medium hover:bg-blue-500/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Изменить
        </button>

        <button
          onClick={onApprove}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-black rounded-md font-semibold hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-gray-600 transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Создать
            </>
          )}
        </button>
      </div>
    </div>
  );
};
