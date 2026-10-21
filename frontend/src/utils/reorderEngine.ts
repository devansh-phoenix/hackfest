import type { Product, Sale, Language, UnitType } from '../types';
import { getUnitLabel } from '../i18n/translations';

export interface ReorderItem {
  product: Product;
  currentStock: number;
  minThreshold: number;
  unit: UnitType;
  averageDailySales: number;
  totalSoldLast7Days: number;
  estimatedDaysRemaining: number;
  suggestedReorderQty: number;
  urgency: 'critical' | 'urgent' | 'moderate';
  reasonTextEn: string;
  reasonTextHi: string;
}

export interface SlowMovingItem {
  product: Product;
  daysWithoutSale: number;
  currentStock: number;
  tiedUpValue: number;
}

/**
 * Calculates deterministic, explainable reorder suggestions based on sales velocity and thresholds.
 */
export function calculateReorders(
  products: Product[],
  sales: Sale[],
  targetDaysSupply = 7
): ReorderItem[] {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400 * 1000;

  // Calculate quantity sold per product in the last 7 days
  const soldMap: Record<string, number> = {};
  sales.forEach(sale => {
    const saleTime = new Date(sale.timestamp).getTime();
    if (saleTime >= sevenDaysAgo) {
      sale.items.forEach(item => {
        soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity;
      });
    }
  });

  const suggestions: ReorderItem[] = [];

  products.forEach(p => {
    // If not active, skip
    const sold7 = soldMap[p.id] || 0;
    // Base ADS on sold in 7 days, or a small baseline if near threshold
    const ads = sold7 > 0 ? sold7 / 7 : 0.5; // minimum assumed consumption if selling
    const daysRemaining = ads > 0 ? Math.round((p.currentStock / ads) * 10) / 10 : 999;

    const isBelowThreshold = p.currentStock <= p.minStockThreshold;
    const isRunningOutSoon = daysRemaining <= 3;

    if (isBelowThreshold || isRunningOutSoon || p.currentStock === 0) {
      // Calculate suggested order quantity
      // Formula: (ADS * TargetDays) + Threshold - CurrentStock
      const rawNeeded = (ads * targetDaysSupply) + p.minStockThreshold - p.currentStock;
      let suggestedQty = Math.max(1, Math.ceil(rawNeeded));

      // For fractional items, round to clean intervals
      if (p.unit === 'kg' || p.unit === 'l') {
        suggestedQty = Math.max(5, Math.ceil(suggestedQty / 5) * 5); // packs of 5kg/L
      } else if (p.unit === 'packet' || p.unit === 'piece') {
        suggestedQty = Math.max(10, Math.ceil(suggestedQty / 5) * 5); // lots of 5 or 10
      }

      let urgency: 'critical' | 'urgent' | 'moderate' = 'moderate';
      if (p.currentStock === 0) {
        urgency = 'critical';
      } else if (p.currentStock <= p.minStockThreshold * 0.5) {
        urgency = 'urgent';
      }

      // Generate explainable bilingual reasons
      let reasonEn = '';
      let reasonHi = '';

      if (p.currentStock === 0) {
        reasonEn = `OUT OF STOCK! Minimum safety level is ${p.minStockThreshold} ${p.unit}. Immediate replenishment needed.`;
        reasonHi = `स्टॉक खत्म है! सुरक्षित स्तर कम से कम ${p.minStockThreshold} ${p.unit} होना चाहिए। तुरंत मंगाएं।`;
      } else if (sold7 > 0) {
        reasonEn = `Sold ${sold7} ${p.unit} in last 7 days. Only ${p.currentStock} ${p.unit} remaining (Threshold: ${p.minStockThreshold}).`;
        reasonHi = `पिछले 7 दिनों में ${sold7} ${p.unit} बिका। केवल ${p.currentStock} ${p.unit} बचा है (न्यूनतम सीमा: ${p.minStockThreshold})।`;
      } else {
        reasonEn = `Current stock (${p.currentStock} ${p.unit}) is at or below minimum threshold (${p.minStockThreshold} ${p.unit}).`;
        reasonHi = `मौजूदा स्टॉक (${p.currentStock} ${p.unit}) न्यूनतम सीमा (${p.minStockThreshold} ${p.unit}) तक आ गया है।`;
      }

      suggestions.push({
        product: p,
        currentStock: p.currentStock,
        minThreshold: p.minStockThreshold,
        unit: p.unit,
        averageDailySales: Math.round(ads * 10) / 10,
        totalSoldLast7Days: sold7,
        estimatedDaysRemaining: daysRemaining,
        suggestedReorderQty: suggestedQty,
        urgency,
        reasonTextEn: reasonEn,
        reasonTextHi: reasonHi
      });
    }
  });

  // Sort by urgency: critical first, then urgent, then lowest days remaining
  return suggestions.sort((a, b) => {
    const order = { critical: 0, urgent: 1, moderate: 2 };
    if (order[a.urgency] !== order[b.urgency]) {
      return order[a.urgency] - order[b.urgency];
    }
    return a.estimatedDaysRemaining - b.estimatedDaysRemaining;
  });
}

/**
 * Identifies slow moving items with 0 sales in the configured threshold (default: 15 days).
 */
export function calculateSlowMoving(
  products: Product[],
  thresholdDays = 15
): SlowMovingItem[] {
  const now = Date.now();
  const slowItems: SlowMovingItem[] = [];

  products.forEach(p => {
    if (p.currentStock > 0 && p.lastSoldAt) {
      const lastSoldTime = new Date(p.lastSoldAt).getTime();
      const diffDays = Math.floor((now - lastSoldTime) / (86400 * 1000));
      if (diffDays >= thresholdDays) {
        slowItems.push({
          product: p,
          daysWithoutSale: diffDays,
          currentStock: p.currentStock,
          tiedUpValue: Math.round(p.currentStock * (p.purchaseCost || p.sellingPrice))
        });
      }
    }
  });

  return slowItems.sort((a, b) => b.daysWithoutSale - a.daysWithoutSale);
}

/**
 * Format order list for WhatsApp or SMS to distributors
 */
export function formatOrderListText(items: ReorderItem[], lang: Language): string {
  const isHi = lang === 'hi';
  const header = isHi 
    ? `📋 *दुकान का ऑर्डर पर्चा (श्री राम किराना)*\nतारीख: ${new Date().toLocaleDateString('hi-IN')}\n-----------------------------------\n`
    : `📋 *Purchase Order List (Shri Ram Kirana)*\nDate: ${new Date().toLocaleDateString('en-IN')}\n-----------------------------------\n`;

  const rows = items.map((item, idx) => {
    const name = isHi && item.product.nameHi ? item.product.nameHi : item.product.name;
    const unit = getUnitLabel(lang, item.unit);
    return `${idx + 1}. ${name} — *${item.suggestedReorderQty} ${unit}* (स्टॉक: ${item.currentStock})`;
  }).join('\n');

  const footer = isHi
    ? `\n-----------------------------------\nकुल आइटम: ${items.length}\nकृपया जल्द सप्लाई भेजें। धन्यवाद!`
    : `\n-----------------------------------\nTotal Items: ${items.length}\nPlease deliver at earliest. Thank you!`;

  return `${header}${rows}${footer}`;
}
