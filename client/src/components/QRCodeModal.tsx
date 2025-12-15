import { X, Download, Link2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useCallback, useMemo } from 'react';

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export const QRCodeModal = ({ url, onClose }: QRCodeModalProps) => {
  const code = useMemo(() => url.split('/').pop() ?? '', [url]);

  const drawLogoAndCode = useCallback((ctx: CanvasRenderingContext2D, size: number, codeText: string) => {
    const qrSize = size * 0.8;
    const qrOffsetX = (size - qrSize) / 2;
    const qrOffsetY = (size - qrSize) / 2 - 24;
    const logoSize = qrSize * 0.18;
    const logoX = qrOffsetX + qrSize / 2;
    const logoY = qrOffsetY + qrSize / 2;

    ctx.save();
    ctx.translate(logoX, logoY);

    const r = logoSize * 0.4;
    ctx.beginPath();
    ctx.moveTo(-logoSize / 2 + r, -logoSize / 2);
    ctx.lineTo(logoSize / 2 - r, -logoSize / 2);
    ctx.quadraticCurveTo(logoSize / 2, -logoSize / 2, logoSize / 2, -logoSize / 2 + r);
    ctx.lineTo(logoSize / 2, logoSize / 2 - r);
    ctx.quadraticCurveTo(logoSize / 2, logoSize / 2, logoSize / 2 - r, logoSize / 2);
    ctx.lineTo(-logoSize / 2 + r, logoSize / 2);
    ctx.quadraticCurveTo(-logoSize / 2, logoSize / 2, -logoSize / 2, logoSize / 2 - r);
    ctx.lineTo(-logoSize / 2, -logoSize / 2 + r);
    ctx.quadraticCurveTo(-logoSize / 2, -logoSize / 2, -logoSize / 2 + r, -logoSize / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${logoSize * 0.55}px Arial, sans-serif`;
    ctx.fillText('K', 0, logoSize * 0.05);

    ctx.restore();

    if (codeText) {
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `${qrSize * 0.11}px 'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillText(codeText, size / 2, qrOffsetY + qrSize + 16);
    }
  }, []);

  const downloadQR = useCallback(() => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const qrSize = size * 0.8;
      const qrOffsetX = (size - qrSize) / 2;
      const qrOffsetY = (size - qrSize) / 2 - 24;

      ctx.drawImage(img, qrOffsetX, qrOffsetY, qrSize, qrSize);
      drawLogoAndCode(ctx, size, code);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${code || 'klpsu'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [code, drawLogoAndCode]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const openShortUrl = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [url],
  );

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className="bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-emerald-500/20 space-y-4"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 id="qr-modal-title" className="text-lg font-semibold text-white">
              QR код ссылки
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Сканируй или скачай для печати
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 mb-1 flex items-center justify-center shadow-inner">
          <div className="relative w-[240px] h-[260px] flex flex-col items-center">
            <div className="relative w-[220px] h-[220px]">
              <QRCode
                id="qr-code-svg"
                value={url}
                size={220}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
                className="w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-md"
                  >
                    <rect
                      x="18"
                      y="18"
                      width="64"
                      height="64"
                      rx="22"
                      fill="#ffffff"
                      fillOpacity="0.96"
                    />
                    <text
                      x="50"
                      y="65"
                      fontFamily="Arial, sans-serif"
                      fontSize="50"
                      fontWeight="bold"
                      fill="#10b981"
                      textAnchor="middle"
                    >
                      K
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {code && (
              <button
                onClick={openShortUrl}
                className="mt-2 text-sm font-semibold text-black tracking-[0.08em] uppercase"
              >
                {code}
              </button>
            )}
          </div>
        </div>

        <a
          href={url}
          onClick={openShortUrl}
          className="flex items-center justify-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors break-all font-mono"
        >
          <Link2 className="w-3 h-3" />
          <span>{url}</span>
        </a>

        <button
          onClick={downloadQR}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-black rounded-xl font-semibold hover:bg-emerald-400 active:bg-emerald-600 transition-colors touch-manipulation min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          Скачать QR код
        </button>
      </div>
    </div>
  );
};
