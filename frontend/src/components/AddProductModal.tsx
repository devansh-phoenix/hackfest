import React, { useState } from 'react';
import type { ProductCategory, UnitType, Language } from '../types';
import { getTranslation, getCategoryLabel, getUnitLabel } from '../i18n/translations';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddProductModalProps {
  language: Language;
  onClose: () => void;
  onAddProduct: (productData: {
    name: string;
    nameHi: string;
    category: ProductCategory;
    unit: UnitType;
    currentStock: number;
    minStockThreshold: number;
    purchaseCost?: number;
    sellingPrice: number;
  }) => void;
  existingProductNames: string[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  language,
  onClose,
  onAddProduct,
  existingProductNames
}) => {
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [category, setCategory] = useState<ProductCategory>('grocery');
  const [unit, setUnit] = useState<UnitType>('packet');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('20');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories: ProductCategory[] = [
    'grocery',
    'snacks',
    'dairy',
    'beverages',
    'personal_care',
    'household'
  ];

  const units: UnitType[] = [
    'packet',
    'piece',
    'bottle',
    'box',
    'kg',
    'g',
    'l',
    'ml'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanNameHi = nameHi.trim();

    if (!cleanName && !cleanNameHi) {
      setErrorMsg(getTranslation(language, 'nameRequired'));
      return;
    }

    // Check for accidental duplicate product name
    const isDuplicate = existingProductNames.some(
      n => n.toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg(`Product "${cleanName}" already exists! (उत्पाद पहले से मौजूद है)`);
      return;
    }

    const stockNum = parseFloat(currentStock);
    const thresholdNum = parseFloat(minStockThreshold);
    const sellingPriceNum = parseFloat(sellingPrice);
    const costNum = purchaseCost ? parseFloat(purchaseCost) : undefined;

    if (isNaN(stockNum) || stockNum < 0 || isNaN(thresholdNum) || thresholdNum < 0) {
      setErrorMsg(getTranslation(language, 'invalidQuantity'));
      return;
    }

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      setErrorMsg('Please enter a valid selling price / सही बिक्री मूल्य दर्ज करें');
      return;
    }

    onAddProduct({
      name: cleanName || cleanNameHi,
      nameHi: cleanNameHi || cleanName,
      category,
      unit,
      currentStock: stockNum,
      minStockThreshold: thresholdNum,
      purchaseCost: costNum,
      sellingPrice: sellingPriceNum
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{getTranslation(language, 'createProductTitle')}</h2>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name-en">
              {getTranslation(language, 'productNameEn')} *
            </label>
            <input
              id="prod-name-en"
              type="text"
              className="form-input"
              placeholder="e.g. Parle Hide & Seek 100g"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-name-hi">
              {getTranslation(language, 'productNameHi')} (वैकल्पिक / Optional)
            </label>
            <input
              id="prod-name-hi"
              type="text"
              className="form-input"
              placeholder="उदा. पारले हाइड एंड सीक"
              value={nameHi}
              onChange={e => setNameHi(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-category">
                {getTranslation(language, 'selectCategory')}
              </label>
              <select
                id="prod-category"
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(language, cat)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-unit">
                {getTranslation(language, 'selectUnit')}
              </label>
              <select
                id="prod-unit"
                className="form-select"
                value={unit}
                onChange={e => setUnit(e.target.value as UnitType)}
              >
                {units.map(u => (
                  <option key={u} value={u}>
                    {u} ({getUnitLabel(language, u)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="initial-stock">
                {getTranslation(language, 'initialStock')}
              </label>
              <input
                id="initial-stock"
                type="number"
                step="any"
                min="0"
                className="form-input"
                value={currentStock}
                onChange={e => setCurrentStock(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="min-threshold">
                {getTranslation(language, 'minStockLevel')}
              </label>
              <input
                id="min-threshold"
                type="number"
                step="any"
                min="0"
                className="form-input"
                value={minStockThreshold}
                onChange={e => setMinStockThreshold(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cost-price">
                {getTranslation(language, 'costPrice')} (₹)
              </label>
              <input
                id="cost-price"
                type="number"
                step="any"
                min="0"
                placeholder="Optional"
                className="form-input"
                value={purchaseCost}
                onChange={e => setPurchaseCost(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="selling-price">
                {getTranslation(language, 'sellingPriceLabel')} (₹) *
              </label>
              <input
                id="selling-price"
                type="number"
                step="any"
                min="0"
                className="form-input"
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
              />
            </div>
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
            <Plus size={18} />
            <span>{getTranslation(language, 'newProductBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
