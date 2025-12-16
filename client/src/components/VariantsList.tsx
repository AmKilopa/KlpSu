import { TrendingUp, BarChart3, Timer, Copy, Check, QrCode, Lock, Crown } from 'lucide-react';
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

  const handleUrlClick = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);


  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Существует {variants.length}{' '}
          {variants.length === 1 ? 'вариант' : variants.length < 5 ? 'варианта' : 'вариантов'}
        </p>
      </div>


      <div className="space-y-2.5" role="list" aria-label="Список коротких ссылок">
        {variantItems.map(({ variant, index, timeLeft, isExpired, isMaxed, clicksPercent }) => (
          <div
            key={index}
            role="listitem"
            className={`border rounded-xl p-2.5 sm:p-3 shadow-sm transition-all duration-200 ${
              isExpired || isMaxed
                ? 'bg-gray-100 dark:bg-zinc-950/60 border-gray-300 dark:border-zinc-800'
                : variant.isMostPopular
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-400/60 hover:border-amber-500/80 ring-1 ring-amber-400/30'
                : 'bg-gradient-to-r from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 border-emerald-500/30 hover:border-emerald-500/60'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                  variant.isMostPopular
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-900'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {variant.rank}
                </span>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <button
                    onClick={() => handleUrlClick(variant.shortUrl)}
                    className={`text-xs font-mono break-all text-left hover:underline transition-colors flex-1 min-w-0 ${
                      variant.isMostPopular
                        ? 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300'
                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                    }`}
                  >
                    {variant.shortUrl}
                  </button>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {variant.isMostPopular && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm">
                        <Crown className="w-3 h-3 text-amber-900" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-amber-900 whitespace-nowrap">
                          Топ
                        </span>
                      </div>
                    )}
                    {variant.hasPassword && (
                      <div title="Защищено паролем">
                        <Lock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500" aria-label="Защищено паролем" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center text-[11px] ml-7">
                <div className="flex items-center gap-1">
                  <BarChart3
                    className="w-3 h-3 text-gray-500 dark:text-gray-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {variant.clicks} {variant.maxClicks && `/ ${variant.maxClicks}`}
                  </span>
                </div>

                {variant.expiresAt && timeLeft && !timeLeft.expired && (
                  <div className="flex items-center gap-1">
                    <Timer
                      className="w-3 h-3 text-orange-600 dark:text-orange-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-orange-600 dark:text-orange-400 font-mono tabular-nums">
                      {timeLeft.days !== undefined && timeLeft.days > 0 && `${timeLeft.days}д `}
                      {String(timeLeft.hours).padStart(2, '0')}:
                      {String(timeLeft.minutes).padStart(2, '0')}:
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {isExpired && (
                  <span className="text-red-600 dark:text-red-400 font-medium" role="status">
                    Истек
                  </span>
                )}
                {isMaxed && (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium" role="status">
                    Лимит
                  </span>
                )}
              </div>

              {variant.maxClicks && (
                <div
                  className="ml-7"
                  role="progressbar"
                  aria-valuenow={clicksPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Использовано ${clicksPercent.toFixed(0)}% кликов`}
                >
                  <div className="h-1 bg-gray-200 dark:bg-black rounded-full overflow-hidden">
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

              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => onCopy(variant.shortUrl, index)}
                  disabled={isExpired || isMaxed}
                  aria-label="Копировать ссылку"
                  className={`flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg font-medium transition-colors border min-h-[36px] flex items-center justify-center gap-1.5 touch-manipulation text-xs ${
                    copiedIndex === index
                      ? 'bg-emerald-500 border-emerald-500 text-black'
                      : isExpired || isMaxed
                      ? 'bg-gray-200 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                      : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 active:bg-gray-100 dark:active:bg-zinc-700'
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleQrOpen(variant.shortUrl)}
                  disabled={isExpired || isMaxed}
                  aria-label="Показать QR код"
                  className="px-2.5 py-1.5 rounded-lg font-medium transition-colors border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900 active:bg-gray-100 dark:active:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] touch-manipulation"
                >
                  <QrCode className="w-3.5 h-3.5" />
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
