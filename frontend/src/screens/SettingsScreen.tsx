import React from 'react';
import type { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Globe, Wifi, RotateCcw, ShieldCheck } from 'lucide-react';

interface SettingsScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  onResetDemoData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onLanguageChange,
  isOnline,
  onToggleOnline,
  onResetDemoData
}) => {
  return (
    <div className="settings-screen">
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {getTranslation(language, 'settingsTitle')}
        </h2>
      </div>

      {/* Language Preference Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Globe size={20} style={{ color: '#d9531e' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            {getTranslation(language, 'languageSetting')}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => onLanguageChange('en')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: `2px solid ${language === 'en' ? '#d9531e' : '#e2e8f0'}`,
              backgroundColor: language === 'en' ? '#fff3ec' : '#fff',
              color: language === 'en' ? '#d9531e' : '#475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            type="button"
          >
            English
          </button>

          <button
            onClick={() => onLanguageChange('hi')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: `2px solid ${language === 'hi' ? '#d9531e' : '#e2e8f0'}`,
              backgroundColor: language === 'hi' ? '#fff3ec' : '#fff',
              color: language === 'hi' ? '#d9531e' : '#475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            type="button"
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>

      {/* Offline Mode Simulator Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Wifi size={20} style={{ color: isOnline ? '#15803d' : '#d97706' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            {getTranslation(language, 'networkStatus')}
          </h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.4 }}>
          {getTranslation(language, 'simulateOfflineDesc')}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isOnline ? '#15803d' : '#d97706' }}>
              {isOnline ? getTranslation(language, 'online') : getTranslation(language, 'offline')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {isOnline ? 'Connected to local network' : 'Local-first offline mode active'}
            </div>
          </div>

          <button
            onClick={onToggleOnline}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: isOnline ? '#f1f5f9' : '#fffbeb',
              color: isOnline ? '#334155' : '#b45309',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            type="button"
          >
            {isOnline ? 'Go Offline (Simulate)' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Data Security & Persistence */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={20} style={{ color: '#15803d' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            {getTranslation(language, 'storagePersistence')}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#475569' }}>
            IndexedDB Offline Storage
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#15803d',
            backgroundColor: '#dcfce7',
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            {getTranslation(language, 'storageActive')}
          </span>
        </div>
      </div>

      {/* Demo Data Management */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <RotateCcw size={20} style={{ color: '#d97706' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            {getTranslation(language, 'resetDemoData')}
          </h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
          {getTranslation(language, 'demoNotice')}
        </p>
        <button
          onClick={onResetDemoData}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #fde68a',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          type="button"
        >
          {getTranslation(language, 'resetDemoData')}
        </button>
      </div>

      {/* Shop & App Info */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        padding: '14px',
        fontSize: '0.75rem',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
          {getTranslation(language, 'shopName')}
        </div>
        <div>{getTranslation(language, 'appVersion')}</div>
        <div>{getTranslation(language, 'devInfo')}</div>
      </div>
    </div>
  );
};
