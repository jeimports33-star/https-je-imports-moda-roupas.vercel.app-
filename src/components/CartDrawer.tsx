import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  Sparkles,
  Check,
  QrCode
} from 'lucide-react';
import { formatCurrency } from '../utils/paymentUtils';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    setIsCheckoutOpen
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 250;
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const totalWithDiscount = Math.max(0, cartSubtotal - discountAmount);
  const pixEstimatedTotal = totalWithDiscount * 0.95;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError(null);
      setCouponCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex justify-end"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        id="cart-drawer-content"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h2 className="font-display font-bold text-lg text-neutral-950">
              Sua Sacola ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            id="close-cart-drawer-btn"
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-neutral-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              {missingForFreeShipping === 0 ? (
                <strong className="text-emerald-600">Parabéns! Você ganhou Frete Grátis!</strong>
              ) : (
                <span>Faltam <strong>{formatCurrency(missingForFreeShipping)}</strong> para Frete Grátis</span>
              )}
            </span>
            <span className="text-neutral-500 font-bold">{freeShippingPercent}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                missingForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-neutral-900'
              }`}
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-neutral-800">Sua sacola está vazia</p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Navegue pelas nossas roupas exclusivas e monte seu look autêntico.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
              >
                Explorar Roupas
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-3.5 pb-4 border-b border-neutral-100 last:border-none"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80'}
                      alt={item.product?.name || 'Produto'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info & Quantity controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">
                          {item.product?.name || 'Produto'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                        <span className="font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                          Tam: {item.selectedSize || 'M'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                            style={{ backgroundColor: item.selectedColor?.hex || '#111' }}
                          />
                          {item.selectedColor?.name || 'Padrão'}
                        </span>
                      </div>
                    </div>

                    {/* Price and quantity row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-neutral-600 hover:bg-neutral-200 transition-colors rounded-l"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-neutral-600 hover:bg-neutral-200 transition-colors rounded-r"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-display font-bold text-sm text-neutral-950">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-neutral-400 hover:text-rose-600 transition-colors underline pt-2"
              >
                Esvaziar toda a sacola
              </button>
            </>
          )}
        </div>

        {/* Footer with Coupon, Subtotal and Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 space-y-3.5">
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      Cupom <strong>{appliedCoupon.code}</strong> aplicado (-{formatCurrency(discountAmount)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-950 font-bold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupom de desconto (ex: JE10)"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 uppercase font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                  {/* Quick coupon buttons */}
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 pt-0.5">
                    <span>Experimente:</span>
                    <button
                      type="button"
                      onClick={() => applyCoupon('JE10')}
                      className="text-neutral-700 underline font-bold hover:text-neutral-950"
                    >
                      JE10
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => applyCoupon('BEMVINDO')}
                      className="text-neutral-700 underline font-bold hover:text-neutral-950"
                    >
                      BEMVINDO
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal dos produtos:</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto cupom ({appliedCoupon?.code}):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete:</span>
                <span className="font-semibold text-neutral-900">
                  {missingForFreeShipping === 0 ? (
                    <span className="text-emerald-600 font-bold">GRÁTIS</span>
                  ) : (
                    'Calculado no checkout'
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-neutral-900">Total Previsto:</span>
                <div className="text-right">
                  <span className="font-display font-black text-lg text-neutral-950 block">
                    {formatCurrency(totalWithDiscount)}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                    <QrCode className="w-3 h-3" />
                    ou {formatCurrency(pixEstimatedTotal)} no PIX (5% OFF)
                  </span>
                </div>
              </div>
            </div>

            {/* Finalize Button */}
            <button
              id="cart-proceed-checkout-btn"
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
            >
              <span>Finalizar Compra / Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
