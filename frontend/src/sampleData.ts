import type { Product, StockMovement, Sale } from './types';

export const IS_TEMPORARY_SAMPLE_DATA = true;
export const SAMPLE_DATA_MILESTONE = 'Milestone 2 (Temporary In-Memory Sample)';

// Realistic initial dataset for a neighbourhood Indian Kirana store
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    nameHi: 'आशीर्वाद चक्की आटा 5 किग्रा',
    category: 'grocery',
    unit: 'packet',
    currentStock: 2, // Low stock (threshold is 5)
    minStockThreshold: 5,
    purchaseCost: 215,
    sellingPrice: 240,
    lastSoldAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Loose Sugar (चीनी)',
    nameHi: 'खुली सफेद चीनी',
    category: 'grocery',
    unit: 'kg',
    currentStock: 14.5, // Fractional stock
    minStockThreshold: 10,
    purchaseCost: 38,
    sellingPrice: 44,
    lastSoldAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Tata Salt Vaccum Evaporated 1kg',
    nameHi: 'टाटा नमक 1 किग्रा',
    category: 'grocery',
    unit: 'packet',
    currentStock: 28,
    minStockThreshold: 8,
    purchaseCost: 23,
    sellingPrice: 28,
    lastSoldAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Amul Pasteurised Butter 100g',
    nameHi: 'अमूल मक्खन 100 ग्राम',
    category: 'dairy',
    unit: 'piece',
    currentStock: 3, // Low stock
    minStockThreshold: 10,
    purchaseCost: 50,
    sellingPrice: 56,
    lastSoldAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Maggi 2-Minute Masala Noodles 70g',
    nameHi: 'मैगी मसाला नूडल्स 70 ग्राम',
    category: 'snacks',
    unit: 'packet',
    currentStock: 44,
    minStockThreshold: 15,
    purchaseCost: 12,
    sellingPrice: 14,
    lastSoldAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-6',
    name: 'Brooke Bond Red Label Tea 250g',
    nameHi: 'रेड लेबल चाय पत्ती 250 ग्राम',
    category: 'beverages',
    unit: 'box',
    currentStock: 0, // OUT OF STOCK
    minStockThreshold: 6,
    purchaseCost: 120,
    sellingPrice: 140,
    lastSoldAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-7',
    name: 'Parle-G Gold Glucose Biscuits',
    nameHi: 'पारले-जी गोल्ड बिस्कुट',
    category: 'snacks',
    unit: 'packet',
    currentStock: 35,
    minStockThreshold: 12,
    purchaseCost: 8.5,
    sellingPrice: 10,
    lastSoldAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-8',
    name: 'Fortune Kachi Ghani Mustard Oil 1L',
    nameHi: 'फॉर्च्यून सरसों तेल 1 लीटर',
    category: 'grocery',
    unit: 'bottle',
    currentStock: 16,
    minStockThreshold: 5,
    purchaseCost: 145,
    sellingPrice: 160,
    lastSoldAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-9',
    name: 'Unpolished Toor Dal (तुअर दाल)',
    nameHi: 'देशी तुअर दाल (अरहर)',
    category: 'grocery',
    unit: 'kg',
    currentStock: 4.5, // Low stock & fractional
    minStockThreshold: 12,
    purchaseCost: 155,
    sellingPrice: 175,
    lastSoldAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-10',
    name: 'Dettol Original Bathing Soap 75g',
    nameHi: 'डेटॉल साबुन 75 ग्राम',
    category: 'personal_care',
    unit: 'piece',
    currentStock: 4, // Low stock
    minStockThreshold: 12,
    purchaseCost: 34,
    sellingPrice: 40,
    lastSoldAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-11',
    name: 'MDH Super Garam Masala 100g',
    nameHi: 'एमडीएच गरम मसाला 100 ग्राम',
    category: 'grocery',
    unit: 'box',
    currentStock: 14,
    minStockThreshold: 4,
    purchaseCost: 88,
    sellingPrice: 105,
    lastSoldAt: new Date(Date.now() - 26 * 86400 * 1000).toISOString(), // SLOW MOVING: 26 days ago!
    createdAt: new Date(Date.now() - 45 * 86400 * 1000).toISOString()
  },
  {
    id: 'prod-12',
    name: 'Vim Dishwash Bar 135g',
    nameHi: 'विम बर्तन धोने का साबुन',
    category: 'household',
    unit: 'piece',
    currentStock: 22,
    minStockThreshold: 8,
    purchaseCost: 8.5,
    sellingPrice: 10,
    lastSoldAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    productName: 'Aashirvaad Shudh Chakki Atta 5kg',
    movementType: 'purchase',
    quantityChange: 10,
    quantityAfter: 12,
    reason: 'Purchase from Ganesh Wholesale Distributors',
    timestamp: new Date(Date.now() - 3 * 86400 * 1000).toISOString()
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    productName: 'Aashirvaad Shudh Chakki Atta 5kg',
    movementType: 'sale',
    quantityChange: -2,
    quantityAfter: 10,
    reason: 'Customer sale (Cash)',
    timestamp: new Date(Date.now() - 2 * 86400 * 1000).toISOString()
  },
  {
    id: 'mov-3',
    productId: 'prod-4',
    productName: 'Amul Pasteurised Butter 100g',
    movementType: 'sale',
    quantityChange: -4,
    quantityAfter: 3,
    reason: 'Customer sale (UPI)',
    timestamp: new Date(Date.now() - 1 * 86400 * 1000).toISOString()
  },
  {
    id: 'mov-4',
    productId: 'prod-6',
    productName: 'Brooke Bond Red Label Tea 250g',
    movementType: 'sale',
    quantityChange: -3,
    quantityAfter: 0,
    reason: 'Customer sale — Stock depleted',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'mov-5',
    productId: 'prod-2',
    productName: 'Loose Sugar (चीनी)',
    movementType: 'adjustment',
    quantityChange: -0.5,
    quantityAfter: 14.5,
    reason: 'Spillage / Bag leakage adjustment (खराबी/बिखराव)',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    receiptNumber: 'RCP-1001',
    items: [
      {
        productId: 'prod-5',
        productName: 'Maggi Noodles 70g',
        productNameHi: 'मैगी नूडल्स',
        quantity: 4,
        unit: 'packet',
        unitPrice: 14,
        subtotal: 56
      },
      {
        productId: 'prod-7',
        productName: 'Parle-G Biscuits',
        productNameHi: 'पारले-जी बिस्कुट',
        quantity: 2,
        unit: 'packet',
        unitPrice: 10,
        subtotal: 20
      }
    ],
    totalAmount: 76,
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'sale-2',
    receiptNumber: 'RCP-1002',
    items: [
      {
        productId: 'prod-2',
        productName: 'Loose Sugar',
        productNameHi: 'खुली चीनी',
        quantity: 1.5,
        unit: 'kg',
        unitPrice: 44,
        subtotal: 66
      }
    ],
    totalAmount: 66,
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];
