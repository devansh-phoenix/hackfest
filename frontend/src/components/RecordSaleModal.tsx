import React, { useState } from 'react';
import type { Product, Language } from '../types';
import { getTranslation, getUnitLabel } from '../i18n/translations';
import { X, Check, AlertCircle } from 'lucide-react';

interface RecordSaleModalProps {
  product: Product;
  language: Language;
  onClose: () => void;
  onConfirmSale: (productId: string, quantity: number, unitPrice: number) => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  product,
  language,
  onClose,
  onConfirmSale
}) => {
  const isFractionalUnit = product.unit === 'kg' || product.unit === 'l' || product.unit === 'g' || product.unit === 'ml';
  const defaultQty = isFractionalUnit && product.unit === 'kg' ? 1 : 1;
  const [qtyString, setQtyString] = useState<string>(String(defaultQty));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numQty = parseFloat(qtyString) || 0;
  const unitLabel = getUnitLabel(language, product.unit);
  const totalAmount = Math.round(numQty * product.sellingPrice * 100) / 100;

  const handlePreset = (val: number, isAddition = false) => {
    setErrorMsg(null);
    if (isAddition) {
      setQtyString(prev => {
        const current = parseFloat(prev) || 0;
        return String(Math.round((current + val) * 1000) / 1000);
      });
    } else {
      setQtyString(String(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMsg(getTranslation(language, 'invalidQuantity'));
      return;
    }

    if (numQty > product.currentStock) {
      setErrorMsg(getTranslation(language, 'insufficientStock', {
        stock: product.currentStock,
        unit: unitLabel
      }));
      return;
    }

    onConfirmSale(product.id, numQty, product.sellingPrice);
  };

  // Preset options depending on unit type
  const renderPresets = () => {
    if (product.unit === 'kg' || product.unit === 'l') {
      return (
        <div className="preset-buttons">
          <button type="button" className="preset-btn" onClick={() => handlePreset(0.25)}>0.25 {unitLabel}</button>
          <button type="button" className="preset-btn" onClick={() => handlePreset(0.5)}>0.5 {unitLabel}</button>
          <button type="button" className="preset-btn" onClick={() => handlePreset(1)}>1 {unitLabel}</button>
          <button type="button" className="preset-btn" onClick={() => handlePreset(2)}>2 {unitLabel}</button>
        </div>
      );
    }
    return (
      <div className="preset-buttons">
        <button type="button" className="preset-btn" onClick={() => handlePreset(1)}>1</button>
        <button type="button" className="preset-btn" onClick={() => handlePreset(2)}>2</button>
        <button type="button" className="preset-btn" onClick={() => handlePreset(5)}>5</button>
        <button type="button" className="preset-btn" onClick={() => handlePreset(1, true)}>+1</button>
      </div>
    );
  };

  const isHindi = language === 'hi';
  const displayName = isHindi && product.nameHi ? product.nameHi : product.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{displayName}</h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {isHindi ? product.name : product.nameHi}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Stock & Rate Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {getTranslation(language, 'availableStock')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: product.currentStock > 0 ? '#15803d' : '#dc2626' }}>
              {product.currentStock} {unitLabel}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {getTranslation(language, 'unitPrice')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              ₹{product.sellingPrice}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="qty-input">
              {getTranslation(language, 'quantityToSell')} ({unitLabel})
            </label>
            <input
              id="qty-input"
              type="number"
              step={isFractionalUnit ? '0.05' : '1'}
              min="0.01"
              max={product.currentStock}
              className="form-input"
              value={qtyString}
              onChange={e => {
                setErrorMsg(null);
                setQtyString(e.target.value);
              }}
              autoFocus
            />
          </div>

          {renderPresets()}

          {/* Subtotal Calculation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: '#fff3ec',
            border: '1px solid #fcd5c3',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.95rem' }}>
              {getTranslation(language, 'totalPrice')}:
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d9531e' }}>
              ₹{totalAmount}
            </span>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '12px',
              backgroundColor: '#fee2e2',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={product.currentStock <= 0}
          >
            <Check size={18} />
            <span>{getTranslation(language, 'completeSale')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
