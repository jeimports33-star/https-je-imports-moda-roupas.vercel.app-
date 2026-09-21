import React, { useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CatalogFilter } from './components/CatalogFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminCatalogModal } from './components/AdminCatalogModal';
import { OrdersModal } from './components/OrdersModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { PixGeneratorModal } from './components/PixGeneratorModal';
import { ToastContainer } from './components/ToastContainer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Sparkles, Shirt, Plus } from 'lucide-react';

const StoreContent: React.FC = () => {
  const { products, filters, resetFilters, setIsAdminOpen, isPixModalOpen, setIsPixModalOpen } = useStore();

  // Filter and sort products dynamically
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (filters.category !== 'todos' && prod.category !== filters.category) {
        return false;
      }

      // Gender filter
      if (filters.gender !== 'todos' && prod.gender !== filters.gender && prod.gender !== 'unissex') {
        return false;
      }

      // Size filter
      if (filters.size && !prod.sizes.includes(filters.size as any)) {
        return false;
      }

      // Only sale filter
      if (filters.onlySale && !prod.isSale) {
        return false;
      }

      // Max price filter
      if (prod.price > filters.maxPrice) {
        return false;
      }

      // Search query filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesCategory = prod.category.toLowerCase().includes(q);
        const matchesSku = prod.sku.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        const matchesSize = prod.sizes.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesSku && !matchesDesc && !matchesSize) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.price) : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) : 0;
        return discB - discA;
      }
      if (filters.sortBy === 'newest') {
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      }
      // default: featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100/50">
      <Navbar />
      
      <main className="flex-1">
        <HeroBanner />

        {/* Dynamic Catalog Section */}
        <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">
                <Shirt className="w-3.5 h-3.5 text-neutral-700" />
                <span>Coleção Exclusiva</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
                {filters.category === 'todos' 
                  ? 'Catálogo Completo de Roupas' 
                  : `Catálogo de ${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Adicionar Roupa ao Catálogo</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <CatalogFilter totalCount={filteredProducts.length} />

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                <Shirt className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-neutral-900">
                Nenhuma peça encontrada
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Não encontramos produtos correspondentes aos filtros selecionados. Tente ajustar os filtros ou limpar a busca.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 text-neutral-800 text-xs font-bold rounded-full hover:bg-neutral-200 transition-colors"
                >
                  + Cadastrar Nova Peça
                </button>
              </div>
            </div>
          )}

        </section>
      </main>

      <Footer />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Dynamic Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <AdminCatalogModal />
      <OrdersModal />
      <SizeGuideModal />
      <PixGeneratorModal isOpen={isPixModalOpen} onClose={() => setIsPixModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
