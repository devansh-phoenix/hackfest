import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with autoUpdate and safe callbacks
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('[PWA] New version available.');
  },
  onOfflineReady() {
    console.info('[PWA] App shell precached and ready for offline use.');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
