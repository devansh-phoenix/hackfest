import React, { useState, useEffect } from 'react';
import type { Product, StockMovement, Sale, Language, ActiveTab } from './types';
import { getTranslation, getUnitLabel } from './i18n/translations';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { RecordSaleModal } from './components/RecordSaleModal';
import { AddStockModal } from './components/AddStockModal';
import { StockCorrectionModal } from './components/StockCorrectionModal';
import { AddProductModal } from './components/AddProductModal';
import { DashboardScreen } from './screens/DashboardScreen';
import { QuickSaleScreen } from './screens/QuickSaleScreen';
import { StockScreen } from './screens/StockScreen';
import { ReorderScreen } from './screens/ReorderScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { calculateReorders } from './utils/reorderEngine';
import {
  db,
  initializeDatabase,
  recordSaleTx,
  addStockTx,
  correctStockTx,
  addProductTx,
  getPendingSyncCount,
  resetDatabaseToDefaults
} from './db';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // IndexedDB persisted state
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [addStockProduct, setAddStockProduct] = useState<Product | null>(null);
  const [correctionProduct, setCorrectionProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Helper to refresh state from IndexedDB
  const reloadFromDb = async () => {
    const p = await db.products.toArray();
    const m = await db.stockMovements.reverse().sortBy('timestamp');
    const s = await db.sales.reverse().sortBy('timestamp');
    const count = await getPendingSyncCount();
    setProducts(p);
    setMovements(m);
    setSales(s);
    setPendingSyncCount(count);
  };

  // Initialize IndexedDB and setup network detection
  useEffect(() => {
    const setup = async () => {
      try {
        await initializeDatabase();
        await reloadFromDb();
      } catch (err) {
        console.error('Failed to initialize database:', err);
      } finally {
        setIsLoading(false);
      }
    };
    setup();

    // Real network connectivity monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reorder alert count for badge
  const reorderList = calculateReorders(products, sales);
  const reorderAlertCount = reorderList.length;

  // Handle Sale Confirmation with Dexie transaction
  const handleConfirmSale = async (productId: string, quantity: number, unitPrice: number) => {
    try {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      const { updatedStock } = await recordSaleTx(productId, quantity, unitPrice, !isOnline);
      await reloadFromDb();
      setSaleProduct(null);

      const unitText = getUnitLabel(language, prod.unit);
      showToast(
        language === 'hi'
          ? `बिक्री दर्ज! ${quantity} ${unitText} बिका। शेष: ${updatedStock} ${unitText}`
          : `Sale recorded! Sold ${quantity} ${unitText}. Remaining: ${updatedStock} ${unitText}`
      );
    } catch (err: any) {
      showToast(err.message || 'Error recording sale');
    }
  };

  // Handle Add Stock with Dexie transaction
  const handleConfirmAddStock = async (productId: string, quantityToAdd: number, note?: string) => {
    try {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      const { updatedStock } = await addStockTx(productId, quantityToAdd, note);
      await reloadFromDb();
      setAddStockProduct(null);

      const unitText = getUnitLabel(language, prod.unit);
      showToast(
        language === 'hi'
          ? `स्टॉक जुड़ गया! ${prod.nameHi || prod.name} का नया स्टॉक: ${updatedStock} ${unitText}`
          : `Stock added! New stock for ${prod.name}: ${updatedStock} ${unitText}`
      );
    } catch (err: any) {
      showToast(err.message || 'Error adding stock');
    }
  };

  // Handle Stock Correction with Dexie transaction
  const handleConfirmCorrection = async (productId: string, newTotalQuantity: number, reason: string) => {
    try {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      await correctStockTx(productId, newTotalQuantity, reason);
      await reloadFromDb();
      setCorrectionProduct(null);

      showToast(getTranslation(language, 'correctionSuccess', { qty: newTotalQuantity, unit: prod.unit }));
    } catch (err: any) {
      showToast(err.message || 'Error updating stock');
    }
  };

  // Handle Add New Product with Dexie transaction
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      await addProductTx(productData);
      await reloadFromDb();
      setIsAddProductOpen(false);
      showToast(getTranslation(language, 'productAddedSuccess'));
    } catch (err: any) {
      showToast(err.message || 'Error adding product');
    }
  };

  // Reset to default seed data in IndexedDB
  const handleResetDemoData = async () => {
    try {
      await resetDatabaseToDefaults();
      await reloadFromDb();
      showToast(language === 'hi' ? 'डेटाबेस रीसेट हो गया!' : 'Database reset to default catalog!');
    } catch (err: any) {
      showToast(err.message || 'Error resetting database');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c', marginBottom: '8px' }}>
          किराना स्मार्ट स्टॉक
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Loading offline database...
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Desktop Sidebar (visible on laptop/desktop screens) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        reorderAlertCount={reorderAlertCount}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        onOpenQuickSale={() => setActiveTab('quick-sale')}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
      />

      <div className="app-main-pane">
        {/* Top Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          isOnline={isOnline}
          onToggleOnline={() => setIsOnline(!isOnline)}
          pendingSyncCount={pendingSyncCount}
        />

        {/* Offline PWA & Persistence Notice Banner */}
        <div className="demo-banner">
          <span>
            📱 <strong>PWA & IndexedDB Active:</strong>{' '}
            {language === 'hi'
              ? `सभी बिक्री और स्टॉक डिवाइस पर सुरक्षित हैं (${pendingSyncCount} सिंक बाकी)।`
              : `All stock & sales permanently saved in IndexedDB (${pendingSyncCount} pending sync).`}
          </span>
          <button
            className="demo-banner-btn"
            onClick={handleResetDemoData}
            type="button"
          >
            {getTranslation(language, 'resetDemoData')}
          </button>
        </div>

        {/* Main Content Area */}
        <main className="app-content">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              products={products}
              movements={movements}
              language={language}
              onNavigate={setActiveTab}
              onOpenQuickSale={() => setActiveTab('quick-sale')}
              onOpenAddStock={p => {
                if (p) {
                  setAddStockProduct(p);
                } else {
                  setActiveTab('stock');
                }
              }}
            />
          )}

          {activeTab === 'quick-sale' && (
            <QuickSaleScreen
              products={products}
              language={language}
              onSelectProduct={p => setSaleProduct(p)}
            />
          )}

          {activeTab === 'stock' && (
            <StockScreen
              products={products}
              language={language}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenAddStock={p => setAddStockProduct(p)}
              onOpenCorrection={p => setCorrectionProduct(p)}
            />
          )}

          {activeTab === 'reorders' && (
            <ReorderScreen
              products={products}
              sales={sales}
              language={language}
              onOpenAddStock={p => setAddStockProduct(p)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              language={language}
              onLanguageChange={setLanguage}
              isOnline={isOnline}
              onToggleOnline={() => setIsOnline(!isOnline)}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>

        {/* Bottom Thumb Navigation Bar (visible on mobile only) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          language={language}
          reorderAlertCount={reorderAlertCount}
        />
      </div>

      {/* Record Sale Modal */}
      {saleProduct && (
        <RecordSaleModal
          product={saleProduct}
          language={language}
          onClose={() => setSaleProduct(null)}
          onConfirmSale={handleConfirmSale}
        />
      )}

      {/* Add Stock Modal */}
      {addStockProduct && (
        <AddStockModal
          product={addStockProduct}
          language={language}
          onClose={() => setAddStockProduct(null)}
          onConfirmAddStock={handleConfirmAddStock}
        />
      )}

      {/* Stock Correction Modal */}
      {correctionProduct && (
        <StockCorrectionModal
          product={correctionProduct}
          language={language}
          onClose={() => setCorrectionProduct(null)}
          onConfirmCorrection={handleConfirmCorrection}
        />
      )}

      {/* Add New Product Modal */}
      {isAddProductOpen && (
        <AddProductModal
          language={language}
          onClose={() => setIsAddProductOpen(false)}
          onAddProduct={handleAddProduct}
          existingProductNames={products.map(p => p.name)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
