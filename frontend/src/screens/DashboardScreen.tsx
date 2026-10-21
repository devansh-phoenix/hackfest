import React from 'react';
import type { Product, StockMovement, Language, ActiveTab } from '../types';
import { getTranslation, getUnitLabel } from '../i18n/translations';
import { calculateReorders, calculateSlowMoving } from '../utils/reorderEngine';
import { ShoppingBag, PackagePlus, AlertTriangle, Clock } from 'lucide-react';

interface DashboardScreenProps {
  products: Product[];
  movements: StockMovement[];
  language: Language;
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickSale: () => void;
  onOpenAddStock: (product?: Product) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  products,
  movements,
  language,
  onNavigate,
  onOpenQuickSale,
  onOpenAddStock
}) => {
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockThreshold);
  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const reorderList = calculateReorders(products, []);
  const slowMovingItems = calculateSlowMoving(products, 15);

  const isHindi = language === 'hi';

  return (
    <div className="dashboard-screen">
      {/* Hero Action Cards for Fast Operation */}
      <div className="hero-actions">
        <button
          className="action-card sale"
          onClick={onOpenQuickSale}
          type="button"
        >
          <ShoppingBag size={28} className="action-card-icon" />
          <span className="action-card-title">{getTranslation(language, 'recordSaleBtn')}</span>
          <span className="action-card-desc">{getTranslation(language, 'quickSaleSubtitle')}</span>
        </button>

        <button
          className="action-card stock"
          onClick={() => onOpenAddStock()}
          type="button"
        >
          <PackagePlus size={28} className="action-card-icon" />
          <span className="action-card-title">{getTranslation(language, 'addStockBtn')}</span>
          <span className="action-card-desc">{getTranslation(language, 'addStockPrompt')}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('stock')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">{getTranslation(language, 'totalProducts')}</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('reorders')} style={{ cursor: 'pointer' }}>
          <div className={`stat-value ${lowStockItems.length > 0 ? 'warning' : ''}`}>
            {lowStockItems.length}
          </div>
          <div className="stat-label">{getTranslation(language, 'lowStockAlerts')}</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('reorders')} style={{ cursor: 'pointer' }}>
          <div className={`stat-value ${outOfStockItems.length > 0 ? 'danger' : ''}`}>
            {outOfStockItems.length}
          </div>
          <div className="stat-label">{getTranslation(language, 'outOfStock')}</div>
        </div>
      </div>

      {/* Dashboard Dual-Column Grid on Laptop / Stacked on Mobile */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Urgent Alerts & Slow Moving */}
        <div className="dashboard-col-alerts">
          {/* Urgent Replenishment Alert Banner */}
          {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '2px solid #fde68a',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#b45309', fontSize: '0.96rem' }}>
                  <AlertTriangle size={20} />
                  <span>{getTranslation(language, 'urgentReorders')} ({reorderList.length})</span>
                </div>
                <button
                  onClick={() => onNavigate('reorders')}
                  style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {getTranslation(language, 'viewAll')} &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reorderList.slice(0, 4).map(item => {
                  const name = isHindi && item.product.nameHi ? item.product.nameHi : item.product.name;
                  const unit = getUnitLabel(language, item.unit);
                  return (
                    <div
                      key={item.product.id}
                      onClick={() => onOpenAddStock(item.product)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1.5px solid #fef3c7',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        {name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: item.currentStock === 0 ? '#991b1b' : '#92400e',
                          backgroundColor: item.currentStock === 0 ? '#fef2f2' : '#fffbeb',
                          border: item.currentStock === 0 ? '1px solid #ef4444' : '1px solid #f59e0b',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          {item.currentStock} {unit}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800 }}>
                          + मंगाएं {item.suggestedReorderQty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slow Moving Products Alert */}
          {slowMovingItems.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '6px' }}>
                <Clock size={18} style={{ color: '#ea580c' }} />
                <span>{getTranslation(language, 'slowMovingItems')} ({slowMovingItems.length})</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                {getTranslation(language, 'slowMovingDesc')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {slowMovingItems.slice(0, 3).map(item => {
                  const name = isHindi && item.product.nameHi ? item.product.nameHi : item.product.name;
                  const unit = getUnitLabel(language, item.product.unit);
                  return (
                    <div key={item.product.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>
                          {getTranslation(language, 'noSalesInDays', { days: item.daysWithoutSale })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 800, color: '#334155' }}>
                        {item.currentStock} {unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Stock Activity Ledger */}
        <div className="dashboard-col-activity">
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={18} />
              <span>{getTranslation(language, 'recentActivity')}</span>
            </h2>
            <button className="section-link" onClick={() => onNavigate('stock')}>
              {getTranslation(language, 'viewAll')}
            </button>
          </div>

          <div className="card-list">
            {movements.slice(0, 6).map(mov => {
              const movKey = `mov_${mov.movementType}` as any;
              const label = getTranslation(language, movKey);

              return (
                <div key={mov.id} className="item-card" style={{ padding: '12px 16px' }}>
                  <div className="item-main">
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {mov.productName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px', fontWeight: 500 }}>
                      {label} {mov.reason ? `• ${mov.reason}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: mov.quantityChange > 0 ? '#15803d' : '#dc2626'
                    }}>
                      {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      शेष: {mov.quantityAfter}
                    </div>
                  </div>
                </div>
              );
            })}
            {movements.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                {getTranslation(language, 'noActivity')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
