import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  CreditCard, 
  FileText, 
  ArrowRight,
  Printer,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../utils/paymentUtils';
import { Order } from '../types';

export const OrdersModal: React.FC = () => {
  const { isOrdersOpen, setIsOrdersOpen, orders, updateOrderStatus } = useStore();

  if (!isOrdersOpen) return null;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pagamento Confirmado
          </span>
        );
      case 'em_andamento':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Em Andamento
          </span>
        );
      case 'em_separacao':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            <Package className="w-3.5 h-3.5" />
            Em Separação no Estoque
          </span>
        );
      case 'enviado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5" />
            A Caminho (Em Rota)
          </span>
        );
      case 'entregue':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            Entrega Feita (Entregue)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Aguardando Confirmação
          </span>
        );
    }
  };

  const advanceOrderStatus = (order: Order) => {
    const sequence: Order['status'][] = ['pendente', 'aprovado', 'em_separacao', 'enviado', 'entregue'];
    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex < sequence.length - 1) {
      updateOrderStatus(order.id, sequence[currentIndex + 1]);
    }
  };

  return (
    <div 
      id="orders-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6"
    >
      <div 
        id="orders-modal-container"
        className="relative bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Package className="w-5 h-5 text-neutral-200" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-neutral-950">
                Meus Pedidos & Comprovantes
              </h2>
              <p className="text-[11px] text-neutral-500">
                Histórico de compras e rastreamento em tempo real
              </p>
            </div>
          </div>

          <button
            id="close-orders-modal-btn"
            type="button"
            onClick={() => setIsOrdersOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-800 text-sm">Nenhum pedido realizado ainda</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Assim que você finalizar sua primeira compra no carrinho, o comprovante e o código de rastreamento aparecerão aqui!
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id}
                className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors space-y-3.5"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm text-neutral-950">
                        Pedido #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Realizado em {new Date(order.date).toLocaleDateString('pt-BR')} às {new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-display font-black text-base text-neutral-950 block">
                      {formatCurrency(order.total)}
                    </span>
                    <span className="text-[11px] text-neutral-500 flex items-center justify-end gap-1 capitalize">
                      {order.paymentMethod === 'pix' && <QrCode className="w-3 h-3 text-emerald-600" />}
                      {order.paymentMethod === 'credit_card' && <CreditCard className="w-3 h-3 text-sky-600" />}
                      {order.paymentMethod === 'boleto' && <FileText className="w-3 h-3 text-amber-600" />}
                      {order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : order.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Status Callout Banner */}
                {order.status === 'entregue' ? (
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="text-xs">
                      <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <span>Entrega Feita com Sucesso!</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">100% Concluído</span>
                      </p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Pedido entregue ao destinatário. O número de pendências acima do ícone de pedidos foi removido.
                      </p>
                    </div>
                  </div>
                ) : order.status === 'em_andamento' ? (
                  <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-extrabold text-blue-900">Pedido Em Andamento</p>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        A equipe da JE Imports está preparando suas peças para entrega expressa.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Status Timeline Visualizer */}
                <div className="bg-white p-3 rounded-xl border border-neutral-200">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-neutral-800">1. Pedido Criado</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        order.status === 'em_andamento' || order.status === 'em_separacao' || order.status === 'enviado' || order.status === 'entregue'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span className={order.status === 'em_andamento' ? 'text-blue-700 font-extrabold' : 'text-neutral-600'}>
                        2. Em Andamento
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        order.status === 'entregue'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className={order.status === 'entregue' ? 'text-emerald-700 font-extrabold' : 'text-neutral-400'}>
                        3. Entrega Feita
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking & Carrier */}
                {order.trackingCode && (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-500" />
                      <span>Rastreio Correios: <strong className="font-mono">{order.trackingCode}</strong></span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Status atual: <strong className="capitalize">{order.status === 'entregue' ? 'Entregue' : order.status === 'em_andamento' ? 'Em Andamento' : order.status}</strong>
                    </span>
                  </div>
                )}

                {/* Items list */}
                <div className="space-y-2">
                  {(order.items || []).map((it) => (
                    <div key={it.id} className="flex items-center gap-3 text-xs bg-white p-2.5 rounded-xl border border-neutral-100">
                      <img
                        src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80'}
                        alt={it.product?.name || 'Produto'}
                        className="w-10 h-12 object-cover rounded-lg border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{it.product?.name || 'Produto'}</p>
                        <p className="text-[11px] text-neutral-500">
                          {it.quantity}x {it.selectedSize || 'M'} • {it.selectedColor?.name || 'Padrão'}
                        </p>
                      </div>
                      <span className="font-bold text-neutral-900">
                        {formatCurrency((it.product?.price || 0) * (it.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address info */}
                {order.customer && (
                  <p className="text-[11px] text-neutral-500 pt-1">
                    Entrega para: <strong>{order.customer.name}</strong>
                    {order.customer.address && (
                      <> • {order.customer.address.street || ''}, {order.customer.address.number || ''}, {order.customer.address.city || ''}/{order.customer.address.state || ''}</>
                    )}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
