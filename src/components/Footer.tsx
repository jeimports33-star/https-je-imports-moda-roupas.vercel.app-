import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Sparkles,
  QrCode,
  CreditCard,
  FileText,
  MessageCircle
} from 'lucide-react';
import { JeLogo } from './JeLogo';
import { STORE_WHATSAPP_DISPLAY, STORE_WHATSAPP_NUMBER } from '../utils/paymentUtils';

export const Footer: React.FC = () => {
  const { setFilters, setIsAdminOpen, setIsPixModalOpen } = useStore();
  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá, JE Imports! Gostaria de falar com o atendimento.')}`;

  return (
    <footer id="store-footer" className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Value props row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-neutral-800">
          <div 
            onClick={() => setIsPixModalOpen(true)}
            className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-neutral-900/50 cursor-pointer transition-colors"
            title="Clique para ver o QR Code PIX oficial"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>PIX Instantâneo</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-800">
                  -5%
                </span>
              </h4>
              <p className="text-xs text-neutral-400">Ver QR Code & Chave</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Cartão de Crédito</h4>
              <p className="text-xs text-[#DFBA73] font-semibold">Parcelamos até 12 vezes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Frete Grátis Brasil</h4>
              <p className="text-xs text-neutral-400">Em compras acima de R$ 250,00</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Pedidos no WhatsApp</h4>
              <p className="text-xs text-neutral-400">{STORE_WHATSAPP_DISPLAY}</p>
            </div>
          </div>
        </div>

        {/* Links & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          
          {/* Brand bio */}
          <div className="lg:col-span-2 space-y-4">
            <JeLogo size="md" showSubtitle={true} />
            <p className="text-neutral-400 leading-relaxed max-w-sm">
              Sua referência nacional em streetwear contemporâneo, techwear e alfaiataria relaxed. Peças de alta gramatura com design autêntico para quem valoriza estilo e presença.
            </p>
            
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">WhatsApp de Pedidos:</span>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{STORE_WHATSAPP_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase tracking-wider text-xs">
              Categorias
            </h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => setFilters(prev => ({ ...prev, category: 'camisetas' }))} className="hover:text-white transition-colors">
                  Camisetas Heavyweight
                </button>
              </li>
              <li>
                <button onClick={() => setFilters(prev => ({ ...prev, category: 'casacos' }))} className="hover:text-white transition-colors">
                  Casacos & Jaquetas
                </button>
              </li>
              <li>
                <button onClick={() => setFilters(prev => ({ ...prev, category: 'streetwear' }))} className="hover:text-white transition-colors">
                  Hoodies & Streetwear
                </button>
              </li>
              <li>
                <button onClick={() => setFilters(prev => ({ ...prev, category: 'calcas' }))} className="hover:text-white transition-colors">
                  Calças Cargo & Shorts
                </button>
              </li>
              <li>
                <button onClick={() => setFilters(prev => ({ ...prev, category: 'calcados' }))} className="hover:text-white transition-colors">
                  Sneakers & Calçados
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase tracking-wider text-xs">
              Ajuda & Suporte
            </h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Falar no WhatsApp</span>
                </a>
              </li>
              <li><span className="hover:text-white cursor-pointer">Prazos e Formas de Envio</span></li>
              <li><span className="hover:text-white cursor-pointer">Guia de Lavagem das Peças</span></li>
              <li><span className="hover:text-white cursor-pointer">Termos e Condições</span></li>
              <li>
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="text-[#DFBA73] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-[#DFBA73]" />
                  <span>Acesso Admin (Gerenciar Catálogo)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Badges & Security */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white uppercase tracking-wider text-xs">
              Formas de Pagamento
            </h5>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setIsPixModalOpen(true)}
                className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Abrir QR Code PIX"
              >
                <QrCode className="w-3 h-3" /> PIX (-5%)
              </button>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                Visa
              </span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                Mastercard
              </span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                Elo
              </span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                Boleto Bancário
              </span>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-2.5 text-neutral-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[10px] leading-tight">
                  Checkout Seguro com Criptografia SSL & Notificação WhatsApp
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} JE Imports. Todos os direitos reservados.</p>
        </div>

      </div>
    </footer>
  );
};
