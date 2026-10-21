import React, { useState } from 'react';
import type { Product, Language, ProductCategory } from '../types';
import { getTranslation, getUnitLabel, getCategoryLabel } from '../i18n/translations';
import { Search, Plus, PackagePlus, SlidersHorizontal } from 'lucide-react';

interface StockScreenProps {
  products: Product[];
  language: Language;
  onOpenAddProduct: () => void;
  onOpenAddStock: (product: Product) => void;
  onOpenCorrection: (product: Product) => void;
}

export const StockScreen: React.FC<StockScreenProps> = ({
  products,
  language,
  onOpenAddProduct,
  onOpenAddStock,
  onOpenCorrection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  const categories: (ProductCategory | 'all')[] = [
    'all',
    'grocery',
    'snacks',
    'dairy',
    'beverages',
    'personal_care',
    'household'
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameHi.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStatus = true;
    if (filterMode === 'low') {
      matchesStatus = p.currentStock > 0 && p.currentStock <= p.minStockThreshold;
    } else if (filterMode === 'out') {
      matchesStatus = p.currentStock === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isHindi = language === 'hi';

  return (
    <div className="stock-screen">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {getTranslation(language, 'stockTitle')}
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {filteredProducts.length} {getTranslation(language, 'totalProducts')}
          </span>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="btn-primary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
          type="button"
        >
          <Plus size={16} />
          <span>{getTranslation(language, 'newProductBtn')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="search-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={getTranslation(language, 'searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Status Filter Tabs (All, Low Stock, Out of Stock) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <button
          className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
          style={{ textAlign: 'center' }}
          type="button"
        >
          {getTranslation(language, 'filterAll')}
        </button>
        <button
          className={`filter-chip ${filterMode === 'low' ? 'active' : ''}`}
          onClick={() => setFilterMode('low')}
          style={{ textAlign: 'center' }}
          type="button"
        >
          {getTranslation(language, 'filterLowStock')}
        </button>
        <button
          className={`filter-chip ${filterMode === 'out' ? 'active' : ''}`}
          onClick={() => setFilterMode('out')}
          style={{ textAlign: 'center' }}
          type="button"
        >
          {getTranslation(language, 'filterOutOfStock')}
        </button>
      </div>

      {/* Category Scroll */}
      <div className="filter-scroll">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            type="button"
          >
            {cat === 'all' ? getTranslation(language, 'filterAll') : getCategoryLabel(language, cat)}
          </button>
        ))}
      </div>

      {/* Inventory Cards */}
      <div className="card-list">
        {filteredProducts.map(prod => {
          const name = isHindi && prod.nameHi ? prod.nameHi : prod.name;
          const subName = isHindi ? prod.name : prod.nameHi;
          const unit = getUnitLabel(language, prod.unit);
          const isOut = prod.currentStock <= 0;
          const isLow = prod.currentStock > 0 && prod.currentStock <= prod.minStockThreshold;

          return (
            <div key={prod.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="item-main">
                  <div className="item-name">{name}</div>
                  <div className="item-name-hi">{subName}</div>
                  <div className="item-meta">
                    <span className="item-tag">{getCategoryLabel(language, prod.category)}</span>
                    <span>रेट: ₹{prod.sellingPrice}/{unit}</span>
                    <span>न्यूनतम: {prod.minStockThreshold} {unit}</span>
                  </div>
                </div>

                <div className="item-stock-box">
                  <div className="item-stock-qty" style={{
                    color: isOut ? '#dc2626' : isLow ? '#d97706' : '#15803d'
                  }}>
                    {prod.currentStock} {unit}
                  </div>
                  <span className={`item-stock-badge ${isOut ? 'out' : isLow ? 'low' : 'ok'}`}>
                    {isOut ? getTranslation(language, 'statusOut') : isLow ? getTranslation(language, 'statusLow') : getTranslation(language, 'statusOk')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add Stock & Stock Correction */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <button
                  onClick={() => onOpenAddStock(prod)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                  type="button"
                >
                  <PackagePlus size={15} />
                  <span>{getTranslation(language, 'addMoreStock')}</span>
                </button>

                <button
                  onClick={() => onOpenCorrection(prod)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                  type="button"
                >
                  <SlidersHorizontal size={15} />
                  <span>{getTranslation(language, 'stockCorrection')}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
            <div>{getTranslation(language, 'noProductsFound')}</div>
          </div>
        )}
      </div>
    </div>
  );
};
