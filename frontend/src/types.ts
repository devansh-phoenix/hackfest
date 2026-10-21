// Common Types for Kirana Smart Stock

export type UnitType = 
  | 'piece' 
  | 'packet' 
  | 'bottle' 
  | 'box' 
  | 'kg' 
  | 'g' 
  | 'l' 
  | 'ml';

export type ProductCategory = 
  | 'grocery' 
  | 'snacks' 
  | 'dairy' 
  | 'beverages' 
  | 'personal_care' 
  | 'household';

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: ProductCategory;
  unit: UnitType;
  currentStock: number;
  minStockThreshold: number;
  purchaseCost?: number;
  sellingPrice: number;
  lastSoldAt?: string; // ISO date string
  createdAt: string;
}

export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantityChange: number; // positive for addition, negative for reduction
  quantityAfter: number;
  reason?: string;
  timestamp: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productNameHi: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  totalAmount: number;
  timestamp: string;
  isOffline?: boolean;
}

export type Language = 'en' | 'hi';

export type ActiveTab = 'dashboard' | 'quick-sale' | 'stock' | 'reorders' | 'settings';
