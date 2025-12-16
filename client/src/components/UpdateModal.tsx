import { X, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const CURRENT_VERSION = '1.0.0';

const CHANGELOG = {
  version: '1.0.0',
  date: '2025-12-16',
  title: 'Первый релиз KlpSu',
  changes: [
    '**Основные возможности:**',
    '• Сокращение ссылок с автогенерацией или кастомным кодом (6 символов)',
    '• Установка срока действия ссылки',
    '• Лимит на количество переходов',
    '• Защита паролем',
    '',
    '**Управление вариантами:**',
    '• Нумерация всех вариантов ссылок',
    '• Автоматическая сортировка по популярности',
    '• Бейдж "Топ" для самого популярного варианта',
    '• Золотая рамка и градиент для выделения популярных ссылок',
    '• Кликабельные ссылки с открытием в новой вкладке',
    '',
    '**Статистика:**',
    '• Счетчик кликов для каждой ссылки',
    '• Визуальный прогресс-бар использования лимита',
    '• Отображение оставшегося времени до истечения',
    '• Индикаторы защиты паролем',
    '',
    '**Дополнительно:**',
    '• Генерация QR-кодов с брендированием',
    '• Скачивание QR-кодов в PNG',
    '• Кнопка "Поделиться" для быстрой отправки',
    '• Адаптивный дизайн для мобильных устройств',
    '• Поддержка светлой и темной темы',
  ],
};

const parseMarkdown = (text: string) => {
  let parsed = text;
  
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-xs">$1</code>');
  
  return parsed;
};

export const UpdateModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    
    if (lastSeenVersion !== CURRENT_VERSION) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gradient-to-b dark:from-zinc-950 dark:to-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {CHANGELOG.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-500">
                Версия {CHANGELOG.version} • {CHANGELOG.date}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          <ul className="space-y-1.5">
            {CHANGELOG.changes.map((change, index) => {
              if (change === '') {
                return <div key={index} className="h-2" />;
              }        
              const isHeader = change.startsWith('**') && change.endsWith(':**');
              const isBullet = change.startsWith('•');             
              return (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-sm ${
                    isHeader
                      ? 'font-semibold text-gray-900 dark:text-white mt-3 first:mt-0'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {!isHeader && !isBullet && (
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                  )}
                  <span
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(change) }}
                    className="leading-relaxed"
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <button
          onClick={handleClose}
          className="w-full mt-6 px-4 py-2.5 bg-emerald-500 text-black rounded-xl font-semibold hover:bg-emerald-400 active:bg-emerald-600 transition-colors touch-manipulation"
        >
          Начать использовать
        </button>
      </div>
    </div>
  );
};
