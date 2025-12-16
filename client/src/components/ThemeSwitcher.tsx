import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeSwitcher = () => {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'system' as const, icon: Monitor, label: 'Системная' },
    { value: 'light' as const, icon: Sun, label: 'Светлая' },
    { value: 'dark' as const, icon: Moon, label: 'Тёмная' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  const handleThemeChange = (newTheme: typeof theme) => {
    changeTheme(newTheme);
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-white dark:from-zinc-900 dark:to-black border border-gray-300 dark:border-zinc-800 shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-110"
          aria-label="Переключить тему"
          aria-expanded={isOpen}
        >
          <CurrentIcon className="w-5 h-5 transition-transform duration-300" />
        </button>

        <div
          className={`absolute top-16 right-0 transition-all duration-300 origin-top-right ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-white dark:bg-gradient-to-b dark:from-zinc-950 dark:to-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-2 space-y-1 min-w-[200px]">
              {themes.map(t => {
                const Icon = t.icon;
                const isActive = theme === t.value;

                return (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-black/10'
                          : 'bg-gray-200 dark:bg-zinc-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{t.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-black animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2 border-t border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-black/20">
              <p className="text-[10px] text-gray-500 dark:text-zinc-600 text-center font-medium">
                Тема сохраняется автоматически
              </p>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
