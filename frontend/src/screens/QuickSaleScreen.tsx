import React, { useState } from 'react';
import type { Product, Language, ProductCategory } from '../types';
import { getTranslation, getUnitLabel, getCategoryLabel } from '../i18n/translations';
import { Search, ShoppingBag } from 'lucide-react';

interface QuickSaleScreenProps {
  products: Product[];
  language: Language;
  onSelectProduct: (product: Product) => void;
}

export const QuickSaleScreen: React.FC<QuickSaleScreenProps> = ({
  products,
  language,
  onSelectProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
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
    return matchesSearch && matchesCategory;
  });

  const isHindi = language === 'hi';

  return (
    <div className="quick-sale-screen">
      {/* Title */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {getTranslation(language, 'quickSaleTitle')}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {getTranslation(language, 'quickSaleSubtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={getTranslation(language, 'searchProductPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter Chips */}
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

      {/* Product List for Sale */}
      <div className="card-list">
        {filteredProducts.map(prod => {
          const name = isHindi && prod.nameHi ? prod.nameHi : prod.name;
          const subName = isHindi ? prod.name : prod.nameHi;
          const unit = getUnitLabel(language, prod.unit);
          const isOut = prod.currentStock <= 0;
          const isLow = prod.currentStock > 0 && prod.currentStock <= prod.minStockThreshold;

          return (
            <div
              key={prod.id}
              className="item-card"
              onClick={() => onSelectProduct(prod)}
              style={{
                cursor: 'pointer',
                opacity: isOut ? 0.6 : 1,
                borderColor: isLow ? '#fde68a' : isOut ? '#fecaca' : undefined
              }}
            >
              <div className="item-main">
                <div className="item-name">{name}</div>
                <div className="item-name-hi">{subName}</div>
                <div className="item-meta">
                  <span className="item-tag">{getCategoryLabel(language, prod.category)}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{prod.sellingPrice} / {unit}</span>
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
          );
        })}

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
            <ShoppingBag size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <div>{getTranslation(language, 'noProductsFound')}</div>
          </div>
        )}
      </div>
    </div>
  );
};
