import { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrl, incrementClicks } from './_db';

const renderLayout = (content: string) => `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>KlpSu - URL Shortener</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-black flex items-center justify-center p-6">
  <div class="w-full max-w-2xl">
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-3 mb-6">
        <div class="p-2.5 bg-emerald-500 rounded-lg">
          <svg class="w-7 h-7 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
          </svg>
        </div>
        <h1 class="text-6xl font-bold text-white tracking-tight">KlpSu</h1>
      </div>
    </div>
    ${content}
    <div class="text-center mt-8">
      <p class="text-sm text-gray-600">
        Нужна помощь? Свяжитесь с поддержкой
      </p>
    </div>
  </div>
</body>
</html>`;

const renderNotFound = () =>
  renderLayout(`
  <div class="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
    <div class="p-12 text-center space-y-6">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full border-2 border-red-500/50">
        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
      </div>
      <div class="space-y-3">
        <h2 class="text-4xl font-bold text-white">404</h2>
        <p class="text-xl text-gray-400 font-medium">Ссылка не найдена</p>
        <p class="text-sm text-gray-500 max-w-md mx-auto">
          Эта короткая ссылка не существует или была удалена.
          Проверьте правильность ссылки или создайте новую.
        </p>
      </div>
      <div class="pt-4">
        <a
          href="/"
          class="inline-flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-md font-semibold hover:bg-emerald-400 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Вернуться на главную
        </a>
      </div>
    </div>
  </div>
`);

const renderExpired = (expiresAt?: string | null) =>
  renderLayout(`
  <div class="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
    <div class="p-12 text-center space-y-6">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 rounded-full border-2 border-orange-500/50">
        <svg class="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
        </svg>
      </div>
      <div class="space-y-3">
        <h2 class="text-4xl font-bold text-white">Срок истек</h2>
        <p class="text-xl text-gray-400 font-medium">Срок действия ссылки истек</p>
        <p class="text-sm text-gray-500 max-w-md mx-auto">
          ${
            expiresAt
              ? `Эта ссылка была активна до <span class="text-orange-400 font-medium">${new Date(
                  expiresAt
                ).toLocaleString('ru-RU')}</span>.`
              : 'Эта ссылка больше не активна.'
          }
          Создайте новую ссылку для продолжения.
        </p>
      </div>
      <div class="pt-4">
        <a
          href="/"
          class="inline-flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-md font-semibold hover:bg-emerald-400 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Вернуться на главную
        </a>
      </div>
    </div>
  </div>
`);

const renderMaxClicks = (clicks: number, maxClicks: number) =>
  renderLayout(`
  <div class="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
    <div class="p-12 text-center space-y-6">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full border-2 border-yellow-500/50">
        <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      </div>
      <div class="space-y-3">
        <h2 class="text-4xl font-bold text-white">Лимит исчерпан</h2>
        <p class="text-xl text-gray-400 font-medium">Достигнут максимум кликов</p>
        <p class="text-sm text-gray-500 max-w-md mx-auto">
          Эта ссылка достигла максимального количества переходов. Создайте новую ссылку для продолжения.
        </p>
        <div class="bg-black rounded-lg border border-zinc-800 p-4 inline-block mt-4">
          <p class="text-3xl font-bold text-yellow-500">${clicks} / ${maxClicks}</p>
          <p class="text-xs text-gray-500 mt-1 uppercase tracking-wider">Кликов использовано</p>
        </div>
      </div>
      <div class="pt-4">
        <a
          href="/"
          class="inline-flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-md font-semibold hover:bg-emerald-400 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Вернуться на главную
        </a>
      </div>
    </div>
  </div>
`);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shortCode } = req.query;

  if (!shortCode || typeof shortCode !== 'string' || shortCode.length !== 6) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(renderNotFound());
  }

  try {
    const urlData = await getUrl(shortCode);

    if (!urlData) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(renderNotFound());
    }

    if (urlData.isExpired) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(410).send(renderExpired(urlData.expiresAt));
    }

    if (urlData.isMaxedOut) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res
        .status(410)
        .send(renderMaxClicks(urlData.clicks, urlData.maxClicks || 0));
    }

    await incrementClicks(shortCode);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.redirect(308, urlData.longUrl);
  } catch {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(renderNotFound());
  }
}
