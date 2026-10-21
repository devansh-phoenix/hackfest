# Kirana Smart Stock — किराना स्मार्ट स्टॉक

A reliable, local-first inventory and stock-reorder Progressive Web App (PWA) tailored specifically for Indian neighbourhood retail stores (kirana stores, chemists, hardware, and stationery shops).

---

## 🚀 Key Features

- **Local-First & 100% Offline Capable**: Works completely offline without active internet. All sales and inventory movements persist immediately in device IndexedDB (`Dexie.js`).
- **Progressive Web App (PWA)**: Installable directly on Android, iOS, or desktop. Precaches the complete application shell and typography.
- **Two-Tap Quick Sales**: Select product, choose quantity presets (e.g. `+1`, `+2`, `+5`, or fractional `0.25 kg`, `0.5 kg`, `1 kg`), and confirm. Live subtotal and stock availability guards prevent negative inventory.
- **Stock Audit & Ledger**: Full movement history tracking purchases, sales, and corrections (damaged, count mismatch, expired) with signed deltas ($\pm\Delta$).
- **Smart Reorder Recommendations**: Computes Average Daily Sales ($ADS$) and safety thresholds with plain-language explanations and a "Copy for WhatsApp" button.
- **Bilingual Interface**: Seamless 1-tap switching between **हिंदी** and **English**.
- **Responsive Dual-Screen Design**: Thumb-friendly bottom bar on mobile screens; dedicated left sidebar and split-grid dashboard on laptops and desktop tablets.

---

## 🛠️ Project Structure

```
kirana-smart-stock/
├── frontend/                     # React 19 + TypeScript + Vite + PWA
│   ├── public/                   # Manifest icons, favicon, apple touch icons
│   ├── src/
│   │   ├── db/                   # Dexie.js IndexedDB layer & atomic transactions
│   │   ├── components/           # UI design system (Header, Sidebar, BottomNav, Modals)
│   │   ├── screens/              # Core screens (Dashboard, QuickSale, Stock, Reorders, Settings)
│   │   ├── i18n/                 # English and Hindi bilingual translation dictionary
│   │   ├── utils/                # Reorder recommendation & sales velocity engine
│   │   ├── App.tsx               # Responsive layout shell & state integration
│   │   └── main.tsx              # PWA service worker registration
│   ├── vite.config.ts            # Vite + VitePWA Workbox precaching configuration
│   └── package.json
├── README.md                     # Setup, testing, and PWA installation guide
├── .gitignore                    # Excludes secrets, node_modules, build artifacts
└── .env.example                  # Placeholder environment configuration
```

---

## 📱 How to Install the PWA on an Android Device

1. **Connect & Open**:
   - Ensure your Android phone and computer are on the same Wi-Fi network (or host the production build with HTTPS).
   - Open **Google Chrome** on your Android phone and navigate to the application URL (e.g. `http://<your-computer-ip>:5173/` or `http://<your-computer-ip>:4173/`).
2. **Install**:
   - Tap the **three vertical dots (⋮)** in the top right corner of Chrome.
   - Tap **"Add to Home screen"** or **"Install app"** (ऐप इंस्टॉल करें).
   - Confirm by tapping **"Install"**.
3. **Launch**:
   - The app icon will appear directly on your home screen or app drawer with the name **"KiranaStock"** / **"किराना स्मार्ट स्टॉक"**.
   - Launching it opens a native full-screen standalone window without browser address bar clutter.

---

## ✈️ How to Test Offline Operation Using Airplane Mode

1. **First-Load Precache**:
   - Open the application in the browser or via the installed PWA once while online so the service worker installs and precaches the app shell.
2. **Turn On Airplane Mode**:
   - On your Android phone, swipe down and tap **Airplane Mode (हवाई जहाज़ मोड)** to disconnect Wi-Fi and mobile data.
   - Alternatively, in desktop Chrome DevTools: Open **Network** tab $\rightarrow$ select **"Offline"** in the throttling dropdown.
3. **Perform Actions Completely Offline**:
   - Close the browser tab or app completely.
   - Reopen the app. Notice the app shell and fonts load immediately from the Service Worker cache!
   - Observe the top status pill reflects **"Offline Mode" (ऑफ़लाइन मोड)**.
   - Record a sale (e.g., sell 2 packets of biscuits or 1.5 kg loose sugar).
   - Add new stock or perform a stock adjustment.
   - Verify the stock decrements/increments immediately and the pending sync counter increases.
4. **Data Persistence Check**:
   - Close the browser or reboot the phone.
   - Reopen the app. All stock levels, movements, and pending operations remain intact in IndexedDB.
5. **Turn Off Airplane Mode**:
   - Disable Airplane Mode.
   - The network status indicator automatically flips back to **"Online" (ऑनलाइन)**.

---

## 🧪 Running Automated Tests & Builds

### Frontend (React 19 + TypeScript + Vitest)
```bash
cd frontend

# Run automated unit tests (21 tests covering inventory math, translations, and Dexie transactions)
npm test

# Build production PWA bundle (generates dist/sw.js and precache manifests)
npm run build

# Preview production build locally
npm run preview
```

### Backend (Python + Django 4.2 + DRF + Pytest)
```bash
cd backend

# Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Run automated test suite (33 tests covering auth, tenant isolation, atomic transactions, and idempotency)
pytest tests/ -v

# Start development API server
python manage.py runserver
```

