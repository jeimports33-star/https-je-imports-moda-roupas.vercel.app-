import React, { useState } from 'react';
import { 
  X, 
  QrCode as QrCodeIcon, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Smartphone,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { 
  OFFICIAL_PIX_CODE, 
  OFFICIAL_PIX_BENEFICIARY, 
  OFFICIAL_PIX_KEY, 
  OFFICIAL_PIX_CITY,
  buildPixEMVPayload,
  formatCurrency,
  copyToClipboard
} from '../utils/paymentUtils';
import { PixQrCode } from './PixQrCode';
import { useStore } from '../context/StoreContext';

interface PixGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixGeneratorModal: React.FC<PixGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useStore();
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(customAmount.replace(',', '.'));
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;

  // Compute dynamic or static PIX payload code
  const currentPixCode = buildPixEMVPayload({
    key: OFFICIAL_PIX_KEY,
    name: OFFICIAL_PIX_BENEFICIARY,
    city: OFFICIAL_PIX_CITY,
    amount: validAmount,
    txid: '***',
  });

  const handleCopyKey = async () => {
    await copyToClipboard(OFFICIAL_PIX_KEY);
    setCopiedKey(true);
    showToast('Chave PIX (jeimports33@gmail.com) copiada!', 'success');
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleCopyCode = async () => {
    await copyToClipboard(currentPixCode);
    setCopiedCode(true);
    showToast('Código PIX Copia e Cola copiado com sucesso!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const presetAmounts = [50, 100, 150, 200, 300];

  return (
    <div 
      id="pix-generator-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="pix-generator-modal-container"
        className="relative bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col my-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-black">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>QR Code PIX Oficial</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-800">
                  ATIVO
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Escaneie com a câmera do app de qualquer banco para pagar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Key Quick Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                @
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                  Chave PIX (E-mail)
                </span>
                <span className="font-mono font-bold text-sm text-neutral-950 select-all">
                  {OFFICIAL_PIX_KEY}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyKey}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
            </button>
          </div>

          {/* Optional Amount Preset / Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Definir valor específico (opcional):</span>
              </label>
              {validAmount !== undefined && (
                <button
                  type="button"
                  onClick={() => setCustomAmount('')}
                  className="text-[11px] text-neutral-500 hover:text-red-500 underline"
                >
                  Limpar valor
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Deixe em branco ou digite o valor..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 text-xs font-semibold rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Preset buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(amt.toString())}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      customAmount === amt.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    R$ {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Interactive Pix QR Code with Zoom and Copy Features */}
          <PixQrCode
            code={currentPixCode}
            amount={validAmount}
            beneficiary={OFFICIAL_PIX_BENEFICIARY}
            pixKey={OFFICIAL_PIX_KEY}
            city={OFFICIAL_PIX_CITY}
          />

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chave oficial autenticada no Banco Central</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
