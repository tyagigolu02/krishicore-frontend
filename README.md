<div align="center">

# 🌾 KrishiCore — Pan-India Smart Soil, Weather & Crop Advisory PWA

**Unbiased ICAR-Standard Fertilizer Prescriptions · Live 16-Day Weather Crop Engine · Honest Govt MRP & Geo-Discovery**

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-PWA_Ready-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Open-Meteo](https://img.shields.io/badge/Weather-Open--Meteo_16--Day-2E7D32?style=for-the-badge)](https://open-meteo.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](#deployment-github-pages)

[🚀 Live Demo](https://tyagigolu02.github.io/krishicore/) · [⚙️ Spring Boot Backend](https://github.com/tyagigolu02/krishicore-backend) · [🐛 Report Bug](https://github.com/tyagigolu02/krishicore/issues)

</div>

---

## 🎯 Why KrishiCore?

Most agricultural apps fail Indian farmers in the field because they hardcode regional units, recommend off-season crops during heavy rainfall, fabricate shop inventory, or choke on rural 2G/3G networks.

**KrishiCore Frontend** solves this with a **Zero-Hardcoding, Offline-First PWA architecture**:
- **Auto-Adapts to Every Indian State:** Detects live GPS (with automatic IP geolocation fallback via `ipwho.is`) and dynamically switches land measurement units (`Guntha` in MH/GJ/KA, `Kanal` in PB/HR, `Cent` in South India, `Kaccha/Pakka Bigha` in UP/BR/RJ, `Acre`, `Hectare`).
- **Dual-Mode Resilience:** Runs seamlessly in **`🟢 Live Server DB`** mode (connected to Spring Boot + PostgreSQL) and gracefully falls back to **`⚡ Local Mode`** (powered by live public APIs + `localStorage` caching) when hosted statically or offline.
- **No Fake Inventory:** Separates **`🟢 Dealer Verified Live Stock`** from API-discovered **`🟡 Call-to-Verify`** stores, backed by 24-hour auto-expiring crowdsourced farmer signals.

---

## ✨ Core Features

### 🧪 1. AI Soil Health Card Scanner & 12-Parameter Verifier
- **Client-Side Compression for Rural Bandwidth:** Compresses uploaded Soil Health Card photos to **WebP (`<300 KB`)** via HTML5 Canvas before upload, complete with blur detection telemetry.
- **12 Soil Parameters Grouped Intuitively:** Physical (`pH`, `OC`, `EC`), Primary (`N`, `P`, `K`, `S`), and Micronutrients (`Zn`, `Fe`, `B`, `Cu`, `Mn`) with instant threshold health badges.

### 🌦️ 2. 8-Factor Weather, Soil & Crop Rotation Engine (20 Pan-India Crops)
- **Live 16-Day Weather Gatekeeping:** Fetches real-time rainfall, temperature, wind, and humidity via **Open-Meteo API** — automatically penalizes waterlogging-sensitive crops during heavy rain alerts and advises holding Urea/foliar sprays.
- **ICAR Crop Rotation Intelligence:** Recommends **Top 6** categorized crops (`Cereal`, `Pulse`, `Oilseed`, `Vegetable`, `Cash`, `Fodder`) using soil chemistry (`pH`, `EC`, `N`, `S`, `OC`) + previous season crop history (grants `+N` rotation boost to pulses after cereals and flags monocropping pest risk).
- **Seed Variety-Aware Dosage:** Selecting a crop dynamically unlocks region-popular seed varieties (e.g., `HD-3226`, `DBW-187`, `Desi C-306`, `Pusa Basmati-1509`, `Co-0238`) that auto-calibrate NPK dosage multipliers.

### 💰 3. Balanced Fertilizer Plan, Split Timeline & Voice Advisory
- **Dynamic Phosphate Source Switcher:** Compare exact bag counts and **Official Govt MRP** across `DAP (18:46:0)`, `SSP (16% P + 11% S)`, and `NPK 12:32:16` with automatic Nitrogen/Potassium offset math.
- **3-Stage Application Schedule:** Basal (Day 0), First Irrigation / CRI (21–25 days), and Second Irrigation / Tillering (45–50 days).
- **Accessibility First:** Built-in **Hindi Voice Playback** (`Web Speech API - hi-IN`) and 1-click **WhatsApp Prescription Share**.

### 📒 4. Permanent Farm Ledger (`MyFarmLedgerBar`)
- Farmers can save multiple plots (name, area, unit, soil type, irrigation source) and log season-by-season harvest yields.
- Clicking any saved plot immediately syncs its area, regional unit, and previous crop into the live calculator and rotation engine.

### 🏪 5. Honest Fertilizer Shops & Soil Testing Labs Discovery
- **Read-Through Geo-Discovery:** Queries Spring Boot PostgreSQL first, falls back to **Photon BBox API** (OSM), and offers 1-click **Google Maps** deep discovery + direct click-to-call buttons.
- **Crowdsourced Ground Truth:** Farmers can tap `हाँ / नहीं` to report daily availability on unclaimed shops (auto-expires after 24 hours to prevent stale misinformation).

### 🔐 6. Role-Based Access & Lifetime Immutable Account
- OTP-based login supporting `FARMER`, `DISTRIBUTOR`, `LAB_OPERATOR`, and `GOVT_ADMIN`.
- Existing mobile numbers automatically lock into their permanent saved profile/role without re-prompting role selection.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         KrishiCore React + Vite PWA                                  │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────────────┐   │
│  │ Geo & Weather.  │  │ 8-Factor ICAR &      │  │ Farm Ledger & Offline         │   │
│  │ Auto-Sync       │  │ Variety Engine       │  │ Cache (localStorage)          │   │
│  └──────┬───────┘  └─────────┬─────────┘  └────────────┬─────────────┘   │
└─────────┼────────────────────┼─────────────────────────┼────────────────┘
          │                    │                         │
          ▼                    ▼                         ▼
┌──────────────────┐  ┌─────────────────────┐  ┌──────────────────────────┐
│ Public Live APIs    │  │ Spring Boot 3.3 API.    │  │ Client-Side Utilities         │
│ • Open-Meteo 16d.   │  │ • JWT OTP Auth          │  │ • Canvas WebP Compressor      │
│ • Photon BBox       │  │ • Gemini Vision OCR     │  │ • Web Speech API (hi-IN).     │
│ • Nominatim/IP      │  │ • PostgreSQL Ledger     │  │ • Haversine Geo-Sorter        │
└──────────────────┘  └─────────────────────┘  └──────────────────────────┘
```

---

## 📂 Modular Project Structure

Every component and utility is intentionally kept micro-modular (`<180 lines` per file) for maintainability, fast Vite HMR, and minimal re-renders:

```text
krishicore-frontend/
├── .github/workflows/
│   └── deploy.yml                  # Automated GitHub Pages CI/CD pipeline
├── src/
│   ├── api/
│   │   └── krishicoreApi.js        # Backend REST client + Open-Meteo & Photon fallbacks
│   ├── components/
│   │   ├── AuthModal.jsx           # OTP login with lifetime immutable account lock
│   │   ├── BottomNav.jsx           # Mobile-first 4-tab navigation bar
│   │   ├── DosageAndTimelinePanel.jsx # Fertilizer bags, 3-stage timeline & Top-6 crops
│   │   ├── GovtMrpBar.jsx          # Role-aware Hindi greeting, MRP strip & network status
│   │   ├── HeroBanner.jsx          # State-aware regional land size & unit converter
│   │   ├── MyFarmLedgerBar.jsx     # Permanent farm plots & past harvest history ledger
│   │   ├── Navbar.jsx              # Desktop navigation & user profile dropdown
│   │   ├── SoilScannerPanel.jsx    # WebP SHC scanner, variety checkboxes & 12 params
│   │   ├── TabAdmin.jsx            # Role-gated Partner & Govt Admin management portal
│   │   ├── TabCalculator.jsx       # L×W dimension-to-acre field & dosage calculator
│   │   ├── TabLabs.jsx             # Radius-filtered KVK & soil testing lab finder
│   │   ├── TabShops.jsx            # Verified live stock vs Call-to-Verify + crowd signals
│   │   ├── TabWorkspace.jsx        # Main farmer advisory workspace layout
│   │   ├── TrustAndFooter.jsx      # ICAR standards overview & helpline footer
│   │   └── WeatherSprayBanner.jsx  # Persistent 16-day weather & spray window alert bar
│   ├── context/
│   │   └── AppContext.jsx          # Centralized state, geo-sync & dual-mode orchestration
│   ├── data/
│   │   ├── cropVarieties.js        # Crop-specific seed varieties & NPK multipliers
│   │   └── fallbackData.js         # 20 Pan-India ICAR crops, FCO rates & unit configs
│   ├── hooks/
│   │   ├── useGeolocation.js       # Browser GPS + ipwho.is fallback + state unit mapper
│   │   └── useOnlineStatus.js      # Real-time 2G/3G/4G & offline PWA telemetry hook
│   └── utils/
│       ├── calculations.js         # 8-factor crop scorer, dosage math, voice & WhatsApp
│       └── imageCompressor.js      # Client-side WebP compression & blur detection
└── vite.config.js                  # Dynamic GitHub Pages base path & dev proxy config
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** `v20+` and **npm** `v10+`
- *(Optional)* Running instance of `krishicore-backend` on `http://localhost:8080` for Live DB mode

### 1. Clone & Install
```bash
git clone [https://github.com/](https://github.com/)tyagigolu02/krishicore.git
cd krishicore
npm install
```

### 2. Configure Environment (Optional)
Create a `.env.local` file in the root directory if connecting to a remote Spring Boot backend:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api/v1` | Base URL for `krishicore-backend` (e.g., `https://api.krishicore.in/api/v1`) |

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173`. If the backend isn't running locally, KrishiCore automatically boots in **`⚡ Local Mode`** with live weather, location detection, and full calculation support.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## ☁️ Deployment (GitHub Pages)

This repository uses **GitHub Actions** (`.github/workflows/deploy.yml`) for zero-touch deployment on every push to `main`:

1. Push your code to the `main` branch.
2. Go to **Repository Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. *(Optional)* To connect a deployed Spring Boot backend (Render/Railway), add `VITE_API_BASE_URL` under **Settings → Secrets and variables → Actions → Variables** and re-run the workflow.

---

## 📸 Application Preview

> *Add 2–4 clean screenshots inside `docs/screenshots/` and link them below:*

| Soil Scanner & Seed Varieties | 8-Factor Top-6 Crop Rotation | Nearby Shops & Labs |
| :---: | :---: | :---: |
| ![Workspace](docs/screenshots/workspace.png) | ![Crops](docs/screenshots/crops.png) | ![Shops](docs/screenshots/shops.png) |

---

## 👨‍💻 Author

**Deepanshu Tyagi**  
Full-Stack Software Engineer (Java · Spring Boot · React.js · Distributed Systems)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
