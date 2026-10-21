import React from 'react';
import type { ActiveTab, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { LayoutDashboard, ShoppingBag, Package, RefreshCw, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  reorderAlertCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  reorderAlertCount = 0
}) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange('dashboard')}
        type="button"
      >
        <LayoutDashboard size={20} />
        <span>{getTranslation(language, 'tabDashboard')}</span>
      </button>

      <button 
        className={`nav-tab ${activeTab === 'quick-sale' ? 'active' : ''}`}
        onClick={() => onTabChange('quick-sale')}
        type="button"
      >
        <ShoppingBag size={20} />
        <span>{getTranslation(language, 'tabQuickSale')}</span>
      </button>

      <button 
        className={`nav-tab ${activeTab === 'stock' ? 'active' : ''}`}
        onClick={() => onTabChange('stock')}
        type="button"
      >
        <Package size={20} />
        <span>{getTranslation(language, 'tabStock')}</span>
      </button>

      <button 
        className={`nav-tab ${activeTab === 'reorders' ? 'active' : ''}`}
        onClick={() => onTabChange('reorders')}
        type="button"
      >
        <RefreshCw size={20} />
        <span>{getTranslation(language, 'tabReorders')}</span>
        {reorderAlertCount > 0 && (
          <span className="nav-tab-badge">{reorderAlertCount}</span>
        )}
      </button>

      <button 
        className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
        type="button"
      >
        <Settings size={20} />
        <span>{getTranslation(language, 'tabSettings')}</span>
      </button>
    </nav>
  );
};
