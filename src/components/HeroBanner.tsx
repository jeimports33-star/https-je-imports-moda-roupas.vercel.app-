import React from 'react';
import { useStore } from '../context/StoreContext';
import { QrCode, CreditCard, Truck, ArrowUpRight, Flame, MessageCircle, ShieldCheck } from 'lucide-react';
import { STORE_WHATSAPP_DISPLAY, STORE_WHATSAPP_NUMBER } from '../utils/paymentUtils';
import { JeLogo } from './JeLogo';

export const HeroBanner: React.FC = () => {
  const { setFilters } = useStore();
  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá, JE Imports! Gostaria de consultar as roupas e novidades do catálogo.')}`;

  return (
    <section id="hero-banner" className="relative overflow-hidden bg-neutral-950 text-white border-b border-neutral-800">
      
      {/* Background with Store Logo Watermark & Luxury Radial Gradients (No model photo) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient golden lighting halos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#DFBA73]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#DFBA73]/5 blur-3xl" />
        
        {/* Giant Watermarked Lion Logo Emblem in the background */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.07] lg:opacity-[0.12] w-[450px] sm:w-[600px] lg:w-[720px] aspect-square flex items-center justify-center select-none pointer-events-none">
          <JeLogo size="2xl" showText={false} className="scale-[2.8] sm:scale-[3.5] lg:scale-[4.2]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFBA73]/15 border border-[#DFBA73]/30 text-[#DFBA73] text-xs font-bold tracking-wide uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>Coleção Nova Temporada // Streetwear & Techwear</span>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Pedidos no WhatsApp: {STORE_WHATSAPP_DISPLAY}</span>
              </a>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white">
              VISTA SUA AUTENTICIDADE COM O MELHOR DO STREETWEAR.
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xl">
              Peças exclusivas com tecidos pesados premium, acabamentos industriais e modelagens oversized autênticas. Escolha seus produtos, finalize e envie o pedido diretamente para o nosso WhatsApp!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-explore-btn"
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-neutral-950 font-bold text-sm hover:bg-neutral-100 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                id="hero-sale-btn"
                type="button"
                onClick={() => {
                  setFilters(prev => ({ ...prev, onlySale: true, category: 'todos' }));
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-700 transition-all cursor-pointer"
              >
                <span>Ofertas & Promoções</span>
              </button>
            </div>
          </div>

          {/* Right Column: Prominent Store Logo Showcase Card (Replacing background woman photo) */}
          <div className="lg:col-span-5 flex justify-center">
            <div 
              id="hero-store-logo-card"
              className="relative w-full max-w-sm sm:max-w-md p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 border border-[#DFBA73]/30 shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-6 group hover:border-[#DFBA73]/50 transition-all duration-300"
            >
              {/* Subtle gold glow behind the emblem */}
              <div className="absolute inset-0 bg-[#DFBA73]/5 rounded-3xl blur-xl group-hover:bg-[#DFBA73]/10 transition-all" />

              {/* The Official Store Crowned Lion Logo */}
              <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                <JeLogo size="2xl" showText={false} className="drop-shadow-[0_10px_20px_rgba(223,186,115,0.25)]" />
              </div>

              {/* Brand Typography */}
              <div className="relative space-y-1">
                <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  JE <span className="text-[#DFBA73]">IMPORTS</span>
                </h2>
                <p className="text-xs font-bold tracking-[0.25em] text-[#DFBA73]/90 uppercase">
                  Streetwear & Heavyweight
                </p>
              </div>

              {/* Trust Pill Bar */}
              <div className="relative w-full pt-4 border-t border-neutral-800/80 flex items-center justify-around text-[11px] text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Confiável
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                <span className="text-white font-semibold">
                  Envio para Todo Brasil
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature badges row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 pt-8 border-t border-neutral-800/80">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">5% OFF no PIX</p>
              <p className="text-[11px] text-neutral-400">Aprovação imediata</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-[#DFBA73]/15 text-[#DFBA73] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Envio no WhatsApp</p>
              <p className="text-[11px] text-neutral-400">{STORE_WHATSAPP_DISPLAY}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Frete Grátis Brasil</p>
              <p className="text-[11px] text-neutral-400">Pedidos acima de R$ 250</p>
            </div>
          </div>

          {/* Card Installments: Parcelamos até 12 vezes */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Cartão de Crédito</p>
              <p className="text-[11px] text-[#DFBA73] font-semibold">Parcelamos até 12 vezes</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
