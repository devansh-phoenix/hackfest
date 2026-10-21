import Dexie, { type Table } from 'dexie';
import type { Product, StockMovement, Sale } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STOCK_MOVEMENTS, INITIAL_SALES } from '../sampleData';

export interface SyncQueueItem {
  id: string;
  entityType: 'PRODUCT' | 'SALE' | 'STOCK_MOVEMENT';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  clientTimestamp: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
}

export interface SettingItem {
  key: string;
  value: any;
}

export class KiranaDatabase extends Dexie {
  products!: Table<Product, string>;
  stockMovements!: Table<StockMovement, string>;
  sales!: Table<Sale, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  settings!: Table<SettingItem, string>;

  constructor() {
    super('kirana_smart_stock_db');
    this.version(1).stores({
      products: 'id, name, nameHi, category, unit, currentStock, minStockThreshold, lastSoldAt, createdAt',
      stockMovements: 'id, productId, movementType, timestamp',
      sales: 'id, receiptNumber, timestamp, isOffline',
      syncQueue: 'id, entityType, entityId, status, clientTimestamp',
      settings: 'key'
    });
  }
}

export const db = new KiranaDatabase();

/**
 * Initializes and seeds the database with initial catalog if empty.
 */
export async function initializeDatabase(): Promise<void> {
  const count = await db.products.count();
  if (count === 0) {
    await db.transaction('rw', [db.products, db.stockMovements, db.sales, db.syncQueue], async () => {
      await db.products.bulkAdd(INITIAL_PRODUCTS);
      await db.stockMovements.bulkAdd(INITIAL_STOCK_MOVEMENTS);
      await db.sales.bulkAdd(INITIAL_SALES);
    });
  }

  // Request persistent storage so browser does not purge IndexedDB under pressure
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      await navigator.storage.persist();
    } catch {
      // Ignore if not supported in test environment
    }
  }
}

/**
 * Record a Sale atomically inside an IndexedDB transaction.
 */
export async function recordSaleTx(
  productId: string,
  quantity: number,
  unitPrice: number,
  isOffline = false
): Promise<{ sale: Sale; movement: StockMovement; updatedStock: number }> {
  return await db.transaction('rw', [db.products, db.stockMovements, db.sales, db.syncQueue], async () => {
    const product = await db.products.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const roundedQty = Math.round(quantity * 1000) / 1000;
    if (roundedQty <= 0) {
      throw new Error('Sale quantity must be positive');
    }

    if (roundedQty > product.currentStock) {
      throw new Error(`Insufficient stock. Available: ${product.currentStock} ${product.unit}`);
    }

    const newStock = Math.round((product.currentStock - roundedQty) * 1000) / 1000;
    const nowIso = new Date().toISOString();

    // 1. Update Product
    await db.products.update(productId, {
      currentStock: newStock,
      lastSoldAt: nowIso
    });

    // 2. Insert Stock Movement
    const movementId = `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const movement: StockMovement = {
      id: movementId,
      productId: product.id,
      productName: product.name,
      movementType: 'sale',
      quantityChange: -roundedQty,
      quantityAfter: newStock,
      reason: `Customer sale (${roundedQty} ${product.unit})`,
      timestamp: nowIso
    };
    await db.stockMovements.add(movement);

    // 3. Insert Sale
    const salesCount = await db.sales.count();
    const saleId = `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const sale: Sale = {
      id: saleId,
      receiptNumber: `RCP-${1000 + salesCount + 1}`,
      items: [
        {
          productId: product.id,
          productName: product.name,
          productNameHi: product.nameHi,
          quantity: roundedQty,
          unit: product.unit,
          unitPrice,
          subtotal: Math.round(roundedQty * unitPrice * 100) / 100
        }
      ],
      totalAmount: Math.round(roundedQty * unitPrice * 100) / 100,
      timestamp: nowIso,
      isOffline
    };
    await db.sales.add(sale);

    // 4. Queue for offline sync (Idempotent client operation)
    await db.syncQueue.add({
      id: `sync-sale-${sale.id}`,
      entityType: 'SALE',
      entityId: sale.id,
      operation: 'CREATE',
      payload: sale,
      clientTimestamp: nowIso,
      status: 'PENDING',
      retryCount: 0
    });

    return { sale, movement, updatedStock: newStock };
  });
}

/**
 * Add Stock (from distributor/supplier) atomically.
 */
