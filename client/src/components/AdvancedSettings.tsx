import { ChevronDown, Sparkles, Calendar, Shield } from 'lucide-react';

interface AdvancedSettingsProps {
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  customCode: string;
  setCustomCode: (code: string) => void;
  expiresIn: string;
  setExpiresIn: (expires: string) => void;
  maxClicks: string;
  setMaxClicks: (clicks: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const AdvancedSettings = ({
  showAdvanced,
  setShowAdvanced,
  customCode,
  setCustomCode,
  expiresIn,
  setExpiresIn,
  maxClicks,
  setMaxClicks,
  onKeyPress
}: AdvancedSettingsProps) => {
  return (
    <div>
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-500 transition-colors"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            showAdvanced ? 'rotate-180' : ''
          }`}
        />
        Дополнительные настройки
      </button>

      <div
        className={`grid transition-all duration-300 ${
          showAdvanced ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pb-1">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Свой код
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.slice(0, 6))}
                  onKeyPress={onKeyPress}
                  placeholder="abc123"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-gray-600 font-mono text-sm pr-14"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono">
                  {customCode.length}/6
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                6 символов: буквы, цифры, _ или -
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Срок действия
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                >
                  <option value="">Бессрочно</option>
                  <option value="1h">1 час</option>
                  <option value="24h">24 часа</option>
                  <option value="7d">7 дней</option>
                  <option value="30d">30 дней</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Макс. кликов
                </label>
                <input
                  type="number"
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value)}
                  onKeyPress={onKeyPress}
                  placeholder="Без лимита"
                  min="1"
                  className="w-full px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-gray-600 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
