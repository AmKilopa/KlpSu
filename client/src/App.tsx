import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link2, Github } from 'lucide-react';
import { nanoid } from 'nanoid';
import { AdvancedSettings } from './components/AdvancedSettings';
import { PreviewPanel } from './components/PreviewPanel';
import { VariantsList } from './components/VariantsList';
import type { UrlVariant, PreviewData } from './types';
import { isValidUrl, isValidCustomCode } from './utils/validation';

const API_URL = '';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [maxClicks, setMaxClicks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [variants, setVariants] = useState<UrlVariant[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setVariants([]);
    setPreview(null);
    setError('');
  }, [longUrl]);

  useEffect(() => {
    if (variants.length > 0 && !preview) {
      const interval = setInterval(loadVariants, 3000);
      return () => clearInterval(interval);
    }
  }, [variants, preview]);

  const loadVariants = async () => {
    if (!longUrl) return;
    try {
      const response = await axios.post(`${API_URL}/api/get-variants`, { longUrl });
      if (response.data.variants) setVariants(response.data.variants);
    } catch {
      console.error('Load variants error');
    }
  };

  const checkCodeExists = async (code: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/api/check-code`, {
        shortCode: code,
      });
      return response.data.exists;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    if (!longUrl) {
      setError('Введите URL');
      return;
    }

    if (!isValidUrl(longUrl)) {
      setError('Введите корректную ссылку (начинается с http:// или https://)');
      return;
    }

    if (customCode && !isValidCustomCode(customCode)) {
      setError(
        'Кастомный код должен содержать ровно 6 символов (буквы, цифры, _ или -)'
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/get-variants`, { longUrl });

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants);
      } else {
        await createPreview();
      }
    } catch {
      await createPreview();
    } finally {
      setLoading(false);
    }
  };

  const createPreview = async () => {
    let generatedCode = customCode || nanoid(6);

    if (customCode) {
      const exists = await checkCodeExists(customCode);
      if (exists) {
        setError('Этот код уже используется. Выберите другой код.');
        return;
      }
    } else {
      let codeExists = true;
      let attempts = 0;
      while (codeExists && attempts < 10) {
        generatedCode = nanoid(6);
        codeExists = await checkCodeExists(generatedCode);
        attempts++;
      }

      if (codeExists) {
        setError('Не удалось сгенерировать уникальный код. Попробуйте еще раз.');
        return;
      }
    }

    setPreview({
      shortCode: generatedCode,
      longUrl,
      expiresIn: expiresIn || undefined,
      maxClicks: maxClicks ? parseInt(maxClicks) : undefined,
    });
  };

  const createAnotherVariant = async () => {
    if (!longUrl || !isValidUrl(longUrl)) {
      setError('Введите корректную ссылку');
      return;
    }

    if (customCode && !isValidCustomCode(customCode)) {
      setError(
        'Кастомный код должен содержать ровно 6 символов (буквы, цифры, _ или -)'
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createPreview();
    } catch {
      setError('Ошибка при создании варианта');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!preview) return;

    setLoading(true);
    setError('');

    try {
      const exists = await checkCodeExists(preview.shortCode);
      if (exists) {
        setError('Этот код уже занят. Пожалуйста, измените код.');
        setLoading(false);
        return;
      }

      await axios.post(`${API_URL}/api/shorten`, {
        shortCode: preview.shortCode,
        longUrl: preview.longUrl,
        expiresIn: preview.expiresIn,
        maxClicks: preview.maxClicks,
      });

      setPreview(null);
      setCustomCode('');
      setExpiresIn('');
      setMaxClicks('');
      setShowAdvanced(false);

      await loadVariants();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при сокращении ссылки');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setPreview(null);
    setCustomCode('');
    setExpiresIn('');
    setMaxClicks('');
    setShowAdvanced(false);
  };

  const handleRegenerate = () => {
    setPreview(null);
    setShowAdvanced(true);
  };

  const copyToClipboard = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !preview) {
      if (variants.length > 0) {
        createAnotherVariant();
      } else {
        handleShorten();
      }
    }
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-500 rounded-lg">
                <Link2 className="w-7 h-7 text-black" strokeWidth={2.5} />
              </div>
              <h1 className="text-6xl font-bold text-white tracking-tight">KlpSu</h1>
            </div>
            <p className="text-gray-500 text-base font-medium">
              Профессиональное сокращение ссылок
            </p>
          </div>

          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Длинная ссылка
                </label>
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com/very/long/url..."
                  className="w-full px-4 py-3 bg-black text-gray-200 border border-zinc-800 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-gray-600 font-mono text-sm"
                />
              </div>

              {!preview && (
                <>
                  <AdvancedSettings
                    showAdvanced={showAdvanced}
                    setShowAdvanced={setShowAdvanced}
                    customCode={customCode}
                    setCustomCode={setCustomCode}
                    expiresIn={expiresIn}
                    setExpiresIn={setExpiresIn}
                    maxClicks={maxClicks}
                    setMaxClicks={setMaxClicks}
                    onKeyPress={handleKeyPress}
                  />

                  <button
                    onClick={variants.length > 0 ? createAnotherVariant : handleShorten}
                    disabled={loading}
                    className="w-full bg-emerald-500 text-black py-3 rounded-md font-semibold hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-gray-600 transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        Обработка...
                      </span>
                    ) : variants.length > 0 ? (
                      'Создать еще'
                    ) : (
                      'Сократить ссылку'
                    )}
                  </button>
                </>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              {preview && (
                <PreviewPanel
                  preview={preview}
                  baseUrl={baseUrl}
                  loading={loading}
                  onReject={handleReject}
                  onRegenerate={handleRegenerate}
                  onApprove={handleApprove}
                />
              )}

              {variants.length > 0 && !preview && (
                <VariantsList
                  variants={variants}
                  currentTime={currentTime}
                  copiedIndex={copiedIndex}
                  onCopy={copyToClipboard}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-900 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <span className="text-emerald-500">React</span>
              <span>•</span>
              <span className="text-emerald-500">TypeScript</span>
              <span>•</span>
              <span className="text-emerald-500">Supabase</span>
            </div>

            <a
              href="https://github.com/AmKilopa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">@AmKilopa</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
