import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  db,
  recordSaleTx,
  addStockTx,
  correctStockTx,
  addProductTx,
  getPendingSyncCount,
  resetDatabaseToDefaults
} from './index';

describe('Dexie.js IndexedDB Offline Persistence & Atomic Transactions', () => {
  beforeEach(async () => {
    await resetDatabaseToDefaults();
  });

  it('initializes and seeds initial kirana catalog into IndexedDB', async () => {
    const productsCount = await db.products.count();
    expect(productsCount).toBeGreaterThan(0);

    const salt = await db.products.filter(p => p.name.includes('Tata Salt')).first();
    expect(salt).toBeDefined();
    expect(salt?.currentStock).toBe(28);
  });

  it('records sales transactionally, decrements stock, and queues sync operation', async () => {
    const initialSugar = await db.products.filter(p => p.name.includes('Loose Sugar')).first();
    expect(initialSugar).toBeDefined();
    const prevStock = initialSugar!.currentStock;

    // Record sale of 1.5 kg
    const { sale, movement, updatedStock } = await recordSaleTx(initialSugar!.id, 1.5, 44, true);

    expect(updatedStock).toBe(prevStock - 1.5);
    expect(sale.totalAmount).toBe(66); // 1.5 * 44
    expect(sale.isOffline).toBe(true);

    // Verify stock movement was recorded
    expect(movement.movementType).toBe('sale');
    expect(movement.quantityChange).toBe(-1.5);
    expect(movement.quantityAfter).toBe(updatedStock);

    // Verify operation queued in syncQueue
    const syncItem = await db.syncQueue.where('entityId').equals(sale.id).first();
    expect(syncItem).toBeDefined();
    expect(syncItem?.status).toBe('PENDING');
    expect(syncItem?.entityType).toBe('SALE');
  });

  it('prevents accidental negative inventory sales', async () => {
    const butter = await db.products.filter(p => p.name.includes('Amul')).first();
    expect(butter).toBeDefined();

    // Available stock is 3, request 50
    await expect(
      recordSaleTx(butter!.id, 50, butter!.sellingPrice)
    ).rejects.toThrow(/Insufficient stock/);

    // Verify stock remains untouched
    const freshButter = await db.products.get(butter!.id);
    expect(freshButter?.currentStock).toBe(butter!.currentStock);
  });

  it('adds newly purchased stock and updates inventory ledger', async () => {
    const atta = await db.products.filter(p => p.name.includes('Aashirvaad')).first();
    expect(atta).toBeDefined();
    const prevStock = atta!.currentStock;

    const { movement, updatedStock } = await addStockTx(atta!.id, 20, 'Distributor Invoice #991');

    expect(updatedStock).toBe(prevStock + 20);
    expect(movement.movementType).toBe('purchase');
    expect(movement.quantityChange).toBe(20);

    const syncItem = await db.syncQueue.where('entityId').equals(movement.id).first();
    expect(syncItem).toBeDefined();
    expect(syncItem?.status).toBe('PENDING');
  });

  it('records stock corrections with audited reasons', async () => {
    const tea = await db.products.filter(p => p.name.includes('Red Label')).first();
    expect(tea).toBeDefined();

    const { movement, updatedStock } = await correctStockTx(tea!.id, 10, 'Physical count mismatch');

    expect(updatedStock).toBe(10);
    expect(movement.movementType).toBe('adjustment');
    expect(movement.reason).toBe('Physical count mismatch');
  });

  it('prevents duplicate product additions in IndexedDB', async () => {
    await expect(
      addProductTx({
        name: 'Tata Salt Vaccum Evaporated 1kg',
        nameHi: 'टाटा नमक',
        category: 'grocery',
        unit: 'packet',
        currentStock: 10,
        minStockThreshold: 5,
        sellingPrice: 28
      })
    ).rejects.toThrow(/already exists/i);
  });

  it('tracks pending sync count accurately across multiple operations', async () => {
    const initialPending = await getPendingSyncCount();

    const prod = await db.products.toCollection().first();
    expect(prod).toBeDefined();

    await addStockTx(prod!.id, 5);
    await correctStockTx(prod!.id, prod!.currentStock + 5, 'Audit count');

    const newPending = await getPendingSyncCount();
    expect(newPending).toBe(initialPending + 2);
  });
});
