import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Truck, 
  Ruler, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  ArrowRight,
  CreditCard,
  QrCode
} from 'lucide-react';
import { ClothingSize, ProductColor } from '../types';
import { formatCurrency, formatCEP, calculateShippingOptions, ShippingOption } from '../utils/paymentUtils';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    isInWishlist, 
    toggleWishlist,
    setIsCartOpen,
    setIsCheckoutOpen,
    setIsSizeGuideOpen
  } = useStore();

  if (!selectedProduct) return null;

  const fallbackImage = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80';
  const images = (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [fallbackImage];
  const sizes = (selectedProduct.sizes && selectedProduct.sizes.length > 0) ? selectedProduct.sizes : (['M'] as ClothingSize[]);
  const colors = (selectedProduct.colors && selectedProduct.colors.length > 0) ? selectedProduct.colors : [{ name: 'Padrão', hex: '#111111' }];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ClothingSize>(sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(colors[0] || { name: 'Padrão', hex: '#111111' });
  const [quantity, setQuantity] = useState(1);
  const [cepInput, setCepInput] = useState('');
  const [shippingResults, setShippingResults] = useState<ShippingOption[] | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Sync state when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImageIndex(0);
      setSelectedSize(sizes[0] || 'M');
      setSelectedColor(colors[0] || { name: 'Padrão', hex: '#111111' });
      setQuantity(1);
      setShippingResults(null);
    }
  }, [selectedProduct?.id]);

  const pixPrice = (selectedProduct.price || 0) * 0.95;
  const installmentValue = (selectedProduct.price || 0) / 12;

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setIsCalculatingShipping(true);
    setTimeout(() => {
      const options = calculateShippingOptions(cleanCep, selectedProduct.price * quantity);
      setShippingResults(options);
      setIsCalculatingShipping(false);
    }, 400);
  };

  return (
    <div 
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={() => setSelectedProduct(null)}
    >
      <div 
        id="product-detail-modal-card"
        className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col md:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-detail-modal-btn"
          type="button"
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-neutral-800 hover:bg-neutral-100 flex items-center justify-center shadow-md transition-all active:scale-95"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Gallery */}
        <div className="w-full md:w-1/2 bg-neutral-100 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
          {/* Main Photo Display */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-200 shadow-inner">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={selectedProduct.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackImage;
              }}
            />
            {selectedProduct.isSale && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                OFERTA ESPECIAL
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-neutral-900 ring-2 ring-neutral-900/20 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Actions */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category, SKU & Wishlist */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {selectedProduct.category} • SKU: {selectedProduct.sku}
              </span>
              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`p-2 rounded-full border transition-all ${
                  isInWishlist(selectedProduct.id)
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
                aria-label="Favoritar"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(selectedProduct.id) ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Product Name */}
            <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-950 leading-snug">
              {selectedProduct.name}
            </h2>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-950">
                  {formatCurrency(selectedProduct.price)}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatCurrency(selectedProduct.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 pt-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <QrCode className="w-4 h-4" />
                  <span>{formatCurrency(pixPrice)} à vista no PIX (5% OFF)</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Parcelamos até 12x de {formatCurrency(installmentValue)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Material & Specs */}
            {selectedProduct.material && (
              <div className="text-xs text-neutral-500 bg-neutral-100/70 p-2.5 rounded-xl">
                <span className="font-bold text-neutral-700">Composição:</span> {selectedProduct.material}
              </div>
            )}

            {/* Color selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700">Cor: <strong>{selectedColor.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                {colors.map((color, idx) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={color.name + idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'ring-2 ring-neutral-950 ring-offset-2 scale-110' 
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 ${color.hex === '#f5f5f0' || color.hex === '#ffffff' || color.hex === '#faf7f2' ? 'text-neutral-900' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700">Tamanho: <strong>{selectedSize}</strong></span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 underline transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Guia de Medidas</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size, idx) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size + idx}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 px-3 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm scale-105'
                          : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-bold text-neutral-700">Quantidade:</span>
              <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-neutral-600 hover:bg-neutral-200 transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-xs text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  className="p-2 text-neutral-600 hover:bg-neutral-200 transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {selectedProduct.stock} peças disponíveis no estoque
              </span>
            </div>

            {/* Shipping Calculator */}
            <div className="pt-2 border-t border-neutral-100">
              <form onSubmit={handleCalculateShipping} className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Calcular frete e prazo de entrega:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite seu CEP (ex: 01310-100)"
                    value={cepInput}
                    onChange={(e) => setCepInput(formatCEP(e.target.value))}
                    maxLength={9}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="submit"
                    disabled={isCalculatingShipping}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    {isCalculatingShipping ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>
              </form>

              {shippingResults && (
                <div className="mt-3 space-y-1.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs">
                  {shippingResults.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between py-1 border-b border-neutral-100 last:border-none">
                      <div>
                        <span className="font-bold text-neutral-900">{opt.name}</span>
                        <span className="text-neutral-500 text-[11px] block">{opt.deliveryDays}</span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        {opt.price === 0 ? 'GRÁTIS' : formatCurrency(opt.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-neutral-200">
            <button
              id="detail-modal-add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar à Sacola • {formatCurrency(selectedProduct.price * quantity)}</span>
            </button>

            <button
              id="detail-modal-buy-now-btn"
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>Comprar Agora (Checkout Rápido)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
