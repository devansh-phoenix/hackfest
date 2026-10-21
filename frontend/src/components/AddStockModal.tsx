import React, { useState } from 'react';
import type { Product, Language } from '../types';
import { getTranslation, getUnitLabel } from '../i18n/translations';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddStockModalProps {
  product: Product;
  language: Language;
  onClose: () => void;
  onConfirmAddStock: (productId: string, quantityToAdd: number, note?: string) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  product,
  language,
  onClose,
  onConfirmAddStock
}) => {
  const isFractional = product.unit === 'kg' || product.unit === 'l';
  const [qtyString, setQtyString] = useState<string>('10');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numQty = parseFloat(qtyString) || 0;
  const unitLabel = getUnitLabel(language, product.unit);
  const newProjectedStock = Math.round((product.currentStock + numQty) * 1000) / 1000;

  const handlePreset = (val: number) => {
    setErrorMsg(null);
    setQtyString(String(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMsg(getTranslation(language, 'invalidQuantity'));
      return;
    }
    onConfirmAddStock(product.id, numQty, note.trim() || undefined);
  };

  const isHindi = language === 'hi';
  const displayName = isHindi && product.nameHi ? product.nameHi : product.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{getTranslation(language, 'addStockTitle')}</h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              {displayName}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Current & New Stock Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
              {getTranslation(language, 'currentQty')}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>
              {product.currentStock} {unitLabel}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
              नया स्टॉक (After Add)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>
              {newProjectedStock} {unitLabel}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="add-stock-qty">
              {getTranslation(language, 'addStockPrompt')} ({unitLabel})
            </label>
            <input
              id="add-stock-qty"
              type="number"
              step={isFractional ? '0.5' : '1'}
              min="0.01"
              className="form-input"
              value={qtyString}
              onChange={e => {
                setErrorMsg(null);
                setQtyString(e.target.value);
              }}
              autoFocus
            />
          </div>

          {/* Presets */}
          <div className="preset-buttons">
            <button type="button" className="preset-btn" onClick={() => handlePreset(5)}>+5</button>
            <button type="button" className="preset-btn" onClick={() => handlePreset(10)}>+10</button>
            <button type="button" className="preset-btn" onClick={() => handlePreset(20)}>+20</button>
            <button type="button" className="preset-btn" onClick={() => handlePreset(50)}>+50</button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dist-note">
              {getTranslation(language, 'distributorBillOptional')}
            </label>
            <input
              id="dist-note"
              type="text"
              className="form-input"
              placeholder="e.g. Sharma Wholesale Bill #451"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className="btn-success">
            <Plus size={18} />
            <span>{getTranslation(language, 'addMoreStock')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
