import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Link2, Github } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Toaster, toast } from 'sonner';
import { AdvancedSettings } from './components/AdvancedSettings';
import { PreviewPanel } from './components/PreviewPanel';
import { VariantsList } from './components/VariantsList';
import { SkeletonLoader } from './components/SkeletonLoader';
import type { UrlVariant, PreviewData } from './types';
import { isValidUrl, isValidCustomCode } from './utils/validation';

const API_URL = '';

const TECH_LINKS = [
  { name: 'React', url: 'https://react.dev', key: 'react' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org', key: 'ts' },
  { name: 'Supabase', url: 'https://supabase.com', key: 'supabase' },
  { name: 'Vercel', url: 'https://vercel.com', key: 'vercel' },
];

interface AppState {
  longUrl: string;
  customCode: string;
  expiresIn: string;
  maxClicks: string;
  password: string;
  passwordEnabled: boolean;
  loading: boolean;
  loadingVariants: boolean;
  error: string;
  variants: UrlVariant[];
  copiedIndex: number | null;
  showAdvanced: boolean;
  preview: PreviewData | null;
}

function ReactIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sky-400">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="1.8" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(120 12 12)" />
      </g>
    </svg>
  );
}

function TSIcon() {
  return (
    <div className="h-3.5 w-3.5 rounded-[3px] bg-[#3178c6] flex items-center justify-center text-[6px] font-bold text-white">
      TS
    </div>
  );
}

function SupabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path
        d="M7 3.5h7.5c.6 0 1.1.5 1.1 1.1V11h3.3c.9 0 1.4 1 .8 1.7l-7 7.5c-.6.7-1.8.3-1.8-.7v-6.2H7c-.9 0-1.4-1-.8-1.7l4.9-6.4c.6-.8 1.9-.3 1.9.7V8"
        fill="#10b981"
      />
    </svg>
  );
}

function VercelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white">
      <path d="M12 3L22 21H2L12 3Z" fill="currentColor" />
    </svg>
  );
}

function getTechIcon(key: string) {
  if (key === 'react') return <ReactIcon />;
  if (key === 'ts') return <TSIcon />;
  if (key === 'supabase') return <SupabaseIcon />;
  if (key === 'vercel') return <VercelIcon />;
  return null;
}

