import { ChevronDown, Sparkles, Calendar, Shield } from 'lucide-react';
import { PasswordProtection } from './PasswordProtection';

interface AdvancedSettingsProps {
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  customCode: string;
  setCustomCode: (code: string) => void;
  expiresIn: string;
  setExpiresIn: (expires: string) => void;
  maxClicks: string;
  setMaxClicks: (clicks: string) => void;
  password: string;
  setPassword: (password: string) => void;
  passwordEnabled: boolean;
  setPasswordEnabled: (enabled: boolean) => void;
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
  password,
  setPassword,
  passwordEnabled,
  setPasswordEnabled,
}: AdvancedSettingsProps) => {
  return (
    <>
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        aria-expanded={showAdvanced}
        aria-controls="advanced-settings-panel"
        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-500 transition-colors touch-manipulation"
      >
        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              showAdvanced ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </div>
        <span>Дополнительные настройки</span>
      </button>

      <div className={showAdvanced ? 'mt-4' : ''}>
        <div
          id="advanced-settings-panel"
          role="region"
          aria-label="Дополнительные настройки"
          className={`grid transition-all duration-300 ${
            showAdvanced ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pb-1 rounded-xl border border-zinc-900 bg-black/40 px-3 py-3 sm:px-4 sm:py-4">
              <div>
                <label
                  htmlFor="custom-code-input"
                  className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>Кастомный код</span>
                </label>
                <div className="relative">
                  <input
                    id="custom-code-input"
                    type="text"
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value.slice(0, 6))}
                    placeholder="abc123"
                    maxLength={6}
                    aria-label="Кастомный код"
                    aria-describedby="custom-code-hint"
                    className="w-full px-3 sm:px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors placeholder:text-gray-600 font-mono text-sm pr-12 sm:pr-14"
                  />
                  <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono pointer-events-none"
                  >
                    {customCode.length}/6
                  </div>
                </div>
                <p
                  id="custom-code-hint"
                  className="text-xs text-gray-600 mt-1.5"
                >
                  6 символов, только латиница, цифры, дефис
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="expires-in-select"
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"
                  >
                    <Calendar
                      className="w-4 h-4 text-emerald-500"
                      aria-hidden="true"
                    />
                    <span>Срок действия</span>
                  </label>
                  <select
                    id="expires-in-select"
                    value={expiresIn}
                    onChange={e => setExpiresIn(e.target.value)}
                    aria-label="Срок действия ссылки"
                    className="w-full px-3 sm:px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors text-sm"
                  >
                    <option value="option">Без ограничений</option>
                    <option value="1h">1 час</option>
                    <option value="24h">24 часа</option>
                    <option value="7d">7 дней</option>
                    <option value="30d">30 дней</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="max-clicks-input"
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"
                  >
                    <Shield
                      className="w-4 h-4 text-emerald-500"
                      aria-hidden="true"
                    />
                    <span>Макс. кликов</span>
                  </label>
                  <input
                    id="max-clicks-input"
                    type="number"
                    value={maxClicks}
                    onChange={e => setMaxClicks(e.target.value)}
                    placeholder="Без ограничений"
                    aria-label="Максимальное количество кликов"
                    className="w-full px-3 sm:px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors placeholder:text-gray-600 text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900/80">
                <PasswordProtection
                  password={password}
                  setPassword={setPassword}
                  enabled={passwordEnabled}
                  setEnabled={setPasswordEnabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
