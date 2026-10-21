import React, { useState } from 'react';
import type { Product, Language } from '../types';
import { getTranslation, getUnitLabel } from '../i18n/translations';
import { X, Check, AlertCircle } from 'lucide-react';

interface StockCorrectionModalProps {
  product: Product;
  language: Language;
  onClose: () => void;
  onConfirmCorrection: (productId: string, newTotalQuantity: number, reason: string) => void;
}

export const StockCorrectionModal: React.FC<StockCorrectionModalProps> = ({
  product,
  language,
  onClose,
  onConfirmCorrection
}) => {
  const isFractional = product.unit === 'kg' || product.unit === 'l';
  const [newQtyString, setNewQtyString] = useState<string>(String(product.currentStock));
  const [reasonKey, setReasonKey] = useState<string>('reasonDiscrepancy');
  const [customNote, setCustomNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numNewQty = parseFloat(newQtyString);
  const unitLabel = getUnitLabel(language, product.unit);
  const delta = Math.round((numNewQty - product.currentStock) * 1000) / 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numNewQty) || numNewQty < 0) {
      setErrorMsg(getTranslation(language, 'invalidQuantity'));
      return;
    }

    const reasonLabel = getTranslation(language, reasonKey as any);
    const finalReason = customNote ? `${reasonLabel} (${customNote})` : reasonLabel;

    onConfirmCorrection(product.id, numNewQty, finalReason);
  };

  const isHindi = language === 'hi';
  const displayName = isHindi && product.nameHi ? product.nameHi : product.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{getTranslation(language, 'correctionTitle')}</h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              {displayName}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Comparison Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              पहले का स्टॉक (Recorded)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {product.currentStock} {unitLabel}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              बदलाव (Difference)
            </div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: delta > 0 ? '#15803d' : delta < 0 ? '#dc2626' : '#64748b'
            }}>
              {delta > 0 ? `+${delta}` : delta} {unitLabel}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="corrected-qty">
              {getTranslation(language, 'newTotalQuantity')} ({unitLabel})
            </label>
            <input
              id="corrected-qty"
              type="number"
              step={isFractional ? '0.1' : '1'}
              min="0"
              className="form-input"
              value={newQtyString}
              onChange={e => {
                setErrorMsg(null);
                setNewQtyString(e.target.value);
              }}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reason-select">
              {getTranslation(language, 'correctionReason')}
            </label>
            <select
              id="reason-select"
              className="form-select"
              value={reasonKey}
              onChange={e => setReasonKey(e.target.value)}
            >
              <option value="reasonDiscrepancy">{getTranslation(language, 'reasonDiscrepancy')}</option>
              <option value="reasonDamaged">{getTranslation(language, 'reasonDamaged')}</option>
              <option value="reasonExpired">{getTranslation(language, 'reasonExpired')}</option>
              <option value="reasonCustomerReturn">{getTranslation(language, 'reasonCustomerReturn')}</option>
              <option value="reasonOther">{getTranslation(language, 'reasonOther')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="custom-correction-note">
              टिप्पणी / विवरण (Optional Note)
            </label>
            <input
              id="custom-correction-note"
              type="text"
              className="form-input"
              placeholder="e.g. Physical inventory check on shelf 2"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
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

          <button type="submit" className="btn-primary">
            <Check size={18} />
            <span>{getTranslation(language, 'save')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
