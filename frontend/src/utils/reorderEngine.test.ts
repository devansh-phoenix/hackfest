import { describe, it, expect } from 'vitest';
import { calculateReorders, calculateSlowMoving, formatOrderListText } from './reorderEngine';
import type { Product, Sale } from '../types';

describe('Reorder Algorithm & Business Logic', () => {
  const sampleProducts: Product[] = [
    {
      id: 'p1',
      name: 'Aashirvaad Atta 5kg',
      nameHi: 'आशीर्वाद आटा',
      category: 'grocery',
      unit: 'packet',
      currentStock: 2,
      minStockThreshold: 5,
      purchaseCost: 200,
      sellingPrice: 240,
      createdAt: new Date().toISOString()
    },
    {
      id: 'p2',
      name: 'Sugar (Loose)',
      nameHi: 'चीनी',
      category: 'grocery',
      unit: 'kg',
      currentStock: 25,
      minStockThreshold: 10,
      sellingPrice: 44,
      createdAt: new Date().toISOString()
    },
    {
      id: 'p3',
      name: 'Red Label Tea',
      nameHi: 'रेड लेबल चाय',
      category: 'beverages',
      unit: 'box',
      currentStock: 0,
      minStockThreshold: 6,
      sellingPrice: 140,
      createdAt: new Date().toISOString()
    }
  ];

  it('triggers reorders for items at or below threshold', () => {
    const reorders = calculateReorders(sampleProducts, []);
    const reorderedIds = reorders.map(r => r.product.id);

    // p1 (current 2 <= threshold 5) and p3 (current 0 <= threshold 6) must trigger
    expect(reorderedIds).toContain('p1');
    expect(reorderedIds).toContain('p3');

    // p2 has 25 > threshold 10, so it should not trigger without high sales velocity
    expect(reorderedIds).not.toContain('p2');
  });

  it('prioritizes critical out-of-stock items first', () => {
    const reorders = calculateReorders(sampleProducts, []);
    expect(reorders[0].product.id).toBe('p3');
    expect(reorders[0].urgency).toBe('critical');
    expect(reorders[0].currentStock).toBe(0);
  });

  it('incorporates sales velocity when suggesting reorder quantity', () => {
    const sales: Sale[] = [
      {
        id: 's1',
        receiptNumber: 'R1',
        totalAmount: 480,
        timestamp: new Date().toISOString(),
        items: [
          {
            productId: 'p1',
            productName: 'Aashirvaad Atta 5kg',
            productNameHi: 'आशीर्वाद आटा',
            quantity: 14, // sold 14 in last 7 days -> ADS = 2/day
            unit: 'packet',
            unitPrice: 240,
            subtotal: 480
          }
        ]
      }
    ];

    const reorders = calculateReorders(sampleProducts, sales);
    const p1Reorder = reorders.find(r => r.product.id === 'p1');
    expect(p1Reorder).toBeDefined();
    expect(p1Reorder?.averageDailySales).toBe(2);
    // Formula: (ADS * 7) + threshold - current = (2 * 7) + 5 - 2 = 17 -> rounded to 20 for packet bulk lot
    expect(p1Reorder?.suggestedReorderQty).toBeGreaterThanOrEqual(17);
  });

  it('generates clear plain-language explanations in English and Hindi', () => {
    const reorders = calculateReorders(sampleProducts, []);
    const p3Reorder = reorders.find(r => r.product.id === 'p3');
    expect(p3Reorder?.reasonTextEn).toContain('OUT OF STOCK');
    expect(p3Reorder?.reasonTextHi).toContain('स्टॉक खत्म है');
  });

  it('identifies slow-moving products with no sales for configured period', () => {
    const slowProducts: Product[] = [
      {
        id: 'slow-1',
        name: 'Slow Spice Box',
        nameHi: 'मसाला',
        category: 'grocery',
        unit: 'box',
        currentStock: 10,
        minStockThreshold: 2,
        sellingPrice: 50,
        purchaseCost: 40,
        lastSoldAt: new Date(Date.now() - 25 * 86400 * 1000).toISOString(), // 25 days ago
        createdAt: new Date().toISOString()
      },
      {
        id: 'fresh-1',
        name: 'Fresh Bread',
        nameHi: 'ब्रेड',
        category: 'dairy',
        unit: 'packet',
        currentStock: 8,
        minStockThreshold: 3,
        sellingPrice: 30,
        lastSoldAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(), // 2 days ago
        createdAt: new Date().toISOString()
      }
    ];

    const slow = calculateSlowMoving(slowProducts, 15);
    expect(slow.length).toBe(1);
    expect(slow[0].product.id).toBe('slow-1');
    expect(slow[0].daysWithoutSale).toBe(25);
    expect(slow[0].tiedUpValue).toBe(400); // 10 * 40
  });

  it('formats clean WhatsApp order list for distributor in Hindi and English', () => {
    const reorders = calculateReorders(sampleProducts, []);
    const textHi = formatOrderListText(reorders, 'hi');
    const textEn = formatOrderListText(reorders, 'en');

    expect(textHi).toContain('दुकान का ऑर्डर पर्चा');
    expect(textHi).toContain('रेड लेबल चाय');
    expect(textEn).toContain('Purchase Order List');
    expect(textEn).toContain('Red Label Tea');
  });
});
