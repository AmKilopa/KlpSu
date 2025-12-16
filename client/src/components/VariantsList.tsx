import { TrendingUp, BarChart3, Timer, Copy, Check, QrCode, Lock } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import type { UrlVariant } from '../types';
import { getTimeRemaining } from '../utils/formatting';
import { QRCodeModal } from './QRCodeModal';
import { ShareButton } from './ShareButton';

interface VariantsListProps {
  variants: UrlVariant[];
  currentTime: Date;
  copiedIndex: number | null;
  onCopy: (url: string, index: number) => void;
}

export const VariantsList = ({
  variants,
  currentTime,
  copiedIndex,
  onCopy,
}: VariantsListProps) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const variantItems = useMemo(
    () =>
      variants.map((variant, index) => {
        const timeLeft = variant.expiresAt
          ? getTimeRemaining(variant.expiresAt, currentTime)
          : null;
        const isExpired = variant.isExpired || (timeLeft && timeLeft.expired);
        const isMaxed = variant.isMaxedOut;
        const clicksPercent = variant.maxClicks
          ? (variant.clicks / variant.maxClicks) * 100
          : 0;

        return { variant, index, timeLeft, isExpired, isMaxed, clicksPercent };
      }),
    [variants, currentTime],
  );

  const handleQrOpen = useCallback((url: string) => {
    setQrUrl(url);
  }, []);

  const handleQrClose = useCallback(() => {
    setQrUrl(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Существует {variants.length}{' '}
          {variants.length === 1 ? 'вариант' : variants.length < 5 ? 'варианта' : 'вариантов'}
        </p>
      </div>

      <div className="space-y-3" role="list" aria-label="Список коротких ссылок">
        {variantItems.map(({ variant, index, timeLeft, isExpired, isMaxed, clicksPercent }) => (
          <div
            key={index}
            role="listitem"
            className={`border rounded-2xl p-3 sm:p-4 shadow-md transition-all duration-200 ${
              isExpired || isMaxed
                ? 'bg-gray-100 dark:bg-zinc-950/60 border-gray-300 dark:border-zinc-800'
                : 'bg-gradient-to-r from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 border-emerald-500/30 hover:border-emerald-500/60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all flex-1">
                    {variant.shortUrl}
                  </p>
                  {variant.hasPassword && (
                    <div className="flex-shrink-0" title="Защищено паролем">
                      <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" aria-label="Защищено паролем" />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                  <div className="flex items-center gap-1.5">
                    <BarChart3
                      className="w-3.5 h-3.5 text-gray-500 dark:text-gray-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {variant.clicks} {variant.maxClicks && `/ ${variant.maxClicks}`}
                    </span>
                  </div>

                  {variant.expiresAt && timeLeft && !timeLeft.expired && (
                    <div className="flex items-center gap-1.5">
                      <Timer
                        className="w-3.5 h-3.5 text-orange-600 dark:text-orange-500 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-mono tabular-nums">
                        {timeLeft.days !== undefined && timeLeft.days > 0 && `${timeLeft.days}д `}
                        {String(timeLeft.hours).padStart(2, '0')}:
                        {String(timeLeft.minutes).padStart(2, '0')}:
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {isExpired && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium" role="status">
                      Истек
                    </span>
                  )}
                  {isMaxed && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium" role="status">
                      Лимит
                    </span>
                  )}
                </div>

                {variant.maxClicks && (
                  <div
                    className="mt-3"
                    role="progressbar"
                    aria-valuenow={clicksPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Использовано ${clicksPercent.toFixed(0)}% кликов`}
                  >
                    <div className="h-1.5 bg-gray-200 dark:bg-black rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          clicksPercent >= 90
                            ? 'bg-red-500'
                            : clicksPercent >= 70
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(clicksPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onCopy(variant.shortUrl, index)}
                  disabled={isExpired || isMaxed}
                  aria-label="Копировать ссылку"
                  className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors border min-h-[44px] flex items-center justify-center gap-2 touch-manipulation ${
                    copiedIndex === index
                      ? 'bg-emerald-500 border-emerald-500 text-black'
                      : isExpired || isMaxed
                      ? 'bg-gray-200 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                      : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 active:bg-gray-100 dark:active:bg-zinc-700'
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span className="text-sm">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span className="text-sm">Копировать</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleQrOpen(variant.shortUrl)}
                  disabled={isExpired || isMaxed}
                  aria-label="Показать QR код"
                  className="px-3 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900 active:bg-gray-100 dark:active:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <ShareButton url={variant.shortUrl} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {qrUrl && <QRCodeModal url={qrUrl} onClose={handleQrClose} />}
    </div>
  );
};