export async function addStockTx(
  productId: string,
  quantityToAdd: number,
  note?: string
): Promise<{ movement: StockMovement; updatedStock: number }> {
  return await db.transaction('rw', [db.products, db.stockMovements, db.syncQueue], async () => {
    const product = await db.products.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const roundedAdd = Math.round(quantityToAdd * 1000) / 1000;
    if (roundedAdd <= 0) {
      throw new Error('Quantity to add must be positive');
    }

    const newStock = Math.round((product.currentStock + roundedAdd) * 1000) / 1000;
    const nowIso = new Date().toISOString();

    await db.products.update(productId, { currentStock: newStock });

    const movementId = `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const movement: StockMovement = {
      id: movementId,
      productId: product.id,
      productName: product.name,
      movementType: 'purchase',
      quantityChange: roundedAdd,
      quantityAfter: newStock,
      reason: note || 'Supplier purchase delivery',
      timestamp: nowIso
    };
    await db.stockMovements.add(movement);

    await db.syncQueue.add({
      id: `sync-mov-${movement.id}`,
      entityType: 'STOCK_MOVEMENT',
      entityId: movement.id,
      operation: 'CREATE',
      payload: movement,
      clientTimestamp: nowIso,
      status: 'PENDING',
      retryCount: 0
    });

    return { movement, updatedStock: newStock };
  });
}

/**
 * Record a Stock Correction / Physical count adjustment atomically.
 */
export async function correctStockTx(
  productId: string,
  newTotalQuantity: number,
  reason: string
): Promise<{ movement: StockMovement; updatedStock: number }> {
  return await db.transaction('rw', [db.products, db.stockMovements, db.syncQueue], async () => {
    const product = await db.products.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const roundedNew = Math.round(newTotalQuantity * 1000) / 1000;
    if (roundedNew < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const delta = Math.round((roundedNew - product.currentStock) * 1000) / 1000;
    const nowIso = new Date().toISOString();

    await db.products.update(productId, { currentStock: roundedNew });

    const movementId = `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const movement: StockMovement = {
      id: movementId,
      productId: product.id,
      productName: product.name,
      movementType: 'adjustment',
      quantityChange: delta,
      quantityAfter: roundedNew,
      reason,
      timestamp: nowIso
    };
    await db.stockMovements.add(movement);

    await db.syncQueue.add({
      id: `sync-mov-${movement.id}`,
      entityType: 'STOCK_MOVEMENT',
      entityId: movement.id,
      operation: 'CREATE',
      payload: movement,
      clientTimestamp: nowIso,
      status: 'PENDING',
      retryCount: 0
    });

    return { movement, updatedStock: roundedNew };
  });
}

/**
 * Add a new product to inventory atomically.
 */
export async function addProductTx(
  productData: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  return await db.transaction('rw', [db.products, db.stockMovements, db.syncQueue], async () => {
    const cleanName = productData.name.trim();
    // Check duplicate
    const existing = await db.products
      .filter(p => p.name.toLowerCase() === cleanName.toLowerCase())
      .first();

    if (existing) {
      throw new Error(`Product "${cleanName}" already exists!`);
    }

    const nowIso = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: nowIso
    };

    await db.products.add(newProduct);

    if (newProduct.currentStock > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        movementType: 'purchase',
        quantityChange: newProduct.currentStock,
        quantityAfter: newProduct.currentStock,
        reason: 'Initial opening stock',
        timestamp: nowIso
      };
      await db.stockMovements.add(movement);
    }

    await db.syncQueue.add({
      id: `sync-prod-${newProduct.id}`,
      entityType: 'PRODUCT',
      entityId: newProduct.id,
      operation: 'CREATE',
      payload: newProduct,
      clientTimestamp: nowIso,
      status: 'PENDING',
      retryCount: 0
    });

    return newProduct;
  });
}

/**
 * Get count of pending sync items
 */
export async function getPendingSyncCount(): Promise<number> {
  return await db.syncQueue.where('status').equals('PENDING').count();
}

/**
 * Reset database to default seed data
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction('rw', [db.products, db.stockMovements, db.sales, db.syncQueue], async () => {
    await db.products.clear();
    await db.stockMovements.clear();
    await db.sales.clear();
    await db.syncQueue.clear();

    await db.products.bulkAdd(INITIAL_PRODUCTS);
    await db.stockMovements.bulkAdd(INITIAL_STOCK_MOVEMENTS);
    await db.sales.bulkAdd(INITIAL_SALES);
  });
}
