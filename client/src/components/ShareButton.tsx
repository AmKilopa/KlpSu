import { Share2 } from 'lucide-react';


interface ShareButtonProps {
  url: string;
}


export const ShareButton = ({ url }: ShareButtonProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Короткая ссылка',
          text: 'Смотри эту ссылку',
          url: url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Ошибка при попытке поделиться:', err);
        }
      }
    } else {
      const width = 600;
      const height = 400;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;


      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}`,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`,
      );
    }
  };


  return (
    <button
      onClick={handleShare}
      aria-label="Поделиться ссылкой"
      className="px-2.5 py-1.5 rounded-lg font-medium transition-colors border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900 active:bg-gray-100 dark:active:bg-zinc-800 min-h-[36px] touch-manipulation"
    >
      <Share2 className="w-3.5 h-3.5" />
    </button>
  );
};
