import { Lock } from 'lucide-react';

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
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900 bg-black/40 hover:border-emerald-500/50 hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer group touch-manipulation">
        <div className="relative w-5 h-5 rounded-md border border-zinc-700 bg-black shadow-inner shadow-black/40 flex items-center justify-center group-hover:border-emerald-500/60 transition-all duration-200">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 absolute opacity-0 cursor-pointer"
          />
          {enabled && (
            <div className="w-3 h-3 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-500/40 scale-110 transition-transform duration-150" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-400 group-hover:text-gray-100 transition-colors">
            Защитить паролем
          </span>
        </div>
      </label>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          enabled ? 'max-h-20 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'
        }`}
      >
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Введите пароль"
          aria-label="Пароль"
          autoComplete="new-password"
          className="w-full px-3 sm:px-4 py-2.5 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 placeholder:text-gray-600 text-sm"
        />
      </div>
    </div>
  );
};
