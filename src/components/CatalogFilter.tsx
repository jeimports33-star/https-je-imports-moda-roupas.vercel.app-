import React from 'react';
import { useStore } from '../context/StoreContext';
import { SlidersHorizontal, RotateCcw, Tag } from 'lucide-react';
import { ClothingSize } from '../types';
import { formatCurrency } from '../utils/paymentUtils';

const SIZES: (ClothingSize | 'todos')[] = ['todos', 'PP', 'P', 'M', 'G', 'GG', 'XG', '38', '40', '42', '44'];

export const CatalogFilter: React.FC<{ totalCount: number }> = ({ totalCount }) => {
  const { filters, setFilters, resetFilters } = useStore();

  const handleGenderChange = (gender: 'todos' | 'masculino' | 'feminino' | 'unissex') => {
    setFilters(prev => ({ ...prev, gender }));
  };

  const handleSizeChange = (size: string) => {
    setFilters(prev => ({ ...prev, size: size === 'todos' ? '' : size }));
  };

  const hasActiveFilters = 
    filters.category !== 'todos' || 
    filters.gender !== 'todos' || 
    filters.size !== '' || 
    filters.onlySale || 
    filters.search !== '' ||
    filters.sortBy !== 'featured';

  return (
    <div id="catalog-filters-bar" className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        
        {/* Left: Summary & Gender selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
            <span>Filtros do Catálogo</span>
            <span className="text-xs font-normal text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {totalCount} {totalCount === 1 ? 'peça encontrada' : 'peças encontradas'}
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

          {/* Gender filter */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-full text-xs font-medium">
            {(['todos', 'masculino', 'feminino', 'unissex'] as const).map((g) => (
              <button
                key={g}
                id={`filter-gender-${g}`}
                onClick={() => handleGenderChange(g)}
                className={`px-3 py-1 rounded-full capitalize transition-all ${
                  filters.gender === g
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sort & Sale Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sale only toggle */}
          <button
            id="filter-only-sale"
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, onlySale: !prev.onlySale }))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.onlySale
                ? 'bg-amber-500 text-neutral-950 border-amber-600 shadow-xs'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Em Promoção</span>
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 hidden sm:inline">Ordenar:</span>
            <select
              id="filter-sort-select"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value="featured">Destaques</option>
              <option value="newest">Lançamentos</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="discount">Maior Desconto</option>
            </select>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              id="filter-reset-btn"
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors ml-auto sm:ml-0"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Sizes and Price Row */}
      <div className="pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sizes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-neutral-400 font-medium shrink-0">Tamanho:</span>
          <div className="flex items-center gap-1.5">
            {SIZES.map((sz) => {
              const isSelected = (sz === 'todos' && !filters.size) || filters.size === sz;
              return (
                <button
                  key={sz}
                  id={`filter-size-${sz}`}
                  onClick={() => handleSizeChange(sz)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {sz === 'todos' ? 'Todos' : sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Max price slider */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-neutral-500">Até {formatCurrency(filters.maxPrice)}</span>
          <input
            id="filter-price-slider"
            type="range"
            min={50}
            max={2000}
            step={50}
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="w-28 sm:w-36 accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
