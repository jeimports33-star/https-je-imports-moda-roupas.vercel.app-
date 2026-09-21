import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, 
  Check, 
  Maximize2, 
  Download, 
  QrCode as QrCodeIcon, 
  Sparkles, 
  X, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { 
  OFFICIAL_PIX_CODE, 
  OFFICIAL_PIX_BENEFICIARY, 
  OFFICIAL_PIX_KEY, 
  OFFICIAL_PIX_CITY,
  OFFICIAL_PIX_SVG,
  OFFICIAL_PIX_DATA_URL,
  formatCurrency
} from '../utils/paymentUtils';
import { useStore } from '../context/StoreContext';

interface PixQrCodeProps {
  code?: string;
  beneficiary?: string;
  pixKey?: string;
  city?: string;
  amount?: number;
  size?: number;
  compact?: boolean;
}

export const PixQrCode: React.FC<PixQrCodeProps> = ({
  code = OFFICIAL_PIX_CODE,
  beneficiary = OFFICIAL_PIX_BENEFICIARY,
  pixKey = OFFICIAL_PIX_KEY,
  city = OFFICIAL_PIX_CITY,
  amount,
  size = 250,
  compact = false,
}) => {
  const { showToast } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [svgString, setSvgString] = useState<string>(code === OFFICIAL_PIX_CODE ? OFFICIAL_PIX_SVG : '');
  const [dataUrl, setDataUrl] = useState<string>(code === OFFICIAL_PIX_CODE ? OFFICIAL_PIX_DATA_URL : '');

  // Render QR Code to canvas and SVG
  useEffect(() => {
    let isMounted = true;

    // Generate to Canvas
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        code,
        {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating canvas QR code:', error);
        }
      );
    }

    // Generate SVG & DataURL
    QRCode.toString(
      code,
      {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: 'M',
      },
      (err, str) => {
        if (!err && isMounted && str) {
          setSvgString(str);
        }
      }
    );

    QRCode.toDataURL(
      code,
      {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'M',
      },
      (err, uri) => {
        if (!err && isMounted && uri) {
          setDataUrl(uri);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [code, size]);

  // If zoom modal is open, render large canvas
  useEffect(() => {
    if (isZoomOpen && modalCanvasRef.current) {
      QRCode.toCanvas(
        modalCanvasRef.current,
        code,
        {
          width: 340,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error in modal canvas:', error);
        }
      );
    }
  }, [isZoomOpen, code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Código PIX Copia e Cola copiado com sucesso!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    showToast('Chave PIX (E-mail) copiada com sucesso!', 'success');
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleDownloadQr = () => {
    try {
      const link = document.createElement('a');
      link.download = 'pix-je-imports.png';
      link.href = dataUrl || OFFICIAL_PIX_DATA_URL;
      link.click();
      showToast('QR Code baixado com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Não foi possível baixar a imagem.', 'error');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Visual Container */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-xs">
        
        {/* Left: The QR Code Card */}
        <div className="relative group shrink-0 flex flex-col items-center">
          <div 
            className="p-3.5 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-md flex items-center justify-center cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.02]"
            onClick={() => setIsZoomOpen(true)}
            title="Clique para ampliar o QR Code"
          >
            {/* Native Canvas with sharp rendering */}
            <canvas 
              ref={canvasRef} 
              className="w-48 h-48 sm:w-56 sm:h-56 block rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Fallback image if canvas fails or during load */}
            <noscript>
              <img 
                src={dataUrl || OFFICIAL_PIX_DATA_URL} 
                alt="QR Code PIX JE Imports" 
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
              />
            </noscript>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 rounded-2xl">
              <Maximize2 className="w-6 h-6 text-emerald-400" />
              <span>Clique para Ampliar</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-500">
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors font-medium"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Ampliar</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors font-medium"
            >
              <Download className="w-3 h-3" />
              <span>Baixar Imagem</span>
            </button>
          </div>
        </div>

        {/* Right: Detailed Beneficiary & Instructions */}
        <div className="space-y-3 flex-1 text-center md:text-left w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PIX Oficial • Confirmação Imediata</span>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-neutral-950">
              Pagamento via PIX Oficial
            </h4>
            {amount !== undefined && (
              <p className="text-xl font-display font-black text-emerald-600 mt-0.5">
                {formatCurrency(amount)}
              </p>
            )}
          </div>

          {/* Details Box */}
          <div className="text-xs text-neutral-700 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-1.5 text-left">
            <div className="flex justify-between items-center py-0.5 border-b border-neutral-200/60">
              <span className="text-neutral-500">Beneficiário:</span>
              <span className="font-bold text-neutral-900">{beneficiary}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-neutral-200/60">
              <span className="text-neutral-500">Chave PIX (E-mail):</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-neutral-900">{pixKey}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1 text-neutral-500 hover:text-emerald-600 transition-colors"
                  title="Copiar Chave PIX"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-neutral-500">Cidade:</span>
              <span className="font-medium text-neutral-800">{city}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-start gap-2 text-xs text-neutral-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-left">
            <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-emerald-950">
              <strong>Como pagar:</strong> Abra o app do seu banco, selecione a opção <strong>PIX</strong> e aponte a câmera para o QR Code ou use o botão <strong>Copiar Código PIX</strong> abaixo.
            </p>
          </div>
        </div>

      </div>

      {/* PIX Copia e Cola Input with Copy Button */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <QrCodeIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Código PIX Copia e Cola Oficial:</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-normal">
            (Basta colar no app do seu banco)
          </span>
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={code}
            className="flex-1 px-3.5 py-2.5 text-xs bg-neutral-100 text-neutral-800 font-mono rounded-xl border border-neutral-200 select-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            id="btn-copy-pix-code"
            type="button"
            onClick={handleCopyCode}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shrink-0 shadow-xs ${
              copiedCode
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-950 hover:bg-neutral-800 text-white'
            }`}
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Código PIX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chave Pix Quick Copy Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
        <span className="text-neutral-600">
          Prefere transferir pela Chave PIX? <strong>{pixKey}</strong>
        </span>
        <button
          type="button"
          onClick={handleCopyKey}
          className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
          <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
        </button>
      </div>

      {/* Fullscreen / Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-60 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <span className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <QrCodeIcon className="w-4 h-4 text-emerald-600" />
                <span>QR Code PIX • Alta Resolução</span>
              </span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-DPI Modal Canvas */}
            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/30 flex items-center justify-center shadow-inner mx-auto">
              <canvas 
                ref={modalCanvasRef} 
                className="w-64 h-64 block rounded-lg"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-bold text-neutral-900">{beneficiary}</p>
              <p>Chave: {pixKey}</p>
              {amount !== undefined && (
                <p className="font-extrabold text-emerald-600 text-sm">{formatCurrency(amount)}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                title="Baixar imagem do QR Code"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
