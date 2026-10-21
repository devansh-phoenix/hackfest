import React from 'react';
import type { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Languages, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  pendingSyncCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  isOnline,
  onToggleOnline,
  pendingSyncCount = 0
}) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="app-header">
      <div className="shop-branding">
        <h1 className="shop-title">{getTranslation(language, 'shopName')}</h1>
        <span className="shop-subtitle">{getTranslation(language, 'appName')}</span>
      </div>

      <div className="header-actions">
        {/* Online / Offline status badge */}
        <button
          className={`status-pill ${isOnline ? 'online' : 'offline'}`}
          onClick={onToggleOnline}
          title={getTranslation(language, 'simulatedOfflineHelp')}
          type="button"
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>
            {isOnline 
              ? getTranslation(language, 'online') 
              : getTranslation(language, 'offline')}
          </span>
          {pendingSyncCount > 0 && (
            <span style={{ fontSize: '0.65rem', background: '#dc2626', color: '#fff', borderRadius: '8px', padding: '0 4px' }}>
              {pendingSyncCount}
            </span>
          )}
        </button>

        {/* Language switch button */}
        <button 
          className="lang-toggle-btn"
          onClick={toggleLanguage}
          title="Switch Language / भाषा बदलें"
          type="button"
        >
          <Languages size={15} />
          <span>{language === 'en' ? 'हिंदी' : 'Eng'}</span>
        </button>
      </div>
    </header>
  );
};
