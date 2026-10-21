import React, { useState } from 'react';
import type { Product, Sale, Language } from '../types';
import { getTranslation, getUnitLabel } from '../i18n/translations';
import { calculateReorders, formatOrderListText } from '../utils/reorderEngine';
import { Copy, Check, PackagePlus, Info } from 'lucide-react';

interface ReorderScreenProps {
  products: Product[];
  sales: Sale[];
  language: Language;
  onOpenAddStock: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

export const ReorderScreen: React.FC<ReorderScreenProps> = ({
  products,
  sales,
  language,
  onOpenAddStock,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const reorders = calculateReorders(products, sales);
  const isHindi = language === 'hi';

  const handleCopy = () => {
    const text = formatOrderListText(reorders, language);
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast(getTranslation(language, 'listCopied'));
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="reorder-screen">
      {/* Title */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {getTranslation(language, 'reordersTitle')}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {getTranslation(language, 'reordersSubtitle')}
        </p>
      </div>

      {/* Disclaimer / Transparency Note */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '10px 12px',
        marginBottom: '16px',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <Info size={16} style={{ color: '#d9531e', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>{getTranslation(language, 'recommendationBadge')}:</strong>{' '}
          {isHindi 
            ? 'यह सुझाव दुकान के न्यूनतम स्टॉक और हालिया बिक्री के आधार पर गणना किए गए हैं।' 
            : 'These estimates are recommendations based on your store threshold and sales rate, not guaranteed forecasts.'}
        </div>
      </div>

      {/* WhatsApp / Distributor Copy Button */}
      {reorders.length > 0 && (
        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#15803d',
            color: '#fff',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}
          type="button"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span>{getTranslation(language, 'copyReorderList')}</span>
        </button>
      )}

      {/* List of Reorders */}
      <div className="card-list">
        {reorders.map(item => {
          const name = isHindi && item.product.nameHi ? item.product.nameHi : item.product.name;
          const unit = getUnitLabel(language, item.unit);
          const reason = isHindi ? item.reasonTextHi : item.reasonTextEn;

          return (
            <div
              key={item.product.id}
              className="item-card"
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                borderColor: item.urgency === 'critical' ? '#fecaca' : item.urgency === 'urgent' ? '#fde68a' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: item.urgency === 'critical' ? '#fee2e2' : item.urgency === 'urgent' ? '#fef3c7' : '#f1f5f9',
                      color: item.urgency === 'critical' ? '#dc2626' : item.urgency === 'urgent' ? '#b45309' : '#475569'
                    }}>
                      {item.urgency === 'critical' ? 'तुरंत मंगाएं (Critical)' : item.urgency === 'urgent' ? 'आवश्यक (Urgent)' : 'अनुशंसित (Recommended)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {getTranslation(language, 'currentQty')}
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: item.currentStock === 0 ? '#dc2626' : '#d97706'
                  }}>
                    {item.currentStock} {unit}
                  </div>
                </div>
              </div>

              {/* Plain Language Explanation */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '8px',
                padding: '8px 10px',
                margin: '10px 0',
                fontSize: '0.78rem',
                color: '#92400e',
                lineHeight: 1.4
              }}>
                <strong>{getTranslation(language, 'whyThisItem')}</strong> {reason}
              </div>

              {/* Recommended Reorder & Fast Add Stock Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {getTranslation(language, 'reorderNow')}:
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>
                    {item.suggestedReorderQty} {unit}
                  </div>
                </div>

                <button
                  onClick={() => onOpenAddStock(item.product)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    backgroundColor: '#15803d',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                  type="button"
                >
                  <PackagePlus size={16} />
                  <span>{getTranslation(language, 'addMoreStock')}</span>
                </button>
              </div>
            </div>
          );
        })}

        {reorders.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '16px',
            border: '1px solid #bbf7d0',
            color: '#166534'
          }}>
            <Check size={48} style={{ margin: '0 auto 12px', color: '#15803d' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
              {getTranslation(language, 'noReordersNeeded')}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};
