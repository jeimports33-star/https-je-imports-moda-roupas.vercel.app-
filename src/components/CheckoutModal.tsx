import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Lock,
  Printer,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  MapPin,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CustomerInfo, 
  PaymentType, 
  Order 
} from '../types';
import { PixQrCode } from './PixQrCode';
import { 
  formatCurrency, 
  formatPhone, 
  buildPixEMVPayload,
  OFFICIAL_PIX_CODE,
  OFFICIAL_PIX_BENEFICIARY,
  OFFICIAL_PIX_KEY,
  OFFICIAL_PIX_CITY,
  OFFICIAL_PIX_QR_CODE_URL,
  STORE_WHATSAPP_NUMBER,
  STORE_WHATSAPP_DISPLAY,
  buildWhatsAppOrderMessage,
  openWhatsAppOrderUrl,
  copyToClipboard
} from '../utils/paymentUtils';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    discountAmount, 
    createOrder, 
    clearCart,
    setIsOrdersOpen,
    showToast
  } = useStore();

  if (!isCheckoutOpen) return null;

  // Checkout Steps: 'info' (Nome, Telefone, Endereço) -> 'payment' (PIX ou Débito/Crédito) -> 'confirmation' (Confirmação & WhatsApp)
  const [step, setStep] = useState<'info' | 'payment' | 'confirmation'>('info');
  
  // Customer Form State - Simple: Nome, Telefone, Endereço
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'João Victor Silva',
    phone: '(79) 99876-5432',
    address: {
      street: 'Avenida Beira Mar, 1200, Apt 302 - Bairro 13 de Julho, Aracaju - SE',
    },
  });

  // Optional customer note
  const [customerNote, setCustomerNote] = useState('');

  // Payment Selection: 'pix' or 'card'
  const [paymentType, setPaymentType] = useState<'pix' | 'card'>('pix');
  // Card sub-type: 'debito' or 'credito'
  const [cardMode, setCardMode] = useState<'credito' | 'debito'>('credito');
  const [cardInstallments, setCardInstallments] = useState<number>(1);

  // Processing simulation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('');
  
  // Completed Order
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Pix timer & copy feedback
  const [pixTimeLeft, setPixTimeLeft] = useState(900); // 15 min
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Financial Calculations - Sem frete
  const baseTotal = Math.max(0, cartSubtotal - discountAmount);
  // Pix has 5% additional discount
  const pixDiscount = paymentType === 'pix' ? baseTotal * 0.05 : 0;
  const finalTotal = baseTotal - pixDiscount;

  // Pix countdown timer
  useEffect(() => {
    if (step === 'payment' && paymentType === 'pix' && pixTimeLeft > 0) {
      const timer = setInterval(() => {
        setPixTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, paymentType, pixTimeLeft]);

  // Validates simple fields: Nome, Telefone, Endereço
  const validateCustomerFields = (): boolean => {
    if (!customer.name.trim()) {
      showToast('Por favor, informe seu nome completo.', 'error');
      return false;
    }
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 8) {
      showToast('Por favor, informe seu telefone ou WhatsApp com DDD.', 'error');
      return false;
    }
    if (!customer.address.street.trim()) {
      showToast('Por favor, informe seu endereço de entrega.', 'error');
      return false;
    }
    return true;
  };

  const handleCopyPix = async (pixCode: string) => {
    await copyToClipboard(pixCode);
    setCopiedPix(true);
    showToast('Código PIX Copia e Cola copiado com sucesso!', 'success');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyOrderText = async () => {
    if (!completedOrder) return;
    const msg = buildWhatsAppOrderMessage({
      id: completedOrder.id,
      customer: completedOrder.customer,
      items: completedOrder.items,
      subtotal: completedOrder.subtotal,
      shipping: 0,
      discount: completedOrder.discount,
      total: completedOrder.total,
      paymentMethod: completedOrder.paymentMethod,
      customerNote: completedOrder.customerNote,
    });
    await copyToClipboard(msg);
    setCopiedMessage(true);
    showToast('Texto do pedido copiado!', 'success');
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  // Complete Transaction and forward to WhatsApp
  const completeTransaction = (
    simulatedPaymentDetails: any, 
    status: Order['status'],
    chosenPayment: PaymentType = (paymentType === 'pix' ? 'pix' : (cardMode === 'credito' ? 'credit_card' : 'debit_card'))
  ) => {
    const isPix = chosenPayment === 'pix';
    const disc = discountAmount + (isPix ? baseTotal * 0.05 : 0);
    const tot = baseTotal - (isPix ? baseTotal * 0.05 : 0);

    const newOrder = createOrder({
      items: [...cart],
      customer,
      paymentMethod: chosenPayment,
      paymentDetails: simulatedPaymentDetails,
      subtotal: cartSubtotal,
      discount: disc,
      shipping: 0,
      total: tot,
      status,
      customerNote: customerNote.trim() || undefined,
      whatsappSent: true,
    });

    setCompletedOrder(newOrder);
    setStep('confirmation');
    clearCart();

    // Open WhatsApp directly with formatted message
    try {
      const whatsappUrl = openWhatsAppOrderUrl({
        id: newOrder.id,
        customer: newOrder.customer,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        shipping: 0,
        discount: newOrder.discount,
        total: newOrder.total,
        paymentMethod: chosenPayment,
        customerNote: customerNote.trim() || undefined,
      });

      window.open(whatsappUrl, '_blank');
      showToast(`Pedido registrado e enviado para o WhatsApp ${STORE_WHATSAPP_DISPLAY}!`, 'success');
    } catch (e) {
      console.error('Error opening WhatsApp:', e);
    }

    // Festive confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#dfba73', '#171717', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Direct WhatsApp order right from step 1
  const handleDirectWhatsAppCheckout = () => {
    if (!validateCustomerFields()) return;
    completeTransaction({
      pixCode: OFFICIAL_PIX_CODE,
      pixQrCodeUrl: OFFICIAL_PIX_QR_CODE_URL,
    }, 'pendente', 'pix');
  };

  // Proceed to Payment selection
  const handleProceedToPayment = () => {
    if (!validateCustomerFields()) return;
    setStep('payment');
  };

  // Payment Confirmation
  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setPaymentStepText('Processando pedido...');

    if (paymentType === 'pix') {
      setTimeout(() => {
        setPaymentStepText(`Pedido confirmado! Abrindo WhatsApp ${STORE_WHATSAPP_DISPLAY}...`);
        setIsProcessingPayment(false);
        completeTransaction({
          pixCode: OFFICIAL_PIX_CODE,
          pixQrCodeUrl: OFFICIAL_PIX_QR_CODE_URL,
        }, 'aprovado', 'pix');
      }, 1000);
    } else {
      // Cartão Débito ou Crédito
      const chosenMethod: PaymentType = cardMode === 'credito' ? 'credit_card' : 'debit_card';
      setTimeout(() => {
        setPaymentStepText(`Registrando opção de ${cardMode === 'credito' ? 'Crédito' : 'Débito'}...`);
      }, 500);

      setTimeout(() => {
        setPaymentStepText(`Pedido confirmado! Abrindo WhatsApp ${STORE_WHATSAPP_DISPLAY}...`);
        setIsProcessingPayment(false);
        completeTransaction({
          cardBrand: cardMode === 'credito' ? 'Cartão de Crédito' : 'Cartão de Débito',
          installments: cardMode === 'credito' ? cardInstallments : 1,
        }, 'pendente', chosenMethod);
      }, 1100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6"
    >
      <div 
        id="checkout-modal-container"
        className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[94vh]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DFBA73] text-neutral-950 flex items-center justify-center font-black text-sm">
              JE
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>Finalizar Pedido • JE Imports</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>WhatsApp: {STORE_WHATSAPP_DISPLAY}</span>
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Checkout Simplificado • Envio direto para o WhatsApp da loja</span>
              </p>
            </div>
          </div>

          {step !== 'confirmation' && (
            <button
              id="close-checkout-modal-btn"
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Tracker */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-center gap-3 sm:gap-8 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 'info' ? 'text-neutral-950 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'info' ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
              1
            </span>
            <span>Dados (Nome, Telefone, Endereço)</span>
          </div>

          <div className="w-8 h-px bg-neutral-300" />

          <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-neutral-950 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
              2
            </span>
            <span>Pagamento (PIX ou Cartão)</span>
          </div>

          <div className="w-8 h-px bg-neutral-300" />

          <div className={`flex items-center gap-1.5 ${step === 'confirmation' ? 'text-emerald-600 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
              3
            </span>
            <span>Confirmação & WhatsApp</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: INFO SIMPLIFICADA (NOME, TELEFONE, ENDEREÇO) */}
          {step === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Simple Customer Form */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Banner Direct WhatsApp */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-950">
                      Finalização Rápida via WhatsApp
                    </p>
                    <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                      Preencha apenas seu <strong>nome</strong>, <strong>telefone</strong> e <strong>endereço</strong>. Seu pedido será encaminhado diretamente ao nosso vendedor oficial no WhatsApp <strong>{STORE_WHATSAPP_DISPLAY}</strong> para confirmação e envio rápido.
                    </p>
                  </div>
                </div>

                {/* Form Fields: nome, telefone, endereço */}
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4">
                  <h3 className="font-bold text-sm text-neutral-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                    Dados do Pedido
                  </h3>

                  {/* 1. Nome */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                      1. Nome Completo *
                    </label>
                    <input
                      id="checkout-input-name"
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      placeholder="Ex: João Victor da Silva"
                    />
                  </div>

                  {/* 2. Telefone */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5 flex items-center justify-between">
                      <span>2. Telefone / WhatsApp com DDD *</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Contato direto</span>
                    </label>
                    <input
                      id="checkout-input-phone"
                      type="text"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })}
                      maxLength={15}
                      className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-medium"
                      placeholder="Ex: (79) 99876-5432"
                    />
                  </div>

                  {/* 3. Endereço */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                      <span>3. Endereço Completo de Entrega *</span>
                    </label>
                    <textarea
                      id="checkout-input-address"
                      required
                      rows={3}
                      value={customer.address.street}
                      onChange={(e) => setCustomer({
                        ...customer,
                        address: { ...customer.address, street: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 leading-relaxed"
                      placeholder="Ex: Rua das Flores, Nº 120, Apto 302 - Bairro Centro, Aracaju - SE (Ponto de referência: Próximo à praça central)"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Informe rua, número, complemento, bairro e cidade para entrega das peças.
                    </p>
                  </div>

                  {/* Observações Opcionais */}
                  <div className="pt-2 border-t border-neutral-200">
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Observação para o pedido (Opcional):
                    </label>
                    <input
                      type="text"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="Ex: Deixar na portaria com o porteiro"
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary & Action Buttons */}
              <div className="lg:col-span-5 bg-neutral-50 p-5 rounded-3xl border border-neutral-200 flex flex-col justify-between h-fit space-y-5">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-neutral-900 flex items-center justify-between">
                    <span>Resumo do Pedido</span>
                    <span className="text-xs text-neutral-500 font-normal">
                      {cart.reduce((a, b) => a + b.quantity, 0)} itens
                    </span>
                  </h4>

                  {/* Items mini list */}
                  <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                    {(cart || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-xs bg-white p-2.5 rounded-xl border border-neutral-200">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80'}
                          alt={item.product?.name || 'Produto'}
                          className="w-12 h-14 object-cover rounded-lg border border-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{item.product?.name || 'Produto'}</p>
                          <p className="text-[11px] text-neutral-500">
                            {item.quantity}x Tam: <strong>{item.selectedSize || 'M'}</strong> • Cor: {item.selectedColor?.name || 'Padrão'}
                          </p>
                        </div>
                        <span className="font-bold text-neutral-900 shrink-0">
                          {formatCurrency((item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing breakdown (Sem Frete) */}
                  <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Subtotal dos produtos:</span>
                      <span className="font-semibold text-neutral-900">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Desconto de cupom:</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                      <span className="font-bold text-neutral-950 text-sm">Total a Pagar:</span>
                      <span className="font-display font-extrabold text-xl text-neutral-950">
                        {formatCurrency(baseTotal)}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>5% de desconto extra no PIX: <strong>{formatCurrency(baseTotal * 0.95)}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    id="checkout-goto-payment-btn"
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                  >
                    <span>Prosseguir para Pagamento (PIX ou Cartão)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="checkout-direct-whatsapp-btn"
                    type="button"
                    onClick={handleDirectWhatsAppCheckout}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                    title={`Enviar pedido diretamente para o WhatsApp ${STORE_WHATSAPP_DISPLAY}`}
                  >
                    <MessageCircle className="w-4 h-4 fill-white/20" />
                    <span>Enviar Direto para o WhatsApp</span>
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Atendimento oficial: {STORE_WHATSAPP_DISPLAY}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: FORMA DE PAGAMENTO (PIX OU CARTÃO DÉBITO/CRÉDITO) */}
          {step === 'payment' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Payment Method Selector Tabs: Apenas PIX e Cartão */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-100 rounded-2xl">
                <button
                  id="payment-tab-pix"
                  type="button"
                  onClick={() => setPaymentType('pix')}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                    paymentType === 'pix'
                      ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-500/20'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>PIX Instantâneo</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full">
                    5% OFF
                  </span>
                </button>

                <button
                  id="payment-tab-card"
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                    paymentType === 'card'
                      ? 'bg-white text-neutral-950 shadow-md'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão (Débito ou Crédito)</span>
                </button>
              </div>

              {/* Total Banner */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">Total a pagar:</span>
                  <span className="font-display font-black text-2xl text-neutral-950">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
                {paymentType === 'pix' && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                      Economia de {formatCurrency(pixDiscount)} no PIX
                    </span>
                  </div>
                )}
              </div>

              {/* 1. SEÇÃO DO PIX COM O QR CODE E CÓDIGO OFICIAL */}
              {paymentType === 'pix' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expira em: {formatTime(pixTimeLeft)}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Escaneie pelo app do banco ou copie o código
                    </span>
                  </div>

                  <PixQrCode
                    code={buildPixEMVPayload({
                      key: OFFICIAL_PIX_KEY,
                      name: OFFICIAL_PIX_BENEFICIARY,
                      city: OFFICIAL_PIX_CITY,
                      amount: finalTotal,
                      txid: '***',
                    })}
                    amount={finalTotal}
                    beneficiary={OFFICIAL_PIX_BENEFICIARY}
                    pixKey={OFFICIAL_PIX_KEY}
                    city={OFFICIAL_PIX_CITY}
                  />
                </div>
              )}

              {/* 2. SEÇÃO DO CARTÃO (BOTÃO PARA SELECIONAR DÉBITO OU CRÉDITO) */}
              {paymentType === 'card' && (
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-display font-bold text-base text-neutral-900">
                      Escolha a Modalidade do Cartão
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Selecione se deseja pagar no <strong>Débito</strong> ou <strong>Crédito</strong>. Não é necessário digitar dados confidenciais do cartão no site!
                    </p>
                  </div>

                  {/* Botões de Seleção: Débito ou Crédito */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCardMode('credito')}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all ${
                        cardMode === 'credito'
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <span className="font-bold text-sm block">Cartão de Crédito</span>
                        <span className={`text-[11px] block mt-0.5 ${cardMode === 'credito' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          À vista ou até 12x
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardMode('debito')}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all ${
                        cardMode === 'debito'
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <span className="font-bold text-sm block">Cartão de Débito</span>
                        <span className={`text-[11px] block mt-0.5 ${cardMode === 'debito' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Cobrança à vista
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Opção de Parcelamento se for Crédito */}
                  {cardMode === 'credito' && (
                    <div className="pt-3 border-t border-neutral-100 space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Selecione as Parcelas (Crédito):
                      </label>
                      <select
                        value={cardInstallments}
                        onChange={(e) => setCardInstallments(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((n) => (
                          <option key={n} value={n}>
                            {n}x de {formatCurrency(finalTotal / n)} {n === 1 ? '(à vista)' : 'sem juros'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Informação sobre o pagamento do cartão */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Como funciona o pagamento com cartão:</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-850">
                      O pagamento com cartão ({cardMode === 'credito' ? 'Crédito' : 'Débito'}) será efetuado na entrega das peças através da <strong>maquininha de cartão</strong> ou via <strong>link de pagamento seguro</strong> enviado pelo vendedor no WhatsApp oficial.
                    </p>
                  </div>
                </div>
              )}

              {/* Botões de Navegação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-4 py-3 text-xs font-bold text-neutral-600 hover:text-neutral-950 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar aos dados de entrega</span>
                </button>

                <button
                  id="submit-payment-btn"
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleProcessPayment}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{paymentStepText}</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 fill-white/20" />
                      <span>
                        Confirmar e Enviar para WhatsApp ({STORE_WHATSAPP_DISPLAY})
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION & WHATSAPP RECEIPT (DEIXADO COMO ESTÁ) */}
          {step === 'confirmation' && completedOrder && (
            <div className="max-w-2xl mx-auto space-y-6 text-center py-4">
              
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                  Pedido Registrado com Sucesso!
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-neutral-950">
                  Pedido #{completedOrder.id}
                </h3>
              </div>

              {/* Big WhatsApp Confirmation Card */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500/40 rounded-3xl text-left space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-6 h-6 fill-white/20" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">
                      Pedido Enviado para o WhatsApp da Loja
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Número: <strong>{STORE_WHATSAPP_DISPLAY}</strong>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed">
                  O pedido com sua lista de roupas, dados do cliente e endereço foi formatado e enviado diretamente para o WhatsApp do vendedor para confirmação de estoque e despacho imediato.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={openWhatsAppOrderUrl(completedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Conversa no WhatsApp Novamente</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyOrderText}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                  >
                    {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-neutral-600" />}
                    <span>{copiedMessage ? 'Copiado!' : 'Copiar Texto do Pedido'}</span>
                  </button>
                </div>
              </div>

              {/* If PIX was selected, show QR Code & code right here for easy payment */}
              {completedOrder.paymentMethod === 'pix' && (
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between px-2">
                    <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Pague via PIX com 5% de Desconto</span>
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {formatCurrency(completedOrder.total)}
                    </span>
                  </div>

                  <PixQrCode
                    code={completedOrder.paymentDetails?.pixCode || OFFICIAL_PIX_CODE}
                    amount={completedOrder.total}
                    beneficiary={OFFICIAL_PIX_BENEFICIARY}
                    pixKey={OFFICIAL_PIX_KEY}
                    city={OFFICIAL_PIX_CITY}
                  />
                </div>
              )}

              {/* Status and Tracking Card */}
              <div className="bg-neutral-50 p-5 rounded-3xl border border-neutral-200 text-left space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Forma de Pagamento:</span>
                    <span className="font-bold text-xs uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                      {completedOrder.paymentMethod === 'pix' ? 'PIX Instantâneo' : (completedOrder.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'Cartão de Débito')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Código de Rastreamento / Envio:</span>
                    <span className="font-mono font-bold text-xs text-neutral-900 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
                      {completedOrder.trackingCode}
                    </span>
                  </div>
                </div>

                {/* Shipping info */}
                <div className="text-xs text-neutral-600 space-y-1">
                  <p className="font-bold text-neutral-900">Endereço de Entrega:</p>
                  <p>
                    {completedOrder.customer.name} • {completedOrder.customer.phone}
                  </p>
                  <p>
                    {completedOrder.customer.address.street}
                  </p>
                </div>

                {/* Items summary */}
                <div className="pt-3 border-t border-neutral-200">
                  <p className="font-bold text-xs text-neutral-900 mb-2">Peças do Pedido:</p>
                  <div className="space-y-2">
                    {(completedOrder.items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span>
                          {item.quantity}x {item.product?.name || 'Produto'} ({item.selectedSize || 'M'}, {item.selectedColor?.name || 'Padrão'})
                        </span>
                        <span className="font-bold text-neutral-900">
                          {formatCurrency((item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total amount */}
                <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between">
                  <span className="font-bold text-xs text-neutral-900">Valor Total do Pedido:</span>
                  <span className="font-display font-black text-xl text-emerald-600">
                    {formatCurrency(completedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Pedido</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsOrdersOpen(true);
                  }}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <span>Ver Meus Pedidos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continuar Comprando</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