function App() {
  const [state, setState] = useState<AppState>({
    longUrl: '',
    customCode: '',
    expiresIn: '',
    maxClicks: '',
    password: '',
    passwordEnabled: false,
    loading: false,
    loadingVariants: false,
    error: '',
    variants: [],
    copiedIndex: null,
    showAdvanced: false,
    preview: null,
  });

  const currentTimeRef = useRef(new Date());
  const variantsIntervalRef = useRef<number>();
  const apiCancelTokenRef = useRef<AbortController>();

  useEffect(() => {
    const timer = setInterval(() => {
      currentTimeRef.current = new Date();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (variantsIntervalRef.current) clearInterval(variantsIntervalRef.current);
      if (apiCancelTokenRef.current) apiCancelTokenRef.current.abort();
    };
  }, []);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadVariants = useCallback(async () => {
    if (!state.longUrl || state.loadingVariants) return;

    const controller = new AbortController();
    apiCancelTokenRef.current = controller;

    try {
      const response = await axios.post(
        `${API_URL}/api/get-variants`,
        { longUrl: state.longUrl },
        { signal: controller.signal },
      );

      if (response.data.variants) {
        updateState({ variants: response.data.variants });
      }
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        console.error('Load variants error');
      }
    }
  }, [state.longUrl, state.loadingVariants, updateState]);

  const checkCodeExists = useCallback(async (code: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/api/check-code`, { shortCode: code });
      return response.data.exists;
    } catch {
      return false;
    }
  }, []);

  const validateInput = useCallback(() => {
    if (!state.longUrl) {
      updateState({ error: 'Введите URL' });
      toast.error('Введите URL');
      return false;
    }

    if (!isValidUrl(state.longUrl)) {
      updateState({
        error: 'Введите корректную ссылку (начинается с http:// или https://)',
      });
      toast.error('Некорректная ссылка');
      return false;
    }

    if (state.customCode && !isValidCustomCode(state.customCode)) {
      updateState({
        error:
          'Кастомный код должен содержать ровно 6 символов (буквы, цифры, _ или -)',
      });
      toast.error('Некорректный код');
      return false;
    }

    if (state.passwordEnabled && !state.password) {
      updateState({ error: 'Введите пароль для защиты ссылки' });
      toast.error('Введите пароль');
      return false;
    }

    updateState({ error: '' });
    return true;
  }, [state.longUrl, state.customCode, state.passwordEnabled, state.password, updateState]);

  const generateUniqueCode = useCallback(
    async (customCode?: string): Promise<string | null> => {
      if (customCode) {
        const exists = await checkCodeExists(customCode);
        return exists ? null : customCode;
      }

      let code = nanoid(6);
      for (let i = 0; i < 5; i++) {
        code = nanoid(6);
        const exists = await checkCodeExists(code);
        if (!exists) return code;
      }

      return null;
    },
    [checkCodeExists],
  );

  const handleShorten = useCallback(
    async (forceNew?: boolean) => {
      if (!validateInput()) return;

      if (forceNew) {
        updateState({ loading: true, loadingVariants: false, preview: null });

        try {
          const code = await generateUniqueCode(
            state.customCode ? state.customCode : undefined,
          );

          if (!code) {
            updateState({
              error:
                'Этот кастомный код уже занят. Измените код или очистите поле, чтобы сгенерировать случайный.',
            });
            toast.error('Код занят', {
              description: 'Выберите другой кастомный код или оставьте поле пустым.',
            });
            return;
          }

          updateState({
            preview: {
              shortCode: code,
              longUrl: state.longUrl,
              expiresIn: state.expiresIn || undefined,
              maxClicks: state.maxClicks ? parseInt(state.maxClicks) : undefined,
            },
          });
        } finally {
          updateState({ loading: false });
        }

        return;
      }

      updateState({ loading: true, loadingVariants: true, preview: null });

      try {
        const response = await axios.post(`${API_URL}/api/get-variants`, {
          longUrl: state.longUrl,
        });

        if (response.data.variants?.length > 0) {
          updateState({
            variants: response.data.variants,
            loadingVariants: false,
          });
          toast.success('Найдены существующие варианты', {
            description: `Найдено ${response.data.variants.length} ${
              response.data.variants.length === 1 ? 'вариант' : 'вариантов'
            }`,
          });
        } else {
          const code = await generateUniqueCode(state.customCode || undefined);
          if (code) {
            updateState({
              preview: {
                shortCode: code,
                longUrl: state.longUrl,
                expiresIn: state.expiresIn || undefined,
                maxClicks: state.maxClicks ? parseInt(state.maxClicks) : undefined,
              },
              loadingVariants: false,
            });
          } else {
            updateState({
              error: 'Не удалось сгенерировать уникальный код',
              loadingVariants: false,
            });
            toast.error('Ошибка генерации');
          }
        }
      } catch {
        const code = await generateUniqueCode(state.customCode || undefined);
        if (code) {
          updateState({
            preview: {
              shortCode: code,
              longUrl: state.longUrl,
              expiresIn: state.expiresIn || undefined,
              maxClicks: state.maxClicks ? parseInt(state.maxClicks) : undefined,
            },
            loadingVariants: false,
          });
        }
      } finally {
        updateState({ loading: false });
      }
    },
    [
      state.longUrl,
      state.customCode,
      state.expiresIn,
      state.maxClicks,
      validateInput,
      generateUniqueCode,
      updateState,
    ],
  );

  const handleApprove = useCallback(
    async () => {
      if (!state.preview) return;

      updateState({ loading: true, error: '' });

      try {
        const exists = await checkCodeExists(state.preview.shortCode);
        if (exists) {
          updateState({
            error: 'Этот код уже занят. Пожалуйста, измените код.',
          });
          toast.error('Код занят');
          return;
        }

        await axios.post(`${API_URL}/api/shorten`, {
          shortCode: state.preview.shortCode,
          longUrl: state.preview.longUrl,
          expiresIn: state.preview.expiresIn,
          maxClicks: state.preview.maxClicks,
          password: state.passwordEnabled ? state.password : undefined,
        });

        toast.success('Ссылка создана!', {
          description: `${window.location.origin}/${state.preview.shortCode}`,
        });

        updateState({
          preview: null,
          customCode: '',
          expiresIn: '',
          maxClicks: '',
          password: '',
          passwordEnabled: false,
          showAdvanced: false,
        });

        loadVariants();
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error || 'Ошибка при сокращении ссылки';
        updateState({ error: errorMsg });
        toast.error('Ошибка', { description: errorMsg });
      } finally {
        updateState({ loading: false });
      }
    },
    [state.preview, state.passwordEnabled, state.password, checkCodeExists, loadVariants, updateState],
  );

  const handleReject = useCallback(() => {
    updateState({
      preview: null,
      customCode: '',
      expiresIn: '',
      maxClicks: '',
      password: '',
      passwordEnabled: false,
      showAdvanced: false,
    });
    toast.info('Отменено');
  }, [updateState]);

  const handleRegenerate = useCallback(() => {
    updateState({ preview: null, showAdvanced: true });
  }, [updateState]);

  const copyToClipboard = useCallback(
    (url: string, index: number) => {
      navigator.clipboard.writeText(url);
      updateState({ copiedIndex: index });

      setTimeout(() => {
        updateState({ copiedIndex: null });
      }, 2000);

      toast.success('Скопировано!', { description: url });
    },
    [updateState],
  );

  const baseUrl = useMemo(() => window.location.origin, []);

  useEffect(() => {
    if (state.variants.length > 0 && !state.preview) {
      variantsIntervalRef.current = window.setInterval(loadVariants, 5000);
      return () => {
        if (variantsIntervalRef.current) clearInterval(variantsIntervalRef.current);
      };
    }
  }, [state.variants.length, state.preview, loadVariants]);

  useEffect(() => {
    if (state.longUrl) {
      updateState({ variants: [], preview: null, error: '' });
    }
  }, [state.longUrl, updateState]);

  const techLinks = useMemo(() => TECH_LINKS, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#f4f4f5',
          },
        }}
      />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-emerald-500/40 blur-xl opacity-60" />
                <div className="relative p-2 sm:p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/40">
                  <Link2
                    className="w-6 sm:w-7 h-6 sm:h-7 text-black"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </div>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
                KlpSu
              </h1>
            </div>
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Профессиональное сокращение ссылок
            </p>
          </div>

          <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl shadow-emerald-500/15">
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="long-url-input"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Длинная ссылка
                </label>
                <div className="relative">
                  <input
                    id="long-url-input"
                    type="url"
                    value={state.longUrl}
                    onChange={e => updateState({ longUrl: e.target.value })}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && !state.preview) {
                        handleShorten(
                          state.variants.length > 0 ? true : false,
                        );
                      }
                    }}
                    placeholder="https://example.com/very/long/url..."
                    aria-label="Введите длинную ссылку для сокращения"
                    aria-invalid={state.error ? 'true' : 'false'}
                    aria-describedby={state.error ? 'url-error' : undefined}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/80 text-gray-200 border border-zinc-800 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 transition-colors placeholder:text-gray-600 font-mono text-xs sm:text-sm"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-white/5" />
                </div>
              </div>

              {!state.preview && (
                <>
                  <AdvancedSettings
                    showAdvanced={state.showAdvanced}
                    setShowAdvanced={show => updateState({ showAdvanced: show })}
                    customCode={state.customCode}
                    setCustomCode={code => updateState({ customCode: code })}
                    expiresIn={state.expiresIn}
                    setExpiresIn={val => updateState({ expiresIn: val })}
                    maxClicks={state.maxClicks}
                    setMaxClicks={val => updateState({ maxClicks: val })}
                    password={state.password}
                    setPassword={val => updateState({ password: val })}
                    passwordEnabled={state.passwordEnabled}
                    setPasswordEnabled={enabled =>
                      updateState({ passwordEnabled: enabled })
                    }
                  />

                  <button
                    onClick={() =>
                      state.variants.length > 0
                        ? handleShorten(true)
                        : handleShorten()
                    }
                    disabled={state.loading}
                    aria-label={
                      state.variants.length > 0
                        ? 'Создать еще один вариант'
                        : 'Сократить ссылку'
                    }
                    className="group w-full px-6 py-3 bg-emerald-500 text-black rounded-xl font-semibold shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-zinc-800 disabled:text-gray-600 disabled:shadow-none transition-all duration-200 text-base touch-manipulation min-h-[44px]"
                  >
                    {state.loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div
                          className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"
                          aria-hidden
                        />
                        <span className="sr-only">Создание...</span>
                      </span>
                    ) : state.variants.length > 0 ? (
                      'Создать еще'
                    ) : (
                      'Сократить ссылку'
                    )}
                  </button>
                </>
              )}

              {state.error && (
                <div
                  id="url-error"
                  role="alert"
                  className="bg-red-500/10 border border-red-500/50 rounded-md p-3"
                >
                  <p className="text-red-400 text-xs sm:text-sm font-medium">
                    {state.error}
                  </p>
                </div>
              )}

              {state.preview && (
                <PreviewPanel
                  preview={state.preview}
                  baseUrl={baseUrl}
                  loading={state.loading}
                  onReject={handleReject}
                  onRegenerate={handleRegenerate}
                  onApprove={handleApprove}
                />
              )}

              {state.loadingVariants ? (
                <SkeletonLoader />
              ) : state.variants.length > 0 && !state.preview ? (
                <VariantsList
                  variants={state.variants}
                  currentTime={currentTimeRef.current}
                  copiedIndex={state.copiedIndex}
                  onCopy={copyToClipboard}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-900/80 mt-8 sm:mt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
              <span className="text-[11px] sm:text-xs text-zinc-500 whitespace-nowrap mb-2 sm:mb-0">
                Сделано с помощью
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {techLinks.map(tech => (
                  <a
                    key={tech.name}
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-[11px] sm:text-xs text-gray-400 hover:border-emerald-500/70 hover:text-emerald-400 hover:bg-zinc-900/80 transition-colors shadow-sm shadow-black/40"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/80 ring-1 ring-zinc-800 group-hover:ring-emerald-500/60">
                      {getTechIcon(tech.key)}
                    </div>
                    <span className="font-medium tracking-tight">{tech.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <a
              href="https://github.com/AmKilopa/KlpSu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Профиль GitHub AmKilopa"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3.5 py-1.5 text-xs sm:text-sm text-gray-400 hover:border-emerald-500/70 hover:text-emerald-400 hover:bg-zinc-900/80 transition-colors shadow-sm shadow-black/40"
            >
              <Github className="w-4 sm:w-5 h-4 sm:h-5" aria-hidden />
              <span className="font-medium">@AmKilopa</span>
              <span className="ml-1 rounded-full bg-emerald-500/15 text-[10px] px-1.5 py-0.5 text-emerald-400">
                Open source
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
