import React from 'react';
import type { ActiveTab, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  RefreshCw,
  Settings,
  Store,
  PlusCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  reorderAlertCount?: number;
  isOnline: boolean;
  onToggleOnline: () => void;
  onOpenQuickSale: () => void;
  onOpenAddProduct: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  language,
  reorderAlertCount = 0,
  isOnline,
  onToggleOnline,
  onOpenQuickSale,
  onOpenAddProduct
}) => {
  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Store size={26} />
        </div>
        <div>
          <h2 className="sidebar-brand-title">{getTranslation(language, 'shopName')}</h2>
          <span className="sidebar-brand-sub">{getTranslation(language, 'appName')}</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="sidebar-quick-actions">
        <button
          className="sidebar-action-btn sale"
          onClick={onOpenQuickSale}
          type="button"
        >
          <ShoppingBag size={18} />
          <span>{getTranslation(language, 'recordSaleBtn')}</span>
        </button>

        <button
          className="sidebar-action-btn product"
          onClick={onOpenAddProduct}
          type="button"
        >
          <PlusCircle size={18} />
          <span>{getTranslation(language, 'newProductBtn')}</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">
          {language === 'hi' ? 'मुख्य मेनू' : 'MAIN MENU'}
        </div>

        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          type="button"
        >
          <LayoutDashboard size={20} />
          <span>{getTranslation(language, 'tabDashboard')}</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'quick-sale' ? 'active' : ''}`}
          onClick={() => onTabChange('quick-sale')}
          type="button"
        >
          <ShoppingBag size={20} />
          <span>{getTranslation(language, 'tabQuickSale')}</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => onTabChange('stock')}
          type="button"
        >
          <Package size={20} />
          <span>{getTranslation(language, 'tabStock')}</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'reorders' ? 'active' : ''}`}
          onClick={() => onTabChange('reorders')}
          type="button"
        >
          <RefreshCw size={20} />
          <span>{getTranslation(language, 'tabReorders')}</span>
          {reorderAlertCount > 0 && (
            <span className="sidebar-badge">{reorderAlertCount}</span>
          )}
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
          type="button"
        >
          <Settings size={20} />
          <span>{getTranslation(language, 'tabSettings')}</span>
        </button>
      </nav>

      {/* Bottom Profile & Connection Status */}
      <div className="sidebar-footer">
        <button
          className={`sidebar-status-pill ${isOnline ? 'online' : 'offline'}`}
          onClick={onToggleOnline}
          type="button"
        >
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          <span>
            {isOnline 
              ? getTranslation(language, 'online') 
              : getTranslation(language, 'offline')}
          </span>
        </button>
        <div className="sidebar-version-tag">v1.0 (Kirana Local-First)</div>
      </div>
    </aside>
  );
};
