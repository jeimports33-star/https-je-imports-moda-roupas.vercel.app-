import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { STORE_WHATSAPP_DISPLAY, STORE_WHATSAPP_NUMBER } from '../utils/paymentUtils';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage = encodeURIComponent(
    'Olá, JE Imports! Gostaria de tirar uma dúvida sobre as peças do catálogo.'
  );
  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${defaultMessage}`;

  return (
    <aside aria-label="Atendimento WhatsApp" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Popover Bubble */}
      {isOpen && (
        <div 
          id="whatsapp-floating-bubble"
          className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 w-72 sm:w-80 text-neutral-800 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-bold text-xs text-neutral-950">Atendimento JE Imports</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-950">
            <p className="font-semibold">Fale diretamente com nossa equipe no WhatsApp:</p>
            <p className="font-bold text-emerald-700 text-sm mt-0.5">{STORE_WHATSAPP_DISPLAY}</p>
          </div>

          <p className="text-[11px] text-neutral-500">
            Tire dúvidas sobre tamanhos, modelagem, estoque ou consulte o status do seu pedido.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Iniciar Conversa no WhatsApp</span>
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="whatsapp-floating-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
        title="Atendimento no WhatsApp (79) 9 9601-6356"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <MessageCircle className="w-5 h-5 text-white fill-white/20" />
        
        <span className="text-xs font-bold hidden sm:inline tracking-wide">
          WhatsApp: {STORE_WHATSAPP_DISPLAY}
        </span>
      </button>
    </aside>
  );
};
