import { Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PasswordProtectionProps {
  password: string;
  setPassword: (password: string) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const PasswordProtection = ({
  password,
  setPassword,
  enabled,
  setEnabled,
}: PasswordProtectionProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-800 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
            Защитить паролем
          </span>
        </div>
      </label>

      {enabled && (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full px-3 sm:px-4 py-2.5 pr-10 bg-white dark:bg-black text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-600 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
