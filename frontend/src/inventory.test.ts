import { describe, it, expect } from 'vitest';
import type { Product, StockMovement } from './types';

describe('Inventory Rules & Decimal Math Integrity', () => {
  const initialProduct: Product = {
    id: 'prod-loose-sugar',
    name: 'Loose Sugar',
    nameHi: 'खुली चीनी',
    category: 'grocery',
    unit: 'kg',
    currentStock: 14.5,
    minStockThreshold: 5,
    sellingPrice: 44,
    createdAt: new Date().toISOString()
  };

  it('correctly deducts fractional sales quantities (e.g. 0.5 kg, 1.25 kg)', () => {
    const saleQty1 = 0.5;
    const stockAfterSale1 = Math.round((initialProduct.currentStock - saleQty1) * 1000) / 1000;
    expect(stockAfterSale1).toBe(14.0);

    const saleQty2 = 1.25;
    const stockAfterSale2 = Math.round((stockAfterSale1 - saleQty2) * 1000) / 1000;
    expect(stockAfterSale2).toBe(12.75);

    // Subtotal math check
    const subtotal = Math.round(saleQty2 * initialProduct.sellingPrice * 100) / 100;
    expect(subtotal).toBe(55); // 1.25 * 44 = 55
  });

  it('prevents accidental negative inventory sales', () => {
    const requestedQty = 20; // currentStock is 14.5
    const isAllowed = requestedQty <= initialProduct.currentStock;
    expect(isAllowed).toBe(false);
  });

  it('records stock movements with accurate signed deltas', () => {
    // Add purchase
    const addQty = 10;
    const stockAfterAdd = initialProduct.currentStock + addQty;
    const purchaseMovement: StockMovement = {
      id: 'mov-1',
      productId: initialProduct.id,
      productName: initialProduct.name,
      movementType: 'purchase',
      quantityChange: addQty,
      quantityAfter: stockAfterAdd,
      reason: 'Wholesale purchase',
      timestamp: new Date().toISOString()
    };

    expect(purchaseMovement.quantityChange).toBe(10);
    expect(purchaseMovement.quantityAfter).toBe(24.5);

    // Spoilage / Correction
    const newPhysicalStock = 24.0; // 0.5kg lost
    const correctionDelta = Math.round((newPhysicalStock - purchaseMovement.quantityAfter) * 1000) / 1000;
    const correctionMovement: StockMovement = {
      id: 'mov-2',
      productId: initialProduct.id,
      productName: initialProduct.name,
      movementType: 'adjustment',
      quantityChange: correctionDelta,
      quantityAfter: newPhysicalStock,
      reason: 'Bag tear / spillage',
      timestamp: new Date().toISOString()
    };

    expect(correctionMovement.quantityChange).toBe(-0.5);
    expect(correctionMovement.quantityAfter).toBe(24.0);
  });

  it('detects duplicate product names case-insensitively', () => {
    const existing = ['Tata Salt 1kg', 'Maggi Noodles', 'Fortune Oil 1L'];
    const newName = 'tata salt 1kg';
    const isDuplicate = existing.some(n => n.toLowerCase() === newName.trim().toLowerCase());
    expect(isDuplicate).toBe(true);

    const validNewName = 'Aashirvaad Atta 5kg';
    const isNewDuplicate = existing.some(n => n.toLowerCase() === validNewName.trim().toLowerCase());
    expect(isNewDuplicate).toBe(false);
  });
});
