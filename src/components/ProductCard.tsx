import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/paymentUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    setSelectedProduct, 
    addToCart, 
    isInWishlist, 
    toggleWishlist,
    setIsCartOpen
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const pixPrice = product.price * 0.95; // 5% off no PIX
  const installmentValue = product.price / 12;

  const activeImage = isHovered && product.images.length > 1 
    ? product.images[1] 
    : product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const chosenSize = product.sizes[selectedSizeIndex] || product.sizes[0];
    const chosenColor = product.colors[selectedColorIndex] || product.colors[0];
    addToCart(product, chosenSize, chosenColor, 1);
    setIsCartOpen(true);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container with badges & action triggers */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        <img
          src={activeImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isSale && discountPercent > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-neutral-900 text-white rounded-md shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Novo
            </span>
          )}
          {product.stock <= 5 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-neutral-950 rounded-md shadow-sm">
              Últimas {product.stock} un.
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          id={`wishlist-btn-${product.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-neutral-700 hover:text-rose-600 hover:bg-white flex items-center justify-center transition-all shadow-md active:scale-90"
          aria-label="Adicionar aos favoritos"
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Floating Quick Action over image */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex gap-2">
          <button
            id={`quick-view-btn-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/95 backdrop-blur-md text-neutral-900 text-xs font-bold hover:bg-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Detalhes</span>
          </button>

          <button
            id={`quick-add-btn-${product.id}`}
            type="button"
            onClick={handleQuickAdd}
            className="py-2.5 px-4 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Adicionar tamanho selecionado"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Colors and gender tag */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {product.category} • {product.gender}
            </span>

            {/* Color swatches */}
            <div className="flex items-center gap-1">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColorIndex(i)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColorIndex === i 
                      ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110' 
                      : 'border-neutral-300 opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => setSelectedProduct(product)}
            className="font-semibold text-sm text-neutral-900 line-clamp-2 cursor-pointer hover:text-neutral-600 transition-colors"
          >
            {product.name}
          </h3>
        </div>

        {/* Sizes chips */}
        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-neutral-400 font-bold uppercase">Tam:</span>
          {product.sizes.map((sz, i) => (
            <button
              key={sz}
              type="button"
              onClick={() => setSelectedSizeIndex(i)}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                selectedSizeIndex === i
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Price Section */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-lg text-neutral-950">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] mt-0.5">
            <span className="text-emerald-600 font-bold">
              {formatCurrency(pixPrice)} no PIX (5% OFF)
            </span>
            <span className="text-neutral-400 hidden sm:inline">
              ou até 12x {formatCurrency(installmentValue)}
            </span>
          </div>

          {/* Mobile quick add button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="mt-3 w-full sm:hidden py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adicionar ({product.sizes[selectedSizeIndex]})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
