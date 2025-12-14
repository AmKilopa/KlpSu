import { TrendingUp, BarChart3, Timer, Copy, Check } from 'lucide-react';
import type { UrlVariant } from '../types';
import { getTimeRemaining } from '../utils/formatting';

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
  onCopy
}: VariantsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <p className="text-base font-semibold text-white">
          Существует {variants.length}{' '}
          {variants.length === 1 ? 'вариант' : variants.length < 5 ? 'варианта' : 'вариантов'}
        </p>
      </div>

      <div className="space-y-3">
        {variants.map((variant, index) => {
          const timeLeft = variant.expiresAt
            ? getTimeRemaining(variant.expiresAt, currentTime)
            : null;
          const isExpired = variant.isExpired || (timeLeft && timeLeft.expired);
          const isMaxed = variant.isMaxedOut;
          const clicksPercent = variant.maxClicks
            ? (variant.clicks / variant.maxClicks) * 100
            : 0;

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                isExpired || isMaxed
                  ? 'bg-gray-800/30 border-gray-700'
                  : 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
              } transition-all duration-200`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-emerald-400 mb-3 truncate">
                    {variant.shortUrl}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-400">
                        {variant.clicks} {variant.maxClicks && `/ ${variant.maxClicks}`}
                      </span>
                    </div>

                    {variant.expiresAt && timeLeft && !timeLeft.expired && (
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs text-orange-400 font-mono">
                          {timeLeft.days !== undefined && timeLeft.days > 0 && `${timeLeft.days}д `}
                          {String(timeLeft.hours).padStart(2, '0')}:
                          {String(timeLeft.minutes).padStart(2, '0')}:
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {isExpired && (
                      <span className="text-xs text-red-400 font-medium">Истек</span>
                    )}
                    {isMaxed && (
                      <span className="text-xs text-yellow-400 font-medium">Лимит</span>
                    )}
                  </div>

                  {variant.maxClicks && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-black rounded-full overflow-hidden">
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

                <button
                  onClick={() => onCopy(variant.shortUrl, index)}
                  disabled={isExpired || isMaxed}
                  className={`px-3 py-2 rounded-md font-medium transition-colors border flex-shrink-0 ${
                    copiedIndex === index
                      ? 'bg-emerald-500 border-emerald-500 text-black'
                      : isExpired || isMaxed
                      ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
