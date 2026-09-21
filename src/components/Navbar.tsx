import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Package, 
  Settings2, 
  Sparkles, 
  X,
  Menu,
  MessageCircle,
  Phone,
  Lock,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { ClothingCategory } from '../types';
import { formatCurrency, STORE_WHATSAPP_DISPLAY, STORE_WHATSAPP_NUMBER } from '../utils/paymentUtils';
import { JeLogo } from './JeLogo';

const CATEGORIES: { id: ClothingCategory; label: string }[] = [
  { id: 'todos', label: 'Ver Todos' },
  { id: 'camisetas', label: 'Camisetas' },
  { id: 'casacos', label: 'Casacos & Jaquetas' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'calcas', label: 'Calças & Shorts' },
  { id: 'vestidos', label: 'Vestidos' },
  { id: 'calcados', label: 'Sneakers & Calçados' },
  { id: 'acessorios', label: 'Acessórios' },
];

export const Navbar: React.FC = () => {
  const { 
    cartTotalCount, 
    cartSubtotal,
    setIsCartOpen, 
    wishlist, 
    orders, 
    activeOrdersCount,
    deliveredOrdersCount,
    setIsOrdersOpen, 
    isAdminOpen,
    setIsAdminOpen,
    isAdminAuthenticated,
    filters,
    setFilters,
    setIsPixModalOpen
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleCategoryClick = (category: ClothingCategory) => {
    setFilters(prev => ({ ...prev, category }));
    setIsMobileMenuOpen(false);
  };

  const whatsappDirectUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá, JE Imports! Gostaria de informações sobre as roupas do catálogo.')}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top promotional bar */}
      <div 
        id="top-promobar"
        className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-between overflow-x-auto whitespace-nowrap"
      >
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5 text-[#DFBA73] shrink-0" />
          <span>Cupom <strong>JE10</strong> (10% OFF) • <strong>5% de Desconto extra no PIX</strong> • Frete Grátis acima de R$ 250</span>
        </div>

        <a 
          href={whatsappDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold ml-4 shrink-0 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp da Loja: {STORE_WHATSAPP_DISPLAY}</span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile menu trigger & Brand Logo with Lion Crest */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-button"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-neutral-700 hover:text-neutral-950 md:hidden focus:outline-none"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a 
              href="#" 
              id="brand-logo"
              className="flex items-center group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setFilters(prev => ({ ...prev, category: 'todos', search: '' }));
              }}
              title="JE Imports - Início"
            >
              <JeLogo size="md" showSubtitle={true} textColor="dark" />
            </a>
          </div>

          {/* Search bar on desktop */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
            id="search-form"
          >
            <input
              id="search-input"
              type="text"
              placeholder="Buscar camisetas, jaquetas, tênis, tamanhos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white text-xs text-neutral-900 placeholder:text-neutral-500 rounded-full border border-neutral-200 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setFilters(prev => ({ ...prev, search: '' }));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* WhatsApp Store Direct Link */}
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200 shadow-2xs"
              title={`Atendimento no WhatsApp: ${STORE_WHATSAPP_DISPLAY}`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>{STORE_WHATSAPP_DISPLAY}</span>
            </a>

            {/* Dynamic Catalog Management Admin Button with password indicator */}
            <button
              id="admin-catalog-button"
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full transition-all shadow-xs active:scale-95 ${
                isAdminAuthenticated
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white border border-emerald-500/50'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
              title={isAdminAuthenticated ? "Painel do Administrador (Liberado)" : "Gerenciar Catálogo (Requer Senha de Admin)"}
            >
              {isAdminAuthenticated ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#DFBA73]" />
              )}
              <span className="hidden sm:inline">Gerenciar Catálogo</span>
            </button>

            {/* Direct PIX QR Code Quick Access */}
            <button
              id="pix-qr-code-header-button"
              type="button"
              onClick={() => setIsPixModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
              title="Ver QR Code PIX e Chave Oficial para Pagamento"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">QR Code PIX</span>
            </button>

            {/* Orders button */}
            <button
              id="orders-history-button"
              type="button"
              onClick={() => setIsOrdersOpen(true)}
              className="relative p-2.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-1.5"
              title={
                activeOrdersCount > 0 
                  ? `${activeOrdersCount} pedido(s) em andamento - Ver Meus Pedidos` 
                  : deliveredOrdersCount > 0 
                    ? 'Todos os pedidos foram entregues! Ver Meus Pedidos e Comprovantes' 
                    : 'Meus Pedidos e Comprovantes'
              }
              aria-label="Meus Pedidos e Comprovantes"
            >
              <div className="relative">
                <Package className="w-5 h-5" />
                {/* O número acima da caixa só aparece enquanto o pedido estiver em andamento. Quando entregue, o número some! */}
                {activeOrdersCount > 0 && (
                  <span 
                    id="orders-pending-count-badge"
                    className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse"
                  >
                    {activeOrdersCount}
                  </span>
                )}
                {/* Quando entrega feita, o número sumiu e é exibido o selo verde de entrega confirmada */}
                {activeOrdersCount === 0 && deliveredOrdersCount > 0 && (
                  <span 
                    id="orders-delivered-check-badge"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs"
                    title="Entrega Feita!"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Tag de confirmação 'Entregue' quando não há mais pendências */}
              {activeOrdersCount === 0 && deliveredOrdersCount > 0 && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Entregue
                </span>
              )}
            </button>

            {/* Wishlist button */}
            <button
              id="wishlist-button"
              type="button"
              onClick={() => {
                if (wishlist.length > 0) {
                  setFilters(prev => ({ ...prev, category: 'todos' }));
                }
              }}
              className="relative p-2.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
              title="Favoritos"
              aria-label="Favoritos"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart button */}
            <button
              id="cart-drawer-trigger"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 pl-3 pr-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-sm active:scale-95"
              aria-label="Abrir carrinho de compras"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-white" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-neutral-950 text-[#DFBA73] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {cartTotalCount > 0 ? formatCurrency(cartSubtotal) : 'Sacola'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Buscar roupas no catálogo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-neutral-100 text-xs rounded-full border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Desktop category navigation */}
        <nav 
          id="category-navigation"
          className="hidden md:flex items-center space-x-1 border-t border-neutral-100 py-2.5 overflow-x-auto"
        >
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-nav-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Categorias de Roupas</p>
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-600 flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{STORE_WHATSAPP_DISPLAY}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-bold ${
                  filters.category === cat.id ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsPixModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Ver QR Code PIX da Loja</span>
            </button>
            <button
              onClick={() => {
                setIsAdminOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-xl bg-neutral-900 text-white shadow-xs"
            >
              <div className="flex items-center gap-2">
                {isAdminAuthenticated ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <Lock className="w-4 h-4 text-[#DFBA73]" />
                )}
                <span>Gerenciar Catálogo & Estoque</span>
              </div>
              <span className="text-[10px] text-[#DFBA73] font-mono bg-neutral-800 px-2 py-0.5 rounded-full">
                {isAdminAuthenticated ? 'LIBERADO' : 'SENHA'}
              </span>
            </button>
            <button
              onClick={() => {
                setIsOrdersOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-xl bg-neutral-100 text-neutral-800"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-600" />
                <span>Meus Pedidos & Comprovantes</span>
              </div>
              {activeOrdersCount > 0 ? (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {activeOrdersCount} em andamento
                </span>
              ) : deliveredOrdersCount > 0 ? (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Entregue
                </span>
              ) : (
                <span className="text-neutral-400 text-[10px]">0</span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
